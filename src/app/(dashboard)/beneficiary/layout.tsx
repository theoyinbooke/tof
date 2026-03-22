import { RoleGuard } from "@/components/layout/role-guard";

export default function BeneficiaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowed={["beneficiary", "admin"]}>{children}</RoleGuard>
  );
}
