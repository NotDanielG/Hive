const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const hiveSchema = new Schema({
  hive: {type: String, required: true, unique: true},
  honey: { type: Number, required: true},
  array:{type: Array, required: true},
  xLocationGrid: {type: Number, required: true},
  yLocationGrid: {type: Number, required: true}
}, {
  timestamps: true,
});

const Hive = mongoose.model('Hive', hiveSchema);

module.exports = Hive;