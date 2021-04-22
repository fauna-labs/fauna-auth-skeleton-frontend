import React, { useEffect, useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import Loading from '../components/states/loading'
import { toast } from 'react-toastify'
import { faunaQueries } from '../query-manager'

import SessionContext from '../context/session'
import { safeVerifyError, rateLimiting } from '../helpers/errors'

const Home = () => {
  const [dinos, setDinos] = useState(null)
  const [loading, setLoading] = useState(false)

  const history = useHistory()

  // Fetch the fweets on first load.
  const sessionContext = useContext(SessionContext)
  const { user } = sessionContext.state

  useEffect(() => {
    setLoading(true)
    faunaQueries
      .getDinos()
      .then(res => {
        if (res !== false) {
          setDinos(res)
          setLoading(false)
          history.push('/')
        } else {
          console.log('do something if no data?')
        }
      })
      .catch(e => {
        console.log(e)
        const codeAndError = safeVerifyError(e, ['requestResult', 'responseContent', 'errors', 0, 'cause', 0])
        if (codeAndError && codeAndError.code === 'transaction aborted' && codeAndError.description === rateLimiting) {
          toast.error('You are reloading too fast')
        } else {
          setLoading(false)
        }
      })
  }, [user, history])

  if (loading) {
    return Loading()
  } else if (dinos && dinos.data.length) {
    return (
      <React.Fragment>
        <div className="dino-list">{showDinos(dinos)}</div>
      </React.Fragment>
    )
  } else {
    return (
      <div className="no-results-container">
        <p className="no-results-text">No Results Found</p>
        <img className="no-results-image" src="/images/dino-noresults.png" alt="no results" />
        <p className="no-results-subtext">No dinos are accessible!</p>
      </div>
    )
  }
}

function showDinos(dinos) {
  return dinos.data.map((d, i) => {
    return (
      <div className="dino-card" key={'dino-card-' + i}>
        <span className="dino-title" key={'dino-card-title-' + i}>
          {d.data.name}
        </span>
        <div className="dino-image-container" key={'dino-card-container-' + i}>
          <img className="dino-image" key={'dino-card-image' + i} src={`/images/${d.data.icon}`} alt="no results"></img>
        </div>
        <span key={'dino-card-rarity-' + i} className={'dino-rarity ' + d.data.rarity}>
          {d.data.rarity}
        </span>
      </div>
    )
  })
}

export default Home
