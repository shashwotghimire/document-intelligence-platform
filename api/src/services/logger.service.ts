import { Logs } from "../models/logs.model";

export const logEvent = async (
  userId: string,
  action: string,
  data: string,
): Promise<void> => {
  try {
    await Logs.create({ userId, action, data });
  } catch (e) {
    console.error("[logger.service] Failed to write log:", e);
  }
};
