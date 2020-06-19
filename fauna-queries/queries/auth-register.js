import faunadb from 'faunadb'
const q = faunadb.query
const { Create, Collection } = q

/* Register - creating a simple account
   any document in the database could be used to register login. In this case 
   we chose to make a collection 'accounts'. Registering then means nothing
   more than creating an account. In our case we'll add credentials to the account
   to make sure we can call the FQL Login function on this account later on.  
 */
function RegisterAccount(email, password) {
  return Create(Collection('accounts'), {
    // credentials is a special field, the contents will never be returned
    // and will be encrypted. { password: ... } is the only format it currently accepts.
    credentials: { password: password },
    // everything you want to store in the document should be scoped under 'data'
    data: {
      email: email
    }
  })
}

export { RegisterAccount }
