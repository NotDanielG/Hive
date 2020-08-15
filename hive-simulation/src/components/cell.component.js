
import React, { Component } from 'react';
import './css/cell.css';


export default class Cell extends Component {
    render() {
        const row = this.props.row;
        const col = this.props.column;

        const styles = {
            container: {
                gridColumnStart: col,
                gridColumnEnd: col+1,
                gridRowStart: row,
                gridRowEnd: row+1,
                backgroundColor: 'rgba(255, 255, 255, 0.8)'
            }
        };
        return (
            <div style={styles.container}className = "cell">
                {row} {col}
            </div>
        )
    }
}
