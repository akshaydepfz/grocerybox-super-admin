import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  Store,
  Users,
} from "lucide-react";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
};

export const dashboardNavItems: DashboardNavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Merchants", href: "/dashboard/merchants", icon: Store },
  { label: "Subscriptions", href: "/dashboard", icon: CreditCard, badge: "Soon", disabled: true },
  { label: "Categories", href: "/dashboard/categories", icon: Boxes },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Customers", href: "/dashboard", icon: Users, badge: "Soon", disabled: true },
  { label: "Reports", href: "/dashboard", icon: BarChart3, badge: "Soon", disabled: true },
  { label: "Settings", href: "/dashboard", icon: Settings, badge: "Soon", disabled: true },
];