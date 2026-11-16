import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  CreditCard,
  LayoutDashboard,
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
  { label: "Merchants", href: "/dashboard", icon: Store, badge: "Soon", disabled: true },
  { label: "Subscriptions", href: "/dashboard", icon: CreditCard, badge: "Soon", disabled: true },
  { label: "Master catalog", href: "/dashboard", icon: Boxes, badge: "Soon", disabled: true },
  { label: "Customers", href: "/dashboard", icon: Users, badge: "Soon", disabled: true },
  { label: "Reports", href: "/dashboard", icon: BarChart3, badge: "Soon", disabled: true },
  { label: "Settings", href: "/dashboard", icon: Settings, badge: "Soon", disabled: true },
];