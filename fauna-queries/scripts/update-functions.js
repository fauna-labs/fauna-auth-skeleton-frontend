import { askKeyOrGetFromtEnvVars, getClient } from './../helpers/script-helpers'

require('dotenv').config({ path: '.env.' + process.argv[2] })

const { updateFunctions } = require('../setup/database')

const main = async () => {
  // To set up we need an admin key either set in env vars or filled in when the script requests it.
  const adminKey = await askKeyOrGetFromtEnvVars()
  const client = await getClient(adminKey)

  try {
    await updateFunctions(client)
  } catch (err) {
    console.error('Unexpected error', err)
  }
}

main()
