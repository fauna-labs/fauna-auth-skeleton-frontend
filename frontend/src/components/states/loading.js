import React from 'react'

const Loading = () => {
  return (
    <React.Fragment>
      <div className="no-results-container">
        <p className="no-results-text"></p>
        <img className="no-results-image" src="/images/dino-loading.gif" alt="no results" />
        <p className="no-results-subtext">Loading... ...</p>
      </div>
    </React.Fragment>
  )
}

export default Loading
