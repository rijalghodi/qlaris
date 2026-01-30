// Auth cookie keys
export const ACCESS_TOKEN_KEY = "qlaris.access-token";
export const REFRESH_TOKEN_KEY = "qlaris.refresh-token";

export enum Role {
  SUPERADMIN = "superadmin",
  OWNER = "owner",
  CASHIER = "cashier",
  MANAGER = "manager",
}

export const employeeRoles = [Role.CASHIER, Role.MANAGER];

export const BUSINESS_CATEGORIES = [
  { label: "Cafe", value: "cafe" },
  { label: "Restaurant", value: "restaurant" },
  { label: "Food Stall", value: "food_stall" },
  { label: "Retail", value: "retail" },
  { label: "Grocery", value: "grocery" },
  { label: "Minimarket", value: "minimarket" },
  { label: "Bakery", value: "bakery" },
  { label: "Pharmacy", value: "pharmacy" },
  { label: "Fashion", value: "fashion" },
  { label: "Laundry", value: "laundry" },
  { label: "Barbershop", value: "barbershop" },
  { label: "Printing", value: "printing" },
  { label: "Other", value: "other" },
];

export const EMPLOYEE_COUNT = [
  { label: "By Yourself", value: "0" },
  { label: "1-5", value: "5" },
  { label: "6-10", value: "10" },
  { label: "11-25", value: "25" },
  { label: "26+", value: "100" },
];
