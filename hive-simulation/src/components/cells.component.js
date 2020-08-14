
import React, { Component } from 'react';


export default class Cells extends Component {
    render() {
        return (
            <div style={styles.container}className = "cell">
                {row} {col}
            </div>
        )
    }
}
