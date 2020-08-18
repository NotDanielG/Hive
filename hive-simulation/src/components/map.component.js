
import React, { Component } from 'react';
import './css/map.css';
import axios from 'axios';
import Cell from './cell.component.js';
import Hive from './hive.component.js';
import Bee from './bee.component.js';

export default class Map extends Component {
    constructor(props){
        super(props);
        this.state = {hive: '',
        grid: [],
        bees: []};
        const interval = null;
    }
    componentDidMount(){
        this.setState({hive: this.props.match.params.hive});
        this.updateGrid();
    }
    componentWillUnmount(){
        // clearInterval(interval);
    }
    updateGrid(){
        this.displayGrid();
        this.displayBees();
        axios.post('http://localhost:5000/hive/process-grid', {
            params: {hive: this.props.match.params.hive}
        })
        .then((response) => {
            console.log("Response: " + response.data);  
        }).catch(err => console.log('Error: ' + err));
    }
    async displayGrid(){
        const size = 7;
        var temp = [];
        await axios.get('http://localhost:5000/hive/get-current-grid', {
            params: {hive: this.props.match.params.hive}
        })
        .then((response) => {
            for(var i = 0; i < response.data[0].grid.length; i++){
                temp[i] = [];
                for(var j = 0; j < response.data[0].grid.length; j++){
                    temp[i][j] = <Cell row={i} column ={j} percentage={response.data[0].grid[i][j].flowerCount/500}/>
                }
            }
            this.setState({grid: temp});    
        }).catch(err => console.log('Error: ' + err));
        
    }
    async displayBees(){
        await axios.get('http://localhost:5000/hive/get-current-hive',{
            params: {hive: this.props.match.params.hive}
        })
        .then((response) => {   
            var temp = [];
            for(var i = 0; i < response.data[0].array.length; i++){
                temp.push(<Bee x={response.data[0].array[i].xLocation} y ={response.data[0].array[i].yLocation} />);
            }
            this.setState({bees: temp});
        }).catch(err => console.log('Error: ' + err));

    }

    //191W 135H
    //Grid CSS is at 14%(Assuming 7 wide grid)
    render() {
        return (
            <div className = "map-container">
                <div className = "id-tag">Hive ID: {this.state.hive}</div>
                <div className = "grid-container" >
                    <div className = "grid">
                        {this.state.grid}
                    </div>
                    <Hive />
                    <div className = "bee-container">
                        {this.state.bees}
                    </div>
                </div>
                <div className = "cell-info"></div>
            </div>
        )
    }
}
