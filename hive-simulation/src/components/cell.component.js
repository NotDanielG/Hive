
import React, { Component } from 'react';
import './css/cell.css';


export default class Cell extends Component {
    constructor(props){
        super(props);
        this.width = 0;
        this.height = 0;
    }
    getDimensions(){
        return [this.width, this.height];
    }
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
        this.refCallback = element => {
            if (element) {
            //   this.props.getSize(element.getBoundingClientRect().width);
                // console.log("WIDTH IS: " + element.getBoundingClientRect().width);
                this.width = element.getBoundingClientRect().width;
                this.height =  element.getBoundingClientRect().height;
            }
        };
        return (
            <div ref = {this.refCallback} style={styles.container} className = "cell">
                {row} {col}
            </div>
        )
    }
}
