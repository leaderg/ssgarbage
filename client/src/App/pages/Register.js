import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

import CustomerModal from '../Components/CustomerModal'
import PaymentModal from '../Components/PaymentModal'
import NavbarMain from '../Components/NavbarMain'
import NoteModal from '../Components/Notes'

class Register extends Component {

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      products: [],
      customerResetID: 0,
      selectedCategoryId: null,
      order: {
        "employeeId": this.props.user,
        "subtotal": 0,
        "tax": 0,
        "total": 0,
        "scale_reference": ""
      },
      lineItems: [],
      discounts: [],
      orderProducts: [],
      discountTriggers: [],
      discountByLineItem: []
    }
  }

  getCategories() {
    axios
    .get(`/api/categories`)
    .then(res => {
      const categories = res.data;
      this.setState({ categories });
    })
  }

  getDiscountTriggers() {
    axios
    .get('/api/discountTriggers')
    .then(res => {
      const discountTriggers = res.data;
      this.setState({ discountTriggers })
    })
  }

  getEmployee(employeeID) {
    axios
    .get(`/api/employees/${employeeID}`)
    .then(res => {
      const employee = res.data[0].first_name;
      this.setState({ employee });
    })
  }

  selectCategory(categoryId) {
    let product = {...this.state.product};
    product.categoryId = categoryId;
    axios
    .get(`/api/products/${categoryId}`)
    .then(res => {
      const selectedProducts = res.data;
      this.setState({
        products: selectedProducts,
        selectedCategoryId: categoryId,
        product
      });
    })
  }

  newOrderSubmit = (payments, cb) => {
    let { order, lineItems, discounts } = this.state

    order.lastVisited = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    order.employeeID = this.props.user;
    order.subtotal = this.toCents(this.getSubtotal());
    order.discount = this.toCents(this.getDiscount());
    order.tax = this.toCents(this.getTax());
    order.total = this.toCents(this.getTotal());

    let paymentTotal = 0
    payments.forEach(payment => {
      paymentTotal += payment.amount
    });
    let change = (paymentTotal - order.total);
    if (this.toDollars(order.total) > this.toDollars(paymentTotal)) {
      alert("Payments Insufficient" + `total:${order.total} Payments:${paymentTotal}`)
      return;
    }
    if (this.toDollars(order.total) < this.toDollars(paymentTotal)) {
      for (let payment of payments) {
        if(payment.payment_method == "Cash") {
          payment.amount -= (change)
          break;
        }
      };
    }
    axios
    .post(`/api/orderbuild`, { order, lineItems, payments, discounts })
    .then(res => {
      cb(this.toDollars(change), res.data);
    })
  }

  orderReset = () => {
    this.setState({
      customerResetID: this.state.customerResetID+1,
      order: {
      "employeeId": this.props.user,
      "discount": 0,
      "subtotal": 0,
      "tax": 0,
      "total": 0,
      "scale_reference": ""
      },
      lineItems: [],
      discounts: [],
      orderProducts: [],
      discountByLineItem: []
    })
  }

  //Order Helper Functions//////////////////
  getSubtotal = () => {
    let output = 0;
    this.state.lineItems.forEach(lineItem => {
      output += (lineItem.price * lineItem.quantity)
    })
    return this.toDollars(output)
  }

  getTax = () => {
    let output = 0;
    this.state.lineItems.forEach((lineItem, index) => {
      output += (((lineItem.price * lineItem.quantity) - this.state.discountByLineItem[index]) * (lineItem.tax_percent / 100))
    })
    return this.toDollars(output)
  }

  getDiscount = () => {
    let output = 0
    this.state.discounts.forEach(discount => {
      output += discount.total
    })
    return this.toDollars(output);
  }

  getTotal = () => {
    let subtotal = this.getSubtotal();
    let discounts = this.getDiscount();
    let tax = this.getTax();
    let total = this.toCents(subtotal) - this.toCents(discounts) + this.toCents(tax);
    return this.toDollars(total);
  }

  ////////////////////////////////////////////

  componentDidMount() {
    this.getCategories();
    this.getEmployee(this.props.user);
    this.getDiscountTriggers();
  }

  addLineItem(product) {
    let order  = {...this.state.order};
    let lineItems = [...this.state.lineItems];

    //Check if Product exists in lineItems already
    let itemPresent = lineItems.some(lineItem => lineItem.product_id === product.id)

    if(itemPresent) {
      //If present add Line Item QTY and then add to the order metrics.
      lineItems.find(item => item.product_id === product.id).quantity += 1;
      this.setState({ lineItems });
    } else {
      //Build Line Item object
      product.product_id = product.id;
      product.quantity = 1;
      product.price = Number(product.price);
      product.tax_percent = Number(product.tax_percent);

      //Add Line Item to the order
      lineItems.push(product)

      this.setState({ lineItems }, () => {
        this.tallyDiscounts(this.state.lineItems)
      });
    }
  }

  getProductDiscount(product) {
    return this.state.discountTriggers.filter( e => {
      return e.product_id == product.id
    })
  }

  tallyDiscounts(lineItems) {
    let output = []
    let discountByLineItem = []
    lineItems.forEach((lineItem, index) => {
      let relevantDiscount = this.getProductDiscount(lineItem)
      discountByLineItem[index] = 0
      if (relevantDiscount.length > 0) {
        let discount = {
          discount_trigger_id: relevantDiscount[0].id,
          total: lineItem.quantity * relevantDiscount[0].value
        }
        output.push(discount)
        discountByLineItem[index] = lineItem.quantity * relevantDiscount[0].value
      }
    })
    this.setState({ discounts: output, discountByLineItem})
  }

  //Quantity Text Field

  handleKeyPress = ( event, index) => {
    if(event.key === 'Enter'){
      if(event.target.value == "") {
      } else {
        this.quantityInput(event, index)
      }
    }
  }

  handleBlur = ( event, index) => {
    if(event.target.value == "") {
    } else {
    this.quantityInput(event, index)
    }
  }

  quantityInput = ( event, index) => {
    let qty = Number(event.target.value);
    event.target.value = "";
    this.changeQuantity(index, qty)
  }

  changeQuantity(index, newAmount) {
    let order  = {...this.state.order};
    let lineItems = [...this.state.lineItems];
    let item = {...lineItems[index]};

    //Remove previous line item price before quantity change
    order.subtotal -= (item.price*item.quantity);
    if(item.taxed) {
      order.tax -= (item.price * item.quantity * (item.tax_percent/100))
    }

    //Change Quantity
    item.quantity = newAmount;

    if(item.quantity <= 0) {
      lineItems.splice(index, 1);
      order.total = order.subtotal + order.tax;
      this.setState({ lineItems, order }, () => {
        this.tallyDiscounts(this.state.lineItems)
      });
      return
    }

    //Add line item values with new quantity.
    order.subtotal += (item.price*item.quantity);
    if(item.taxed) {
      order.tax += (item.price * item.quantity * (item.tax_percent/100))
    }

    order.total = order.subtotal + order.tax;
    lineItems[index] = item;

    this.setState({ lineItems, order }, () => {
        this.tallyDiscounts(this.state.lineItems)
      });
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

  scaleReferenceChange = event => {
    let order = {...this.state.order};
    order.scale_reference = event.target.value;
    this.setState({ order });
  }

  addPaymentMethod(type, value) {
    let payments = [...this.state.payments]
    let payment = {
      payment_method: type,
      amount: this.toCents(value)
    }
    payments.push(payment);
    this.setState({ payments });
  }

  paymentMethodSelection(e){
    this.setState({paymentMethod: e.target.value});
  }

  setCustomer = (customerId) => {
    let order = {...this.state.order};
    order.customer_id = customerId;
    this.setState({ order });
  }

  render() {
    let { categories, products, selectedCategoryId, order, lineItems } = this.state;
    let { admin, dashboard, user } = this.props;
    let subtotal = this.getSubtotal();
    let discount = this.getDiscount();
    let tax = this.getTax();
    let total = this.getTotal();


    return (
    <div className="App">
      <NavbarMain admin={admin} dashboard={dashboard}/>
      <h1>Cash Register</h1>
      <div className="cr-container">
        <div className="cr-product-section">
          <div>
          {categories.length ? (
            <div className="cr-product-category-selection">
              {categories.map((category) => { return(
              <div className="cr-category-card noselect" onClick={() => this.selectCategory(category.id)}>
                {category.name}
              </div>
                )})}
            </div>
          ) : (
            <div>
              <h3>No Categories Found</h3>
            </div>
          )}
        </div>
          {selectedCategoryId === null ? (
            <div className="cr-select-category-message">No Category Selected</div> )
          : (products.length ? (
                <div className="cr-products-container">
                {products.map((product) => {
                  return(
                    <div className="cr-product-card noselect" onClick={() => this.addLineItem(product)}>{product.name}</div>
                  )
                })}
                </div>) : (<h3>No Products Found</h3>))}
        </div>
        <div className="cr-order-section">
          <h1>Order</h1>
          <table className="cr-order-table-total">
            <tr>
              <td>Employee</td>
              <td className="total-amount">{this.state.employee}</td>
            </tr>
            <CustomerModal setCustomer={this.setCustomer} key={this.state.customerResetID}/>
            <tr>
              <td>Scale Reference</td>
              <td className="total-amount"><input type="text" onChange={this.scaleReferenceChange} /></td>
            </tr>
          </table>

          <table className="cr-order-table-products">
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
            {lineItems.length === 0 ? (
              <tr><td colspan="3">Please Add A Product</td></tr>
            ) : (
              lineItems.map((product, index) => {
                return(
                  <tr>
                    <td>{product.name}</td>
                    <td>
                      <button onClick={() => this.changeQuantity(index, product.quantity-1)}>-</button>
                      <input
                        type="text"
                        placeholder={product.quantity}
                        onKeyPress={(e) => this.handleKeyPress(e, index)}
                        onBlur={(e) => this.handleBlur(e, index)}
                        className="qty-bar"
                      />
                       <button onClick={() => this.changeQuantity(index, product.quantity+1)}>+</button>
                    </td>
                    <td>${this.toDollars(product.price * product.quantity)}</td>
                  </tr>
                )
              }))
            }
          </table>

          <br/>
          <table className="cr-order-table-total">
            <tr>
              <td>Subtotal</td>
              <td className="total-amount">${subtotal}</td>
            </tr>
            {discount > 0 ?
                        <tr>
                          <td>Discount</td>
                          <td className="total-amount" style={{color: 'red'}}>-${discount}</td>
                        </tr> : null}
            <tr>
              <td>Tax</td>
              <td className="total-amount">${tax}</td>
            </tr>
            <tr className="total-row">
              <td>Total</td>
              <td className="total-amount">${total}</td>
            </tr>
          </table>
          <PaymentModal
            lineItems={this.state.lineItems}
            order={this.state.order}
            newOrderSubmit={this.newOrderSubmit}
            subtotal={subtotal}
            tax={tax}
            orderTotal={total}
            resetOrder={this.orderReset}
          />
        </div>
        <div className="cr-clear"></div>
        <NoteModal/>
      </div>
    </div>
    );
  }
}

export default Register;