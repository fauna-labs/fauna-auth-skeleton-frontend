import fauna, { Call } from 'faunadb'
const q = fauna.query

/* Initialize the client to contact FaunaDB
 * The client is initially started with the a 'BOOTSTRAP' token.
 * This token has only two permissions, call the 'login' and 'register' User Defined Function (UDF)
 * If the login function succeeds, it will return a new token with elevated permission.
 * The client will then be replaced with a client that uses the secret that was returned by Login.
 */

class QueryManager {
  constructor() {
    // To keep our error messages the same as our frontend solution we start with a keyless client that
    // has basically no permissions. Whereas the frontend only solution started with a bootstrap key
    // with limited permissions.
    this.client = new fauna.Client({
      secret: process.env.REACT_APP_LOCAL___BOOTSTRAP_KEY
    })
  }

  // Calling the login endpoint which will run the login
  // Fauna query from the backend and send use the token + set a httpOnly cookie for refreshing the token
  login(email, password) {
    return this.client.query(Call(q.Function('login_call_limited'), email, password)).then(res => {
      console.log(res)
      if (res.token) {
        this.client = new fauna.Client({
          secret: res.token.secret
        })
        return res.account
      } else {
        return false
      }
    })
  }

  // Calling the register endpoint which will run the register
  // Fauna query from the backend and send use the token + set a httpOnly cookie for refreshing the token
  register(email, password) {
    return this.client.query(Call(q.Function('register'), email, password))
  }

  changePassword(oldPassword, newPassword) {
    return this.client.query(Call(q.Function('change_password'), oldPassword, newPassword))
  }

  logout() {
    return this.client.query(Call(q.Function('logout'), true)).then(res => {
      this.client = new fauna.Client({
        secret: process.env.REACT_APP_LOCAL___BOOTSTRAP_KEY
      })
    })
  }

  getDinos() {
    return this.client.query(Call(q.Function('get_all_dinos_rate_limited')))
  }

  async postData(url, data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      return response.json().then(err => {
        throw err
      })
    } else {
      return response.json()
    }
  }
}
const faunaQueries = new QueryManager()
export { faunaQueries }
