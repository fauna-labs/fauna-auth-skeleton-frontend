import { createAccountCollection, PopulateAccounts } from './accounts'
import { createDinoCollection, PopulateDinos } from './dinos'
import { handleSetupError } from '../helpers/errors'
import { executeFQL } from '../helpers/fql'

import { CreateBootstrapRole, CreateFnRoleLogin, CreateFnRoleRegister, CreateLoggedInRole } from './roles'
import { LoginUDF, RegisterUDF } from './functions'

async function setupDatabase(client) {
  const resAccounts = await handleSetupError(
    createAccountCollection(client),
    'collections/indexes - accounts collection'
  )
  const resDinos = await handleSetupError(createDinoCollection(client), 'collections/indexes - dinos collection')

  // Before we define functions we need to define the roles that will be assigned to them.
  await executeFQL(client, CreateFnRoleLogin, 'roles - function role - login')
  await executeFQL(client, CreateFnRoleRegister, 'roles - function role - register')

  // Define the functions we will use
  await executeFQL(client, LoginUDF, 'functions - login')
  await executeFQL(client, RegisterUDF, 'functions - register')

  // Now that we have defined the functions, the bootstrap role will give access to these functions.
  await executeFQL(client, CreateBootstrapRole, 'roles - normal - bootstrap')
  // Finally the membership role will give logged in Accounts (literally members from the Accounts collection)
  // access to the protected data.
  await executeFQL(client, CreateLoggedInRole, 'roles - membership role - logged in')

  // Populate, add some mascottes if the collection was newly made
  // (resDinos will contain the collection if it's newly made, else false)
  if (resDinos) {
    await executeFQL(client, PopulateDinos, 'populate - add some mascot data')
  }
  // Add some example accounts
  if (resAccounts) {
    await executeFQL(client, PopulateAccounts, 'populate - add some accounts data')
  }
}

async function updateFunctions(client) {
  // Both are wrapped in our wrapper (CreateOrUpdateFunction) so they will just update if they already exist.
  await executeFQL(client, LoginUDF, 'functions - login')
  await executeFQL(client, RegisterUDF, 'functions - register')
}

export { setupDatabase, updateFunctions }
