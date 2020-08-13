
import React, { Component } from 'react';
import axios from 'axios';
import Load from './load.component.js';
import {withRouter} from "react-router-dom";

class Index extends Component {
  clickHandler = (e) =>{
    axios.post('http://localhost:5000/hive/add-new-hive')
    .then((response) => {
      var hive = response.data;
      this.props.history.push("/hive/"+ hive);
    })
    .catch(err => console.log('Error: ' + err));
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
export default withRouter(Index);
