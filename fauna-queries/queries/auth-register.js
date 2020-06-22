import faunadb from 'faunadb'
const q = faunadb.query
const { Create, Collection, ContainsStrRegex, If, GTE, Length, Abort } = q

/* Register - creating a simple account
   any document in the database could be used to register login. In this case 
   we chose to make a collection 'accounts'. Registering then means nothing
   more than creating an account. In our case we'll add credentials to the account
   to make sure we can call the FQL Login function on this account later on.  
 */
function RegisterAccount(email, password) {
  const ValidateEmail = FqlStatement =>
    If(
      ContainsStrRegex(
        email,
        "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
      ),
      // If it's valid, we continue with the original statement
      FqlStatement,
      // Else we Abort!
      Abort('Invalid e-mail provided')
    )

  const ValidatePassword = FqlStatement =>
    If(
      GTE(Length(password), 8),
      // If it's valid, we continue with the original statement
      FqlStatement,
      // Else we Abort!
      Abort('Invalid password, please provided at least 8 chars')
    )
  const Query = Create(Collection('accounts'), {
    // credentials is a special field, the contents will never be returned
    // and will be encrypted. { password: ... } is the only format it currently accepts.
    credentials: { password: password },
    // everything you want to store in the document should be scoped under 'data'
    data: {
      email: email
    }
  })

  // Compose, each Validate function will Abort if something is wrong, else it will just call the FQL
  // that was passed.
  return ValidateEmail(ValidatePassword(Query))
}

export { RegisterAccount }
