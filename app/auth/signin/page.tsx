"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEventHandler, useState } from "react";
import { toast } from "sonner";
import { SignInWithGitHub } from "../SignInWithGitHub";
import { SignInWithGoogle } from "../SignInWithGoogle";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const router = useRouter();

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const event = {
      onRequest: () => {
        setIsLoading(true);
      },
      onSuccess: () => {
        router.push(isMagicLink ? "/auth/verify" : "/auth");
        router.refresh();
      },
      onError: (ctx: { error: { message: string } }) => {
        toast.error(ctx.error.message);
        setIsLoading(false);
      },
    };

    if (isMagicLink) {
      authClient.signIn.magicLink(
        {
          email,
          callbackURL: "/auth",
        },
        event
      );
    } else {
      authClient.signIn.email(
        {
          email,
          password,
        },
        event
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          We just need a few details to get you started.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="*:not-first:mt-2">
              <Label htmlFor={`email`}>Email</Label>
              <Input
                id={`email`}
                placeholder="hi@yourcompany.com"
                type="email"
                required
                name="email"
              />
            </div>
            {isMagicLink ? null : (
              <div className="*:not-first:mt-2">
                <Label htmlFor={`password`}>Password</Label>
                <Input
                  id={`password`}
                  placeholder="Enter your password"
                  type="password"
                  required
                  name="password"
                />
              </div>
            )}
          </div>
          <Button disabled={isLoading} type="submit" className="w-full">
            Sign in
          </Button>
          <button
            type="button"
            className="text-center w-full text-indigo-500 text-sm"
            onClick={() => setIsMagicLink((s) => !s)}
          >
            {isMagicLink
              ? "Login with password"
              : "Login with magic link instead"}
          </button>
        </form>

        <div className="before:bg-border after:bg-border flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1">
          <span className="text-muted-foreground text-xs">Or</span>
        </div>

        <div className="flex items-center gap-2 justify-">
          <SignInWithGitHub />
          <SignInWithGoogle />
        </div>

        <p className="text-muted-foreground text-center text-xs">
          No account ?{" "}
          <Link className="text-indigo-500" href="/auth/signup">
            Sing Up
          </Link>
        </p>
        <p className="text-muted-foreground text-center text-xs">
          Forget password ?{" "}
          <Link className="text-indigo-500" href="/auth/reset-password">
            Reset it
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
