import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { toast } from 'react-toastify'

import SessionContext from './../context/session'
import { faunaQueries } from '../query-manager'
import { safeVerifyError } from '../helpers/errors'

// Components
import Form from '../components/form'

const handleLogin = (event, username, password, history, sessionContext) => {
  faunaQueries
    .login(username, password)
    .then(account => {
      if (account === false) {
        toast.error('Login failed')
      } else {
        toast.success('Login successful')
        sessionContext.dispatch({ type: 'login', data: account })
        history.push('/')
      }
    })
    .catch(e => {
      // When using functions, the actual error is nested deeper.
      const codeAndError = safeVerifyError(e, ['requestResult', 'responseContent', 'errors', 0, 'cause', 0, 'cause', 0])
      if (codeAndError && codeAndError.code === 'transaction aborted') {
        // It might not be a good idea to tell the user that the account is blocked
        // since that gives an attacker the means to determine which e-mails exist in your system.
        // This also means that you probably want to return a custom error from the login UDF.
        // We'll see how to do that in the node example! We'll show the error here as an example though.
        // Ideally you would modify the call_limit to return false to hide instead of Aborting.
        toast.error('Account blocked (dont show this, its an example)')
      } else if (e.error) {
        toast.error(e.error)
      } else {
        console.log(e)
        toast.error('Oops, something went wrong')
      }
    })

  event.preventDefault()
}

const Login = props => {
  const history = useHistory()
  const sessionContext = useContext(SessionContext)
  const { user } = sessionContext.state

  if (!user) {
    return (
      <Form
        title="Login"
        formType="login"
        handleSubmit={(event, username, password) => handleLogin(event, username, password, history, sessionContext)}
      ></Form>
    )
  } else {
    return (
      <div className="form-container">
        <div className="form-title"> Login </div>
        <div className="form-text">You are already logged in, logout first!</div>
      </div>
    )
  }
}

export default Login
