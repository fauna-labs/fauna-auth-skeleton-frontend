import React, { useState } from 'react'
import PropTypes from 'prop-types'

const Form = props => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleChangeUserName = event => {
    setUsername(event.target.value)
  }

  const handleChangePassword = event => {
    setPassword(event.target.value)
  }

  function renderFields() {
    return (
      <React.Fragment>
        {renderInputField('Email', username, 'text', e => handleChangeUserName(e), 'username')}
        {props.formType === 'register' || props.formType === 'login'
          ? renderInputField('Password', password, 'password', e => handleChangePassword(e), 'current-password')
          : null}
      </React.Fragment>
    )
  }

  function renderForm() {
    return (
      <form className="form" onSubmit={e => props.handleSubmit(e, username, password)}>
        {renderFields()}
        <div className="input-row margin-top-50">
          <button className={props.formType + ' align-right'}> {props.formType} </button>
        </div>
      </form>
    )
  }

  return (
    <React.Fragment>
      <div className="form-container">
        <div className="form-title"> {props.title} </div>
        {renderForm()}
      </div>
    </React.Fragment>
  )
}

const renderInputField = (name, value, type, fun, autocomplete) => {
  const lowerCaseName = name.toLowerCase()
  return (
    <div className="input-row">
      <label htmlFor="{lowerCaseName}" className="input-row-column">
        {name}
      </label>
      <input
        className="input-row-column"
        value={value}
        onChange={fun}
        type={type}
        id={lowerCaseName}
        name={lowerCaseName}
        autoComplete={autocomplete}
      />
    </div>
  )
}

Form.propTypes = {
  formType: PropTypes.string,
  handleSubmit: PropTypes.func,
  title: PropTypes.string
}

export default Form
