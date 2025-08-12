// amplify/backend.ts

import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/to-do-app/recap/#connect-the-backend-to-the-app
 */
export const backend = defineBackend({
  auth,
  data,
});
