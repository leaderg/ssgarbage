import React, { Component } from 'react';

class Discounts extends Component {
  // Initialize the state
  constructor(props){
    super(props);
    this.state = {
      discountValue: 0,
      discountActive: true,
      discountIsPercent: true
    }
  }

  toCents(input) {
    input *= 100
    return(input);
  }

  render() {
    let selected = {
      backgroundColor: '#00aded',
      color: 'white',
      border: '3px solid #0076a1'
    }
    return (
      <div className="cr-products-container">
        <div className="cr-discount-container">
          <h2 className="discount-header">Set Discount</h2>
          <div
            className="d-btn noselect"
            onClick={() => this.setState({discountIsPercent: true, discountValue: 0})}
            style={this.state.discountIsPercent ? selected : null}
          >
            Percent
          </div>
          <div
            className="d-btn noselect"
            onClick={() => this.setState({discountIsPercent: false, discountValue: 0})}
            style={!this.state.discountIsPercent ? selected : null}
          >
            Dollars Off
          </div>
          {this.state.discountIsPercent ? (
            <div>
              <input onChange={(e) => this.setState({discountValue: e.target.value})}/>%
            </div>
          ) : (
            <div>
              $<input onChange={(e) => this.setState({discountValue: this.toCents(e.target.value)})}/>
            </div>
          )}
          <div className='d-btn' onClick={() => this.props.removeDiscount()}>Remove Discount</div>
          <div
            className="d-btn"
            onClick={() => this.props.setDiscount(this.state.discountValue, this.state.discountIsPercent)}
          >
           Confirm
          </div>
        </div>
      </div>
    );
  }
}

export default Discounts;