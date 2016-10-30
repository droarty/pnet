import React from 'react'
import {Table, Tr, Td} from 'reactable'
import _ from 'underscore'
import SourceAddEdit from 'app/components/SourceAddEdit.jsx'

let SourcesView = React.createClass({
  getInitialState() {
    return ({
      sources: [],
      sourcesWSummary: []
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
      url: `/api/sources/all`,
      type: 'GET',
      success: (result)=> {
        this.setState({
          sources: result.response,
          sourceFields: result.fields
        })
        window.$.ajax({
          url: `/api/tests/all`,
          type: 'GET',
          success: (result)=> {

            this.setState({
              sourcesWSummary: result.response
            })
          }
        })
      }
    })
  },

  saveSourceData(source) {
    window.$.ajax({
      url: `/api/sources/save`,
      type: 'POST',
      data: {source: source},
      success: (result)=> {
        if(result.err) alert(result.err)
        else {
          let target = _.find(this.state.sources, function(source) {
            return source.id == result.data.id
          })
          if(target) {
            _.extend(target, result.data)
          }
          else {
            let sources = this.state.sources
            sources.push(result.data)
            this.setState({sources: sources})
          }
        }
      }
    })
  },

  editSource(source) {
    if (!source) {
      // create an empty object
      source = {}
      this.state.sourceFields.forEach(function(fieldObj) {
        source[fieldObj.name] = null
      })
    }
    this.setState({
      editedSource: _.extend({}, source),
      originalSource: source
    })
  },

  saveSource(source) {
    this.saveSourceData(source)
    this.setState({
      editedSource: false,
      originalSource: false
    })
  },

  closeModal() {
    this.setState({
      editedSource: false,
      originalSource: false
    })
  },

  displayModal() {
    if (!this.state.editedSource) {
      return <div />
    }
    else {
      return (
        <SourceAddEdit
          source={ this.state.editedSource }
          sourceFields={ this.state.sourceFields }
          saveSource={ this.saveSource }
          closeModal={ this.closeModal } />
      )
    }
  },

  renderRow(source) {
    let editSource = this.editSource
    return (
      <Tr key={source.id}>
        <Td key={"editcol"} column="edit">
          <button className="btn btn-primary btn-small" onClick={() => editSource(source)}>Edit</button>
        </Td>
        {Object.keys(source).map(function(field) {
          return <Td key={`${field}_${source.id}`} column={field}>{source[field]}</Td>
        })}
      </Tr>
    )
  },

  render() {
    let pathname = window.location.pathname
    let renderRow = this.renderRow
    return (
      <div>
        { this.displayModal() }
        <div className="header">
          <h2>
            <span>Sources</span>
            <button className="pull-right btn btn-primary btn-small" onClick={() => this.editSource()}>Add Source</button>
          </h2>
        </div>
        <Table className="table">
          {
            this.state.sources.map(function(source) {
              return renderRow(source)
            })
          }
        </Table>
        <div className="h2">Sources With Summary</div>
        <Table className="table" data={this.state.sourcesWSummary}>
        </Table>
      </div>
    )
  }
})

module.exports = SourcesView
