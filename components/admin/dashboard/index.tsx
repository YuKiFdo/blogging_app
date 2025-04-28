"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Head from "next/head";
import {
  User,
  FileText,
  LogOut,
  Home,
  Bell,
  Search,
  Menu,
  Moon,
  Sun,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import NavItem from "./nav-item";
import PostsManagement from "./posts-management";
import UserManagement from "./user-management";
import DashboardOverview from "./dashboard-overview";

const AdminDashboard = () => {
  type SectionKey = "dashboard" | "posts" | "users";
  const [selectedSection, setSelectedSection] =
    useState<SectionKey>("dashboard");
  const { data: session } = useSession();

  const navItems = [
    {
      label: "Dashboard",
      icon: <Home className="w-5 h-5" />,
      id: "dashboard" as SectionKey,
    },
    {
      label: "Posts",
      icon: <FileText className="w-5 h-5" />,
      id: "posts" as SectionKey,
    },
    {
      label: "Users",
      icon: <User className="w-5 h-5" />,
      id: "users" as SectionKey,
    },
  ];

  const sectionComponents = {
    dashboard: <DashboardOverview />,
    posts: <PostsManagement />,
    users: <UserManagement />,
  };

  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newDarkMode = !prev;
      if (newDarkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newDarkMode;
    });
  };

  return (
    <>
      <Head>
        <title>Admin Dashboard | Blog Hub</title>
        <meta property="og:title" content="Admin Dashboard | Blog Hub" key="title" />
        <meta
          name="description"
          content="Manage your blog posts and users efficiently."
        />
        <meta
          property="og:description"
          content="Manage your blog posts and users efficiently."
          key="description"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Admin Dashboard | Blog Hub",
            }),
          }}
        ></script>
      </Head>
      <div className="flex h-screen bg-background">
        <aside className="hidden md:flex w-64 flex-col sidebar border-r p-4">
          <div className="flex items-center mb-6">
            <span className="font-semibold text-lg">Blog Hub Dashboard</span>
          </div>

          <nav className="flex flex-col flex-1 gap-4">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={selectedSection === item.id}
                onClick={() => setSelectedSection(item.id)}
              />
            ))}

            <div className="mt-auto pt-4 border-t border-border">
              <button
                onClick={() => signOut()}
                className="flex items-center w-full px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="ml-3">Sign Out</span>
              </button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 flex items-center justify-between px-4 bg-card text-card-foreground border-b">
            {" "}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex items-center mb-6">
                  <span className="font-semibold text-lg">
                    Blog Hub Dashboard
                  </span>
                </div>

                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <NavItem
                      key={item.id}
                      icon={item.icon}
                      label={item.label}
                      isActive={selectedSection === item.id}
                      onClick={() => {
                        setSelectedSection(item.id);
                        (
                          document.querySelector(
                            '[data-state="open"]'
                          ) as HTMLElement
                        )?.click();
                      }}
                    />
                  ))}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => signOut()}
                      className="flex items-center w-full px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="ml-3">Sign Out</span>
                    </button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            <div className="md:hidden font-medium">
              {navItems.find((item) => item.id === selectedSection)?.label}
            </div>
            <div className="hidden md:flex items-center ml-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="input pl-9 pr-4 py-2 w-64 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div className="flex items-center">
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
              <Button variant="ghost" size="icon" className="mr-2">
                <Bell className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden">
                      <Image
                        src={session?.user?.image || "/default-avatar.jpg"}
                        alt="Profile"
                        fill
                        priority
                        className="object-cover"
                      />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium border-b border-gray-100">
                    {session?.user?.name || "User"}
                  </div>
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-6xl mx-auto">
              {sectionComponents[selectedSection]}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
