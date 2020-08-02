const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const beeSchema = new Schema({
    energy: { type: int, required: true },
    cameFrom: {type: String, required: true},
    intent: {type: String, required: true},
    hasPollen: {type: Boolean, required: true},
    xLocation: {type: int, required: true}, // Location on screen
    yLocation: {type: int, required: true}, 
    xLocationGrid: {type: int, required: true},  // Location on 2d grid
    yLocationGrid: {type: int, required: true},
    xLocationFood: {type: int, required: true},  //Location of food
    yLocationFood: {type: int, required: true},
}, {
    timestamps: true,
});

const Bee = mongoose.model('Bee', beeSchema);

module.exports = Bee;