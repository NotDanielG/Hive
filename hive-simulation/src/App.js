import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import Index from './components/index.component';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App-header">
        <Route path="/" exact component={Index} />
      </div>
    </Router>
  );
}

export default App;
