"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5";
// import logo from '@/public/logo/mainLogo.png';

import {
  HiSearch,
  HiTruck,
  HiDocumentText,
  HiCalendar,
  HiBell,
  HiMail,
  HiUser,
  HiCurrencyDollar,
  HiCheckCircle,
  HiClipboardList,
  HiCreditCard,
  HiReceiptTax,
  HiQuestionMarkCircle,
  HiHome,
} from "react-icons/hi";
import { HiArrowRightOnRectangle } from "react-icons/hi2";
import { toast } from "react-toastify";
import {
  LayoutGrid,
  Building2,
  Truck,
  Calendar,
  Users,
  RollerCoaster,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGetCurrentSubscriptionQuery } from "@/rtk";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Fetch current subscription for garage users
  const { data: subscriptionData, isLoading: isLoadingSubscription } =
    useGetCurrentSubscriptionQuery(undefined, {
      skip: !user?.type || user.type.toLowerCase() !== "garage",
    });

  const menuItems = [
    // Driver
    {
      icon: HiSearch,
      label: "Book My MOT",
      href: "/driver/book-my-mot",
      role: "driver",
    },
    {
      icon: HiTruck,
      label: "My Vehicles",
      href: "/driver/my-vehicles",
      role: "driver",
    },
    {
      icon: HiDocumentText,
      label: "MOT Reports",
      href: "/driver/mot-reports",
      role: "driver",
    },
    {
      icon: HiCalendar,
      label: "My Bookings",
      href: "/driver/my-bookings",
      role: "driver",
    },
    {
      icon: HiBell,
      label: "Notifications",
      href: "/driver/notifications",
      role: "driver",
    },
    {
      icon: HiMail,
      label: "Contact Us",
      href: "/driver/contact-us",
      role: "driver",
    },

    // garage
    {
      icon: HiUser,
      label: "Garage Profile",
      href: "/garage/garage-profile",
      role: "garage",
    },
    {
      icon: HiCurrencyDollar,
      label: "Pricing",
      href: "/garage/pricing",
      role: "garage",
    },
    {
      icon: HiCheckCircle,
      label: "Availability",
      href: "/garage/availability",
      role: "garage",
    },
    {
      icon: HiClipboardList,
      label: "Bookings",
      href: "/garage/bookings",
      role: "garage",
    },
    {
      icon: HiCreditCard,
      label: "Subscription",
      href: "/garage/subscription",
      role: "garage",
    },
    {
      icon: HiReceiptTax,
      label: "Invoices",
      href: "/garage/invoices",
      role: "garage",
    },
    {
      icon: HiMail,
      label: "Contact Us",
      href: "/garage/contact-us",
      role: "garage",
    },
    {
      icon: HiQuestionMarkCircle,
      label: "FAQ",
      href: "/garage/faq",
      role: "garage",
    },

    // admin
    {
      icon: LayoutGrid,
      label: "Dashboard",
      href: "/admin/dashboard",
      role: "admin",
    },
    {
      icon: Building2,
      label: "Garages Management",
      href: "/admin/manage-garages",
      role: "admin",
    },
    {
      icon: Truck,
      label: "Vehicles Management",
      href: "/admin/vehicles-management",
      role: "admin",
    },
    {
      icon: Users,
      label: "Drivers Management",
      href: "/admin/manage-drivers",
      role: "admin",
    },
    {
      icon: Calendar,
      label: "Bookings Management",
      href: "/admin/manage-bookings",
      role: "admin",
    },
    {
      icon: Users,
      label: "Users Management",
      href: "/admin/users-management",
      role: "admin",
    },
    {
      icon: User,
      label: "Role Management",
      href: "/admin/roles-management",
      role: "admin",
    },
    {
      icon: User,
      label: "Subscription Management",
      href: "/admin/subscriptions-management",
      role: "admin",
    },
  ];

  const handleLogout = () => {
    logout(); // Clear auth state
    router.push("/");
    toast.success("Logout successful");
  };

  const handleLogin = () => {
    router.push("/login/driver");
  };

  const handleActivateAccount = () => {
    router.push("/garage/subscription");
  };

  // Check if subscription is active
  const hasActiveSubscription = subscriptionData?.data?.status === "ACTIVE";

  // Protected routes that require active subscription
  const protectedRoutes = [
    "/garage/pricing",
    "/garage/availability",
    "/garage/bookings",
  ];

  const isRouteProtected = (href: string) => {
    return protectedRoutes.includes(href);
  };

  return (
    <div className="w-72 h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="py-5 px-3 flex justify-between items-center mt-2">
        <div>
          <h1 className="text-2xl font-bold text-[#19CA32]">simplymot.co.uk</h1>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full cursor-pointer hover:bg-gray-100 md:hidden"
        >
          <IoClose className="h-6 w-6" />
        </button>
      </div>

      {/* Navigation Menu - Takes up available space */}
      <div className="flex-1 overflow-y-auto">
        <nav className="mt-4 px-3">
          <ul className="space-y-5">
            {menuItems
              .filter((item) => {
                const role = user?.type ? user.type.toLowerCase() : "driver";
                return item.role === role;
              })
              .map((item) => {
                const isActive =
                  item.href === "/driver/book-my-mot"
                    ? pathname.startsWith("/driver/book-my-mot")
                    : pathname === item.href;

                // Check if route is protected and subscription is not active
                const isGarageLocked =
                  user?.type?.toLowerCase() === "garage" &&
                  isRouteProtected(item.href) &&
                  !hasActiveSubscription;

                // Check if route is protected for guest users
                const isGuestLocked =
                  !isAuthenticated && item.href !== "/driver/book-my-mot";

                const isLocked = isGarageLocked || isGuestLocked;

                return (
                  <li key={item.href}>
                    {isLocked ? (
                      <div className="flex items-center justify-between px-4 py-2 text-gray-400 cursor-not-allowed rounded-[8px] bg-gray-50">
                        <div className="flex items-center">
                          <item.icon className="h-5 w-5 mr-3" />
                          {item.label}
                        </div>
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    ) : (
                      <Link href={item.href}>
                        <span
                          className={`flex items-center px-4 py-2 transition-colors duration-200
                                              ${
                                                isActive
                                                  ? "bg-[#DDF7E0] text-[#19CA32] font-[400] rounded-[8px]"
                                                  : "text-gray-800 hover:bg-gray-100 hover:text-gray-700 rounded-[8px]"
                                              }`}
                        >
                          <item.icon
                            className={`h-5 w-5 mr-3 ${
                              isActive ? "text-white]" : ""
                            }`}
                          />
                          {item.label}
                        </span>
                      </Link>
                    )}
                  </li>
                );
              })}
          </ul>
        </nav>
      </div>

      {/* Bottom Section - Always at bottom */}
      <div className="mt-auto">
        {/* role based alert - hide only when status is ACTIVE, show for all other cases */}
        {user?.type &&
          user.type.toLowerCase() === "garage" &&
          !isLoadingSubscription &&
          (!subscriptionData?.success ||
            !subscriptionData?.data ||
            subscriptionData?.data?.status !== "ACTIVE") && (
            <div className="p-2">
              <div
                className="bg-red-500 text-white px-6 py-6 rounded-lg space-y-2"
                role="alert"
              >
                <h1 className="font-bold text-md text-center font-Inter">
                  Account not active
                </h1>
                <p className="text-sm leading-relaxed text-center text-[#EDEDED]">
                  To activate your garage subscription and start receiving
                  bookings, please proceed to the payment page.
                </p>

                <button
                  onClick={handleActivateAccount}
                  className="bg-white text-red-500 px-2 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors duration-200 w-full cursor-pointer font-Inter text-sm"
                >
                  Activate Account
                </button>
              </div>
            </div>
          )}

        {/* Logout/Login button */}
        <div className="p-4">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center cursor-pointer w-full px-4 py-2 text-[#19CA32] hover:bg-[#19CA32] hover:text-white rounded-md transition-colors duration-300 group"
            >
              <HiArrowRightOnRectangle className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:translate-x-1" />
              Logout
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center cursor-pointer w-full px-4 py-2 text-[#19CA32] hover:bg-[#19CA32] hover:text-white rounded-md transition-colors duration-300 group"
            >
              <HiArrowRightOnRectangle className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:translate-x-1" />
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
