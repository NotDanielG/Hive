
import React, { Component } from 'react';
import axios from 'axios';
import Load from './load.component.js';

export default class Index extends Component {
  clickHandler = (e) =>{
    // e.preventDefault();
    console.log("BUTTON CLICKED");
    axios.post('http://localhost:5000/hive/test-route');

  }
  render() {
    return (
      <div>
        <button onClick = {(e) => this.clickHandler(e)}>Generate New Hive</button>
        <Load/>
      </div>
    )
  }
}
