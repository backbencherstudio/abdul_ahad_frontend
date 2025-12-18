"use client";

import React from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import Image from "next/image";
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export const UserMenu: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
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
          <Avatar className="h-10 w-10">
            {user?.avatar_url ? (
              <AvatarImage asChild>
                <Image
                  src={user.avatar_url}
                  alt="User Avatar"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              </AvatarImage>
            ) : (
              <AvatarFallback className="select-none">
                {user?.type?.toLowerCase() === "garage"
                  ? user?.garage_name?.charAt(0) ?? "G"
                  : user?.name?.charAt(0) ?? "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="hidden md:flex flex-col items-start select-none">
            <span className="text-sm font-medium text-gray-900">
              {user?.type?.toLowerCase() === "garage"
                ? user?.garage_name || ""
                : user?.name || "User"}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              {user?.type ? user.type.toLowerCase() : "driver"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};



