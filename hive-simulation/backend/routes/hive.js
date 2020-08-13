const router = require('express').Router();
let Hive = require('../models/hive.model');
let Grid = require('../models/grid.model');


let MAX_LENGTH = 4;
let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let GRID_SIZE = 7;
let GRID_CENTER = Math.floor(GRID_SIZE/2);


router.route('/load').post((req, res) => {
    console.log("PARAMS: " + req.body.hive);
    Hive.find({hive: req.body.hive})
        .then((result) => {
            res.json( result.length);
        })
        .catch(err => res.status(400).json('Error Not Found: ' + err));
    
});
router.route(':hive/get-cell-info').get((req, res) => {
    Hive.find({hive: req.params.hive})
        .then((result) => {
            var array = [];

        })
        .catch(err => res.status(400).json('Error: ' + err));
});
//TODO: Still needs work
router.route('/:hive/process-grid').post((req,res) => {
    var hive = null;
    var grid = null;
    Hive.findOne({hive: req.params.hive})
        .then((result) => {
            // res.json(result.array);
            hive = result;
        })
        .catch(err => res.status(400).json('Error: ' + err));

    for(var i = 0; i < hive.array.length; i++){
        switch(result.array[0].intent){
            case('Forage'):
                break;
            case('Waiting'):
                break;
            case('Deposit'):
                break;
        }
    }
});
router.route('/:hive/add-bee').post((req, res) => {
    Hive.findOne({hive: req.params.hive})
        .then((result)=> {
            result.array.push(new Bee(10, "", "", false, GRID_CENTER, GRID_CENTER, -1, -1, -1, -1));
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
    const x = 6;
    const array = [];
    const y = 6;
    var bee = new Bee(10, "", "", false, GRID_CENTER, GRID_CENTER, -1, -1, -1, -1);
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
                    res.json('Hive and Grid generated!');
                })
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));

    
});
router.route('/:hive/delete-hive').post((req, res) => {
    Hive.findOneAndDelete({hive:req.params.hive})
        .then((result) => {
            Grid.findOneAndDelete({hive:req.params.hive})
                .then((result) => {
                    res.json("Deleted!");
                })
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});
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
    constructor(energy, cameFrom, intent, hasPollen, xLocation, yLocation, xLocationGrid, yLocationGrid, xLocationFood, yLocationFood){
        this.energy = energy;
        this.cameFrom = cameFrom;
        this.intent = intent;
        this.hasPollen = hasPollen;
        this.xLocation = xLocation;
        this.yLocation = yLocation;
        this.xLocationGrid = xLocationGrid;
        this.yLocationGrid = yLocationGrid;
        this.xLocationFood = xLocationFood;
        this.yLocationFood = yLocationFood;
    }
    setIntent(intended){
        this.intent = intended;
    }
    stringify(){
        return JSON.stringify({
            energy: this.energy, 
            cameFrom: this.cameFrom, 
            intent: this.intent, 
            hasPollen: this.hasPollen, 
            xLocation: this.xLocation, 
            yLocation: this.yLocation, 
            xLocationGrid: this.xLocationGrid, 
            yLocationGrid: this.yLocationGrid, 
            xLocationFood: this. xLocationFood, 
            yLocationFood: this.yLocationFood});
    }
}
module.exports = router;