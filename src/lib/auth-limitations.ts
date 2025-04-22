import { UserPlan } from "./generated/client";

export type LimitationType = {
  files: number;
  canAddPassword: boolean;
  canAddPricing: boolean;
  fees: number;
};

export const PLAN_LIMITATIONS: Record<UserPlan, LimitationType> = {
  BRONZE: {
    files: 1,
    canAddPassword: false,
    canAddPricing: false,
    fees: 10,
  },
  IRON: {
    files: 10,
    canAddPassword: true,
    canAddPricing: true,
    fees: 5,
  },
  GOLD: {
    files: 500,
    canAddPassword: true,
    canAddPricing: true,
    fees: 3,
  },
};

export const getLimitation = (plan?: string | null) => {
  const limitation = PLAN_LIMITATIONS[plan as UserPlan];

  return limitation || PLAN_LIMITATIONS.BRONZE;
};
