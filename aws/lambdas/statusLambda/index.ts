import { Handler } from '../../helpers'

const COMMIT_SHA = process.env.COMMIT_SHA

export const handler: Handler = async (event, context, callback) => {
  console.log('Received event', JSON.stringify(event))
  console.log('Received context', JSON.stringify(context))
  const {
    // arguments: args,
    identity,
    //source,
    request,
    //info: { fieldName, parentTypeName },
    // prev,
    // stash: { newId: id },
  } = event

  const commitSha = COMMIT_SHA
  callback(null, { commitSha, identity: JSON.stringify(identity), request: JSON.stringify(request) })
}
