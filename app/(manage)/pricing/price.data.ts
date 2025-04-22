export type PriceType = {
  id: string;
  name: string;
  price: number;
  features: string[];
  monthlyPriceId: string;
  yearlyPriceId: string;
};

export const PRICES: PriceType[] = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    features: ["Basic file sharing", "Limited storage", "Standard support"],
    monthlyPriceId: "",
    yearlyPriceId: "",
  },
  {
    id: "IRON",
    name: "Iron",
    price: 5,
    features: ["Password protection", "Extended storage", "Priority support"],
    monthlyPriceId: process.env.IRON_PLAN_PRICE_ID ?? "",
    yearlyPriceId: process.env.IRON_PLAN_YEARLY_PRICE_ID ?? "",
  },
  {
    id: "GOLD",
    name: "Gold",
    price: 50,
    features: [
      "Unlimited sharing",
      "Premium storage",
      "24/7 support",
      "Custom branding",
    ],
    monthlyPriceId: process.env.GOLD_PLAN_PRICE_ID ?? "",
    yearlyPriceId: process.env.GOLD_PLAN_YEARLY_PRICE_ID ?? "",
  },
];
