
import React, { Component } from 'react';
import axios from 'axios';

export default class Load extends Component {
    constructor(props){
        super(props);
        this.state = {id: ''};
    }
    onChangeHandler = (event) =>{
        this.setState({id: event.target.value});
        // console.log(event.target.value);
    }
    onClickHandler = (event) =>{
        console.log("SENDING: " + this.state.id);
        axios.post('http://localhost:5000/hive/load', {
            hive: this.state.id
          })
          .then((response) => {
            console.log(response);
          }, (error) => {
            console.log(error);
          });
    }
    render() {
        return (
            <div>
                <form>
                <span>Insert Hive ID: </span>
                    <input onChange= {this.onChangeHandler} maxLength = '4' type = 'text'/>
                </form>
                <button onClick = {this.onClickHandler}>Load</button>
            </div>
        )
    }
}

