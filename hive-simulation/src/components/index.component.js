
import React, { Component } from 'react';
import axios from 'axios';
import Load from './load.component.js';
import {withRouter} from "react-router-dom";

class Index extends Component {
  constructor(props){
    super(props);
    this.state = {honey: 0,
                  bees: 0,
                  food_cells: 0}
  }
  clickHandler = (e) =>{
    var honey = e.target.honey.value;
    var bees = e.target.starting_bees.value;
    var food_cells = e.target.food_cells.value;
    console.log(honey + " " + bees + " " + food_cells);
    if(!Number(honey) || !Number(bees)|| !Number(food_cells)){
      alert('Values must be numbers')
    }
    else{
      axios.post('http://localhost:5000/hive/add-new-hive',{
        starting_honey: honey,
        starting_bees: bees,
        food_amount: food_cells
      })
      .then((response) => {
        var hive = response.data;
        this.props.history.push("/hive/"+ hive);
      })
      .catch(err => console.log('Error: ' + err));
    }
    e.preventDefault();
  }
  render() {
    return (
      <div>
        <form onSubmit = {(e)=> this.clickHandler(e)}>
          <span>Starting Honey Amount: </span><input type ='text' name='honey'></input> <br/>
          <span>Starting Bee Amount: </span><input type ='text' name='starting_bees'></input> <br/>
          <span>Food Cell Amount: </span><input type ='text' name='food_cells'></input> <br/>
          <input type ='submit'></input>
        </form> <br/>
        {/* <button onClick = {(e) => this.clickHandler(e)}>Generate New Hive</button> */}
        <Load/>
      </div>
    )
  }
}
export default withRouter(Index);
