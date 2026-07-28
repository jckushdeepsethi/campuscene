import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type AccessTokenPayload = {
  sub: string;
  role: string;
};

export const signAccessToken = (payload: AccessTokenPayload) => {
  const options: SignOptions = { expiresIn: env.ACCESS_TOKEN_TTL as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
};
