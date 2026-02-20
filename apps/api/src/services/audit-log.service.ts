import { AuditLog } from '../models/audit-log.model';

interface LogActionInput {
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
}

export const logAdminAction = (input: LogActionInput): void => {
  // Fire-and-forget: don't await, don't block the request
  AuditLog.create({
    admin: input.adminId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    changes: input.changes ?? {},
    ipAddress: input.ipAddress ?? '',
  }).catch((err: unknown) => {
    console.error('Failed to write audit log:', err);
  });
};

export const getAuditLogs = async (
  page: number,
  limit: number,
  filters?: { action?: string; targetType?: string; adminId?: string }
) => {
  const query: Record<string, unknown> = {};
  if (filters?.action) query.action = filters.action;
  if (filters?.targetType) query.targetType = filters.targetType;
  if (filters?.adminId) query.admin = filters.adminId;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    AuditLog.countDocuments(query),
  ]);

  return { logs, total };
};
