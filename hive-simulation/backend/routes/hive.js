const router = require('express').Router();
let Hive = require('../models/hive.model');

let MAX_LENGTH = 4;
let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

router.route('/add-bee/:hive').post((req, res) => {
    Hive.findOne({hive: req.params.hive})
        .then((result)=> {
            result.array.push(new Bee(10, "", "", false, 6, 6, -1, -1, -1, -1));
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
    var bee = new Bee(10, "", "", false, 6, 6, -1, -1, -1, -1);
    array.push(bee);
    
    const newHive = new Hive({hive:str, honey:honey, array:array, xLocationGrid:x, yLocationGrid:y});
    newHive.save()
        .then(() => res.json('Hive created!'))
        .catch(err => res.status(400).json('Error: ' + err));
});
router.route('/delete-hive/:hive').post((req, res) => {
    Hive.findOneAndDelete({hive:req.params.hive})
        .then((result) => {
            res.json('Result: ' + result)
        })
        .catch(err => res.status(400).json('Error: ' + err));
});
function getRandomNumber(min, max){
    return Math.floor(Math.random() * (max - min) + min);
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