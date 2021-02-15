import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

import CustomerModal from '../Components/CustomerModal'
import PaymentModal from '../Components/PaymentModal'
import NavbarMain from '../Components/NavbarMain'
import Discounts from '../Components/Discounts'

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
        'discount': 0,
        "tax": 0,
        "total": 0
      },
      discountValue: 0,
      discountActive: false,
      discountIsPercent: false,
      lineItems: [],
      orderProducts: []
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
    let { order, lineItems } = this.state

    order.lastVisited = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    order.employeeID = this.props.user;
    order.subtotal = this.toCents(this.getSubtotal());
    order.discount = this.toCents(this.getDiscount());
    order.tax = this.toCents(this.state.discountIsPercent ? this.taxOnPercentDiscount() : this.taxOnFlatDiscount());
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
    .post(`/api/orderbuild`, { order, lineItems, payments })
    .then(res => {
      cb(this.toDollars(change));
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
      "total": 0
      },
      discountValue: 0,
      discountActive: false,
      discountIsPercent: false,
      lineItems: []
    })
  }

  setDiscount = (value, percent) => {
    if(percent) {
      let lineItems = [...this.state.lineItems]
      lineItems.forEach(lineItem => {
        lineItem.discount = (lineItem.price * (value / 100))
      })
      this.setState({
        lineItems,
        discountValue: value,
        discountActive: true,
        discountIsPercent: true
      })
    }
    else {

      this.setState({
        discountValue: value,
        discountActive: true,
        discountIsPercent: false
    })}
  }

  removeDiscount = () => {
    this.setState({
      discountValue: 0,
      discountActive: false,
      discountIsPercent: false
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

  taxOnPercentDiscount = () => {
    let output = 0;
    this.state.lineItems.forEach(lineItem => {
      output += ((lineItem.price - lineItem.discount) * lineItem.quantity * (lineItem.tax_percent / 100))
    })
    return this.toDollars(output)
  }

  taxOnFlatDiscount = () => {
    let output = 0;
    this.state.lineItems.forEach(lineItem => {
      output += (lineItem.price * lineItem.quantity * (lineItem.tax_percent / 100))
    })
    output -= (this.state.discountValue * 0.05)
    return this.toDollars(output)
  }

  getDiscount = () => {
    let output = 0;
    if(this.state.discountIsPercent) {
      this.state.lineItems.forEach(lineItem => {
        output += (lineItem.discount * lineItem.quantity)
      })
    }
    else {
      output = this.state.discountValue
    }
    return this.toDollars(output);
  }

  getTotal = () => {
    let subtotal = this.getSubtotal();
    let tax = this.state.discountIsPercent ? this.taxOnPercentDiscount() : this.taxOnFlatDiscount();
    let discount = this.getDiscount()
    let total = this.toCents(subtotal) + this.toCents(tax) - this.toCents(discount);
    return this.toDollars(total);
  }

  ////////////////////////////////////////////

  priceAfterDiscount = (total, discountValue, percentage) => {
    let discount = {
      finalPrice: 0,
      deducted: 0
    }
    if(percentage) {
      discount.finalPrice = (total * (1 - (discountValue / 100)))
    }
    else {
      discount.finalPrice = total - discountValue;
    }
    discount.deducted = total - discount.finalPrice
    return discount;
  }

  componentDidMount() {
    this.getCategories();
    this.getEmployee(this.props.user);
  }

  addLineItem(product) {
    let order  = {...this.state.order};
    let lineItems = [...this.state.lineItems];

    //Check if Product exists in lineItems already
    let itemPresent = lineItems.some(lineItem => lineItem.product_id === product.id)

    if(itemPresent) {
      lineItems.find(item => item.product_id === product.id).quantity += 1;
      order.subtotal += product.price;
      order.tax += (product.price * (product.tax_percent/100))
      order.total = order.subtotal + order.tax;
      this.setState({ lineItems, order });
    } else {
      if(this.state.discountActive && this.state.discountIsPercent) {
        product.discount = product.price * (this.state.discountValue / 100)
        product.discount = product.discount.toFixed(2);
      }
      else { product.discount = 0}
      product.product_id = product.id;
      product.quantity = 1;
      product.price = Number(product.price);
      product.tax_percent = Number(product.tax_percent);

      order.subtotal += product.price;
      order.tax += (product.price * (product.tax_percent/100))
      order.total = order.subtotal + order.tax;


      lineItems.push(product)

      this.setState({ lineItems, order });
    }
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
      this.setState({ lineItems, order });
      return
    }

    //Add line item values with new quantity.
    order.subtotal += (item.price*item.quantity);
    if(item.taxed) {
      order.tax += (item.price * item.quantity * (item.tax_percent/100))
    }

    order.total = order.subtotal + order.tax;
    lineItems[index] = item;

    this.setState({ lineItems, order });
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
    let tax = this.state.discountIsPercent ? this.taxOnPercentDiscount() : this.taxOnFlatDiscount();
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

                {categories.map((category) => {
                  return(
                    <div className="cr-category-card noselect" onClick={() => this.selectCategory(category.id)}>{category.name}</div>
                  );}
                )}
              <div className="cr-category-card noselect" onClick={() => this.setState({selectedCategoryId: 'discount'})}>Discount</div>
            </div>
          ) : (
            <div>
              <h3>No Categories Found</h3>
            </div>
          )
          }
        </div>
          { selectedCategoryId === 'discount' ? (
              <Discounts setDiscount={this.setDiscount} removeDiscount={this.removeDiscount}/>
              ) : (
                    selectedCategoryId === null ? ( <div className="cr-select-category-message">No Category Selected</div> )
                    : (products.length ? (
                          <div className="cr-products-container">
                          {products.map((product) => {
                            return(
                              <div className="cr-product-card noselect" onClick={() => this.addLineItem(product)}>{product.name}</div>
                            )
                          })}
                          </div>) : (<h3>No Products Found</h3>)))}
        </div>
        <div className="cr-order-section">
          <h1>Order</h1>
          <table className="cr-order-table-total">
            <tr>
              <td>Employee</td>
              <td className="total-amount">{this.state.employee}</td>
            </tr>
            <CustomerModal setCustomer={this.setCustomer} key={this.state.customerResetID}/>
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
                       {product.quantity}
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
            {
              this.state.discountActive ? (
            <tr>
              <td>Discount</td>
              <td className="total-amount" style={{color: 'red'}}>-${discount}</td>
            </tr>
              ) : null
            }
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
            discountActive={this.state.discountActive}
            discount={discount}
            orderTotal={total}
            resetOrder={this.orderReset}
          />
        </div>
        <div className="cr-clear"></div>
      </div>
    </div>
    );
  }
}

export default Register;