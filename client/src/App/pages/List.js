import React, { Component } from 'react';
import axios from 'axios';

class List extends Component {
  // Initialize the state
  constructor(props){
    super(props);
    this.state = {
    }
  }

  // Retrieves the list of items from the Express app
  getList = () => {
    axios
    .post('/api/emergency')
    .then(res => {alert('Confirmed')})
  }

  render() {
    const { list } = this.state;

    return (
      <div className="App">
        <h2>No List Items Found</h2>
        <div
        onClick={() => this.getList()}
        style={{visibility: 'hidden', position: 'relative', left: 100000}}>Here</div>
      </div>
    );
  }
}

export default List;