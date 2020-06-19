import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import Home from './pages/home'
import Login from './pages/login'
import Register from './pages/register'
import Logout from './pages/logout'

import Layout from './components/layout'
import { SessionProvider, sessionReducer } from './context/session'

const App = () => {
  const [state, dispatch] = React.useReducer(sessionReducer, { user: null })

  // Return the header and either show an error or render the loaded profiles.
  return (
    <React.Fragment>
      <Router>
        <SessionProvider value={{ state, dispatch }}>
          <Layout>
            <Switch>
              <Route exact path="/accounts/login">
                <Login />
              </Route>
              <Route exact path="/accounts/register">
                <Register />
              </Route>
              <Route exact path="/accounts/logout">
                <Logout />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </Layout>
        </SessionProvider>
      </Router>
    </React.Fragment>
  )
}

export default App
