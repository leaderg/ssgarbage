import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

export default function withAuth(ComponentToProtect) {

  return class extends Component {

    constructor() {
      super();
      this.state = {
        loading: true,
        redirect: false,
      };
    }

    componentDidMount() {
      axios('/api/checkToken')
        .then(res => {
          if (res.status === 200) {
            this.setState({
              loading: false,
              user: res.data.user,
              dashboard: res.data.dashboard,
              admin: res.data.admin
            });
          } else {
            const error = new Error(res.error);
            throw error;
          }
        })
        .catch(err => {
          console.error(err);
          this.setState({ loading: false, redirect: true });
        });
    }

    render() {
      const { loading, redirect, admin, dashboard, user } = this.state;
      if (loading) {
        return null;
      }
      if (redirect) {
        return <Redirect to="/" />;
      }
      return <ComponentToProtect {...this.props} admin={admin} dashboard={dashboard} user={user} />;
    }
  }
}