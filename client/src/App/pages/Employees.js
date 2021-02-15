import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import EditEmployeeModal from '../Components/EditEmployeeModal';
import axios from 'axios';

class Employees extends Component {
 constructor(props){
    super(props);
    this.state = {
      list: [],
      employeeSelected: false,
      employee: {},
      editEmployee: {}
    }
  }

  // Fetch the list on first mount
  componentDidMount() {
    this.getList();
  }

  // Retrieves the list of items from the Express app
  getList = () => {
    axios
      .get(`/api/employees`)
      .then(res => {
        const list = res.data;
        this.setState({ list,employeeSelected: false });
      })
  }

  //Get Employee
  getEmployee = (employeeId) => {
    axios
      .get(`/api/employees/${employeeId}`)
      .then(res => {
        const employee = res.data[0];
        this.setState({ employee, employeeSelected: true });
      })
  }

  firstNameChange = event => {
    let editEmployee = {...this.state.editEmployee};
    editEmployee.first_name = event.target.value
    this.setState({ editEmployee });
  }

  lastNameChange = event => {
    let editEmployee = {...this.state.editEmployee};
    editEmployee.last_name = event.target.value
    this.setState({ editEmployee });
  }

  phoneNumberChange = event => {
    let editEmployee = {...this.state.editEmployee};
    editEmployee.phone_number = event.target.value
    this.setState({ editEmployee });
  }

  emailChange = event => {
    let editEmployee = {...this.state.editEmployee};
    editEmployee.email = event.target.value
    this.setState({ editEmployee });
  }

  usernameChange = event => {
    let editEmployee = {...this.state.editEmployee};
    editEmployee.username = event.target.value
    this.setState({ editEmployee });
  }

  passwordChange = event => {
    let editEmployee = {...this.state.editEmployee};
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

  handleSubmit = event => {
    event.preventDefault();
    let employee = {...this.state.editEmployee};
    if (("first_name" in employee) && ("username" in employee) && ("first_name" in employee)) {
      axios.post(`/api/employees`, { employee })
      .then(res => {
        this.getList();
        alert('Employee created')
        this.props.history.push('/dashboard/employees');
      })
    }
    else {alert(
      `Employee Not Created:
      Please Enter all required fields (*)`
      )}
  }

  render() {
    const { list } = this.state;

    let createEmployeeForm = (
      <div className="create-employee">
      <div className="create-employee-size">
        <h2>Create Employee</h2>
        <form onSubmit={this.handleSubmit}>
          <label>
            First Name:<br/>
            <input type="text" name="firstName" onChange={this.firstNameChange} defaultValue=""/>*
          </label><br/>
          <label>
            Last Name:<br/>
            <input type="text" name="lastName" onChange={this.lastNameChange} defaultValue=""/>
          </label><br/>
          <label>
            Phone Number:<br/>
            <input type="text" name="phoneNumber" onChange={this.phoneNumberChange} defaultValue=""/>
          </label><br/>
          <label>
            Email:<br/>
            <input type="text" name="email" onChange={this.emailChange} defaultValue=""/>
          </label><br/>
          <label>
            Username:<br/>
            <input type="text" name="username" onChange={this.usernameChange} defaultValue=""/>*
          </label><br/>
          <label>
            Password:<br/>
            <input type="password" name="password" onChange={this.passwordChange} defaultValue=""/>*
          </label><br/>
          <label>
            Report Access:<br/>
            <input type="checkbox" name="access" onChange={this.dashboardChange} />
          </label><br/>
          <label>
            Admin Privaleges:<br/>
            <input type="checkbox" name="access" onChange={this.adminChange} />
          </label><br/><br/><br/>
          <button type="submit">Add</button>
        </form>
        </div>
      </div>)

    let employeeInfo = (
      <div className="create-employee">
        <div className="create-employee-size">
          <h2>Edit Employee</h2>
          <div>
            First Name:<br/>
            {this.state.employee.first_name || ""}
          </div><br/>
          <div>
            Last Name:<br/>
            {this.state.employee.last_name || ""}
          </div><br/>
          <div>
            Phone Number:<br/>
            {this.state.employee.phone_number || ""}
          </div><br/>
          <div>
            Email:<br/>
            {this.state.employee.email || ""}
          </div><br/>
          <div>
            Username:<br/>
            {this.state.employee.username || ""}
          </div><br/>
          <EditEmployeeModal key={this.state.employee.first_name} getList={this.getList} employee={this.state.employee}/>
        </div>
      </div>)

    return (
    <div className="App">
      <h1>Employees</h1>
      <div className="employee-view">
      <div className="current-employees-list">
        <div className="employee-list-size">
        <h2>Employee List</h2>

        {list.length ? (
        <div className="employee-list">
            {/* Render the list of items */}
            {list.map((item) => {
              return(
                <div className="employee-card noselect" onClick={() => this.getEmployee(item.id)}>
                  {item.first_name} {item.last_name}
                </div>
              );
            })}
            <div className="employee-card noselect" onClick={() => this.setState({employeeSelected: false})}>Add Employee</div>
          </div>
        ) : (
          <div className="employee-list">
          {/*<div className="employee-card noselect">Create Employee</div>*/}
          <div className="employee-card noselect">No List Items Found</div>
          </div>
        )
      }
      </div>
      </div>
      {this.state.employeeSelected ? employeeInfo : createEmployeeForm}
      </div>
    </div>
    );
  }
}
export default Employees;