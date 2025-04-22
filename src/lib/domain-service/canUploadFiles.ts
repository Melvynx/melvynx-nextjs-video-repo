import { getRequiredUser } from "../auth-session";
import { prisma } from "../prisma";

export const canUploadFilesDS = async () => {
  const user = await getRequiredUser();
  const filesCount = await prisma.item.count({ where: { userId: user.id } });

  const canUploadFiles = filesCount < user.limitations.files;

  return canUploadFiles;
};
