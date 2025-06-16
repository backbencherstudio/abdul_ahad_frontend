import React from 'react'
import { HiMenuAlt2 } from 'react-icons/hi'
import { Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { usePathname, useRouter } from 'next/navigation';

export default function Header({ onMenuClick, user }: {
    onMenuClick: () => void, user: {
        name: string;
        email: string;
        role: string;
        avatar: string;
    }
}) {
    const notificationCount = 3
    const pathname = usePathname();
    const router = useRouter();
    const getPageTitle = () => {
        switch (pathname) {
            // Driver routes
            case '/driver/book-my-mot':
                return 'Book My MOT';
            case '/driver/my-vehicles':
                return 'My Vehicles';
            case '/driver/mot-reports':
                return 'MOT Reports';
            case '/driver/my-bookings':
                return 'My Bookings';
            case '/driver/notifications':
                return 'Notifications';
            case '/driver/contact-us':
                return 'Contact Us';

            // Garage routes
            case '/garage/garage-profile':
                return 'Garage Profile';
            case '/garage/pricing':
                return 'Pricing';

            default:
                // Dynamic default based on user role
                if (pathname.startsWith('/garage')) {
                    return 'Garage Dashboard';
                } else {
                    return 'Driver Dashboard';
                }
        }
    };

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
                    {/* <div className="hidden md:block">
                        <h1 className="text-xl font-semibold text-[#737373]">{getPageTitle()}</h1>
                    </div> */}
                </div>

                {/* Right Side - Notifications and User Profile */}
                <div className="flex items-center gap-4">
                    {/* Notification Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative cursor-pointer select-none border">
                                <Bell className="h-5 w-5 text-gray-600" />
                                {notificationCount > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                                    >
                                        {notificationCount}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                                <div className="font-medium">New message received</div>
                                <div className="text-sm text-gray-500">You have a new message from John Doe</div>
                                <div className="text-xs text-gray-400">2 minutes ago</div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                                <div className="font-medium">Booking confirmed</div>
                                <div className="text-sm text-gray-500">Your MOT booking has been confirmed</div>
                                <div className="text-xs text-gray-400">1 hour ago</div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                                <div className="font-medium">Payment reminder</div>
                                <div className="text-sm text-gray-500">Your payment is due in 3 days</div>
                                <div className="text-xs text-gray-400">1 day ago</div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-center text-[#19CA32] font-medium">
                                View all notifications
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 px-2 cursor-pointer select-none">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar} alt="User Avatar" />
                                    <AvatarFallback className="select-none">{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="hidden md:flex flex-col items-start select-none">
                                    <span className="text-sm font-medium text-gray-900 select-none">{user.name}</span>
                                    <span className="text-xs text-gray-500 select-none capitalize">{user.role}</span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => {

                                // i have three role admin, garage, driver
                                const profileRoute = user.role === 'admin' ? '/admin/profile' : user.role === 'garage' ? '/garage/profile' : '/driver/profile';
                                router.push(profileRoute);
                            }}>
                                <User className="h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex items-center gap-2 text-red-600 cursor-pointer">
                                <LogOut className="h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    )
}
