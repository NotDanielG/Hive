
import React, { Component } from 'react';
import './css/map.css';
import axios from 'axios';
import Cell from './cell.component.js';
import Hive from './hive.component.js';

export default class Map extends Component {
    constructor(props){
        super(props);
        this.state = {hive: ''};
        this.grid = [];
        this.test = [];
    }
    componentDidMount(){
        this.setState({hive: this.props.match.params.hive});
        const size = 7;
        for(var i = 0; i < size; i++){
            this.grid[i]=[];
            for(var j = 0; j < size; j++){
                this.grid[i][j] = <Cell row={i} column ={j}/>
            }
        }
        this.test.push(this.grid);
        // this.test.push(<Hive/>);
        // axios.get('http://localhost:5000/hive/'+this.state.hive + '/get-current-hive')
        // .then((response) => {

        // }).catch(err => console.log('Error: ' + err));

        // axios.get('http://localhost:5000/hive/'+this.state.hive + '/get-current-grid')
        // .then((response) => {
            
        // }).catch(err => console.log('Error: ' + err));;

    }
    //190W 132H
    //Grid CSS is at 14%(Assuming 7 wide grid)
    render() {
        return (
            <div className = "map-container">
                <div className = "id-tag">Hive ID: {this.state.hive}</div>
                <div className = "grid-container" >
                    <div className = "grid">
                        {this.test}
                    </div>
                    <Hive/>
                </div>
                <div className = "cell-info"></div>
            </div>
        )
    }
}
