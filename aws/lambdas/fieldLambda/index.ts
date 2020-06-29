import * as AWS from 'aws-sdk'
import { Handler } from '../../helpers'
const db = new AWS.DynamoDB.DocumentClient()
const USER_TABLE = process.env.USER_TABLE || ''

export const handler: Handler = (event, context, callback) => {
  try {
    console.log('Received event', JSON.stringify(event))
    console.log('Received context', JSON.stringify(context))
    const {
      // arguments: args,
      // identity: { claims, groups, username },
      source,
      // request: { headers },
      info: { fieldName, parentTypeName },
      // prev,
      // stash: { newId: id },
    } = event
    let TableName

    switch (fieldName) {
      case 'age':
      case 'name':{
        TableName = USER_TABLE
        break
      }
    }
    if (!source[fieldName]) {
      callback(null, null)
    }
    const params = {
      TableName,
      Key: { id: source[fieldName] },
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
