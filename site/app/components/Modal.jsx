import React from 'react'

let Modal = React.createClass({
  getDefaultProps() {
    return {
      openModalButtonDisabled: false,
      openModalButtonClassName: 'btn btn-primary btn-block',
      cancelButton: 'Cancel',
      confirmButton: 'Confirm',
      title: '',
      modalId: 'customModal'
    }
  },

  renderOpenModalButton() {
    if (!this.props.openModalButton) return ''

    return (
      <button type="button"
              className={ this.props.openModalButtonClassName }
              data-toggle="modal"
              data-target={ '#' + this.props.modalId }
              disabled={ this.props.openModalButtonDisabled }>
        { this.props.openModalButton }
      </button>
    )
  },

  renderHeader() {
    return (
      <div className="modal-header">
        <button type="button" className="close" data-dismiss="modal">&times;</button>
        <h4 className="modal-title">
          { this.props.title }
        </h4>
      </div>
    )
  },

  renderBody() {
    if (!this.props.children) return ''

    return (
      <div className="modal-body">
        { this.props.children }
      </div>
    )
  },

  onConfirm() {
    this.props.confirmAction(this.props.confirmActionOption)
  },

  renderFooter() {
    return (
      <div className="modal-footer">
        <div className="row">
          <div className="col-xs-6 cancel">
            <button type="button" className="btn btn-block btn-default" data-dismiss="modal">
              { this.props.cancelButton }
            </button>
          </div>
          <div className="col-xs-6 confirm">
            <button type="button" className="btn btn-block btn-primary" data-dismiss="modal"
                    onClick={ this.onConfirm }>
              { this.props.confirmButton }
            </button>
          </div>
        </div>
      </div>
    )
  },

  render() {
    return (
      <div>
        { this.renderOpenModalButton() }

        <div id={ this.props.modalId } className="modal fade" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              { this.renderHeader() }
              { this.renderBody() }
              { this.renderFooter() }
            </div>
          </div>
        </div>
      </div>
    )
  }
})

module.exports = Modal
