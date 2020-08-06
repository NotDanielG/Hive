const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const gridSchema = new Schema({
  hive: { type: String, required: true ,unique:true},
  grid: { type: Array, required: true}
}, {
  timestamps: true,
});

const Grid = mongoose.model('Grid', gridSchema);

module.exports = Grid;