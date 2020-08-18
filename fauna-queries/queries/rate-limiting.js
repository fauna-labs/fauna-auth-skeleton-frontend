import { rateLimiting } from '../../fauna-queries/helpers/errors'
import faunadb from 'faunadb'
/*
 * Ideally we limit the amount of calls that come to Login.
 */
const q = faunadb.query
const {
  If,
  Epoch,
  Match,
  Index,
  Collection,
  Let,
  Var,
  Paginate,
  Select,
  TimeDiff,
  Or,
  GTE,
  Abort,
  Create,
  IsEmpty,
  Count,
  LT,
  Do,
  Now,
  Subtract
} = q

function AddRateLimiting(action, FqlQueryToExecute, Identifier, calls, perMilliseconds) {
  const ExecuteAndCreateLog = Do(
    Create(Collection('logs'), {
      data: {
        action: action,
        identity: Identifier
      }
    }),
    FqlQueryToExecute
  )

  return Let(
    {
      logsPage: Paginate(Match(Index('logs_by_action_and_identity_ordered_by_ts'), action, Identifier), {
        size: calls
      })
    },
    If(
      Or(IsEmpty(Var('logsPage')), LT(Count(Select(['data'], Var('logsPage'))), calls)),
      // If no logs exist yet, create one.
      ExecuteAndCreateLog,
      Let(
        {
          // the page looks like { data: [timestamp1, timestamp2,...]},
          // we will retrieve the last timestamp of that page. If the pagesize would be 3, it would be the oldest of these 3 events.
          // since the index is ordered from new to old.
          timestamp: Select(['data', Subtract(calls, 1)], Var('logsPage')),
          // transform the Fauna timestamp to a Time object
          time: Epoch(Var('timestamp'), 'microseconds'),
          // How long ago was that event in ms
          ageInMs: TimeDiff(Var('time'), Now(), 'milliseconds')
        },
        If(
          GTE(Var('ageInMs'), perMilliseconds),
          // Then great we execute
          ExecuteAndCreateLog,
          // Else.. Abort! Rate-limiting in action
          Abort(rateLimiting)
        )
      )
    )
  )
}

export { AddRateLimiting }
