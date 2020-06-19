require('dotenv').config({ path: '.env.' + process.argv[2] })
console.log(process.argv[2])

const { executeFQL } = require('../helpers/fql')

const faunadb = require('faunadb')
const q = faunadb.query
const { CreateKey, Exists, Database, CreateDatabase, If } = q
const readline = require('readline-promise').default

const keyQuestion = `----- 1. Please provide a FaunaDB admin key) -----
You can get one on https://dashboard.fauna.com/ on the Security tab of the database you want to use.

An admin key is powerful, it should only be used for the setup script, not to run your application!
At the end of the script a key with limited privileges will be returned that should be used to run your application
Enter your key or set it .env.local as 'FAUNADB_ADMIN_KEY' (do not push this to git):`

const explanation = `
Thanks!
This script will (Do not worry! It will all do this for you): 
 - Setup the user defined functions 'login and register'
 - Create roles that the user defined functions will assume
 - Create a role for the initial key which can only call login/register
 - Create a role for an account to assume (database entities can assume roles, using Login a key can be retrieved for such an entity)
(take a look at scripts/setup.js if it interests you what it does)
`

export async function askKeyOrGetFromtEnvVars() {
  let adminKey = process.env.FAUNADB_ADMIN_KEY
  // Ask the user for a key if it's not provided in the environment variables yet.
  if (!adminKey || adminKey === 'undefined') {
    const interactiveSession = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    await interactiveSession.questionAsync(keyQuestion).then(key => {
      adminKey = key
      interactiveSession.close()
    })
    console.log(explanation)
  }
  return adminKey
}

export async function getClient(adminKey) {
  // either we just use the admin key that we received for the client
  let client = new faunadb.Client({ secret: adminKey })

  const childDbName = process.env.CHILD_DB_NAME
  // except if the childDbName env var was set.
  if (childDbName && typeof childDbName !== 'undefined') {
    // If this option is provided, the db will be created as a child db of the database
    // that the above admin key belongs to. This is useful to destroy/recreate a database
    // easily without having to wait for cache invalidation of collection/index names.
    const CreateDBQuery = If(Exists(Database(childDbName)), false, CreateDatabase({ name: childDbName }))
    await executeFQL(client, CreateDBQuery, 'database - create child database if it doesnt exist')

    const CreateKeyQuery = CreateKey({ database: Database(childDbName), role: 'admin' })
    const key = await executeFQL(client, CreateKeyQuery, 'database admin key - create child database admin key')

    // in that case, we'll use a key from the child database to continue.
    client = new faunadb.Client({ secret: key.secret })
    // If the admin key was a database called: 'example'
    // and our CHILD_DB_NAME was 'local', then we just
    // created a database structure as follows:
    // |--- example (parent db)               > initial admin key
    //         |---- local (child db)         > our current key
  }
  return client
}
