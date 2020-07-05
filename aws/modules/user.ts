import { createResolver } from "../resolver";
import { ModuleArgs } from "../helpers";

export const userModule: (ModuleArgs: ModuleArgs) => void = ({
  fieldArrayDataSource,
  fieldDataSource,
}) => {
  if (!fieldArrayDataSource) {
    throw Error("fieldArrayDataSource not passed to userModule as arg");
  }
};
