import React from 'react'
import {Link} from 'react-router'

let ErrorView = React.createClass({
  render() {
    return (
      <div className="container error-view">
        <h3>Oops! There was an error somewhere.</h3>
        <div>Usually you can just try again.</div>
        <Link className="btn btn-primary" to="/">Go To Project</Link>
        <div className="report-error">If you keep getting this error, report this to your teacher.</div>
      </div>
    )
  }
})
module.exports = ErrorView
