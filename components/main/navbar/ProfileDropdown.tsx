'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function ProfileDropdown() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session) return null;

  // Function to handle Google profile image URL
  const getProfileImageUrl = (url: string) => {
    if (url?.includes('googleusercontent.com')) {
      // Remove the size parameter and get the full resolution image
      return url.replace(/=s\d+(-c)?$/, '=s400');
    }
    return url;
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" className="h-8 w-8 md:h-10 md:w-10 rounded-full p-0 hover:bg-gray-100 transition-colors">
        {session.user?.image ? (
          <div className="relative h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden">
            <Image
              src={getProfileImageUrl(session.user.image)}
              alt="Profile"
              fill
              priority
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-gray-200">
            <User className="h-5 w-5" />
          </div>
        )}
      </Button>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="hidden md:block">
              <div className="text-sm font-medium">{session.user?.name}</div>
              <div className="text-xs text-gray-500">{session.user?.role.charAt(0).toUpperCase() + session.user?.role.slice(1).toLowerCase()}</div>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <div className="px-2 py-1.5 text-sm font-semibold">
            {session.user?.name} - {session.user?.role.charAt(0).toUpperCase() + session.user?.role.slice(1).toLowerCase()}
          </div>
          <div className="px-2 py-1.5 text-xs text-gray-500">
            {session.user?.email}
          </div>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center hover:bg-gray-100">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center hover:bg-gray-100">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => signOut()}
            className="flex items-center text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 