const router = require('express').Router();
let Hive = require('../models/hive.model');
let Grid = require('../models/grid.model');

let MAX_LENGTH = 4;
let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let GRID_SIZE = 7;
let GRID_CENTER = Math.floor(GRID_SIZE/2);
let capacity = 16;
let BEE_UPKEEP = 4;
let BEE_ENERGY_MAX = 10;
let MAX_BEE = 200;
let BEE_SPEED = 12;
let MARGIN_ERROR = 20;

//Options
let MAX_FOOD = 10;
let MAX_STARTING_BEES = 20;
let MAX_HONEY = 300;
let MIN_FOOD = 3;
let MIN_STARTING_BEES = 1;
let MIN_HONEY = 100;

let NORTH = 0;
let EAST = 1;
let SOUTH = 2;
let WEST = 3;

let width = 191;
let height = 135;

//TODO: 
//Bee can sense one cell around them - DONE
//Bee sharing food location - 

router.route('/get-current-hive').get((req,res) => {
    Hive.find({hive: req.query.hive})
        .then((result) => {
            res.json(result);
        })
        .catch(err => res.json('Could not be found'));
});
router.route('/get-current-grid').get((req,res) => {
    Grid.find({hive: req.query.hive})
        .then((result) => {
            res.json(result);
        })
        .catch(err => res.json('Could not be found'));
});
router.route('/load').post((req, res) => {
    console.log("PARAMS: " + req.body.hive);
    Hive.find({hive: req.body.hive})
        .then((result) => {
            res.json( result.length);
        })
        .catch(err => res.status(400).json('Error Not Found: ' + err));
});
router.route('/get-cell-info').get((req, res) => {
    Hive.find({hive: req.query.hive})
        .then((result) => {
            var array = [];
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/process-grid').post(async (req,res) => {
    // var arr = [0,1,2,3];
    
    var hivePromise = getHive(req);
    var gridPromise = getGrid(req);
    
    var hive = null;
    var grid = null;
    await hivePromise.then((result) => {
        hive = result;
    });
    await gridPromise.then((res) => {
        grid = res;
        // console.log("GRID INFO: " + grid.hive);
    });
    //Bee Update
    // console.log(" ");
    var food_locations = [];
    var waiting_bees = [];
    var waiting_bees_index = [];

    var dead_bees_index = [];
    for(var i = 0; i < hive.array.length; i++){
        var bee = hive.array[i];
        var doIntent = false;
        if(bee.energy == 0){
            dead_bees_index.push(i);
            bee.action = 'Completed';
            bee.intent = 'Death'
        }
        // console.log(bee.xLocation + ' ' + bee.yLocation + ' '+ bee.xDestination + ' ' + bee.yDestination + ' ' + bee.intent + ' ' + bee.action);
        switch(bee.action){
            case('Pending'):
                var xDifference = bee.xDestination - bee.xLocation;
                var yDifference = bee.yDestination - bee.yLocation;
                var angle = Math.atan2(yDifference, xDifference);

                var velocityX = Math.cos(angle)*BEE_SPEED;
                var velocityY = Math.sin(angle)*BEE_SPEED;

                bee.xLocation += velocityX;
                bee.yLocation += velocityY;

                if((bee.xLocation <= bee.xDestination+MARGIN_ERROR && bee.xLocation >= bee.xDestination-MARGIN_ERROR) && 
                (bee.yLocation <= bee.yDestination+MARGIN_ERROR && bee.yLocation >= bee.yDestination-MARGIN_ERROR)){
                    bee.action = 'Completed';
                    doIntent = true;
                }
                bee.tick+=1;
                if(bee.tick >= 50){
                    bee.tick = 0;
                    bee.energy -= 1;
                }
                break;
            case('Completed'):
                doIntent = true;
                break;
            case('None'):
                doIntent = true;
                break;
        }
        if(doIntent){
            if(bee.energy <= BEE_ENERGY_MAX*.3 && bee.intent != 'Recovering' && bee.intent != 'Waiting'){ //Go to recovery phase, save old info
                bee.prevIntent = bee.intent;
                bee.prevXLocationGrid = bee.xLocationGrid;
                bee.prevYLocationGrid = bee.yLocationGrid;

                bee.intent = 'Recovering';
                bee.action = 'Pending';
                bee.xLocationGrid = GRID_CENTER;
                bee.yLocationGrid = GRID_CENTER;
                bee.xDestination = GRID_CENTER * width + randomXCoordHive();
                bee.yDestination = GRID_CENTER * height + randomYCoordHive();
            }
            else{
                switch(bee.intent){
                    case('Death'):
                        break;
                    case('Searching'):
                        if(isValidCell(grid, bee)){
                            grid.grid[bee.xLocationGrid][bee.yLocationGrid].nectar -= capacity;
                            bee.nectar += capacity;

                            bee.xLocationFood = bee.xLocationGrid;
                            bee.yLocationFood = bee.yLocationGrid;

                            var xCoord = randomXCoordHive();
                            var yCoord = randomYCoordHive();
                            bee.xDestination = GRID_CENTER * width + xCoord;
                            bee.yDestination = GRID_CENTER * height + yCoord;

                            bee.intent = 'Deposit';
                            bee.action = 'Pending';
                        }
                        else{
                            var array = getValidDirections(bee);

                            var selection = selectDirection(array, bee, grid);
                            if(selection == -1){
                                selection = array[getRandomNumber(0, array.length)];
                            }
                            var xDirection = 0;
                            var yDirection = 0;
                            
                            if(selection == NORTH){
                                bee.cameFrom = "SOUTH";
                                yDirection = -1;
                            }
                            if(selection == EAST){
                                bee.cameFrom = "WEST";
                                xDirection = 1;
                            }
                            if(selection == SOUTH){
                                bee.cameFrom = "NORTH";
                                yDirection = 1;
                            }
                            if(selection == WEST){
                                bee.cameFrom = "EAST";
                                xDirection = -1;
                            }
                            bee.xLocationGrid += yDirection;
                            bee.yLocationGrid += xDirection;

                            var xCoord = randomXCoord();
                            var yCoord = randomYCoord();

                            bee.xDestination = bee.yLocationGrid * width + xCoord;
                            bee.yDestination = bee.xLocationGrid * height + yCoord;
                            
                            bee.action = 'Pending';
                        }
                        break;
                    case('Foraging'): //Once action is completed, foraging is intent. 
                        if(isValidCell(grid, bee)){
                            bee.intent = 'Deposit';
                            grid.grid[bee.xLocationGrid][bee.yLocationGrid].nectar -= capacity;
                            grid.grid[bee.xLocationGrid][bee.yLocationGrid].pollinated = true;
                            grid.grid[bee.xLocationGrid][bee.yLocationGrid].pollinationCounter += .01;
                            bee.nectar += capacity;

                            bee.xLocationFood = bee.xLocationGrid;
                            bee.yLocationFood = bee.yLocationGrid;
                            bee.quality = grid.grid[bee.xLocationGrid][bee.yLocationGrid].quality;

                            var xCoord = getRandomNumber(80, 110);
                            var yCoord = getRandomNumber(50, 70);
                            bee.xDestination = GRID_CENTER * width + xCoord;
                            bee.yDestination = GRID_CENTER * height + yCoord;
                            bee.action = 'Pending';
                        }
                        else{
                            bee.intent = 'Searching';
                        }
                        break;
                    case('Waiting'): //Either go back to old task OR get shared something
                        //Loop of waiting to depo/foraging to recovery, need to fix
                        //Once another bee deposits, check if there is enough energy yet
                        var energy_required = BEE_ENERGY_MAX-bee.energy;
                        // console.log("WAITING BEE'S ENERGY " + bee.energy);
                        if(energy_required <= hive.honey){
                            bee.energy += energy_required;
                            hive.honey -= energy_required;
                        }
                        waiting_bees.push(bee);
                        waiting_bees_index.push(i);
                        break;
                    case('Recovering'):
                        var energy_required = BEE_ENERGY_MAX-bee.energy;
                        if(energy_required <= hive.honey){
                            bee.energy += energy_required;
                            hive.honey -= energy_required;
                            bee.intent = bee.prevIntent;
                            bee.xLocationGrid = bee.prevXLocationGrid;
                            bee.yLocationGrid = bee.prevYLocationGrid;

                            bee.xDestination = bee.yLocationGrid*191+randomXCoord();
                            bee.yDestination = bee.xLocationGrid*135+randomYCoord();
                            bee.action = 'Pending';
                        }
                        else{
                            bee.intent = 'Waiting'; 
                            bee.action = 'Completed';
                        }
                        break;
                    case('Deposit'):
                        var energy_required = BEE_ENERGY_MAX-bee.energy;
                        bee.energy += energy_required;
                        bee.nectar -= energy_required;

                        hive.honey += bee.nectar;
                        bee.nectar = 0;

                        var xCoord = getRandomNumber(30, 160);
                        var yCoord = getRandomNumber(30, 110);

                        bee.xDestination = bee.yLocationFood * width + xCoord;
                        bee.yDestination = bee.xLocationFood * height + yCoord;
                        bee.intent = 'Foraging';
                        bee.action = 'Pending';
                        if(!food_locations.includes([bee.yLocationFood, bee.xLocationFood])){
                            food_locations.push([bee.yLocationFood, bee.xLocationFood]);
                        }
                        break;
                }   
            }
        }
    }
    //Bee gets shared locations
    if(food_locations.length > 0){
        food_locations.sort(function(a,b){ //Prioritize quality food sources
            return grid.grid[b[1]][b[0]].quality - grid.grid[a[1]][a[0]].quality
        });
        for(var i = 0; i < food_locations.length; i++){
            var max = 5;
            for(var j = 0; j < waiting_bees.length; j++){
                if(max <= 0){
                    break;
                }
                var energy_required = BEE_ENERGY_MAX-bee.energy;
                if(energy_required <= hive.honey){
                    waiting_bees[j].energy += energy_required;
                    hive.honey -= energy_required;
                }
                if( waiting_bees[j].energy >= BEE_ENERGY_MAX*.5){
                    waiting_bees[j].xLocationFood = food_locations[i][1];
                    waiting_bees[j].yLocationFood = food_locations[i][0];
                    waiting_bees[j].intent = 'Foraging'; //Deposits 0 nectar
                    waiting_bees[j].action = 'Pending';

                    waiting_bees[j].xLocationGrid = food_locations[i][1];
                    waiting_bees[j].yLocationGrid = food_locations[i][0];

                    var xCoord = getRandomNumber(30, 160);
                    var yCoord = getRandomNumber(30, 110);

                    waiting_bees[j].xDestination = waiting_bees[j].yLocationFood * width + xCoord;
                    waiting_bees[j].yDestination = waiting_bees[j].xLocationFood * height + yCoord;
                    max-=1;
                }
            }
        }
        for(var i = 0; i < waiting_bees_index.length; i++){
            // hive.array[waiting_bees_index[i]] = waiting_bees[i];
            var bee = hive.array[waiting_bees_index[i]];
            bee.energy = waiting_bees[i].energy;
            bee.xLocationFood = waiting_bees[i].xLocationFood;
            bee.yLocationFood = waiting_bees[i].yLocationFood;

            bee.xDestination = waiting_bees[i].xDestination;
            bee.yDestination = waiting_bees[i].yDestination;
    
            bee.intent = waiting_bees[i].intent;
            bee.action = waiting_bees[i].action;
        }
    }
    for(var i = 0; i < dead_bees_index.length; i++){
        hive.array.slice(dead_bees_index[i], 1);
    }

    //Grid Update
    if(grid.tick >= 50){
        grid = updateGrid(grid);
        grid.tick = 0;
    }

    // Make new bees, need to add destination
    if(hive.honey >= hive.array.length*BEE_UPKEEP/4 && hive.array.length < MAX_BEE){
        var bee = generateBee();
        hive.array.push(bee);
        hive.honey -= capacity;
    }

    var current_grid_tick = grid.tick+1;
    Hive.updateOne({hive: req.body.params.hive}, {$set:{array: hive.array, honey: hive.honey}})
        .catch(err => console.log('Error saving Hive' + err ));
    Grid.updateOne({hive: req.body.params.hive}, {$set:{grid: grid.grid, tick: current_grid_tick}})
        .catch(err => console.log('Error saving Grid' + err ));
    
    res.end();
});

router.route('/add-bee').post((req, res) => {
    const xCoord = getRandomNumber(80,110);
    const yCoord = getRandomNumber(50, 70);
    var decider = getRandomNumber(0, 10);
    const randomizedIntent = "Waiting";
    if(decider <= 3){
        randomizedIntent = "Searching"
    }
    Hive.findOne({hive: req.query.hive})
        .then((result)=> {
            result.array.push(new Bee(BEE_ENERGY_MAX, "", randomizedIntent, "Completed",false, GRID_CENTER * width + xCoord, GRID_CENTER * height + yCoord, GRID_CENTER, GRID_CENTER, -1, -1, -1, -1, 0));
            result.save()
                .then(() => res.json('Bee created'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
    
});

router.route('/add-new-hive').post((req, res) => {
    //Options should be honey amount, # of food cells, and starting amount of bees
    //---Put
    var honey = req.body.starting_honey;
    var bee_amount = req.body.starting_bees;
    var food_amount = req.body.food_amount;
    if(honey > MAX_HONEY){
        honey = MAX_HONEY;
    }
    if(bee_amount > MAX_STARTING_BEES){
        bee_amount = MAX_STARTING_BEES;
    }
    if(food_amount > MAX_FOOD){
        food_amount = MAX_FOOD;
    }
    if(honey < 0){
        honey = MIN_HONEY;
    }
    if(bee_amount < 0){
        bee_amount = MIN_STARTING_BEES;
    }
    if(food_amount < 0){
        food_amount = MIN_FOOD;
    }
    
    var str = "";
    for(var i = 0; i < MAX_LENGTH; i++){
        str+=characters.charAt(Math.floor(Math.random()*characters.length));
    }
    const x = GRID_CENTER;
    const y = GRID_CENTER;
    const array = []; 
    for(var i = 0; i < bee_amount; i++){
        var bee = generateBee();
        array.push(bee);
    }

    
    const newHive = new Hive({hive:str, honey:honey, array:array, xLocationGrid:x, yLocationGrid:y});

    newHive.save()
        .then(() => {
            var size = GRID_SIZE;
            const grid = [];

            for(var i = 0; i < size; i++){
                grid[i] = [];
                for(var j =0; j < size; j++){
                    grid[i][j] = getNewCell(0, 0, false, i, j);
                }
            }
            for(var i = 0; i < food_amount; i++){
                var x, y = -1;
                while(x == -1 || y == -1 || (x == GRID_CENTER, y == GRID_CENTER)){
                    x = getRandomNumber(0, size);
                    y = getRandomNumber(0, size);
                    if(grid[x][y].flowerCount > 0){
                        x = -1;
                        y = -1;
                    }
                }
                grid[x][y] = setRandomStat(grid[x][y]);
            }
            const tick = 0;
            const newGrid = new Grid({hive: str, grid: grid, tick: tick});
            newGrid.save()
                .then(()=>{
                    res.json(str);
                })
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));

    
});
router.route('/delete-hive').post((req, res) => {
    Hive.findOneAndDelete({hive:req.query.hive})
        .then((result) => {
            Grid.findOneAndDelete({hive:req.params.hive})
                .then((result) => {
                    res.json("Deleted!");
                })
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});
function randomXCoord(){
    var xCoord = getRandomNumber(30, 160);
    return xCoord;
}
function randomYCoord(){
    var yCoord = getRandomNumber(30, 110);
    return yCoord;
}
function randomXCoordHive(){
    var xCoord = getRandomNumber(80, 110);
    return xCoord;
}
function randomYCoordHive(){
    var yCoord = getRandomNumber(50, 70);
    return yCoord;
}
function updateGrid(grid){
    var rMax = 0.01;
    for(var i = 0; i < GRID_SIZE; i++) {
        for(var j = 0; j < GRID_SIZE; j++){
            var regenerate = Math.floor((grid.grid[i][j].flowerCount/3) * grid.grid[i][j].quality/10);
            grid.grid[i][j].nectar += regenerate;
            
            var K = grid.grid[i][j].flowerMax;
            var N = grid.grid[i][j].flowerCount;
            var logGrowthRate = calculateLogGrowth(rMax + grid.grid[i][j].pollinationCounter, K, N);
            
            if(grid.grid[i][j].pollinated){
                logGrowthRate = Math.floor(logGrowthRate*1.2);
            }

            if(N > 0 && logGrowthRate <= 0){
                logGrowthRate = 1;
            }
            grid.grid[i][j].flowerCount += logGrowthRate;
            grid.grid[i][j].pollinationCounter = 0;
        }
    }
    return grid;
}
function calculateLogGrowth(rMax, K, N){
    return Math.round(rMax*N*((K-N)/K));
}
function isValidCell(grid, bee){
    var map = grid.grid;
    // console.log(bee.xLocationGrid + " " + bee.yLocationGrid);
    // console.log("GRID CELL:  "+ map[bee.xLocationGrid][bee.yLocationGrid]);
    if(map[bee.xLocationGrid][bee.yLocationGrid].nectar >= capacity){
        return true;
    }
    return false;
}
function selectDirection(array, bee, grid){
    //NORTH 0, -1
    //EAST 1, 0
    //SOUTH 0, 1
    //WEST -1, 0
    var flowerCount = 0;
    var foodDirection = -1;
    var quality = 0; //Feature to be added
    var grid = grid.grid;
    var xBee = bee.xLocationGrid;
    var yBee = bee.yLocationGrid;

    for(var i = 0; i < array.length; i++){
        switch(array[i]){
            case(NORTH):
                if(grid[xBee-1][yBee].flowerCount > 0 && grid[xBee-1][yBee].quality > quality){
                    foodDirection = NORTH;
                    flowerCount = grid[xBee-1][yBee].flowerCount;
                    quality = grid[xBee-1][yBee].quality;
                }
                break;
            case(SOUTH):
                if(grid[xBee+1][yBee].flowerCount > 0 && grid[xBee+1][yBee].quality > quality){
                    foodDirection = SOUTH;
                    flowerCount = grid[xBee+1][yBee].flowerCount;
                    quality = grid[xBee+1][yBee].quality;
                }
                break;
            case(EAST):
                if(grid[xBee][yBee+1].flowerCount > 0 && grid[xBee][yBee+1].quality > quality){
                    foodDirection = EAST;
                    flowerCount = grid[xBee][yBee+1].flowerCount;
                    quality = grid[xBee][yBee+1].quality;
                }
                break;
            case(WEST):
                if(grid[xBee][yBee-1].flowerCount > 0 && grid[xBee][yBee-1].quality > quality){
                    foodDirection = WEST;
                    flowerCount = grid[xBee][yBee-1].flowerCount;
                    quality = grid[xBee][yBee-1].quality;
                }
                break;
        }
    }
    return foodDirection;
}
function getValidDirections(bee){
    var directions = [];
    directions.push(0, 1, 2, 3);
    // console.log("Came from: " + bee.cameFrom);
    switch(bee.cameFrom){
        case('NORTH'):
            directions = removeFromArray(directions, 0);
            break;
        case('EAST'):
            directions = removeFromArray(directions, 1);
            break;
        case('SOUTH'):
            directions = removeFromArray(directions, 2);
            break;
        case('WEST'):
            directions = removeFromArray(directions, 3);
            break;
    }
    switch(bee.xLocationGrid){
        case(0):
            directions = removeFromArray(directions, NORTH);
            break;
        case(GRID_SIZE-1):
            directions = removeFromArray(directions, SOUTH);
            break;
    }
    switch(bee.yLocationGrid){
        case(0):
            directions = removeFromArray(directions, WEST);
            break;
        case(GRID_SIZE-1):
            directions = removeFromArray(directions, EAST);
            break;
    }
    if(bee.xLocationGrid == 2 && bee.yLocationGrid == 3){ //NORTH OF HIVE
        directions = removeFromArray(directions, SOUTH);
    }
    if(bee.xLocationGrid == 4 && bee.yLocationGrid == 3){ //SOUTH OF HIVE
        directions = removeFromArray(directions, NORTH);
    }
    if(bee.xLocationGrid == 3 && bee.yLocationGrid == 2){ //WEST OF HIVE
        directions = removeFromArray(directions, EAST);
    }
    if(bee.xLocationGrid == 3 && bee.yLocationGrid == 4){ //EAST OF HIVE
        directions = removeFromArray(directions, WEST);
    }
    if(directions.length == 0){
        direction = [];
        directions.push(1,2,3,4);

        switch(bee.xLocationGrid){
            case(0):
                directions = removeFromArray(directions, NORTH);
                break;
            case(GRID_SIZE-1):
                directions = removeFromArray(directions, SOUTH);
                break;
        }
        switch(bee.yLocationGrid){
            case(0):
                directions = removeFromArray(directions, WEST);
                break;
            case(GRID_SIZE-1):
                directions = removeFromArray(directions, EAST);
                break;
        }
        switch(bee.cameFrom){
            case('NORTH'):
                directions = removeFromArray(directions, 0);
                break;
            case('EAST'):
                directions = removeFromArray(directions, 1);
                break;
            case('SOUTH'):
                directions = removeFromArray(directions, 2);
                break;
            case('WEST'):
                directions = removeFromArray(directions, 3);
                break;
        }
    }   
    return directions;
}
function removeFromArray(array, value){
    for(var i = 0; i < array.length; i++){
        if(array[i] == value){
            array.splice(i, 1);
            break;
        }
    }
    return array;
}
function generateBee(){
    var xCoord = getRandomNumber(80, 110);
    var yCoord = getRandomNumber(50, 70);
    var rand = getRandomNumber(0,3);
    var xDir = 0;
    var yDir = 0;
    var cameFrom = "";
    switch(rand){
        case(NORTH):
            cameFrom = "SOUTH";
            yDir = -1;
            break;
        case(EAST):
            xDir = 1;
            cameFrom = "WEST";
            break;
        case(SOUTH):
            yDir = 1;
            cameFrom = "NORTH";
            break;
        case(WEST):
            xDir = -1;
            cameFrom = "EAST";
            break;
    }
    var xFirst = getRandomNumber(30, 160);
    var yFirst = getRandomNumber(30, 110);
    var xDest = (GRID_CENTER + xDir)*191 + xFirst;
    var yDest = (GRID_CENTER + yDir)*135 + yFirst;

    return new Bee(BEE_ENERGY_MAX, cameFrom, "Searching", "Pending", false, GRID_CENTER * 191 + xCoord, GRID_CENTER * 135 + yCoord, GRID_CENTER+yDir, GRID_CENTER+xDir, -1, -1, xDest, yDest, 0);
}

async function getHive(req){
    var val = null
    await Hive.findOne({hive: req.body.params.hive})
        .then((result) => {
            val = result;
        })
        .catch(err => res.status(400).json('Error: ' + err));
    return val;
}
async function getGrid(req){
    var val = null;
    await Grid.findOne({hive: req.body.params.hive})
        .then((res) => {
            val = res;
        })
        .catch(err => res.status(400).json('Error: ' + err));   
    return val;
}
function getRandomNumber(min, max){
    return Math.floor(Math.random() * (max - min) + min);
}
function setRandomStat(cell){
    cell.nectar =getRandomNumber(100,300);
    cell.flowerCount = getRandomNumber(50,100);
    cell.flowerMax = getRandomNumber(300,500);
    return cell;
}
function getNewCell(nectar, flowerCount, pollinated, x, y){
    flowerMax = getRandomNumber(100, 300);
    cell = new Cell(nectar, flowerCount, flowerMax, pollinated, x, y);
    return cell;
}
class Cell{
    constructor(nectar, flowerCount, flowerMax, pollinated, xLocationGrid, yLocationGrid){
        this.nectar = nectar;
        this.flowerCount = flowerCount;
        this.flowerMax = flowerMax;
        this.pollinated = pollinated;
        this.xLocationGrid = xLocationGrid;
        this.yLocationGrid = yLocationGrid;
        this.pollinationCounter = 0;
        this.quality = getRandomNumber(70, 100);
    }
}
class Bee{
    constructor(energy, cameFrom, intent, action,hasPollen, xLocation, yLocation, xLocationGrid, yLocationGrid, xLocationFood, yLocationFood, xDestination, yDestination, quality){
        this.energy = energy;
        this.cameFrom = cameFrom;
        this.intent = intent;
        this.action = action;
        this.hasPollen = hasPollen;
        this.xLocation = xLocation;
        this.yLocation = yLocation;
        this.xLocationGrid = xLocationGrid;
        this.yLocationGrid = yLocationGrid;
        this.xLocationFood = xLocationFood;
        this.yLocationFood = yLocationFood;
        this.xDestination = xDestination;
        this.yDestination = yDestination;
        this.quality = quality;
        this.tick = 0;
        this.recover_full = false;
        this.nectar = 0;

        //Fields meant for recovery, to let the bees go back to what they were doing
        this.prevIntent = ""; 
        this.prevLocationGrid = -1;
        this.prevLocationGrid = -1;

    }
}
module.exports = router;