import React from "react";
import { HiMenuAlt2 } from "react-icons/hi";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <nav className="bg-white">
      <div className="px-4 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="text-gray-600 cursor-pointer hover:text-gray-800 md:hidden"
          >
            <HiMenuAlt2 className="h-6 w-6" />
          </button>
        </div>

        {/* Right Side - Notifications and User Profile */}
        <div className="flex items-center gap-4">
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
