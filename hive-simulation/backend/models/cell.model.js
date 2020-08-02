const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const cellSchema = new Schema({
  nectar: { type: int, required: true },
  flowerCount: {type: int, required: true},
  flowerMax: {type:int, required: true},
  pollinated: {type: Boolean, required: true},
  xLocationGrid: {type: int, required: true},
  yLocationGrid: {type: int, required: true}
}, {
  timestamps: true,
});

const Cell = mongoose.model('Cell', cellSchema);

module.exports = Cell;