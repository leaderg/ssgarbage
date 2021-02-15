import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

class Login extends Component {
 constructor(props){
    super(props);
    this.state = {
    }
  }

  usernameChange = event => {
    this.setState({ username: event.target.value });
  }

  passwordChange = event => {
    this.setState({ password: event.target.value });
  }

  handleSubmit = event => {
    event.preventDefault();

    const employee = {
      username: this.state.username,
      password: this.state.password
    };

    axios.post(`/api/login`, { employee })
      .then((res) => {
        this.props.history.push('/register');
      })
      .catch(err => {
        this.setState({error: err.response.data.error})
      })
  }

  componentDidMount() {
    axios('/api/checkToken')
    .then(res => {
      if (res.status === 200) {
        this.props.history.push('/register');
      }
    })
  }

  render() {
    return (
    <div className="App">
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={this.handleSubmit}>
          <label>
            Username:<br/>
            <input type="text" name="user" onChange={this.usernameChange} />
          </label><br/><br/>
          <label>
            Password:<br/>
            <input type="password" name="password" onChange={this.passwordChange} />
          </label><br/><br/>
          <button type="submit">Go</button><br/>
          {this.state.error ? this.state.error : null}
        </form>
      </div>
    </div>
    );
  }
}
export default Login;