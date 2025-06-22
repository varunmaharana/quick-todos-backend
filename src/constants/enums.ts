export const STATUS_VALUES = ["PENDING", "IN_PROGRESS", "COMPLETE"] as const;
export type StatusType = (typeof STATUS_VALUES)[number];

export const PRIORITY_VALUES = [
    "NONE",
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT",
] as const;
export type PriorityType = (typeof PRIORITY_VALUES)[number];
