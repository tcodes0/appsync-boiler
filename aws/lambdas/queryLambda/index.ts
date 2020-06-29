import { handler as anyType } from "./anyType";

const USER_TABLE = process.env.USER_TABLE || "";

const tables = {
  users: USER_TABLE,
};

export const handler = (event, context, callback) => {
  console.log("Received event", JSON.stringify(event));
  console.log("Received context", JSON.stringify(context));
  const {
    // arguments: args,
    // identity: { claims, groups, username },
    // source,
    // request: { headers },
    info: { fieldName },
    // prev,
    // stash: { newId: id },
  } = event;

  switch (fieldName) {
    case "User":
      anyType(event, context, callback, { tables });
      break;
    default:
      break;
  }
};
