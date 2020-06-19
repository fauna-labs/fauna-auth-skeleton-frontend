import { CreateOrUpdateRole } from './../helpers/fql'
const faunadb = require('faunadb')
// Use the excellent community-driven library by Eigil
// Since everything is just functions, this is how easy it is to extend FQL

const q = faunadb.query
const { Collection, Index } = q

const CreateBootstrapRole = CreateOrUpdateRole({
  name: 'keyrole_bootstrap',
  privileges: [
    {
      resource: q.Function('login'),
      actions: { call: true }
    },
    {
      resource: q.Function('register'),
      actions: { call: true }
    }
  ]
})

const CreateFnRoleLogin = CreateOrUpdateRole({
  name: 'functionrole_login',
  privileges: [
    {
      resource: Index('accounts_by_email'),
      actions: { read: true }
    },
    {
      resource: Collection('accounts'),
      actions: { read: true }
    }
  ]
})

const CreateFnRoleRegister = CreateOrUpdateRole({
  name: 'functionrole_register',
  privileges: [
    {
      resource: Collection('accounts'),
      actions: { create: true }
    }
  ]
})

const CreateLoggedInRole = CreateOrUpdateRole({
  name: 'membershiprole_loggedin',
  membership: [{ resource: Collection('accounts') }],
  privileges: [
    {
      resource: Collection('dinos'),
      actions: { read: true }
    }
  ]
})

export { CreateBootstrapRole, CreateFnRoleLogin, CreateFnRoleRegister, CreateLoggedInRole }
