"use server";

import { ItemType } from "@/lib/generated/client";
import { prisma } from "@/lib/prisma";
import { userAction } from "@/lib/safe-action";
import { utapi } from "@/lib/uploadthing";
import { z } from "zod";

const createItemSchema = z.object({
  name: z.string().min(1),
  fileUrl: z.string().url(),
  type: z.nativeEnum(ItemType),
  password: z.string().optional(),
  expiresAt: z.date().optional(),
  price: z.number().optional(),
});

export const createItem = userAction
  .schema(createItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx;

    const newItem = await prisma.item.create({
      data: {
        ...parsedInput,
        userId: user.id,
      },
    });

    return newItem;
  });

const updateItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  password: z.string().nullish(),
  expiresAt: z.date().nullish(),
  price: z.number().nullish(),
});

export const updateItemAction = userAction
  .schema(updateItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx;

    const item = await prisma.item.findUnique({
      where: {
        id: parsedInput.id,
        userId: user.id,
      },
    });

    if (!item) {
      throw new Error(
        "Item not found or you don't have permission to update it"
      );
    }

    const updatedItem = await prisma.item.update({
      where: {
        id: parsedInput.id,
      },
      data: {
        ...parsedInput,
        password: user.limitations.canAddPassword ? parsedInput.password : null,
        price: user.limitations.canAddPricing ? parsedInput.price : null,
      },
    });

    return updatedItem;
  });

const deleteItemSchema = z.object({
  id: z.string(),
});

export const deleteItem = userAction
  .schema(deleteItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx;

    const item = await prisma.item.findUnique({
      where: {
        id: parsedInput.id,
        userId: user.id,
      },
    });

    if (!item) {
      throw new Error(
        "Item not found or you don't have permission to delete it"
      );
    }

    // Delete the file from UploadThing
    try {
      if (item.fileUrl) {
        // Extract the file key from the URL
        const fileKey = item.fileUrl.split("/").pop();
        if (fileKey) {
          await utapi.deleteFiles(fileKey);
        }
      }
    } catch (error) {
      console.error("Error deleting file from UploadThing:", error);
      // Continue with deletion even if file removal fails
    }

    // Delete the item from database
    await prisma.item.delete({
      where: {
        id: parsedInput.id,
      },
    });

    return { success: true };
  });
