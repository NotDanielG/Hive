const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useUnifiedTopology:true, useNewUrlParser: true, useCreateIndex: true });
const connection = mongoose.connection;

connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const beeRouter = require('./routes/bee');
const hiveRouter = require('./routes/hive');
const cellRouter = require('./routes/cell');

// app.use('/bee', beeRouter);
app.use('/hive', hiveRouter);
// app.use('/cell', cellRouter);

// app.get('/', function(req, res){
  
// });

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});