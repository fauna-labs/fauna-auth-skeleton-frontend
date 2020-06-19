import { askKeyOrGetFromtEnvVars } from './../helpers/script-helpers'
require('dotenv').config({ path: '.env.' + process.argv[2] })

const { executeFQL } = require('../helpers/fql')

const faunadb = require('faunadb')
const q = faunadb.query
const {
  If,
  Exists,
  Database,
  Filter,
  Delete,
  Lambda,
  Paginate,
  Var,
  Roles,
  Functions,
  Keys,
  Tokens,
  Indexes,
  Collections,
  Equals,
  Select,
  Get
} = q

const main = async () => {
  // To set up we need an admin key either set in env vars or filled in when the script requests it.
  const adminKey = await askKeyOrGetFromtEnvVars()
  const client = new faunadb.Client({ secret: adminKey })

  const childDbName = process.env.CHILD_DB_NAME

  if (childDbName) {
    const DeleteDb = If(Exists(Database(childDbName)), Delete(Database(childDbName)), false)
    // the keys for a child database, when created with the admin key of a parent database will be saved
    // on the parent database. Hence those keys will not be deleted by removing the child database,
    // we'll delete them separately.
    const DeleteKeysChildDb = q.Map(
      Filter(Paginate(Keys()), Lambda(['k'], Equals('local', Select(['database', 'id'], Get(Var('k')), false)))),
      Lambda('key', Delete(Var('key')))
    )
    await executeFQL(client, DeleteDb, 'database - delete child database')
    await executeFQL(client, DeleteKeysChildDb, 'database - delete child database keys')
  } else {
    const DeleteAllRoles = q.Map(Paginate(Roles()), Lambda('ref', Delete(Var('ref'))))
    const DeleteAllFunctions = q.Map(Paginate(Functions()), Lambda('ref', Delete(Var('ref'))))
    const DeleteAllCollections = q.Map(Paginate(Collections()), Lambda('ref', Delete(Var('ref'))))
    const DeleteAllIndexes = q.Map(Paginate(Indexes()), Lambda('ref', Delete(Var('ref'))))
    const DeleteAllTokens = q.Map(Paginate(Tokens()), Lambda('ref', Delete(Var('ref'))))
    await executeFQL(client, DeleteAllRoles, 'database - delete roles')
    await executeFQL(client, DeleteAllFunctions, 'database - delete functions')
    await executeFQL(client, DeleteAllCollections, 'database - delete collections')
    await executeFQL(client, DeleteAllIndexes, 'database - delete indexes')
    await executeFQL(client, DeleteAllTokens, 'database - delete tokens')

    // Note, we don't delete keys since that would invalidate our admin key each time.
  }
}

main()
