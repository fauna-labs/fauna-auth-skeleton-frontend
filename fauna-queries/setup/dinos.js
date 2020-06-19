import { DeleteIfExists, IfNotExists } from './../helpers/fql'
const faunadb = require('faunadb')
const q = faunadb.query
const { CreateCollection, Collection, Create, Do } = q

const CreateDinosCollection = CreateCollection({ name: 'dinos' })

async function createDinoCollection(client) {
  return await client.query(IfNotExists(Collection('dinos'), CreateDinosCollection))
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
