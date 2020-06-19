import { askKeyOrGetFromtEnvVars, getClient } from './../helpers/script-helpers'
require('dotenv').config({ path: '.env.' + process.argv[2] })

const fs = require('fs')

// This will help to set the bootstrap token in the frontend directly.
const envfile = require('envfile')
const envFrontend = './../frontend/.env.local'
const envFrontendExample = './../frontend/.env.local.example'
// This script sets up the database to be used for this example application.
// Look at the code in src/fauna/setup/.. to see what is behind the magic

const { setupDatabase } = require('../setup/database')
const { executeFQL } = require('../helpers/fql')

const faunadb = require('faunadb')
const q = faunadb.query
const { CreateKey, Role } = q

const main = async () => {
  // To set up we need an admin key either set in env vars or filled in when the script requests it.
  const adminKey = await askKeyOrGetFromtEnvVars()
  const client = await getClient(adminKey, true)

  try {
    await setupDatabase(client)

    const CreateBootstrapKey = CreateKey({ role: Role('keyrole_bootstrap') })
    const bootstrapKey = await executeFQL(client, CreateBootstrapKey, 'key - bootstrap')

    if (bootstrapKey) {
      printEnvFileExplanation()
      writeExampleEnvFile(envFrontend, envFrontendExample, { REACT_APP_LOCAL___BOOTSTRAP_KEY: bootstrapKey.secret })
    }
  } catch (err) {
    console.error('Unexpected error', err)
  }
}

// -------------- Helpers -------------------

function writeExampleEnvFile(path, examplePath, extra) {
  // Write frontend .env.local
  let json = null
  try {
    json = envfile.parseFileSync(path)
  } catch (err) {
    json = envfile.parseFileSync(examplePath)
  }
  Object.keys(extra).forEach(k => {
    json[k] = extra[k]
  })
  fs.writeFileSync(path, envfile.stringifySync(json))
}

function printEnvFileExplanation() {
  console.log(
    '\x1b[32m',
    `The client token to bootstrap your application will be automatically installed in  the .env.local of your frontend`
  )
}

main()
