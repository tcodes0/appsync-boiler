import { Handler } from "../../helpers";
import * as AWS from "aws-sdk";
const db = new AWS.DynamoDB.DocumentClient();

export const handler: Handler = (event, context, callback, { tables }) => {
  try {
    console.log({ delegatedTo: "createUser" });
    const {
      arguments: args,
      // identity: { claims, groups, username },
      // request: { headers },
      // info: { variables },
      // prev,
      stash: { newId: id },
    } = event;

    const now = new Date().toISOString();
    const { age = 18, name } = args;
    const Item = {
      id,
      name,
      age,
      createdAt: now,
      updatedAt: now,
    };
    const params = {
      TableName: tables.users,
      Item,
    };
    console.log({ params });
    db.put(params, (err) => {
      if (err) {
        // prettier-ignore
        console.log({
          err,
          errName: err.name,
          errorMessage: err.message,
          statusCode: err.statusCode
         })
        callback(err.message, null);
      } else {
        callback(null, Item);
      }
    });
  } catch (catchError) {
    // prettier-ignore
    console.log({
      errorName: catchError.name,
      errorStack: catchError.stack,
      errorMessage: catchError.message,
     })
    callback(catchError.message, null);
  }
};
