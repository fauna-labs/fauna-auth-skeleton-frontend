import faunadb from 'faunadb'

const q = faunadb.query
const { Paginate, Documents, Collection, Lambda, Get, Var } = q

export const GetAllDinos = q.Map(
  // map over the references returned from paginate
  Paginate(Documents(Collection('dinos'))),
  // for each of these references, get the document
  Lambda(['dinoRef'], Get(Var('dinoRef')))
)
