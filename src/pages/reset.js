import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { toast } from 'react-toastify'

import SessionContext from './../context/session'
import { faunaQueries } from '../query-manager'

// Components
import Form from '../components/form'

const handleReset = (event, oldPassword, newPassword, repeatedPassword, history, sessionContext) => {
  event.preventDefault()

  if (newPassword !== repeatedPassword) {
    toast.error(`The new password didn't match the repeat password field`)
  }
  faunaQueries
    .changePassword(oldPassword, newPassword)
    .then(res => {
      if (res === false) {
        toast.error('Password change failed')
      } else {
        toast.success('Password change successful')
      }
    })
    .catch(e => {
      console.log(e)
      toast.error('Oops, something went wrong')
    })
}

const Reset = props => {
  const history = useHistory()
  const sessionContext = useContext(SessionContext)
  const { user } = sessionContext.state

  if (user) {
    return (
      <Form
        title="Reset"
        formType="reset"
        handleSubmit={(event, email, password, newPassword, repeatedPassword) =>
          handleReset(event, password, newPassword, repeatedPassword, history, sessionContext)
        }
      ></Form>
    )
  } else {
    return (
      <div className="form-container">
        <div className="form-title"> Reset </div>
        <div className="form-text">You must be logged in!</div>
      </div>
    )
  }
}

export default Reset
