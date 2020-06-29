import { Handler } from '../../helpers'
import * as AWS from 'aws-sdk'
const db = new AWS.DynamoDB.DocumentClient()

const attributesWithId = ['pushId', 'auth0UserId', 'postUserId', 'conversationId', 'sentToId', 'createdById']

export const handler: Handler = (event, context, callback, { tables }) => {
  console.log({ delegatedTo: 'updateTypeLambda' })
  try {
    const {
      arguments: args,
      // identity: { claims, groups, username },
      // request: { headers },
      info: { fieldName },
      // prev,
      // stash: { newId: id },
    } = event
    const { id, ...updatedAttributes } = args
    const now = new Date().toISOString()
    const params = {
      TableName: '',
      Key: { id },
      UpdateExpression: '',
      ExpressionAttributeNames: {},
      ReturnValues: 'ALL_NEW',
      ExpressionAttributeValues: {},
    }

    switch (fieldName) {
      case 'updateConversation':
        params.TableName = tables.conversations
        break
      case 'updatePost':
        params.TableName = tables.posts
        break
      case 'updateMessage':
        params.TableName = tables.messages
        break
      case 'updateUser':
        params.TableName = tables.users
        break
    }

    Object.keys(updatedAttributes).forEach(attribute => {
      let value = updatedAttributes[attribute]
      // undefined: return
      if (value === undefined) {
        return
      }
      // null: return. Previously: leave it as null
      // the problem is that client has mutation specified with many extra vars, which are unused and end up coming in as null
      // client fix would be to resend fields queried but not changed, but for now disallowing mutations to set things to null, since it's a edge case
      // and potentially toxic
      if (value === null) {
        return
      }
      // empty string: assign null
      if (typeof value === 'string' && !value) {
        value = null
      }
      // defined: extract value
      if (value !== null) {
        value = value?.id || value
      }
      // this is a bit sad, most attributes come as inputs "fooId" or "fooIds" and are saved in db as foo.
      // there are exceptions though.
      const safeAttributeName = attributesWithId.includes(attribute) ? attribute : attribute.replace(/Ids?$/, '')

      params.UpdateExpression = `${params.UpdateExpression}#${safeAttributeName} = :${safeAttributeName}, `
      params.ExpressionAttributeNames = {
        ...params.ExpressionAttributeNames,
        [`#${safeAttributeName}`]: safeAttributeName,
      }
      params.ExpressionAttributeValues = {
        ...params.ExpressionAttributeValues,
        [`:${safeAttributeName}`]: value,
      }
    })
    params.UpdateExpression = `SET ${params.UpdateExpression} #updatedAt = :updatedAt`
    params.ExpressionAttributeNames = {
      ...params.ExpressionAttributeNames,
      '#updatedAt': 'updatedAt',
    }
    params.ExpressionAttributeValues = {
      ...params.ExpressionAttributeValues,
      ':updatedAt': now,
    }

    console.log({ params })
    db.update(params, (err, result) => {
      console.log({ result })
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
        callback(null, result.Attributes)
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
