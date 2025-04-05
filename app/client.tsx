/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

export function SessionDisplay() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tanstack Query
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) {
          throw new Error("Failed to fetch session");
        }
        const data = await response.json();
        setSession(data.session);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  if (loading) {
    return <div>Loading session...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!session) {
    return <div>Not signed in</div>;
  }

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-bold mb-2">Current Session</h2>
      <div className="space-y-1">
        <p>
          <span className="font-medium">User:</span> {session.user.email}
        </p>
        <p>
          <span className="font-medium">Session ID:</span> {session.id}
        </p>
        <p>
          <span className="font-medium">Expires:</span>{" "}
          {new Date(session.expiresAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
