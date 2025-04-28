'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { ProfileDropdown } from "./ProfileDropdown";
import { Switch } from "@/components/ui/switch";

export function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newDarkMode = !prev;
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newDarkMode;
    });
  };

  const isEditorOrAdmin = session?.user?.role === 'EDITOR' || session?.user?.role === 'ADMIN';

  return (
    <nav className="sticky top-0 z-50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-sm dark:text-white border-b">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              BlogHub
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {session && (
              <div className="md:hidden">
                <ProfileDropdown />
              </div>
            )}
            <div className="flex md:hidden items-center space-x-2 mr-2">
              <Switch
                id="theme-mode-mobile"
                checked={darkMode}
                onCheckedChange={toggleTheme}
                aria-label="Toggle theme"
              />
              {darkMode ? (
                <Moon className="h-4 w-4 text-blue-400" />
              ) : (
                <Sun className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Show My Blogs if the user is an editor or admin */}
            <Link
              href={isEditorOrAdmin ? "/my-blogs" : "/blogs"}
              className="text-sm font-medium hover:text-gray-900 dark:hover:text-gray-300"
            >
              {isEditorOrAdmin ? "My Blogs" : "All Blogs"}
            </Link>

            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              <Switch
                id="theme-mode-desktop"
                checked={darkMode}
                onCheckedChange={toggleTheme}
                aria-label="Toggle theme"
              />
              <Moon className="h-4 w-4 text-blue-400" />
            </div>

            {session ? (
              <div className="flex items-center gap-4">
                <ProfileDropdown />
              </div>
            ) : (
              <Button asChild>
                <Link href="/auth/login">
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} transition-all duration-300 ease-in-out`}>
          <div className="py-4 space-y-2">
            {/* Show My Blogs if the user is an editor or admin */}
            <Link
              href={isEditorOrAdmin ? "/my-blogs" : "/blogs"}
              className="block px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              {isEditorOrAdmin ? "My Blogs" : "All Blogs"}
            </Link>

            {!session && (
              <Button asChild className="w-full">
                <Link href="/auth/login">
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
