import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render () {
    return (
      <div className='App'>
        <header className='App-header'>
          <img src={logo} className='App-logo' alt='logo' />
          <h1 className='App-title'>React with AWS Lambda REST API</h1>
        </header>
        <p className='App-intro'>
        Work in progress
        </p>
        <p>
          <a href='https://www.stackery.io'>www.stackery.io</a>
        </p>
      </div>
    );
  }
}

export default App;
