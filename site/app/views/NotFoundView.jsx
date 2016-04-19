import React from 'react'

let NotFoundView = React.createClass({
  render() {
    let pathname = window.location.pathname

    return (
      <h3>Could Not Find {pathname}</h3>
    )
  }
})

module.exports = NotFoundView
