import React, { Component } from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import List from './pages/List';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import withAuth from './withAuth'

class App extends Component {
  render() {
    const App = () => (
      <div>
        <Switch>
          <Route exact path='/' component={Login}/>
          <Route path='/register' component={withAuth(Register)}/>
          <Route path='/dashboard' component={withAuth(Dashboard)}/>
          <Route exact path='/list' component={List}/>
        </Switch>
      </div>
    )
    return (
      <Switch>
        <App/>
      </Switch>
    );
  }
}

export default App;