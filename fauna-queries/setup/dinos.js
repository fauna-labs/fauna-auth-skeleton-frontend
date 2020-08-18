import { DeleteIfExists, IfNotExists } from './../helpers/fql'
const faunadb = require('faunadb')
const q = faunadb.query
const { CreateCollection, Collection, Create, Do, Query, If, Equals, Select, Var, Lambda, CreateIndex, Not, Index } = q

const CreateDinosCollection = CreateCollection({ name: 'dinos' })

const CreatePublicDinosIndex = CreateIndex({
  name: 'all_public_dinos',
  source: {
    collection: Collection('dinos'),
    fields: {
      publicRefs: Query(
        Lambda(
          'dino',
          // only common dinos are public, if we return null here it won't be in the index.
          If(Equals(Select(['data', 'rarity'], Var('dino')), 'common'), Select(['ref'], Var('dino')), null)
        )
      )
    }
  },
  values: [
    {
      binding: 'publicRefs'
    }
  ]
})

const CreateNormalDinosIndex = CreateIndex({
  name: 'all_normal_dinos',
  source: {
    collection: Collection('dinos'),
    fields: {
      normalRefs: Query(
        Lambda(
          'dino',
          // only legendary dinos are hidden from non-admin users, if we return null here it won't be in the index.
          If(Not(Equals(Select(['data', 'rarity'], Var('dino')), 'legendary')), Select(['ref'], Var('dino')), null)
        )
      )
    }
  },
  values: [
    {
      binding: 'normalRefs'
    }
  ]
})

async function createDinoCollection(client) {
  const res = await client.query(IfNotExists(Collection('dinos'), CreateDinosCollection))
  await client.query(IfNotExists(Index('all_public_dinos'), CreatePublicDinosIndex))
  await client.query(IfNotExists(Index('all_normal_dinos'), CreateNormalDinosIndex))
  return res
}

async function deleteDinoCollection(client) {
  await client.query(DeleteIfExists(Collection('dinos')))
}

const PopulateDinos = Do(
  Create(Collection('dinos'), {
    data: {
      name: 'Skinny Dino',
      icon: 'skinny_dino.png',
      rarity: 'exotic'
    }
  }),
  Create(Collection('dinos'), {
    data: {
      name: 'Metal Dino',
      icon: 'metal_dino.png',
      rarity: 'common'
    }
  }),
  Create(Collection('dinos'), {
    data: {
      name: 'Flower Dino',
      icon: 'flower_dino.png',
      rarity: 'rare'
    }
  }),
  Create(Collection('dinos'), {
    data: {
      name: 'Grumpy Dino',
      icon: 'grumpy_dino.png',
      rarity: 'legendary'
    }
  }),
  Create(Collection('dinos'), {
    data: {
      name: 'Old Gentleman Dino',
      icon: 'old_gentleman_dino.png',
      rarity: 'legendary'
    }
  }),
  Create(Collection('dinos'), {
    data: {
      name: 'Old Lady Dino',
      icon: 'old_lady_dino.png',
      rarity: 'epic'
    }
  }),
  Create(Collection('dinos'), {
    data: {
      name: 'Sitting Dino',
      icon: 'sitting_dino.png',
      rarity: 'common'
    }
  }),
  Create(Collection('dinos'), {
    data: {
      name: 'Sleeping Dino',
      icon: 'sleeping_dino.png',
      rarity: 'uncommon'
    }
  })
)

export { createDinoCollection, deleteDinoCollection, PopulateDinos }
