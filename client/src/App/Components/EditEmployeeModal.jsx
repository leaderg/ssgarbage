import React, { Component } from 'react';
import axios from 'axios';

class EditEmployeeModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      openModal: false
    }
  }

  showModal() {
    this.setState({
      openModal: true
    })
  }

  hideModal() {
    this.setState({
      openModal: false
    })
  }

  firstNameChange = event => {
    let editEmployee = {...this.state.editEmployee};
    if(!event.target.value) {
      delete editEmployee.first_name
      this.setState({ editEmployee })
      return;
    }
    editEmployee.first_name = event.target.value
    this.setState({ editEmployee });
  }

  lastNameChange = event => {
    let editEmployee = {...this.state.editEmployee};
    if(!event.target.value) {
      delete editEmployee.last_name
      this.setState({ editEmployee })
      return;
    }
    editEmployee.last_name = event.target.value
    this.setState({ editEmployee });
  }

  phoneNumberChange = event => {
    let editEmployee = {...this.state.editEmployee};
    if(!event.target.value) {
      delete editEmployee.phone_number
      this.setState({ editEmployee })
      return;
    }
    editEmployee.phone_number = event.target.value
    this.setState({ editEmployee });
  }

  emailChange = event => {
    let editEmployee = {...this.state.editEmployee};
    if(!event.target.value) {
      delete editEmployee.email
      this.setState({ editEmployee })
      return;
    }
    editEmployee.email = event.target.value
    this.setState({ editEmployee });
  }

  usernameChange = event => {
    let editEmployee = {...this.state.editEmployee};
    if(!event.target.value) {
      delete editEmployee.username
      this.setState({ editEmployee })
      return;
    }
    editEmployee.username = event.target.value
    this.setState({ editEmployee });
  }

  passwordChange = event => {
    let editEmployee = {...this.state.editEmployee};
    if(!event.target.value) {
      delete editEmployee.password
      this.setState({ editEmployee })
      return;
    }
    editEmployee.password = event.target.value
    this.setState({ editEmployee });
  }

  dashboardChange = event => {
    let editEmployee = {...this.state.editEmployee};
    editEmployee.dashboard_access = event.target.checked
    this.setState({ editEmployee });
  }

  adminChange = event => {
    let editEmployee = {...this.state.editEmployee};
    editEmployee.admin_access = event.target.checked
    this.setState({ editEmployee });
  }

  updateEmployee = (employeeId) => {
    let employee = {...this.state.editEmployee};
    axios.put(`/api/employees/${employeeId}`, { employee })
      .then(res => {
        alert('Employee edited')
        this.props.getList()
        this.hideModal()
      })
  }

  deleteEmployee = (employeeId) => {
    let employee = { site_access: false, hidden: true };
    axios.put(`/api/employees/${employeeId}`, { employee })
      .then(res => {
        alert('Employee Deleted and site access removed.')
        this.props.getList()
        this.hideModal()
      })
  }

  modalView = (
    <div className="obscuring-background">
      <div className="customer-modal">
        <h1>Edit Employee</h1>
        <button className="close-btn" onClick={() => this.hideModal()}>Close</button>
        <div className="edit-employee-section">
        <div className="edit-employee-card">
          <div className="edit-employee-label">First Name</div>
          <input
          className="edit-employee-value"
          onChange={this.firstNameChange}
          placeholder={this.props.employee.first_name}/>
        </div>
        <div className="edit-employee-card">
          <div className="edit-employee-label">Last Name</div>
          <input
          className="edit-employee-value"
          onChange={this.lastNameChange}
          placeholder={this.props.employee.last_name}/>
        </div>
        <div className="edit-employee-card">
          <div className="edit-employee-label">Phone Number</div>
          <input className="edit-employee-value" onChange={this.phoneNumberChange} placeholder={this.props.employee.phone_number}/>
        </div>
        <div className="edit-employee-card">
          <div className="edit-employee-label">Email</div>
          <input className="edit-employee-value" onChange={this.emailChange} placeholder={this.props.employee.email} />
        </div>
        <div className="edit-employee-card">
          <div className="edit-employee-label">Username</div>
          <input className="edit-employee-value" onChange={this.usernameChange} placeholder={this.props.employee.username}/>
        </div>
        <div className="edit-employee-card">
          <div className="edit-employee-label">Password</div>
          <input className="edit-employee-value" onChange={this.passwordChange}/>
        </div>
        <div className="edit-employee-card">
          <div className="edit-employee-label">Report Access<input type="checkbox" onChange={this.dashboardChange} defaultChecked={this.props.employee.dashboard_access}/></div>
        </div>
        <div className="edit-employee-card">
          <div className="edit-employee-label">Admin Access<input type="checkbox" onChange={this.adminChange} defaultChecked={this.props.employee.admin_access}/></div>
        </div>
        </div>
        <div className="edit-employee-btn-section">
          <div className="edit-employee-delete-btn noselect" onClick={() => this.deleteEmployee(this.props.employee.id)}>Delete</div>
          <div className="edit-employee-save-btn noselect" onClick={() => this.updateEmployee(this.props.employee.id)}>Save</div>
        </div>
      </div>
    </div>
  )

  editButton = (
    <div onClick={() => this.showModal()} className="employee-edit-button noselect">
      Edit
    </div>
  )

  render() {
    return (
      <div>
      { this.state.openModal ? this.modalView : this.editButton }
      </div>
    )
  }
}
export default EditEmployeeModal;