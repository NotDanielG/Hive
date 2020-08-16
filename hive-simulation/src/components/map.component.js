
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
        // this.grid = [];
        // this.bees = [];
    }
    componentDidMount(){
        this.setState({hive: this.props.match.params.hive});
        const size = 7;
        var temp = [];
        for(var i = 0; i < size; i++){
            temp[i]=[];
            for(var j = 0; j < size; j++){
                temp[i][j] = <Cell row={i} column ={j}/>
            }
        }
        this.setState({grid: temp});
        this.bees = [];
        this.displayBees();
        // this.bees.push(<Bee x={500} y={500}/>); 
        

        // axios.get('http://localhost:5000/hive/'+this.state.hive + '/get-current-grid')
        // .then((response) => {
            
        // }).catch(err => console.log('Error: ' + err));;

    }
    async displayBees(){
        axios.get('http://localhost:5000/hive/get-current-hive',{
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



    //190W 132H
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
