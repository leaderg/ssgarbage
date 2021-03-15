import React, { Component } from 'react';
import ReactToPrint from 'react-to-print';

import {
  CircularProgress
} from "@material-ui/core";

import moment from 'moment';

function toDollars(input) {
  input = Number(input);
  input  /= 100
  return(input.toFixed(2))
}

class ComponentToPrint extends React.Component {

  constructor(props) {
    super(props);
  }

  toDollars(input) {
    input = Number(input);
    input  /= 100
    return(input.toFixed(2))
  }

  render() {
    return (
      <div>
        <div className="receipt-header">
          <h3>Salt Spring Garbage</h3>
          360 Blackburn<br/>
          Salt Spring Island, BC V8K2B8<br/>
          (250) 537-2167<br/><br/>
          {moment(this.props.date).format("LLL")}
          Ref #: {this.props.orderNumber}<br/>

        </div>

        <div className="receipt-line-items">
          <table>
            <tr>
              <th style={{textAlign: "center"}}>Qty</th>
              <th style={{textAlign: "center"}}>Desc.</th>
              <th>Price</th>
              <th>Amt.</th>
            </tr>
            {this.props.lineItems.map(lineItem => {
            return (
              <tr className="receipt-row">
                <td style={{textAlign: "center"}}>{lineItem.quantity}</td>
                <td style={{textAlign: "center"}}>{lineItem.name}</td>
                <td className="receipt-amount">{this.toDollars(lineItem.price)}</td>
                <td className="receipt-amount">{this.toDollars(lineItem.price * lineItem.quantity)}</td>
              </tr>)
            })}
          </table>
        </div>

        <div className="receipt-totals-div">
          <div className="receipt-totals-labels">
            <div>Sub Total</div>
            {this.props.discount > 0 ? (<div>Discount</div>) : null}
            <div>Tax</div>
            <div><b>Total</b></div>
          </div>
          <div className="receipt-totals-values">
            <div>${this.props.subtotal}</div>
            {this.props.discount > 0 ? (<div>-${this.props.discount}</div>) : null}
            <div>${this.props.tax}</div>
            <div><b>${this.props.total}</b></div>
          </div>
        </div>


        <div className="receipt-footer">
          Thank you for choosing Salt Spring Garbage!<br/>
          GST# 89204 3548 RT001
        </div>
      </div>
    );
  }
}

class PaymentsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openModal: false,
      receiptPage: false,
      inputAmount: 0,
      payments: [],
      change: "0.00",
      date: "",
      orderNumber: null
    }
  }

  //Modal Handlers
  showModal() {
    this.setState({
      openModal: true,
      inputAmount: this.toCents(this.props.orderTotal)
     })
  }

  hideModal() {
    this.setState({ openModal: false })
  }

  toDollars(input) {
    input = Number(input);
    input  /= 100
    return(input.toFixed(2))
  }

  toCents(input) {
    input *= 100
    return(input);
  }

  inputAmountChange = event => {
    this.setState({ inputAmount: this.toCents(event.target.value) });
  }

  createPayment = (type) => {
    let payments = [...this.state.payments];
    payments.push({ amount: this.state.inputAmount, payment_method: type})
    this.setState({ payments });
  }

  totalOrder = () => {
    let total = this.toCents(this.props.orderTotal)
    this.state.payments.forEach(payment => {
      total -= payment.amount
    })
    return this.toDollars(total)
  }

  removePayment = (index) => {
    let payments = [...this.state.payments];
    payments.splice(index, 1);
    this.setState({ payments })
  }

  receiptView = (change, orderInfo) => {
    this.setState({
      receiptPage: true,
      change: change,
      orderNumber: orderInfo.id,
      date: orderInfo.last_visited
    })
  }

  done = () => {
    this.props.resetOrder()
    this.setState({
      receiptPage: false,
      openModal: false,
      payments: [],
      change: "0.00",
      date: "",
      orderNumber: null
    })
  }

  render() {
    let receiptModal = (
      <div className="obscuring-background">
        <div className="customer-modal">
          <div className="cr-receipt-change">Change</div>
          <div className="cr-receipt-change-amt">${this.state.change}</div>
          <ReactToPrint
              trigger={() => <div className="cr-receipt-print-btn noselect">Print Receipt</div>}
              content={() => this.componentRef}
              pageStyle={`@page { size: 80mm ${85 + (this.props.lineItems.length * 6)}mm }`}
            />
            <div  style={{display: 'none'}}>
            <ComponentToPrint
              ref={el => (this.componentRef = el)}
              order={this.props.order}
              subtotal={this.props.subtotal}
              discount={this.props.discount}
              tax={this.props.tax}
              total={this.props.orderTotal}
              lineItems={this.props.lineItems}
              discountActive={this.props.discountActive}
              date={this.state.date}
              orderNumber={this.state.orderNumber}
            />
            </div>
            <div className="cr-receipt-close noselect" onClick={() => this.done()}>Done</div>
        </div>
      </div>
      )

    let paymentModal = (
      <div className="obscuring-background">
        <div className="payment-modal">
          <h1>Payment Methods</h1>
          <h2>Amount Due:</h2>
          <h1>${this.totalOrder()}</h1>
          <div className="cr-payment-table-house">
          {( this.state.payments.length === 0 ) ? null :
          <table className="cr-payment-table-total">
            <tr>
              <th><u>Payment Method</u></th>
              <th><u>Amount</u></th>
            </tr>
            {this.state.payments.map((payment, index) => {
              return(
                <tr className="cr-payment-row">
                  <td>{payment.payment_method}</td>
                  <td>${this.toDollars(payment.amount)}</td>
                  <td><button onClick={() => this.removePayment(index)}>x</button></td>
                </tr>
              )
            })}
          </table> }
          </div>
          <div className="add-payment-div">
            <h1>Add Payment</h1>
            $<input type="text" defaultValue={this.totalOrder()} onChange={this.inputAmountChange}/>
            <button onClick={() => this.createPayment("Cash")}>Cash</button>
            <button onClick={() => this.createPayment("Debit")}>Debit</button>
            <button onClick={() => this.createPayment("Credit")}>Credit</button>
            <button onClick={() => this.createPayment("Charge")}>Charge</button>
            <button onClick={() => this.createPayment("Cheque")}>Cheque</button>
          </div>
          <div className="cr-payment-button-cancel noselect" onClick={() => this.hideModal()}>Cancel</div>
          {
            this.props.loading ?
          <div className="customer-button-confirm noselect"><CircularProgress /></div>
            :
          <div className="customer-button-confirm noselect" onClick={() => this.props.newOrderSubmit(this.state.payments, this.receiptView)}>Checkout</div>
          }
        </div>
      </div>
    )


    return (
      <fragment>
        <div onClick={() => this.showModal()} className="choose-payment-btn">Choose Payment</div>
        {this.state.openModal ? (this.state.receiptPage ? receiptModal : paymentModal) : null}
      </fragment>
    );
  }
}
export default PaymentsModal;