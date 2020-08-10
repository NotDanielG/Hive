import React from 'react';
import { BrowserRouter as Router, Route ,Switch} from "react-router-dom";
import Index from './components/index.component';
import Map from './components/map.component.js';
import './App.css';


function App() {
  return (
    <Router>
      <div className="App-header">
        <Route path="/" exact component={Index} />
        <Route path='/hive/:hive' exact component={Map} />
      </div>
      
    </Router>
  );
}

export default App;
