import React from 'react'
import LoginView from 'app/views/LoginView.jsx'

require('app/assets/css/advanced_app.scss')

let AdminApp = React.createClass({
  getInitialState: function() {
    return {
      user: window.advanced_user,
      userValidated: false
    }
  },

  constructContent() {
    let childProps = {
      user: this.state.user,
    }

    /*  pass state as props to children */
    let allChildren = React.cloneElement(
      this.props.children,
      ...[childProps]
    )

    /* show Loading... when we haven't done necessary fetches */
    if (!this.state.user.email) {
      allChildren = <div className="container">Loading...</div>
    }

    return allChildren
  },

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-xs-8">
            <h3 className="pull-left">Admin View</h3>
          </div>
          <div className="col-xs-4">
            <div className="pull-right">
              <span>User: {this.state.user.name} </span>
              <a href="/logout" className="btn btn-default btn-xs">Logout</a>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            {this.constructContent()}
          </div>
        </div>
      </div>
    )
  }
})

module.exports = AdminApp
