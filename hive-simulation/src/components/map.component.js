
import React, { Component } from 'react';
import axios from 'axios';

export default class Map extends Component {
    constructor(props){
        super(props);
        this.state = {hive: ''};
    }
    render() {
        return (
            <div>
                Hive Grid Map for {this.state.hive}
            </div>
        )
    }
}
