import { LoginAccount } from './../queries/auth-login'
import { RegisterAccount } from './../queries/auth-register'

import { CreateOrUpdateFunction } from './../helpers/fql'

const faunadb = require('faunadb')
const q = faunadb.query
const { Query, Lambda, Role, Var } = q

const RegisterUDF = CreateOrUpdateFunction({
  name: 'register',
  body: Query(Lambda(['email', 'password'], RegisterAccount(Var('email'), Var('password')))),
  role: Role('functionrole_register')
})

const LoginUDF = CreateOrUpdateFunction({
  name: 'login',
  body: Query(Lambda(['email', 'password'], LoginAccount(Var('email'), Var('password')))),
  role: Role('functionrole_login')
})

export { RegisterUDF, LoginUDF }
