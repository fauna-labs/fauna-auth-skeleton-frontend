import { DeleteIfExists, IfNotExists } from './../helpers/fql'

const faunadb = require('faunadb')
const q = faunadb.query
const {
  Do,
  Create,
  Documents,
  CreateCollection,
  CreateIndex,
  Collection,
  Exists,
  If,
  Index,
  Delete,
  Lambda,
  Paginate,
  Var
} = q

/* Collection */

const CreateAccountsCollection = CreateCollection({ name: 'accounts' })

/* Indexes */
const CreateIndexAllAccounts = CreateIndex({
  name: 'all_accounts',
  source: Collection('accounts'),
  // this is the default collection index, no terms or values are provided
  // which means the index will sort by reference and return only the reference.
  serialized: true
})

const CreateIndexAccountsByEmail = CreateIndex({
  name: 'accounts_by_email',
  source: Collection('accounts'),
  // We will search on email
  terms: [
    {
      field: ['data', 'email']
    }
  ],
  // if no values are added, the index will just return the reference.
  // Prevent that accounts with duplicate e-mails are made.
  // uniqueness works on the combination of terms/values
  unique: true,
  serialized: true
})

async function createAccountCollection(client) {
  const accountsRes = await client.query(IfNotExists(Collection('accounts'), CreateAccountsCollection))
  await client.query(IfNotExists(Index('accounts_by_email'), CreateIndexAccountsByEmail))
  await client.query(IfNotExists(Index('all_accounts'), CreateIndexAllAccounts))
  return accountsRes
}

async function deleteAccountsCollection(client) {
  await client.query(DeleteIfExists(Collection('accounts')))
  await client.query(DeleteIfExists(Index('accounts_by_email')))
  await client.query(DeleteIfExists(Index('all_accounts')))
}

const DeleteAllAccounts = If(
  Exists(Collection('accounts')),
  q.Map(Paginate(Documents(Collection('accounts'))), Lambda('ref', Delete(Var('ref')))),
  true
)

const PopulateAccounts = Do(
  Create(Collection('accounts'), {
    data: {
      email: 'normal@test.com',
      type: 'normal'
    },
    credentials: {
      password: 'testtest'
    }
  }),
  Create(Collection('accounts'), {
    data: {
      email: 'admin@test.com',
      type: 'admin'
    },
    credentials: {
      password: 'testtest'
    }
  })
)

export { createAccountCollection, deleteAccountsCollection, PopulateAccounts, DeleteAllAccounts }
