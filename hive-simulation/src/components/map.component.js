
import React, { Component } from 'react';
import axios from 'axios';

export default class Map extends Component {
    constructor(props){
        super(props);
        this.state = {hive: ''};
    }
    onComponentMount(){
        this.state.hive = this.props.match.params.hive;
    }
    render() {
        return (
            <div>
                <span className = "">Hive Grid Map for {this.state.hive}</span>
            </div>
        )
    }
}
