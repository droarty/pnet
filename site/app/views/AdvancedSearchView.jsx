import React from 'react'

let AdvancedSearchView = React.createClass({
  render() {
    let pathname = window.location.pathname

    return (
      <div>
        <span>
          School: <select>
            <option>Choose a school</option>
          </select>
        </span>
        <span>
          Or Type an advanced selector: <input type="text"/>
        </span>
        <button type="button" className="btn btn-primary btn-sm">Search</button>
      </div>
    )
  }
})

module.exports = AdvancedSearchView
