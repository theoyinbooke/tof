import { RoleGuard } from "@/components/layout/role-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard allowed={["admin"]}>{children}</RoleGuard>;
}
