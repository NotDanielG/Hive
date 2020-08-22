const router = require('express').Router();
let Hive = require('../models/hive.model');
let Grid = require('../models/grid.model');

let MAX_LENGTH = 4;
let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let GRID_SIZE = 7;
let GRID_CENTER = Math.floor(GRID_SIZE/2);
let capacity = 8;

let NORTH = 0;
let EAST = 1;
let SOUTH = 2;
let WEST = 3;

let width = 191;
let height = 135;

//TODO: 
//Traveling function for bees - Completed Untested
//Grid changes based on flowerCount - Completed Untested
//Hive makes new bees - Completed Untested
//Energy Implementation + go back on low energy


//Later TODO:
//Pollination(can include a round based timer on the cell), based on a number, can increase flowerCount


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
    var hivePromise = getHive(req);
    var gridPromise = getGrid(req);
    var hive = null;
    var grid = null;
    await hivePromise.then((result) => {
        hive = result;
    });
    await gridPromise.then((result) => {
        grid = result;
    });
    
    //Bee Update
    for(var i = 0; i < hive.array.length; i++){
        var bee = hive.array[i];
        //action = none, don't do anything.
        //action = pending, continue traveling to destination. 
        //if dest reached, changed action to completed and go to intent. action can be changed in intent switch cases
        var doIntent = false;
        switch(bee.action){
            case('Pending'):
                var speed = 10;
                var xDifference = bee.xDestination - bee.xLocation;
                var yDifference = bee.yDestination - bee.yLocation;
                var angle = Math.atan2(yDifference, xDifference);

                var velocityX = Math.cos(angle)*speed;
                var velocityY = Math.sin(angle)*speed;

                bee.xLocation += velocityX;
                bee.yLocation += velocityY;

                if(bee.xLocation == bee.xDestination && bee.yLocation == bee.yLocation){
                    bee.action = 'Completed';
                    doIntent = true;
                }
                break;
            case('Completed'):
                doIntent = true;
                break;
            case('None'):
                break;
        }
        if(doIntent){
            switch(bee.intent){
                case('Searching'):
                    if(isValidCell(grid, bee)){
                        bee.intent = 'Deposit';
                        grid.grid[bee.xLocationGrid][bee.yLocationGrid].nectar -= capacity;
                        bee.nectar += capacity;

                        bee.xLocationFood = bee.xLocationGrid;
                        bee.yLocationFood = bee.yLocationGrid;

                        var xCoord = getRandomNumber(80, 110);
                        var yCoord = getRandomNumber(50, 70);
                        bee.xDestination = GRID_CENTER * width + xCoord;
                        bee.yDestination = GRID_CENTER * height + yCoord;
                        bee.action = 'Pending';
                    }
                    else{
                        var array = getValidDirections(bee);
                        var rand = getRandomNumber(0,array.length);
                        var xDirection = 0;
                        var yDirection = 0;
                        
                        if(rand == NORTH){
                            yDirection = -1;
                        }
                        if(rand == EAST){
                            xDirection = 1;
                        }
                        if(rand == SOUTH){
                            yDirection = -1;
                        }
                        if(rand == WEST){
                            xDirection = -1;
                        }
                        bee.xLocationGrid += xDirection;
                        bee.yLocationGrid += yDirection;

                        var xCoord = getRandomNumber(80, 110);
                        var yCoord = getRandomNumber(50, 70);

                        bee.xDestination = bee.xLocationGrid * width + xCoord;
                        bee.yDestination = bee.yLocationGrid * height + yCoord;
                        
                        bee.action = 'Pending';
                    }
                    
                    break;
                case('Foraging'): //Once action is completed, foraging is intent. 
                    if(isValidCell(grid, bee)){
                        bee.intent = 'Deposit';
                        grid.grid[bee.xLocationGrid][bee.yLocationGrid].nectar -= capacity;
                        grid.grid[bee.xLocationGrid][bee.yLocationGrid].pollinated = true;
                        bee.nectar += capacity;

                        bee.xLocationFood = bee.xLocationGrid;
                        bee.yLocationFood = bee.yLocationGrid;

                        var xCoord = getRandomNumber(80, 110);
                        var yCoord = getRandomNumber(50, 70);
                        bee.xDestination = GRID_CENTER * width + xCoord;
                        bee.yDestination = GRID_CENTER * height + yCoord;
                        bee.action = 'Pending';
                    }
                    else{
                        bee.action = 'Searching';
                    }
                    break;
                case('Waiting'):
                    break;
                case('Deposit'):
                    //--------------------------------Make sure to include energy usage
                    bee.intent = 'Foraging';
                    hive.honey += bee.nectar;
                    bee.nectar -= bee.nectar;

                    var xCoord = getRandomNumber(30, 160);
                    var yCoord = getRandomNumber(30, 110);

                    bee.xDestination = bee.xLocationFood * width + xCoord;
                    bee.yDestination = bee.yLocationFood * height + yCoord;
                    bee.action = 'Pending';
                    break;
            }   
        }
    }

    //Grid Update
    if(grid.tick >= 50){
        var rMax = 10;
        for(var i = 0; i < GRID_SIZE; i++) {
            for(var j = 0; j < GRID_SIZE; j++){
                var regenerate = Math.floor((grid.grid[i][j].flowerCount)/3);
                grid.grid[i][j].nectar += regenerate;
                
                var K = grid.grid[i][j].flowerMax;
                var N = grid.grid[i][j].flowerCount;
                var logGrowthRate = calculateLogGrowth(rMax, K, N);
                
                if(grid.grid[i][j].pollinated){
                    logGrowthRate = Math.floor(logGrowthRate*1.2);
                }

                if(N > 0 && logGrowthRate <= 0){
                    logGrowthRate = 1;
                }
                grid.grid[i][j].flowerCount += logGrowthRate;

            }
        }
        grid.tick = 0;
    }

    //Make new bees
    if(hive.nectar >= hive.array.length*8){
        var xCoord = getRandomNumber(80, 110);
        var yCoord = getRandomNumber(50, 70);
        hive.array.push(new Bee(10, "", "Searching", "None", false, GRID_CENTER * 191 + xCoord, GRID_CENTER * 135 + yCoord, GRID_CENTER, GRID_CENTER, -1, -1, -1, -1));
    }

    Hive.findOne({hive: req.body.params.hive})
        .then((result) => {
            result.array = hive.array;
            result.honey = result.honey;
            result.save()
                .then(() => console.log("Saved"))
                .catch(err => res.status(400).json('Error '+ err));
        })
        .catch(err => res.json('Could not be found'));
    
    Grid.findOne({hive: req.body.params.hive})
        .then((result) => {
            result.grid = grid.grid;
            result.tick += 1;
            result.save()
                .then(() => console.log("Saved"))
                .catch(err => res.status(400).json('Error '+ err));
        })
        .catch(err => res.json('Could not be found'));
    
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
            result.array.push(new Bee(10, "", randomizedIntent, "None",false, GRID_CENTER * width + xCoord, GRID_CENTER * height + yCoord, GRID_CENTER, GRID_CENTER, -1, -1, -1, -1));
            result.save()
                .then(() => res.json('Bee created'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
    
});

router.route('/add-new-hive').post((req, res) => {
    var str = "";
    for(var i = 0; i < MAX_LENGTH; i++){
        str+=characters.charAt(Math.floor(Math.random()*characters.length));
    }
    const honey = 100;
    const x = GRID_CENTER;
    const array = [];
    const y = GRID_CENTER;
    const xCoord = getRandomNumber(80, 110);
    const yCoord = getRandomNumber(50, 70);
    var bee = new Bee(10, "", "Searching", "None", false, GRID_CENTER * 191 + xCoord, GRID_CENTER * 135 + yCoord, GRID_CENTER, GRID_CENTER, -1, -1, -1, -1);
    array.push(bee);
    
    const newHive = new Hive({hive:str, honey:honey, array:array, xLocationGrid:x, yLocationGrid:y});

    newHive.save()
        .then(() => {
            var size = GRID_SIZE;
            var food_amount = 3;
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

function calculateLogGrowth(rMax, K, N){
    return Math.round(rMax*N*((K-N)/K));
}
function isValidCell(grid, bee){
    var map = grid.grid;
    if(map[bee.xLocationGrid][bee.yLocationGrid.nectar] >= capacity){
        return true;
    }
    return false;
}
function getValidDirections(bee){
    var directions = [];
    directions.push(0, 1, 2, 3);
    switch(bee.cameFrom){
        case('North'):
            directions = removeFromArray(directions, 0);
            break;
        case('East'):
            directions = removeFromArray(directions, 1);
            break;
        case('South'):
            directions = removeFromArray(directions, 2);
            break;
        case('West'):
            directions = removeFromArray(directions, 3);
            break;
    }
    switch(bee.xLocationGrid){
        case(0):
            directions = removeFromArray(directions, WEST);
            break;
        case(GRID_SIZE):
            directions = removeFromArray(directions, EAST);
            break;
    }
    switch(bee.yLocationGrid){
        case(0):
            directions = removeFromArray(directions, NORTH);
            break;
        case(GRID_SIZE):
            directions = removeFromArray(directions, SOUTH);
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
    await Grid.findOne({hive: req.body.params.hive})
        .then((res) => {
            return res;
        })
        .catch(err => res.status(400).json('Error: ' + err));   
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
    }
}
class Bee{
    constructor(energy, cameFrom, intent, action,hasPollen, xLocation, yLocation, xLocationGrid, yLocationGrid, xLocationFood, yLocationFood, xDestination, yDestination){
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
    }
    setIntent(intended){
        this.intent = intended;
    }
}
module.exports = router;