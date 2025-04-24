"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export const SignInWithGitHub = () => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Button
      disabled={isLoading}
      className="flex-1"
      variant="outline"
      onClick={() => {
        authClient.signIn.social(
          {
            provider: "github",
            callbackURL: "/auth",
          },
          {
            onRequest: () => {
              setIsLoading(true);
            },
            onError: (ctx: { error: { message: string } }) => {
              toast.error(ctx.error.message);
              setIsLoading(false);
            },
          }
        );
      }}
    >
      {isLoading ? "Loading..." : "Continue with GitHub"}
    </Button>
  );
};
