import React from 'react'

let LoginView = React.createClass({
  propTypes: {
    signedIn: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      signedIn: false
    }
  },

  getInitialState: function() {
    return {
      errors: null
    }
  },

  handleLogoutClick: function() {
  },

  handleAuthClick() {
  },

  render() {
    return (
      <div className="login-view">
        <div className="container">
          <h3>Login</h3>
        </div>
      </div>
    )
  }
})

module.exports = LoginView
