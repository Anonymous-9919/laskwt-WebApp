import { redirect } from "next/navigation";
import { getCurrentProfileServer } from "@/lib/auth/server-auth";
import { isAdmin } from "@/lib/auth/permissions";
import { listProfilesForAdmin, salesForAllEmployees } from "@/lib/data/server-profiles";
import type { EmployeeSales } from "@/lib/data/types";
import type { Profile } from "@/types";
import { UsersPageClient } from "@/components/users/users-page-client";

export default async function UsersPage() {
  const profile = await getCurrentProfileServer();
  if (!profile || !isAdmin(profile)) {
    redirect("/login");
  }

  const [profiles, sales] = await Promise.all([
    listProfilesForAdmin(),
    salesForAllEmployees(30),
  ]);

  return (
    <UsersPageClient profile={profile} profiles={profiles as Profile[]} sales={sales} />
  );
}
