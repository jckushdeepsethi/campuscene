import crypto from "node:crypto";

export const createOpaqueToken = () => crypto.randomBytes(48).toString("base64url");

export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const addMinutes = (date: Date, minutes: number) => {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
};

