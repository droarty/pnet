import React from 'react'
import {Route, IndexRoute} from 'react-router'

import ErrorView from 'app/views/ErrorView.jsx'
import NotFoundView from 'app/views/NotFoundView.jsx'
import AdvancedSearchView from 'app/views/AdvancedSearchView.jsx'
import AdvancedApp from 'app/layouts/AdvancedApp.jsx'

module.exports = (
  <Route path="/advanced" component={AdvancedApp}>
    <IndexRoute component={AdvancedSearchView}/>
    <Route path="error/:error_status" component={ErrorView}/>
    <Route path="*" component={NotFoundView}/>
  </Route>
)
