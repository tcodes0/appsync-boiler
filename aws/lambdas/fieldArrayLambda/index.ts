import * as AWS from "aws-sdk";
import { Handler } from "../../helpers";
const db = new AWS.DynamoDB.DocumentClient();

const toIntegerDate = (s: string) => new Date(s).valueOf();
const log = (...args) => {
  process.env.NODE_ENV !== "test" && console.log(...args);
};

function uniq(value, index, self) {
  return self.indexOf(value) === index;
}

export const handler: Handler = async (event, context, callback) => {
  const USER_TABLE = process.env.USER_TABLE || "";

  try {
    log("Received event", JSON.stringify(event));
    log("Received context", JSON.stringify(context));
    let ascending = false;
    let sortKey = "createdAt";
    const {
      arguments: args,
      // identity: { claims, groups, username },
      source,
      // request: { headers },
      info: { fieldName: _fieldName, parentTypeName },
      // prev,
      // stash: { newId: id },
    } = event;

    let TableName;
    let reportCount = false;
    let fieldName = _fieldName;

    switch (fieldName) {
      case "name":
      case "age": {
        TableName = USER_TABLE;
        break;
      }
      default:
        break;
    }
    log({ fieldName: _fieldName, parentTypeName: parentTypeName, TableName });

    console.log({ fieldName, reportCount, TableName });
    if (!source[fieldName]) {
      if (reportCount) {
        console.log({ bounce: "source.fieldname is falsey, resolving as 0" });
        return callback(null, { count: 0 });
      }
      console.log({ bounce: "source.fieldname is falsey, resolving as []" });
      return callback(null, []);
    }
    if (reportCount) {
      console.log({ bounce: "asked count, returning source.fieldName length" });
      return callback(null, { count: source[fieldName].length });
    }
    if (source[fieldName].length === 0) {
      console.log({ bounce: "source.fieldName is empty array, returning []" });
      return callback(null, []);
    }
    if (!TableName) {
      console.log({ bounce: "TableName undefined" });
      callback(null, []);
      return;
    }

    const params = {
      RequestItems: {
        [TableName]: {
          // todo fix this limit here to a proper solution
          Keys: source[fieldName]
            .map((id) => ({ id }))
            .slice(0, 100)
            .filter(uniq),
        },
      },
    };
    log({ paramst: JSON.stringify(params) });
    const batchResult = await new Promise<
      AWS.DynamoDB.DocumentClient.BatchGetItemOutput
    >((resolve, reject) => {
      db.batchGet(params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    let items = batchResult.Responses?.[TableName];
    log({ items: JSON.stringify(items) });
    callback(null, items);
  } catch (catchError) {
    // prettier-ignore
    log({
      errorName: catchError.name,
      errorStack: catchError.stack,
      errorMessage: catchError.message,
     })
    callback(catchError.message, null);
  }
};
