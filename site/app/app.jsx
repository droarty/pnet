import React from 'react'
import { render } from 'react-dom'
import { Router } from 'react-router'
import routes from 'app/config/routes.jsx'

// Instead of hash history, use pushstate
import { createHistory, useBasename } from 'history'
const history = useBasename(createHistory)({
  basename: null
})

render(
  <Router history={history}>
    {routes}
  </Router>,
  document.getElementById('root')
)
