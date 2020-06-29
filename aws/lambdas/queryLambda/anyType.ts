import { Handler } from '../../helpers'
import * as AWS from 'aws-sdk'
const db = new AWS.DynamoDB.DocumentClient()

export const handler: Handler = (event, context, callback, { tables }) => {
  try {
    console.log({ delegatedTo: 'anyType' })

    const {
      arguments: args,
      // identity: { claims, groups, username },
      // source,
      // request: { headers },
      info: { fieldName },
      // prev,
      // stash: { newId: id },
    } = event
    let TableName = ''

    switch (fieldName) {
      case 'Conversation':
        TableName = tables.conversations
        break
      case 'Post':
        TableName = tables.posts
        break
      case 'User':
        TableName = tables.users
        break

      default:
        break
    }

    const { id } = args
    const params = {
      TableName,
      Key: { id },
    }
    console.log({ params })
    db.get(params, (err, result) => {
      if (err) {
        // prettier-ignore
        console.log({
          err,
          errName: err.name,
          errorMessage: err.message,
          statusCode: err.statusCode
         })
        callback(err.message, null)
      } else {
        if (result) {
          console.log({ result: JSON.stringify(result.Item) })
          callback(null, result.Item)
        } else {
          callback(null, null)
        }
      }
    })
  } catch (catchError) {
    // prettier-ignore
    console.log({
      errorName: catchError.name,
      errorStack: catchError.stack,
      errorMessage: catchError.message,
     })
    callback(catchError.message, null)
  }
}
