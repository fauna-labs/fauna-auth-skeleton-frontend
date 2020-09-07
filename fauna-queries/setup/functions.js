import { LoginAccount } from './../queries/auth-login'
import { RegisterAccount } from './../queries/auth-register'

import { CreateOrUpdateFunction } from './../helpers/fql'
import { AddRateLimiting } from '../queries/rate-limiting'
import { GetAllDinos } from '../queries/dinos'
import { ChangePassword } from '../queries/auth-reset'

const faunadb = require('faunadb')
const q = faunadb.query
const { Query, Lambda, Role, Var, Identity, If, HasIdentity } = q

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

const ChangePasswordUDF = CreateOrUpdateFunction({
  name: 'change_password',
  body: Query(Lambda(['password', 'newpassword'], ChangePassword(Var('password'), Var('newpassword')))),
  role: Role('functionrole_change_password')
})

const GetAllDinosUDF = CreateOrUpdateFunction({
  name: 'get_all_dinos',
  // We'll only allow 2 calls to this function per identity!
  // But we can also get some dinos publicly.. so we have to verify whether there is an Identity, we'll give the
  // 'global' identity a bit more calls per minute.
  body: Query(
    Lambda(
      [],
      AddRateLimiting(
        'get_dinos',
        GetAllDinos,
        If(HasIdentity(), Identity(), 'anonymous'),
        // logged in people get 2 calls per minute, anonymous 10 per minute.
        If(HasIdentity(), 2, 10),
        60000
      )
    )
  ),
  role: Role('functionrole_get_all_dinos')
})

export { RegisterUDF, LoginUDF, ChangePasswordUDF, GetAllDinosUDF }
