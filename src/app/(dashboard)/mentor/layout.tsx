import { RoleGuard } from "@/components/layout/role-guard";

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowed={["mentor", "admin"]}>{children}</RoleGuard>;
}
