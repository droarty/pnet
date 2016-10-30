import React from 'react'
import {Table, Tr, Td} from 'reactable'

let SourceAddEdit = React.createClass({
  getInitialState() {
    return ({
      source: this.props.source
    })
  },

  fieldChanged(event, field) {
    let source = this.state.source
    source[field] = event.target.value
    this.setState({source: source})
  },

  displayFields() {
    let fieldChanged = this.fieldChanged
    let source = this.state.source
    return Object.keys(this.props.source).map(function(field, index) {
      let value = source[field]
      return (
        <div className="form-group row" key={ `field_${index}` }>
          <label htmlFor={ `field_${ field }` } className="col-xs-2 col-form-label">{ field }</label>
          <div className="col-xs-10">
            <input className="form-control" type="text" value={ value } id={ `field_${ field }` } onChange={(event) => fieldChanged(event, field) } />
          </div>
        </div>
      )
    })
  },

  render() {
    if (!this.props.source) {
      return <div />
    }
    else {
      return (
        <div>
          <div className="modal-background">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" onClick={this.props.closeModal} className="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                  <h4 className="modal-title">Edit Source</h4>
                </div>
                <div className="modal-body container-fluid">
                  { this.displayFields() }
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={this.props.closeModal} className="btn btn-default">Close</button>
                  <button type="button" onClick={() => this.props.saveSource(this.state.source) }className="btn btn-primary">Save changes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
})

module.exports = SourceAddEdit
