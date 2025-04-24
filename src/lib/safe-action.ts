import { createSafeActionClient } from "next-safe-action";
import { getUser } from "./auth-session";

// Custom error class for action errors
class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

// Create a base action client with error handling
export const actionClient = createSafeActionClient({
  handleServerError(error) {
    console.error("Action error:", error);

    // Return custom error message for ActionError instances
    if (error instanceof ActionError) {
      return error.message;
    }

    return "An unexpected error occurred";
  },
});

// Create an authenticated action client that checks for user session
export const authAction = actionClient.use(async ({ next }) => {
  const user = await getUser();

  if (!user) {
    throw new ActionError("Unauthorized: User not authenticated");
  }

  // Pass the user to the next middleware/action
  return next({
    ctx: { user },
  });
});
