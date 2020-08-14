
import React, { Component } from 'react';
import './css/cell.css';
import axios from 'axios';


export default class Cell extends Component {
    constructor(props){
        super(props);
    }
    render() {
        const row = this.props.row;
        const col = this.props.column;
        console.log(row + " " + col);
        const styles = {
            container: {
                gridColumnStart: col,
                gridColumnEnd: col+1,
                gridRowStart: row,
                gridRowEnd: row+1
            }
        };
        return (
            <div style={styles.container}className = "cell">
                {row} {col}
            </div>
        )
    }
}
