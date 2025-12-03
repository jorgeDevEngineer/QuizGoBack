import { randomBytes } from "node:crypto";
import { InvitationTokenGenerator } from "../../domain/port/GroupInvitationTokenGenerator";

export const cryptoInvitationTokenGenerator: InvitationTokenGenerator = () => {
  return randomBytes(16).toString("hex"); 
};