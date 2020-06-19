import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { toast } from 'react-toastify'

import SessionContext from './../context/session'
import { faunaQueries } from '../fauna/query-manager'

// Components
const handleLogout = (event, history, sessionContext) => {
  faunaQueries
    .logout()
    .then(res => {
      toast.success('Logout successful')
      sessionContext.dispatch({ type: 'logout', data: null })
      history.push('/')
    })
    .catch(e => {
      if (e.error) {
        toast.error(e.error)
      } else {
        console.log(e)
        toast.error('Oops, something went wrong')
      }
    })

  event.preventDefault()
}

const Logout = props => {
  const history = useHistory()
  const sessionContext = useContext(SessionContext)

  const { user } = sessionContext.state

  if (user) {
    return (
      <div className="form-container">
        <div className="form-title"> Logout </div>
        <div className="form-text">
          Clicking logout will remove the session which essentially removes the token from the client and reverts to the
          bootstrap token. After logging out, we can login again.
        </div>
        <div className="form">
          <div className="input-row margin-top-50">
            <button onClick={e => handleLogout(e, history, sessionContext)} className={'logout' + ' align-right'}>
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="form-container">
        <div className="form-title"> Logout </div>
        <div className="form-text">To logout you first need to be logged in!</div>
      </div>
    )
  }
}

export default Logout
