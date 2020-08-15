
import React, { Component } from 'react';

export default class Hive extends Component {
    render() {
        const row = this.props.row;
        const col = this.props.column;

        const styles = {
            container: {
                position: 'absolute',
                backgroundColor: 'rgba(255, 255, 0, 0.3)',
                width: '30px',
                height: '30px',
                left: 3*191 + 191/2 - 16 + 'px',
                top: 3*135 + 135/2 -16 + 'px',
                border: '1px solid black'
            }
        };
        return (
            <div style={styles.container}>
                
            </div>
        )
    }
}
