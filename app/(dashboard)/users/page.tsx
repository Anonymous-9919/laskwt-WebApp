import { redirect } from "next/navigation";
import { getCurrentProfileServer } from "@/lib/auth/server-auth";
import { isAdmin } from "@/lib/auth/permissions";
import { listProfilesForAdmin, salesForEmployee } from "@/lib/data/server-profiles";
import type { EmployeeSales } from "@/lib/data/types";
import type { Profile } from "@/types";
import { UsersPageClient } from "@/components/users/users-page-client";

export default async function UsersPage() {
  const profile = await getCurrentProfileServer();
  if (!profile || !isAdmin(profile)) {
    redirect("/login");
  }

  const profiles = await listProfilesForAdmin();

  const salesEntries = await Promise.all(
    profiles.map(async (p) => {
      const s = await salesForEmployee(p.id, 30);
      return [p.id, s] as const;
    })
  );
  const sales: Record<string, EmployeeSales> = Object.fromEntries(salesEntries);

  return (
    <UsersPageClient profile={profile} profiles={profiles as Profile[]} sales={sales} />
  );
}
