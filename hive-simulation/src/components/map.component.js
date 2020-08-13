
import React, { Component } from 'react';
import axios from 'axios';

export default class Map extends Component {
    constructor(props){
        super(props);
        this.state = {hive: ''};
    }
    componentDidMount(){
        this.setState({hive: this.props.match.params.hive});
    }
    render() {
        return (
            <div>
                Hive ID: {this.state.hive}
            </div>
        )
    }
}
