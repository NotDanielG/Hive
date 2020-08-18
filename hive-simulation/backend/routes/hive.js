const router = require('express').Router();
let Hive = require('../models/hive.model');
let Grid = require('../models/grid.model');


let MAX_LENGTH = 4;
let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let GRID_SIZE = 7;
let GRID_CENTER = Math.floor(GRID_SIZE/2);

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
//TODO: Still needs work
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
    
    for(var i = 0; i < hive.array.length; i++){
        // hive.array[i]
        //action = none, don't do anything.
        //action = pending, continue traveling to destination. 
        //if dest reached, changed action to completed and go to intent. action changes in intent switch cases
        // switch(hive.array[i].intent){
        //     case('Searching'):
        //         break;
        //     case('Foraging'):
        //         break;
        //     case('Waiting'):
        //         break;
        //     case('Deposit'):
        //         break;
        // }   
        hive.array[i].xLocation+=1;
    }
    Hive.findOne({hive: req.body.params.hive})
        .then((result) => {
            result.array = hive.array;
            result.save()
                .then(() => res.json("Saved"))
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
            result.array.push(new Bee(10, "", randomizedIntent, "None",false, GRID_CENTER * 191 + xCoord, GRID_CENTER * 135 + yCoord, GRID_CENTER, GRID_CENTER, -1, -1, -1, -1));
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
            const newGrid = new Grid({hive: str, grid: grid});
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