import React, { Component } from 'react';
import { Redirect, Route, Switch, Link } from 'react-router-dom';
import axios from 'axios';
import cookie from 'react-cookies'


class NavbarMain extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  logout = () => {
    cookie.remove('token', { path: '/' })
    window.location.replace('/');
  }


  render() {
    let { admin, dashboard, user } = this.props;
    return (
      <ul className='navbar'>
        <Link to={'/register'}>
          <li className='navbar-item'>
            Cash Register
          </li>
        </Link>
        { dashboard ?
        <Link to={'/dashboard/reports'}>
          <li className='navbar-item'>
            Reports
          </li>
        </Link>
        : null }
        { admin ?
        <Link to={'/dashboard/employees'}>
          <li className='navbar-item'>
            Employees
          </li>
        </Link>
        : null }
        { admin ?
        <Link to={'/dashboard/inventory'}>
          <li className='navbar-item'>
            Inventory
          </li>
        </Link>
        : null }
        { admin ?
        <Link to={'/discounts'}>
          <li className='navbar-item'>
            Discounts
          </li>
        </Link>
        : null }
        { dashboard ?
        <Link to={'/transactions'}>
          <li className='navbar-item'>
            Transactions
          </li>
        </Link>
        : null }
        <li className='navbar-item-right' onClick={this.logout}>
          Logout
        </li>
      </ul>
    );
  }
}


export default NavbarMain;