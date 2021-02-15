import React, { Component } from 'react';
import moment from 'moment';

class OrderReviewModal extends Component {

  toDollars = (input) => {
    input = Number(input);
    input  /= 100
    return(input.toFixed(2))
  }

  render() {

    if(this.props.info) {
    return (
<div className="obscuring-background">
  <div  className="ord">
    <button className="close-btn noselect" onClick={this.props.close}>Close</button>
    <div class="invoice-box">
        <table cellpadding="0" cellspacing="0">
            <tr class="top">
                <td colspan="2">
                    <table>
                        <tr>
                            <td class="title">
                                {/*<img src="https://www.sparksuite.com/images/logo.png" style="width:100%; max-width:300px;">*/}
                            </td>

                            <td>
                                Order #: {this.props.info.order[0].id}<br/>
                                Customer: {this.props.info.customer[0] ? this.props.info.customer[0].name : 'N/A'}<br/>
                                {moment(this.props.info.order[0].last_visited).format('MMM, Do YYYY h:mm a')}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <tr class="information">
                <td colspan="2">
                    <table>
                        <tr>
                            <td>
                                Sooke Detailing<br/>
                                6681 Logan Lane<br/>
                                Sooke, BC  V9Z 1A0
                            </td>

                            <td>
                                {this.props.info.employee[0] ? this.props.info.employee[0].first_name : 'Sooke Detail'}<br/>
                                (778) 352-2211<br/>
                                info@mysookecarwash.ca
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <tr class="heading">
                <td>
                    Payment Method
                </td>

                <td>
                    Amount
                </td>
            </tr>

              {this.props.info.payments.map((payment) => {
              return(

            <tr class="details">
                <td>
                    {payment.payment_method}
                </td>
                <td>
                    ${this.toDollars(payment.amount)}
                </td>
            </tr>

                )})}

            <tr class="heading">
                <td>
                    Item
                </td>

                <td>
                    Total
                </td>
            </tr>

              {this.props.info.lineItems.map((item) => {
              return(
            <tr  class="item">
              <td>{item.name} {(item.quantity > 1)? `x ${item.quantity}` : ``}</td>
              <td>${this.toDollars(item.price * item.quantity)}</td>
            </tr>
              )})}

            <tr class="total">
              <td></td>
              <td>
                Subtotal: ${this.toDollars(this.props.info.order[0].subtotal)}
              </td>
            </tr>

                {Number(this.props.info.order[0].discount) > 0 ? (
            <tr class="total">
              <td></td>
              <td>
                Discount: ${this.toDollars(this.props.info.order[0].discount)}
              </td>
            </tr>
                ) : null}
            <tr class="total">
              <td></td>
              <td>
                Tax: ${this.toDollars(this.props.info.order[0].tax)}
              </td>
            </tr>
            <tr class="total">
              <td></td>
              <td>
                 Total: ${this.toDollars(this.props.info.order[0].total)}
              </td>
            </tr>
        </table>
    </div>


  </div>
</div>
    );
  } else {
      return null
    }
  }
}
export default OrderReviewModal;

