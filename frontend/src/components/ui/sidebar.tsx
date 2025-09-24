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
              className="hidden lg:flex cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto ">
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
                className="w-full justify-start p-0 h-auto hover:bg-transparent cursor-pointer group"
              >
                <div className="w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center space-x-3 w-full">
                    <div className="relative">
                      <Avatar className="h-12 w-12 ring-4 ring-white/20 shadow-lg">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-white/20 backdrop-blur-sm text-white text-lg font-semibold">
                          {user?.firstName && user?.lastName
                            ? getInitials(`${user.firstName} ${user.lastName}`)
                            : "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    {!isCollapsed && (
                      <>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-semibold text-white truncate drop-shadow-sm">
                            {user?.firstName && user?.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : "Admin User"}
                          </p>
                          <p className="text-xs text-white/80 truncate drop-shadow-sm">
                            {user?.email || "admin@school.com"}
                          </p>
                          <div className="flex items-center mt-1">
                            <div className="h-1.5 w-1.5 bg-green-400 rounded-full mr-2"></div>
                            <span className="text-xs text-white/70 font-medium">
                              Online
                            </span>
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" />
                      </>
                    )}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-xl p-2"
            >
              <DropdownMenuLabel className="px-3 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gradient-to-r from-indigo-200 to-purple-200" />
              <DropdownMenuItem className="cursor-pointer rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 mx-1 my-1">
                <UserCheck className="mr-3 h-4 w-4 text-indigo-600 " />
                <span className="font-medium text-indigo-600">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 mx-1 my-1">
                <Settings className="mr-3 h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-600">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 mx-1 my-1">
                <HelpCircle className="mr-3 h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-600">Help</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gradient-to-r from-indigo-200 to-purple-200 my-2" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 mx-1 my-1 text-red-600"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-medium">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Theme Toggle */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-800 dark:to-gray-900 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Theme
                </span>
                <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-inner">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme("light")}
                    className={cn(
                      "h-8 w-8 p-0 cursor-pointer rounded-md transition-all duration-200",
                      theme === "light"
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    )}
                    title="Light Mode"
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "h-8 w-8 p-0 cursor-pointer rounded-md transition-all duration-200",
                      theme === "dark"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    )}
                    title="Dark Mode"
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme("system")}
                    className={cn(
                      "h-8 w-8 p-0 cursor-pointer rounded-md transition-all duration-200",
                      theme === "system"
                        ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    )}
                    title="System Theme"
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {theme === "light" && "☀️ Light Mode Active"}
                  {theme === "dark" && "🌙 Dark Mode Active"}
                  {theme === "system" && "🖥️ System Theme Active"}
                </span>
                <span className="text-xs">
                  {theme === "system" && "Follows OS preference"}
                </span>
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
          "w-full justify-start p-3 h-auto hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer",
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
                className="w-full justify-start p-2 h-auto hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
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
