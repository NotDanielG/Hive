
import React, { Component } from 'react';
import './css/map.css';
import axios from 'axios';
import Cell from './cell.component.js';
import Hive from './hive.component.js';
import Bee from './bee.component.js';

export default class Map extends Component {
    constructor(props){
        super(props);
        this.state = {hive: ''};
        this.grid = [];
        this.bees = [];
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
        this.displayBees();
        

        // axios.get('http://localhost:5000/hive/'+this.state.hive + '/get-current-grid')
        // .then((response) => {
            
        // }).catch(err => console.log('Error: ' + err));;

    }
    displayBees(){
        // 
        axios.get('http://localhost:5000/hive/get-current-grid',{
            params: {hive: this.props.match.params.hive}
        })
        .then((response) => {   
            this.bees = [];
            console.log("DAWAWDAAWAWDA");
            // console.log(response.data);
            // for(var i = 0; i < response.data.array.length; i++){
            //     this.bees.push(<Bee xGrid = {response.data.array[i].xLocationGrid} yGrid = {response.data.array[i].yLocationGrid} 
            //                        x = {response.data.array[i].xLocation} y = {response.data.array[i].yLocation}/>);
            // }
        }).catch(err => console.log('Error: ' + err));
    }


    //190W 132H
    //Grid CSS is at 14%(Assuming 7 wide grid)
    render() {
        return (
            <div className = "map-container">
                <div className = "id-tag">Hive ID: {this.state.hive}</div>
                <div className = "grid-container" >
                    <div className = "grid">
                        {this.grid}
                    </div>
                    <Hive />
                    {this.bees}
                </div>
                <div className = "cell-info"></div>
            </div>
        )
    }
}
