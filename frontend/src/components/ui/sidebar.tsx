"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Home,
  Users,
  Bus,
  Route,
  MapPin,
  Bell,
  Settings,
  BarChart3,
  Shield,
  UserCheck,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "@/contexts/sidebar-context";
import { useRouter } from "next/navigation";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: Home,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    badge: "New",
  },
  {
    title: "Driver Management",
    href: "/admin/drivers",
    icon: UserCheck,
  },
  {
    title: "Bus Management",
    icon: Bus,
    children: [
      {
        title: "All Buses",
        href: "/admin/buses",
        icon: Bus,
      },
      {
        title: "Bus Routes",
        href: "/admin/routes",
        icon: Route,
      },
      {
        title: "GPS Tracking",
        href: "/admin/tracking",
        icon: MapPin,
      },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    children: [
      {
        title: "User Analytics",
        href: "/admin/analytics/users",
        icon: Users,
      },
      {
        title: "Route Analytics",
        href: "/admin/analytics/routes",
        icon: Route,
      },
      {
        title: "Safety Reports",
        href: "/admin/analytics/safety",
        icon: Shield,
      },
    ],
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    badge: "3",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [openItems, setOpenItems] = React.useState<string[]>([]);
  const { user, logout } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out",
        isCollapsed ? "-translate-x-full" : "translate-x-0 w-64",
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bus className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  BusTrack
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Admin Panel
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="hidden lg:flex"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <NavItem
              key={item.title}
              item={item}
              openItems={openItems}
              onToggle={toggleItem}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start p-3 h-auto hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center space-x-3 w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                      {user?.name ? getInitials(user.name) : "A"}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user?.name || "Admin User"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user?.email || "admin@school.com"}
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserCheck className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Theme Toggle */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Theme
              </span>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "h-8 w-8 p-0",
                    theme === "light" && "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "h-8 w-8 p-0",
                    theme === "dark" && "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  <Moon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme("system")}
                  className={cn(
                    "h-8 w-8 p-0",
                    theme === "system" && "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface NavItemProps {
  item: NavItem;
  openItems: string[];
  onToggle: (title: string) => void;
  isCollapsed: boolean;
}

function NavItem({ item, openItems, onToggle, isCollapsed }: NavItemProps) {
  const router = useRouter();
  const isOpen = openItems.includes(item.title);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      onToggle(item.title);
    } else if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start p-3 h-auto hover:bg-gray-100 dark:hover:bg-gray-800",
          isCollapsed && "justify-center px-2"
        )}
        onClick={handleClick}
        title={isCollapsed ? item.title : undefined}
      >
        <div className="flex items-center space-x-3 w-full">
          <item.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left text-gray-700 dark:text-gray-300">
                {item.title}
              </span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
              {hasChildren && (
                <div className="text-gray-400">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </Button>

      {hasChildren && !isCollapsed && (
        <Collapsible open={isOpen}>
          <CollapsibleContent className="ml-6 space-y-1">
            {item.children?.map((child) => (
              <Button
                key={child.title}
                variant="ghost"
                className="w-full justify-start p-2 h-auto hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => child.href && router.push(child.href)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <child.icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {child.title}
                  </span>
                </div>
              </Button>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
