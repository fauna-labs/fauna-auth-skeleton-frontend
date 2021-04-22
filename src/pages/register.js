import React from 'react'
import { toast } from 'react-toastify'
import { faunaQueries } from '../query-manager'
import { safeVerifyError } from '..//helpers/errors'

// Components
import Form from './../components/form'

const handleRegister = (event, username, password) => {
  faunaQueries
    .register(username, password)
    .then(e => {
      toast.success('User registered')
    })
    .catch(e => {
      // When using functions, the actual error is nested deeper.
      const underlyingError = safeVerifyError(e, [
        'requestResult',
        'responseContent',
        'errors',
        0,
        'cause',
        0,
        'description'
      ])
      console.log(underlyingError)
      if (underlyingError) {
        toast.error(underlyingError)
      } else if (e.error) {
        toast.error(e.error)
      } else {
        console.log(e)
        toast.error('Oops, something went wrong')
      }
    })
  event.preventDefault()
}

const Register = () => {
  return (
    <Form
      title="Register"
      formType="register"
      handleSubmit={(event, username, password) => handleRegister(event, username, password)}
    ></Form>
  )
}

export default Register
