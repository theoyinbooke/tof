import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }
  return userId;
}

export async function getAuthUser() {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }
  return user;
}
