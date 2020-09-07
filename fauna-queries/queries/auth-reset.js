import faunadb from 'faunadb'

const q = faunadb.query
const { Identify, Var, Let, If, Update, Identity } = q

function ChangePassword(password, newPassword) {
  return Let(
    {
      // frontend only password change is only allowed when we are already logged in.
      // Therefore, identity is the current account.
      validPassword: Identify(Identity(), password)
    },
    If(
      Var('validPassword'),
      // If the login was valid, we just continue and create a token.
      Update(Identity(), { credentials: { password: newPassword } }),
      // If not, we return false
      false
    )
  )
}

export { ChangePassword }
