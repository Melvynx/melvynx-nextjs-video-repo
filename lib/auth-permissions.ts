import { createAccessControl, Statements } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const statement = {
  ...defaultStatements,
  posts: ["create", "delete"],
} as const;

const ac = createAccessControl(statement);

const member = ac.newRole({
  ...memberAc.statements,
  posts: ["create", "delete"],
});

const admin = ac.newRole({
  ...adminAc.statements,
  posts: ["create", "delete"],
});

const owner = ac.newRole({
  ...(statement as Statements),
  ...ownerAc.statements,
});

export const AC_ROLES = { member, admin, owner };
export const AC_CONTROL = ac;
