import React, { Component } from 'react';
import { Redirect, Route, Switch, Link } from 'react-router-dom';

import Employees from './Employees';
import Inventory from './Inventory';
import Reports from './Reports';
import NavbarMain from '../Components/NavbarMain'


class Dashboard extends Component {
  render() {
    let { admin, dashboard, user } = this.props;

    if (!dashboard) {
      return <Redirect to="/register" admin={admin} dashboard={dashboard} user={user} />
    }

    return (
    <div className="App">
      <NavbarMain admin={admin} dashboard={dashboard}/>
      <Switch>
        <Route exact path='/dashboard' component={Reports}/>
        <Route path='/dashboard/inventory' component={Inventory}/>
        <Route path='/dashboard/employees' component={Employees}/>
        <Route path='/dashboard/reports' component={Reports}/>
      </Switch>
    </div>
    );
  }
}
export default Dashboard;