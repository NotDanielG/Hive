const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const hiveSchema = new Schema({
  honey: { type: int, required: true },
  xLocationGrid: {type: int, required: true},
  yLocationGrid: {type: int, required: true}
}, {
  timestamps: true,
});

const Hive = mongoose.model('Hive', hiveSchema);

module.exports = Hive;