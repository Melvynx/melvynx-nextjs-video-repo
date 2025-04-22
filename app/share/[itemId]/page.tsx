/* eslint-disable @next/next/no-img-element */
import { ItemType } from "@/lib/generated/client";
import { prisma } from "@/lib/prisma";
import {
  DollarSignIcon,
  DownloadIcon,
  FileAudioIcon,
  FileIcon,
  FileTextIcon,
  FilmIcon,
  ImageIcon,
  LockIcon,
  ShieldIcon,
} from "lucide-react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { PasswordForm } from "./password-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { getLimitation } from "@/lib/auth-limitations";
import { stripe } from "@/lib/stripe";

// Helper to get file type icon
const FileTypeIcon = ({ type }: { type: ItemType }) => {
  switch (type) {
    case "VIDEO":
      return <FilmIcon className="h-5 w-5" />;
    case "AUDIO":
      return <FileAudioIcon className="h-5 w-5" />;
    case "PDF":
      return <FileIcon className="h-5 w-5" />;
    case "DOCUMENT":
      return <FileTextIcon className="h-5 w-5" />;
    case "IMAGE":
      return <ImageIcon className="h-5 w-5" />;
    default:
      return <FileIcon className="h-5 w-5" />;
  }
};

export default async function SharePage(props: {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { itemId } = params;
  const sessionId = searchParams.session_id;

  // Get the item from the database
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      user: {
        select: {
          plan: true,
          stripeAccountId: true,
        },
      },
    },
  });

  // If item doesn't exist, show 404
  if (!item) {
    notFound();
  }

  // Check if the item has expired
  if (item.expiresAt && new Date(item.expiresAt) < new Date()) {
    return (
      <div className="container max-w-2xl mx-auto py-20 px-4">
        <Alert variant="destructive">
          <AlertTitle>This link has expired</AlertTitle>
          <AlertDescription>
            Sorry, the owner has set this file to expire and it is no longer
            available.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if the item has a password
  const cookieStore = await cookies();
  const storedPassword = cookieStore.get(`itemId-password`)?.value;
  const isPasswordProtected = !!item.password;
  const passwordMatches = storedPassword === item.password;

  // If password protected and password doesn't match, show password form
  if (isPasswordProtected && !passwordMatches) {
    return <PasswordForm itemId={itemId} />;
  }

  // Check if the file is paid and not yet purchased
  const isPaid = !!item.price && item.price > 0;
  let isPurchased = false;
  try {
    if (isPaid && sessionId) {
      const stripeCheckoutSession = await stripe.checkout.sessions.retrieve(
        sessionId as string,
        {
          stripeAccount: item.user.stripeAccountId as string,
        }
      );

      const isCompleted = stripeCheckoutSession.status === "complete";

      isPurchased = isCompleted;
    }
  } catch {
    isPurchased = false;
  }

  // Check if it's an image for preview
  const isImage = item.type === "IMAGE";

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Card className="shadow-none border overflow-hidden p-0">
        <CardHeader className="pb-3 pt-6 px-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-muted rounded-md">
              <FileTypeIcon type={item.type} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-medium truncate">{item.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              {isPasswordProtected && (
                <Badge variant="outline" className="text-xs">
                  <LockIcon className="h-3 w-3 mr-1" /> Protected
                </Badge>
              )}
              {isPaid && (
                <Badge variant="outline" className="text-xs">
                  <DollarSignIcon className="h-3 w-3 mr-1" /> Paid
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Preview for images */}
          {isImage && !isPaid && (
            <div className="border-b">
              <div className="relative flex justify-center items-center bg-muted/30 h-[300px]">
                <img
                  src={item.fileUrl}
                  alt={item.name}
                  className="object-contain max-h-[300px] max-w-full"
                />
              </div>
            </div>
          )}

          <div className="p-6">
            {/* Paid but not purchased section */}
            {isPaid && !isPurchased && (
              <div className="py-6">
                <div className="flex flex-col items-center max-w-md mx-auto">
                  <div className="w-12 h-12 flex items-center justify-center bg-muted rounded-full mb-6">
                    <ShieldIcon className="h-6 w-6 text-muted-foreground" />
                  </div>

                  <h2 className="text-lg font-medium mb-2">
                    This file is protected by a paywall
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 text-center">
                    To download this content, you need to purchase it first.
                  </p>

                  <div className="w-full p-4 bg-muted rounded-md mb-6">
                    <p className="text-center font-medium">
                      ${(item.price! / 100).toFixed(2)} USD
                    </p>
                  </div>

                  <form>
                    <Button
                      formAction={async () => {
                        "use server";

                        const { stripeAccountId, plan } =
                          await prisma.user.findFirstOrThrow({
                            where: {
                              items: {
                                some: {
                                  id: itemId,
                                },
                              },
                            },
                            select: { stripeAccountId: true, plan: true },
                          });

                        if (!stripeAccountId) new Error("Invalid");

                        const limitation = getLimitation(plan);

                        const session = await stripe.checkout.sessions.create(
                          {
                            mode: "payment",
                            line_items: [
                              {
                                price_data: {
                                  currency: "USD",
                                  unit_amount: item.price ?? 0,
                                  product_data: {
                                    name: item.name,
                                    description: "SOme descriptoin",
                                  },
                                },
                                quantity: 1,
                              },
                            ],
                            payment_intent_data: {
                              application_fee_amount: Math.round(
                                ((item.price ?? 0) * limitation.fees) / 100
                              ),
                            },
                            success_url: `http://localhost:3000/share/${item.id}?session_id={CHECKOUT_SESSION_ID}`,
                            cancel_url: `http://localhost:3000/share/${item.id}`,
                          },
                          {
                            stripeAccount: stripeAccountId ?? "",
                          }
                        );

                        if (!session.url) throw new Error("Invlaid url");

                        redirect(session.url);
                      }}
                      className="w-full"
                    >
                      Buy Now
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* Download section (visible if not paid or if purchased) */}
            {(!isPaid || isPurchased) && (
              <div className="py-6">
                <div className="flex flex-col items-center max-w-md mx-auto">
                  <div className="w-12 h-12 flex items-center justify-center bg-muted rounded-full mb-6">
                    <DownloadIcon className="h-6 w-6 text-muted-foreground" />
                  </div>

                  <h2 className="text-lg font-medium mb-6">
                    Your file is ready for download
                  </h2>

                  <Button asChild className="w-full">
                    <a
                      href={item.fileUrl}
                      download={item.name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download File
                    </a>
                  </Button>

                  <p className="text-muted-foreground text-xs mt-4 text-center">
                    Click the button above to start downloading the file.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="py-3 px-6 border-t bg-muted/20 text-center text-muted-foreground text-xs">
          Shared via ShareFile
        </CardFooter>
      </Card>
    </div>
  );
}
