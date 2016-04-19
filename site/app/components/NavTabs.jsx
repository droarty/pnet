import React from 'react'
import { Link } from 'react-router'

let NavTabs = React.createClass({
  render() {
    let isProjectView = !!this.props.params.project_id
    let isIntroductionView = this.props.location.pathname.indexOf('introduction') > -1
    let isResearchActive = this.props.location.pathname.indexOf('activities') > -1
    let isDraftActive = this.props.location.pathname.indexOf('draft') > -1
    let isPublishActive = this.props.location.pathname.indexOf('publish') > -1
    let projectViewSubNav =
      <ul className="nav navbar-nav">
        <li role="presentation" className={isIntroductionView ? 'active' : ''}>
          <Link to={`/projects/${this.props.params.project_id}`}>
            Introduction
          </Link>
        </li>
        <li role="presentation" className={isResearchActive ? 'active' : ''}>
          <Link to={`/projects/${this.props.params.project_id}/activities`}>
            Research
          </Link>
        </li>
        <li role="presentation" className={isDraftActive ? 'active' : ''}>
          <Link to={`/projects/${this.props.params.project_id}/draft`}>
            Draft
          </Link>
        </li>
        <li role="presentation" className={isPublishActive ? 'active' : ''}>
          <Link to={`/projects/${this.props.params.project_id}/publish`}>Publish</Link>
        </li>
      </ul>
    let navTabsRow =
      <div>
        <div>
          <ul className="project-view-nav-tabs nav nav-tabs">
            {projectViewSubNav}
          </ul>
        </div>
      </div>
    if (!isProjectView) {
      navTabsRow = null
    }

    return (
      <div className="nav-tabs-row">{navTabsRow}</div>
    )
  }
})

module.exports = NavTabs
