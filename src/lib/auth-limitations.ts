import { UserPlan } from "./generated/client";

export type LimitationType = {
  files: number;
  canAddPassword: boolean;
  canAddPricing: boolean;
};

export const PLAN_LIMITATIONS: Record<UserPlan, LimitationType> = {
  BRONZE: {
    files: 1,
    canAddPassword: false,
    canAddPricing: false,
  },
  IRON: {
    files: 10,
    canAddPassword: true,
    canAddPricing: true,
  },
  GOLD: {
    files: 500,
    canAddPassword: true,
    canAddPricing: true,
  },
};

export const getLimitation = (plan?: string | null) => {
  const limitation = PLAN_LIMITATIONS[plan as UserPlan];

  return limitation || PLAN_LIMITATIONS.BRONZE;
};
