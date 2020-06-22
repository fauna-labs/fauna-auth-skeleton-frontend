import faunadb from 'faunadb'
import { tooManyFaultyLogins } from './../helpers/errors'
const q = faunadb.query
const {
  Logout,
  Identify,
  Paginate,
  Abort,
  Count,
  GTE,
  Match,
  Index,
  TimeAdd,
  Now,
  Tokens,
  Var,
  Get,
  Let,
  Select,
  If,
  Create,
  Collection,
  Do,
  Lambda,
  Delete,
  Equals
} = q

const MAX_LOGIN_ATTEMPTS = 3

/* LoginAccount
   We can login by searching for the account with the accounts_by_email account which returns references.
   If we assume that this will only return one account reference (which is the case, there is a uniqueness on that index)
   then we can call Login directly on that match. Login expects a reference, and an object that 
   specifies a password, which is the second parameter we pass along. The object also optionally specifies a 'ttl'
   which we will set to make sure our tokens dissapear after the given time. Having tokens that stay forever
   is a bad idea of course. 
 */
function LoginAccount(email, password) {
  const LoginFQL = Let(
    {
      accountRef: Select(['data', 0], Paginate(Match(Index('accounts_by_email'), email))),
      // Instead of logging in, we are going to use Identify to verify the password.
      // Compared to 'Login' the main difference is that it does not throw an error and does not create a token.
      validLogin: Identify(Var('accountRef'), password)
    },
    If(
      Var('validLogin'),
      // If the login was valid, we just continue and create a token.
      Let(
        {
          account: Get(Var('accountRef')),
          token: Create(Tokens(), { ttl: TimeAdd(Now(), 3, 'hours'), instance: Var('accountRef') }),
          secret: Select(['secret'], Var('token'))
        },
        {
          secret: Var('secret'),
          account: Var('account')
        }
      ),
      // If not, we return false
      false
    )
  )

  // Let's wrap some other functionality around the login.
  const BlockThreeFaultyLogins = Do(
    If(
      GTE(Count(Match(Index('logs_by_action_and_identity'), 'faulty_login', email)), MAX_LOGIN_ATTEMPTS),
      // Abort if exceeded
      Abort(tooManyFaultyLogins),
      // Else, just continue as usual!
      Let(
        {
          login: LoginFQL
        },
        Do(
          If(
            Equals(false, Var('login')),
            // if the login is faulty, we'll add a log entry
            Create(Collection('logs'), {
              data: {
                action: 'faulty_login',
                identity: email
              }
            }),
            // Else, we will clean up the faulty_login logs
            q.Map(
              Paginate(Match(Index('logs_by_action_and_identity'), 'faulty_login', email)),
              Lambda(['logRef'], Delete(Var('logRef')))
            )
          ),
          Var('login')
        )
      )
    )
  )

  return BlockThreeFaultyLogins
}
/* LogoutAccount
   logging out is simple, we know already (via the token) who is connected. 
   logout will invalidate that token. Setting true would invalidate all tokens related to that account.
   setting it to false only invalidates the token currently used in the client */
function LogoutAccount() {
  return Logout(false)
}

export { LoginAccount, LogoutAccount }
