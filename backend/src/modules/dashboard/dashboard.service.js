import { getSuperAdminStats, getInstitutionAdminStats, getRecentActivities } from "./dashboard.repository.js";

export const getDashboardStatsService = async (user) => {
  let stats;
  if (user.roleName === "SUPER_ADMIN") {
    stats = await getSuperAdminStats();
  } else {
    stats = await getInstitutionAdminStats(user.institutionId);
  }

  const recentActivities = await getRecentActivities();

  return {
    stats,
    recentActivities
  };
};
