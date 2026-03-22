import { RoleGuard } from "@/components/layout/role-guard";

export default function FacilitatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowed={["facilitator", "admin"]}>{children}</RoleGuard>
  );
}
