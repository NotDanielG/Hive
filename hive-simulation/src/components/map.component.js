
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
            this.interval = setInterval(this.updateGrid.bind(this), 1000);
        }
        else{
            this.interval = null;
        }
        console.log(this.interval);
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
            console.log("DISPLAY GRIDDDDDDDD");
            this.setState({grid: temp});    
        }).catch(err => console.log('Error: ' + err));
        
    }
    async displayBees(){
        axios.get('http://localhost:5000/hive/get-current-hive',{
            params: {hive: this.state.hive}
        })
        .then((response) => {   
            var temp = [];
            for(var i = 0; i < response.data[0].array.length; i++){
                temp.push(<Bee x={response.data[0].array[i].xLocation} y ={response.data[0].array[i].yLocation} />);
            }
            console.log("DISPLAY BEEEEEEES");
            this.setState({bees: temp});
        }).catch(err => console.log('Error: ' + err));
    }
    updateGrid = () =>{
        console.log("Processing Grid");
        axios.post('http://localhost:5000/hive/process-grid', {
            params: {hive: this.state.hive}
        })
        .then((response) => {
            console.log("Response: " + response.data);  
        }).catch(err => console.log('Error: ' + err));
        console.log("Displaying Grid");
        this.displayGrid();
        console.log("Displaying Bees");
        this.displayBees();
        this.render();
        console.log("Running...");
    }

    //191W 135H
    //Grid CSS is at 14%(Assuming 7 wide grid)
    render() {
        return (
            <div className = "map-container">
                <div className = "id-tag">Hive ID: {this.state.hive} <br/>
                    <button onClick = {this.updateGrid}>Start Process</button>
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
                <div className = "cell-info"></div>
            </div>
        )
    }
}
