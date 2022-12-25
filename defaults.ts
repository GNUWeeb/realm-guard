import * as fs from "fs";
import { getStorageDir } from "./modules/generic";

export function createDefaults() {
  // create default greets.json
  if (!fs.existsSync(getStorageDir() + "groups/")) {
    fs.mkdirSync(getStorageDir() + "groups/");
    fs.writeFileSync(
      getStorageDir() + "groups/default.json",
      JSON.stringify(
        {
          welcome: "Welcome to {{group_name}}, {{user_name}}!",
          farewell: "Goodbye, {{user_name}}!",
        },
        null,
        2
      )
    );
  }
}
