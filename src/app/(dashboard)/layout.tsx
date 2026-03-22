import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { UserSyncGate } from "@/components/user-sync";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <UserSyncGate>
      <AppShell>{children}</AppShell>
    </UserSyncGate>
  );
}
