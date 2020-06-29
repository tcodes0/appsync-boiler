import { handler as updateType } from "./updateType";
import { handler as createUser } from "./createUser";

const USER_TABLE = process.env.USER_TABLE || "";
const REGION = process.env.REGION || "us-east-1";

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
    case "updateUser":
      updateType(event, context, callback, { tables });
      break;
    case "createUser":
      createUser(event, context, callback, { tables });
      break;
    default:
      break;
  }
};
