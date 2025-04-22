"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useZodForm,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LimitationType } from "@/lib/auth-limitations";
import { Item } from "@/lib/generated/client";
import { format } from "date-fns";
import { CalendarIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  deleteItem,
  updateItemAction,
} from "../../../app/(manage)/files/file.action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  password: z.string().nullable(),
  expiresAt: z.date().nullable(),
  price: z.coerce
    .number()
    .nullable()
    .transform((val) => (val === 0 ? null : val)),
});

type FormValues = z.infer<typeof formSchema>;

interface FileEditFormProps {
  file: Item;
  limitation: LimitationType;
}

export function FileEditForm({ file, limitation }: FileEditFormProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useZodForm({
    schema: formSchema,
    defaultValues: {
      name: file.name,
      password: file.password || null,
      expiresAt: file.expiresAt ? new Date(file.expiresAt) : null,
      price: file.price || null,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsUpdating(true);
    try {
      await updateItemAction({
        id: file.id,
        ...values,
        price: values.price ? Math.floor(values.price * 100) : null,
      });
      toast.success("File updated successfully");
      router.push("/files");
    } catch (error) {
      console.error("Error updating file:", error);
      toast.error("Failed to update file");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteItem({ id: file.id });
      toast.success("File deleted successfully");
      router.push("/files");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
      setIsDeleting(false);
    }
  };

  return (
    <Card className="space-y-6">
      <CardHeader className="flex items-start justify-between flex-row">
        <div>
          <CardTitle>Edit File</CardTitle>
          <CardDescription>Update file information</CardDescription>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                file.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent>
        <Form form={form} onSubmit={onSubmit}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="File name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    {limitation.canAddPassword ? (
                      <Input
                        {...field}
                        type="password"
                        placeholder="Set a password (optional)"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Input
                              {...field}
                              type="password"
                              disabled
                              placeholder="Set a password (optional)"
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(e.target.value || null)
                              }
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              You need to upgrade your plan to add password
                              protection to your files.
                            </p>
                            <Link
                              className={buttonVariants({
                                size: "sm",
                                variant: "outline",
                                className: "mt-2 text-foreground",
                              })}
                              href="/pricing"
                            >
                              Upgrade
                            </Link>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </FormControl>
                  <FormDescription>
                    Password protect this file (leave empty for no password)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiration Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "PPP")
                            : "Set expiration date (optional)"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                      {field.value && (
                        <div className="p-3 border-t border-border">
                          <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => field.onChange(null)}
                          >
                            Clear date
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Set a date when this file will expire
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (USD)</FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-muted-foreground">$</span>
                    </div>
                    <FormControl>
                      {limitation.canAddPassword ? (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pl-8"
                          value={field.value === null ? "" : field.value}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? null
                                : parseFloat(e.target.value)
                            )
                          }
                        />
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Input
                                {...field}
                                type="number"
                                disabled
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="pl-8"
                                value={field.value === null ? "" : field.value}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? null
                                      : parseFloat(e.target.value)
                                  )
                                }
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                You need to upgrade your plan to add password
                                protection to your files.
                              </p>
                              <Link
                                className={buttonVariants({
                                  size: "sm",
                                  variant: "outline",
                                  className: "mt-2 text-foreground",
                                })}
                                href="/pricing"
                              >
                                Upgrade
                              </Link>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </FormControl>
                  </div>
                  <FormDescription>
                    Set a price (leave empty for free)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
