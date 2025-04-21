import { authRoute } from "@/app/api/zod-route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const POST = authRoute
  .params(
    z.object({
      postId: z.coerce.number(),
    })
  )
  .body(
    z.object({
      content: z.string(),
    })
  )
  .handler(async (request, context) => {
    const body = context.body;
    const params = context.params;

    const comment = await prisma.comment.create({
      data: {
        content: body.content,
        postId: params.postId,
        userId: context.ctx.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return comment;
  });

// export async function POST(
//   req: Request,
//   context: { params: Promise<{ postId: string }> }
// ) {
//   const user = await getRequiredUser();

//   const params = await context.params;

//   const body = await req.json();
//   const { content } = body;

//   if (!content) {
//     return NextResponse.json({ error: "Content is required" }, { status: 400 });
//   }

//   const comment = await prisma.comment.create({
//     data: {
//       content,
//       postId: parseInt(params.postId),
//       userId: user.id,
//     },
//     include: {
//       user: {
//         select: {
//           name: true,
//           image: true,
//         },
//       },
//     },
//   });

//   return NextResponse.json(comment);
// }
