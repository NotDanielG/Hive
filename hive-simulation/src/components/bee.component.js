
import React, { Component } from 'react';

export default class Bee extends Component {
    render() {
        const styles = {
            container: {
                position: 'absolute',
                backgroundColor: 'rgb(0, 0, 0)',
                width: '4px',
                height: '4px',
                left: this.props.x + 'px',
                top: this.props.y + 'px',
                border: '1px solid black'
            }
        };
        return (
            <div style={styles.container}>
                
            </div>
        )
    }
}
