import faunadb from 'faunadb'

const q = faunadb.query
const { Logout, Login, Match, Index, TimeAdd, Now, Var, Get, Let, Select } = q

/* LoginAccount
   We can login by searching for the account with the accounts_by_email account which returns references.
   If we assume that this will only return one account reference (which is the case, there is a uniqueness on that index)
   then we can call Login directly on that match. Login expects a reference, and an object that 
   specifies a password, which is the second parameter we pass along. The object also optionally specifies a 'ttl'
   which we will set to make sure our tokens dissapear after the given time. Having tokens that stay forever
   is a bad idea of course. 
 */
function LoginAccount(email, password) {
  return Let(
    {
      accountRef: Match(Index('accounts_by_email'), email),
      token: Login(Var('accountRef'), { password: password, ttl: TimeAdd(Now(), 3, 'hour') }),
      account: Get(Var('accountRef'))
    },
    { account: Var('account'), secret: Select(['secret'], Var('token')) }
  )
}
/* LogoutAccount
   logging out is simple, we know already (via the token) who is connected. 
   logout will invalidate that token. Setting true would invalidate all tokens related to that account.
   setting it to false only invalidates the token currently used in the client */
function LogoutAccount() {
  return Logout(false)
}

export { LoginAccount, LogoutAccount }
