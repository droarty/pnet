import React from 'react'
import {Route, IndexRoute} from 'react-router'

import ErrorView from 'app/views/ErrorView.jsx'
import NotFoundView from 'app/views/NotFoundView.jsx'
import AdminApp from 'app/layouts/AdminApp.jsx'
import AdvancedSearchView from 'app/views/AdvancedSearchView.jsx'
import SourcesView from 'app/views/SourcesView.jsx'

module.exports = (
  <Route path="/advanced" component={AdminApp}>
    <IndexRoute component={AdvancedSearchView}/>
    <Route path="/advanced/sources" component={SourcesView}/>
    <Route path="/error/:error_status" component={ErrorView}/>
    <Route path="*" component={NotFoundView}/>
  </Route>
)
