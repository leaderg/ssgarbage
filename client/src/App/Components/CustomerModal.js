import React, { Component } from 'react';
import axios from 'axios';
import FuzzySearch from 'fuzzy-search';



class CustomerModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      customer: {
        name: "",
        email: "",
        phone_number: "",
        comments: "",
        loyalty_count: 0
      },
      selectedCustomer: {},
      customerSelected: false,
      openModal: false,
      createCustomer: false,
      editCustomer: false,
      list: [],
      pool: []
    }

  }

  //Modal Handlers
  showModal = () => {
    this.setState({
      openModal: true,
      customer: {
        name: "",
        email: "",
        phone_number: "",
        comments: "",
        loyalty_count: 0
      }
    })
  }

  hideModal = () => {
    this.setState({
      openModal: false,
      customerSelected: false,
      createCustomer: false,
      customer: {
        name: "",
        email: "",
        phone_number: "",
        comments: "",
        loyalty_count: 0
      }
    })
  }

  existingCustomerView = () => {
    this.setState({
      createCustomer: false,
      editCustomer: false,
      customerSelected: false,
      customer: {
        name: "",
        email: "",
        phone_number: "",
        comments: "",
        loyalty_count: 0
      }
    })
  }

  createCustomerView = () => {
    this.setState({
      createCustomer: true,
      customerSelected: false,
      customer: {
        name: "",
        email: "",
        phone_number: "",
        comments: "",
        loyalty_count: 0
      }
    })
  }

  //Form Input Handlers
  nameChange = event => {
    let customer = {...this.state.customer};
    customer.name = event.target.value;
    this.setState({ customer });
  }

  phoneNumberChange = event => {
    let customer = {...this.state.customer};
    customer.phone_number = event.target.value;
    this.setState({ customer });
  }

  emailChange = event => {
    let customer = {...this.state.customer};
    customer.email = event.target.value;
    this.setState({ customer });
  }

  commentsChange = event => {
    let customer = {...this.state.customer};
    customer.comments = event.target.value;
    this.setState({ customer });
  }

  customerSearch = event => {
    let searchterm = event.target.value;
    if(searchterm === "") {
      this.setState({list: this.state.pool})
    } else {
      let list = new FuzzySearch(this.state.pool, ['email', 'name', 'phone_number'], {sort: true}).search(searchterm)
      this.setState({ list });
    }
  }

  //Customer Related Calls

  getList = () => {
    axios
      .get(`/api/customers`)
      .then(res => {
        const list = res.data;
        this.setState({ list, pool: list });
      })
  }

  newCustomerSubmit = event => {
    const { customer } = this.state;
    let list = [...this.state.list];

    axios.post(`/api/customers`, { customer })
    .then(res => {
      this.props.setCustomer(res.data)
      list.push(customer)
      this.setState({
        selectedCustomer: customer,
        customerSelected: true,
        createCustomer: false,
        openModal: false,
        list: list,
        customer: {
          name: "",
          email: "",
          phone_number: "",
          comments: "",
          loyalty_count: 0
        }
      })
    })
  }

  editCustomerSubmit = event => {
    const { customer } = this.state;
    let list = [...this.state.list];

    axios.post(`/api/customers/${customer.id}`, { customer })
    .then(res => {
      this.props.setCustomer(res.data)
      this.getList()
      this.setState({
        selectedCustomer: customer,
        customerSelected: false,
        createCustomer: false,
        editCustomer: false,
        openModal: true,
        list: list,
        customer: {
          name: "",
          email: "",
          phone_number: "",
          comments: "",
          loyalty_count: 0
        }
      })
    })
  }

  chooseCustomer = (customer) => {
    this.setState({
      customer: customer,
      customerSelected: true
    })
  }

  editCustomer = (customer) => {
    this.setState({
      customer: customer,
      editCustomer: true
    })
  }

  confirmCustomerChoice = () => {
    this.props.setCustomer(this.state.customer.id)
    this.setState({
      selectedCustomer: this.state.customer,
      customerSelected: true,
      createCustomer: false,
      openModal: false
    })
  }

  componentDidMount() {
    this.getList();
  }

  render() {

    let createCustomerModal = (
      <div className="obscuring-background">
        <div className="customer-modal">
          <h1>Create A Customer</h1>
          Name<br/><input type="text" onChange={this.nameChange}/><br/><br/>
          Email <br/><input type="text" onChange={this.emailChange}/><br/><br/>
          Phone Number<br/><input type="text" onChange={this.phoneNumberChange}/><br/><br/>
          Comments<br/><input type="text" onChange={this.commentsChange}/>
          <div className="customer-button-new noselect" onClick={this.existingCustomerView}>Cancel</div>
          <div className="customer-button-confirm noselect" onClick={this.newCustomerSubmit}>Create Customer</div>
        </div>
      </div>
    )

    let editCustomerModal = (
      <div className="obscuring-background">
        <div className="customer-modal">
          <h1>Editing Customer</h1>
          Name<br/><input placeholder={this.state.customer.name} type="text" onChange={this.nameChange}/><br/><br/>
          Email <br/><input placeholder={this.state.customer.email} type="text" onChange={this.emailChange}/><br/><br/>
          Phone Number<br/><input placeholder={this.state.customer.phone_number} type="text" onChange={this.phoneNumberChange}/><br/><br/>
          Comments<br/><input placeholder={this.state.customer.comments} type="text" onChange={this.commentsChange}/>
          <div className="customer-button-new noselect" onClick={this.existingCustomerView}>Cancel</div>
          <div className="customer-button-confirm noselect" onClick={this.editCustomerSubmit}>Edit Customer</div>
        </div>
      </div>
    )

    let selectCustomerModal = (
      <div className="obscuring-background">
        <div className="customer-modal">
          <div className="customer-modal-heading">Select A Customer</div>
          <div className="customer-close-btn noselect" onClick={() => this.hideModal()}>Close</div>
          <div>
            Search For Customer <input placeholder="Name, phone or email" onChange={this.customerSearch} type="text"/>
          </div>
          *double click to edit
          <div className="customer-table-housing center">
            <table className="cr-customer-table fixHead" style={{marginLeft:"auto", marginRight:"auto"}}>
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Comments</th>
              </tr>
              {this.state.list.length === 0 ? (
                <tr><td colspan="5">No Customers Found</td></tr>
                ) : (
                this.state.list.map((customer, index) => {
                  return(
                    <tr onClick={() => this.chooseCustomer(customer)} onDoubleClick={() => this.editCustomer(customer)}>
                      <td>{customer.name}</td>
                      <td>{customer.phone_number}</td>
                      <td>{customer.email}</td>
                      <td>{customer.comments}</td>
                    </tr>
                  )
                }))
              }
            </table>

          </div>
          <div className="customer-selection">{this.state.customerSelected ? `${this.state.customer.name || this.state.selectedCustomer.name} Selected` : `Select A Customer`}</div>
          <div className="customer-button-new noselect" onClick={this.createCustomerView}>New Customer</div>
          <div className="customer-button-confirm noselect" onClick={this.confirmCustomerChoice}>Confirm Customer</div>
        </div>
      </div>
    )


    let customerSelectButton = (<td className="total-amount" onClick={this.showModal}><span className="noselect" style={{border: "2px solid grey", borderRadius: 3, padding: 2}}>Select Customer</span></td>)
    let customerSelectedRow = (<td className="total-amount" onClick={this.showModal}>{this.state.selectedCustomer.name}</td>)


    return (
      <tr>
        <td>Customer</td>
        {this.state.customerSelected ? customerSelectedRow : customerSelectButton}
        {this.state.openModal && (this.state.createCustomer ? createCustomerModal : (this.state.editCustomer ? editCustomerModal : selectCustomerModal))}
      </tr>
    );
  }
}


export default CustomerModal;