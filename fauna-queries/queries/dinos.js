import faunadb from 'faunadb'

const q = faunadb.query
const {
  Paginate,
  Documents,
  Collection,
  Lambda,
  Get,
  Var,
  Match,
  If,
  HasIdentity,
  Equals,
  Select,
  Identity,
  Index,
  Let
} = q

// Instead of writing this in the role, we can write the security in the function as well.
// We could use Filter but we'll show a different approach (and more efficient, yet less flexible) using indexes
const GetAllDinos = Let(
  {
    match: If(
      HasIdentity(),
      If(
        Equals('admin', Select(['data', 'type'], Get(Identity()))),
        // Admins can see everything
        Documents(Collection('dinos')),
        // Normal users only see legendary
        Match(Index('all_normal_dinos'))
      ),
      Match(Index('all_public_dinos'))
    )
  },
  q.Map(
    // map over the references returned from paginate
    Paginate(Var('match')),
    // for each of these references, get the document
    Lambda(['dinoRef'], Get(Var('dinoRef')))
  )
)

export { GetAllDinos }
