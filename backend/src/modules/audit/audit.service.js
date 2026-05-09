import { createAuditLogRecord, findAuditLogs } from "./audit.repository.js";
import AppError from "../../common/utils/appError.js";


export const logActionService = async ({
  user,
  action,
  entityType,
  entityId,
  oldValues = null,
  newValues = null,
  req = null,
  institutionId = null,
}) => {
  try {
    const userId = user?.id || null;
    const finalInstitutionId = institutionId || user?.institutionId || null;

    let ipAddress = null;
    let userAgent = null;

    if (req) {
      const forwarded = req.headers["x-forwarded-for"];
      const clientIp = forwarded ? forwarded.split(",")[0].trim() : null;
      ipAddress = clientIp || req.ip || req.connection?.remoteAddress;
      userAgent = req.headers["user-agent"];
    }

    return await createAuditLogRecord({
      userId,
      institutionId: finalInstitutionId,
      action,
      entityType,
      entityId: String(entityId),
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    // We log but don't THROW because we don't want an audit failure to break the main business logic
    console.error("Audit Logging Failed:", error);
  }
};

/**
 * Lists audit logs with multi-tenant permissions.
 */
export const listAuditLogsService = async ({ user, filters = {}, pagination = {} }) => {
  const { page = 1, limit = 20 } = pagination;
  const offset = (page - 1) * limit;

  const queryFilters = { ...filters };

  // Enforce Multi-tenancy
  if (user.roleName !== "SUPER_ADMIN") {
    if (!user.institutionId) {
      throw new AppError("Unauthorized: No institution context found.", 403);
    }
    queryFilters.institutionId = user.institutionId;
  }

  return await findAuditLogs({
    ...queryFilters,
    limit,
    offset,
  });
};
