"use client";

import React from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

export const UserMenu: React.FC = () => {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [imageError, setImageError] = React.useState(false);

  // Reset image error when avatar_url changes
  React.useEffect(() => {
    setImageError(false);
  }, [user?.avatar_url]);

  const handleLogout = () => {
    logout();
    router.push("/login/driver");
  };

  const handleLogin = () => {
    router.push("/login/driver");
  };

  const handleRegister = () => {
    router.push("/register/driver");
  };

  const handleProfileClick = () => {
    const role = user?.type ? user.type.toLowerCase() : "driver";
    const profileRoute =
      role === "admin"
        ? "/admin/profile"
        : role === "garage"
        ? "/garage/profile"
        : "/driver/profile";
    router.push(profileRoute);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 cursor-pointer select-none"
        >
          <Avatar className="h-10 w-10 border">
            {isAuthenticated && user?.avatar_url && !imageError ? (
              <Image
                src={user.avatar_url}
                alt={user?.name || "User Avatar"}
                width={40}
                height={40}
                className="rounded-full object-cover w-full h-full"
                onError={() => setImageError(true)}
              />
            ) : null}
            <AvatarFallback className="select-none">
              {isAuthenticated
                ? user?.type?.toLowerCase() === "garage"
                  ? user?.garage_name?.charAt(0) ?? "G"
                  : user?.name?.charAt(0) ?? "U"
                : "G"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start select-none">
            <span className="text-sm font-medium text-gray-900">
              {isAuthenticated
                ? user?.type?.toLowerCase() === "garage"
                  ? user?.garage_name || ""
                  : user?.name || "User"
                : "Guest"}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              {isAuthenticated && user?.type
                ? user.type.toLowerCase()
                : "Visitor"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAuthenticated ? (
          <>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleProfileClick}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-red-600 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-[#19CA32]"
              onClick={handleLogin}
            >
              <User className="h-4 w-4" />
              <span>Login</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-[#19CA32]"
              onClick={handleRegister}
            >
              <User className="h-4 w-4" />
              <span>Register</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
