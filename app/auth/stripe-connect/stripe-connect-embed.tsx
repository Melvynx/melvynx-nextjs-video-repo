"use client";

import { loadConnectAndInitialize } from "@stripe/connect-js";
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";
import { useState } from "react";

export type StripeCOnnectEmbedProps = {
  clientSecret: string;
};

export const StripeConnectEmbed = (props: StripeCOnnectEmbedProps) => {
  const [stripeConnectInstance] = useState(() => {
    return loadConnectAndInitialize({
      fetchClientSecret: async () => props.clientSecret,

      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    });
  });

  if (!stripeConnectInstance) return <p>Loading...</p>;

  return (
    <>
      <div className="container">
        <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
          <ConnectAccountOnboarding
            onExit={() => {
              console.log("The account has exited onboarding");
            }}
          />
        </ConnectComponentsProvider>
      </div>
    </>
  );
};
