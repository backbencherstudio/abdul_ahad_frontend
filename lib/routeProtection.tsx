"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/reusable/LoadingSpinner";

interface RouteProtectionProps {
  children: React.ReactNode;
}

export const RouteProtection: React.FC<RouteProtectionProps> = ({
  children,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Skip redirection for public driver routes
        if (pathname.startsWith("/driver/book-my-mot")) {
          return;
        }

        // Redirect to appropriate login page based on the route
        if (pathname.startsWith("/driver")) {
          router.push("/login/driver");
        } else if (pathname.startsWith("/garage")) {
          router.push("/login/garage");
        } else if (pathname.startsWith("/admin")) {
          router.push("/admin-login");
        } else {
          router.push("/login");
        }
        return;
      }

      if (user) {
        const isDriverRoute = pathname.startsWith("/driver");
        const isGarageRoute = pathname.startsWith("/garage");
        const isAdminRoute = pathname.startsWith("/admin");

        // If user tries to access a route they don't have permission for, redirect immediately
        if (isDriverRoute && user.type !== "DRIVER") {
          router.push("/unauthorized");
          return;
        }

        if (isGarageRoute && user.type !== "GARAGE") {
          router.push("/unauthorized");
          return;
        }

        if (isAdminRoute && user.type !== "ADMIN") {
          router.push("/unauthorized");
          return;
        }
      }
    }
  }, [isAuthenticated, isLoading, user, pathname, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  // Show loading while redirecting (for both login and unauthorized)
  // Don't show loading for public driver routes when unauthenticated
  const isPublicDriverRoute = pathname.startsWith("/driver/book-my-mot");

  if (
    (!isAuthenticated && !isPublicDriverRoute) ||
    (user &&
      ((pathname.startsWith("/driver") && user.type !== "DRIVER") ||
        (pathname.startsWith("/garage") && user.type !== "GARAGE") ||
        (pathname.startsWith("/admin") && user.type !== "ADMIN")))
  ) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  return <>{children}</>;
};
