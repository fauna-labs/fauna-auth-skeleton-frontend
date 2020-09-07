import { CreateOrUpdateRole } from './../helpers/fql'
const faunadb = require('faunadb')
// Use the excellent community-driven library by Eigil
// Since everything is just functions, this is how easy it is to extend FQL

const q = faunadb.query
const { Not, Lambda, Var, Collection, Tokens, Index, Query, Get, Select, Equals, If, Identity, HasIdentity } = q

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
      resource: q.Function('get_all_dinos'),
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

// We can limit this role much more but since it's only meant to give permissions to a functions
// we'll keep it simple. For more advanced and super fine-grained roles, look at the backend-based branches.
const CreateFnRoleChangePassword = CreateOrUpdateRole({
  name: 'functionrole_change_password',
  privileges: [
    {
      resource: Collection('accounts'),
      actions: { write: true }
    }
  ]
})

const CreateFnRoleGetAllDinos = CreateOrUpdateRole({
  name: 'functionrole_get_all_dinos',
  privileges: [
    {
      resource: Collection('logs'),
      actions: { create: true, write: true, delete: true, read: true }
    },
    {
      resource: Index('logs_by_action_and_identity_ordered_by_ts'),
      actions: { read: true }
    },

    // since we can only bind one role to a function, we can't use membership here.
    // We still have two options though:
    // - Base our logic on the Identity() in the role privileges.
    // - Base our logic on the Identity() in the User Defined Function itself.
    // In this case, we'll write it in the User Defined Function instead, that way
    // we can use indexes to do it which is a bit less flexible but much more efficient (see ../queries/dinos.js)
    {
      resource: Collection('dinos'),
      actions: {
        read: true
      }
    },
    // we'll need to get the Identity to branch on so the function needs access to accounts.
    {
      resource: Collection('accounts'),
      actions: {
        read: true
      }
    },
    // and needs access to the index that contains only normal dinos
    {
      resource: Index('all_normal_dinos'),
      actions: {
        read: true
      }
    },
    // and needs access to the index that contains only public dinos
    {
      resource: Index('all_public_dinos'),
      actions: {
        read: true
      }
    }
  ]
})

const CreateLoggedInRole = CreateOrUpdateRole({
  name: 'membershiprole_loggedin',
  membership: [{ resource: Collection('accounts') }],
  privileges: [
    {
      resource: q.Function('get_all_dinos'),
      actions: { call: true }
    },
    {
      resource: q.Function('change_password'),
      actions: { call: true }
    }
  ]
})

export {
  CreateBootstrapRole,
  CreateFnRoleLogin,
  CreateFnRoleGetAllDinos,
  CreateFnRoleRegister,
  CreateFnRoleChangePassword,
  CreateLoggedInRole
}
