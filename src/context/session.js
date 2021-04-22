import React from 'react'

const SessionContext = React.createContext({})

export const sessionReducer = (state, action) => {
  console.log(state, action)
  switch (action.type) {
    case 'login': {
      return { user: action.data.data.email }
    }
    case 'register': {
      return { user: action.data.data.email }
    }
    case 'logout': {
      return { user: null }
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

export const SessionProvider = SessionContext.Provider
export const SessionConsumer = SessionContext.Consumer
export default SessionContext
