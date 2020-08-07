
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
        
    }
    render() {
        return (
            <form>
            <span>Insert Hive ID: </span>
            <input onChange= {this.onChangeHandler} maxlength = '4' type = 'text'/>
            <button onClick = {this.onClickHandler}>Load</button>
            </form>
        )
    }
}

