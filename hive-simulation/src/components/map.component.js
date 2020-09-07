
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
        bees: [],
        honey: 0,
        beeCount: 0};
        this.interval = null;
        this.hiveID = '';
        this.updateGrid.bind(this)
    }
    async componentDidMount(){
        var temp = this.props.match.params.hive;
        await this.setState({hive: temp});
        this.hiveID = this.state.hive;
        this.updateGrid();
    }
    componentWillUnmount(){
        if(this.interval != null){
            clearInterval(this.interval);
        }
    }
    intervalButton = () => {
        if(this.interval == null){
            this.interval = setInterval(this.updateGrid.bind(this), 150);
        }
        else{
            this.interval = clearInterval(this.interval);
            this.interval = null;
        }
    }
    async displayGrid(){
        // const size = 7;
        var temp = [];
        axios.get('http://localhost:5000/hive/get-current-grid', {
            params: {hive: this.state.hive}
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
        axios.get('http://localhost:5000/hive/get-current-hive',{
            params: {hive: this.state.hive}
        })
        .then((response) => {   
            var temp = [];
            this.setState({honey: response.data[0].honey,
                           beeCount: response.data[0].array.length});
            for(var i = 0; i < response.data[0].array.length; i++){
                temp.push(<Bee x={response.data[0].array[i].xLocation} y ={response.data[0].array[i].yLocation} />);
            }
            this.setState({bees: temp});
        }).catch(err => console.log('Error: ' + err));
    }
    updateGrid = () =>{
        axios.post('http://localhost:5000/hive/process-grid', {
            params: {hive: this.state.hive}
        })
        .then((response) => {
            // console.log("Response: " + response.data);  
        }).catch(err => console.log('Error: ' + err));
        this.displayGrid();
        this.displayBees();
        this.render();
    }

    //191W 135H
    //Grid CSS is at 14%(Assuming 7 wide grid)
    render() {
        return (
            <div className = "map-container">
                <div className = "id-tag">Hive ID: {this.state.hive} <br/>
                    <div>Honey: {this.state.honey}</div>
                    <div>Bee Count: {this.state.beeCount}</div>
                    <button onClick = {this.intervalButton}>Toggle Process</button>
                </div>
                <div className = "grid-container" >
                    <div className = "grid">
                        {this.state.grid}
                    </div>
                    <Hive />
                    <div className = "bee-container">
                        {this.state.bees}
                    </div>
                </div>
                {/* <div className = "cell-info"></div> */}
            </div>
        )
    }
}
