
import React, { Component } from 'react';
import axios from 'axios';

import {withRouter} from "react-router-dom";

class Load extends Component {
    constructor(props){
        super(props);
        this.state = {id: '',
                    redirect:false};
    }
    onChangeHandler = (event) =>{
        this.setState({id: event.target.value});
    }
    onClickHandler = (event) =>{
        axios.post('http://localhost:5000/hive/load', {
            hive: this.state.id
        })
        .then((response) => {
            if(response.data !== 0){
                // var url = 'http://localhost:5000/hive/' + this.state.id;
                this.props.history.push("/hive/"+this.state.id);
            }
        }).catch(err => console.log('Error: ' + err));
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
export default withRouter(Load);
