import { CreateOrUpdateRole } from './../helpers/fql'
const faunadb = require('faunadb')
// Use the excellent community-driven library by Eigil
// Since everything is just functions, this is how easy it is to extend FQL

const q = faunadb.query
const { Not, Lambda, Var, Collection, Tokens, Index, Query, Get, Select, Equals } = q

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
    },
    {
      resource: Collection('dinos'),
      actions: {
        read: Query(Lambda(['dinoReference'], Equals(Select(['data', 'rarity'], Get(Var('dinoReference'))), 'common')))
      }
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
      resource: Index('logs_by_action_and_identity'),
      actions: { read: true }
    },
    {
      resource: Collection('logs'),
      actions: { create: true, write: true, delete: true, read: true }
    },
    {
      resource: Collection('accounts'),
      actions: { read: true }
    },
    {
      resource: Tokens(),
      actions: { create: true }
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
      actions: {
        read: Query(
          Lambda(['dinoReference'], Not(Equals(Select(['data', 'rarity'], Get(Var('dinoReference'))), 'legendary')))
        )
      }
    }
  ]
})

const CreateLoggedInRoleAdmin = CreateOrUpdateRole({
  name: 'membershiprole_loggedin_admin',
  membership: [
    {
      resource: Collection('accounts'),
      predicate: Query(Lambda(['accountRef'], Equals(Select(['data', 'type'], Get(Var('accountRef'))), 'admin')))
    }
  ],
  privileges: [
    {
      resource: Collection('dinos'),
      actions: {
        read: true
      }
    }
  ]
})

export { CreateBootstrapRole, CreateFnRoleLogin, CreateFnRoleRegister, CreateLoggedInRole, CreateLoggedInRoleAdmin }
