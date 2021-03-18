import { handleSetupError } from './errors'

const faunadb = require('faunadb')
const q = faunadb.query
const { Exists, If, Delete, Update, CreateFunction, CreateRole, Role } = q

// Some minor wrapper to execute FQL and at the same time log a statement.
// and handle errors. We mainly use to provide a cleaner setup script progress and errors.
function executeFQL(client, FQL, log) {
  return handleSetupError(client.query(FQL), log)
}

// Some minor FQL extensions to make our live easier
function DeleteIfExists(ref) {
  return If(Exists(ref), Delete(ref), false)
}

function IfNotExists(ref, FqlCode) {
  return If(Exists(ref), false, FqlCode)
}

// A convenience function to either create or update a function.
function CreateOrUpdateFunction(obj) {
  return If(
    Exists(q.Function(obj.name)),
    Update(q.Function(obj.name), { body: obj.body, role: obj.role }),
    CreateFunction({ name: obj.name, body: obj.body, role: obj.role })
  )
}

// A convenience function to either create or update a role.
function CreateOrUpdateRole(obj) {
  return If(
    Exists(Role(obj.name)),
    Update(Role(obj.name), { membership: obj.membership, privileges: obj.privileges }),
    CreateRole(obj)
  )
}

export { executeFQL, DeleteIfExists, IfNotExists, CreateOrUpdateFunction, CreateOrUpdateRole }
