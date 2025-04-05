"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";

export default function Page() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data: { email: string; password: string }) => {
    setPending(true);
    setError("");
    const result = await fetch("/api/auth/signup", {
      body: JSON.stringify(data),
      method: "POST",
    });
    const json = await result.json();

    setPending(false);

    if (json.error) {
      console.log({ json });
      setError(json.error as string);
      return;
    }

    window.location.href = "/";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
      </CardHeader>

      <CardContent>
        <form
          className="flex flex-col gap-4"
          action={(formData) => {
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;
            handleSubmit({ email, password });
          }}
        >
          <Input name="email" type="email" placeholder="Email" />
          <Input name="password" type="password" placeholder="Password" />
          <Button disabled={pending} type="submit">
            Submit
          </Button>
        </form>
        {error ? <p>{error}</p> : null}
      </CardContent>
      <CardFooter>
        <Link href="/auth/signin" className="text-indigo-500 hover:underline">
          Sign IN
        </Link>
      </CardFooter>
    </Card>
  );
}
