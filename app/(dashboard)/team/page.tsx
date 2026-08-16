import { redirect } from "next/navigation";
import { getCurrentProfileServer } from "@/lib/auth/server-auth";
import { isAdmin } from "@/lib/auth/permissions";
import { listProfilesForAdmin, salesForEmployee } from "@/lib/data/server-profiles";
import type { EmployeeSales } from "@/lib/data/types";
import type { Profile } from "@/types";
import { TeamPageClient } from "@/components/team/team-page-client";

export default async function TeamPage() {
  const profile = await getCurrentProfileServer();
  if (!profile || !isAdmin(profile)) {
    redirect("/login");
  }

  const profiles = await listProfilesForAdmin();

  const sales: Record<string, EmployeeSales> = {};
  for (const p of profiles) {
    sales[p.id] = await salesForEmployee(p.id, 30);
  }

  return (
    <TeamPageClient profile={profile} profiles={profiles as Profile[]} sales={sales} />
  );
}
