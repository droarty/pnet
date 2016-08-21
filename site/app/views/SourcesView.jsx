import React from 'react'

let SourcesView = React.createClass({
  getInitialState() {
    return ({
      sources: []
    })
  },

  componentWillMount() {
    this.fetchSources()
  },

  componentWillReceiveProps(nextProps) {
    this.fetchSources()
  },

  fetchSources() {
    window.$.ajax({
      url: `/api/sources/findAllWithSummary`,
      type: 'GET',
      success: (result)=> {
        this.setState({
          sources: result
        })
      }
    })
  },

  render() {
    let pathname = window.location.pathname

    return (
      <div>
        <h1>Sources</h1>
        <div>
          {JSON.stringify(this.state.sources)}
        </div>
      </div>
    )
  }
})

module.exports = SourcesView
