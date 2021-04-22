const handleSetupError = (promise, explanation) => {
  return promise
    .then(data => {
      console.log(`   [ Executed ] '${explanation}'`)
      return data
    })
    .catch(error => {
      if (error && error.message === 'instance already exists') {
        console.warn(`   [ Skipped ] '${explanation}', it already exists`)
      } else {
        console.error(`   [ Failed  ] '${explanation}', with error:`, error)
      }
    })
}

const safeVerifyError = (error, keys) => {
  if (keys.length > 0) {
    if (error && error[keys[0]]) {
      const newError = error[keys[0]]
      keys.shift()
      return safeVerifyError(newError, keys)
    } else {
      return false
    }
  }
  return error
}

const tooManyFaultyLogins = 'too_many_faulty_logins'
const rateLimiting = 'rate_limiting'

export { handleSetupError, safeVerifyError, tooManyFaultyLogins, rateLimiting }
