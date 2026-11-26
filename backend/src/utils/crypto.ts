import crypto from "node:crypto";

export const createOpaqueToken = () => crypto.randomBytes(48).toString("base64url");

export const createNumericOtp = (digits = 6): string => {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

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

