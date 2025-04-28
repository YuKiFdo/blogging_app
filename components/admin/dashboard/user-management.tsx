"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, User, Loader2 } from "lucide-react";
import ContentCard from "./content-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Image from "next/image";
import { toast } from "sonner";

interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  image?: string | null;
}

import { useSession } from "next-auth/react";
const UserManagement = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { data: session } = useSession();

  const handleEdit = () => {
    if (selectedUser?.id === session?.user?.id) {
      toast.error("You cannot edit your own details.");
      return;
    }
    setIsEditing(!isEditing);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: UserType["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "inactive":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const handleRoleChange = (newRole: string) => {
    if (selectedUser) {
      setSelectedUser({ ...selectedUser, role: newRole });
    }
  };

  const hadnleSubmit = async () => {
    if (selectedUser) {
      try {
        const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: selectedUser.role }),
        });
        if (!response.ok) {
          throw new Error("Failed to update user role");
        }
        const data = await response.json();
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === data.id ? { ...user, role: data.role } : user
          )
        );
        toast.success("User role updated successfully");
        setOpenDialog(false);
        setIsEditing(false);
      } catch (err) {
        toast.error("Failed to update user role");
        setIsEditing(false);
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    }
  };

  if (loading) {
    return (
      <ContentCard>
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ContentCard>
    );
  }

  if (error) {
    return <ContentCard>Error: {error}</ContentCard>;
  }

  return (
    <ContentCard>
      <h2 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">
        User Management
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Users
          </p>
          <p className="text-2xl font-semibold mt-1">{users.length}</p>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Active Users
          </p>
          <p className="text-2xl font-semibold mt-1">
            {users.filter((u) => u.status === "active").length}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            New This Week
          </p>
          <p className="text-2xl font-semibold mt-1">
            {
              users.filter((u) => {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                return new Date(u.createdAt) > oneWeekAgo;
              }).length
            }
          </p>
        </div>
      </div>

      <div className="flex justify-end items-center mb-4">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search users..."
            className="pl-8 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-900 dark:text-white">
          <thead className="border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="text-left py-3 font-medium">User</th>
              <th className="text-left py-3 font-medium">Email</th>
              <th className="text-left py-3 font-medium">Role</th>
              <th className="text-left py-3 font-medium">Status</th>
              <th className="text-left py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  onClick={() => {
                    setSelectedUser(user);
                    setOpenDialog(true);
                  }}
                >
                  <td className="py-3">
                    <div className="flex items-center">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name}
                            className="h-full w-full object-cover"
                            width={32}
                            height={32}
                          />
                        ) : (
                          <div className="bg-gray-200 h-full w-full flex items-center justify-center dark:bg-gray-700">
                            <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3">{user.email}</td>
                  <td className="py-3 capitalize">{user.role}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        "active"
                      )}`}
                    >
                      Active
                    </span>
                  </td>
                  <td className="py-3">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenDialog(true)}
                    ></Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader className="flex flex-row justify-between items-center mt-2">
            <DialogTitle>User Details</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="hover:text-gray-200"
            >
              <Edit className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-gray-200" />
            </Button>
          </DialogHeader>
          <DialogDescription>
            View and edit user information here.
          </DialogDescription>

          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden">
                  {selectedUser.image ? (
                    <Image
                      src={selectedUser.image}
                      alt={selectedUser.name}
                      className="h-full w-full object-cover"
                      width={64}
                      height={64}
                    />
                  ) : (
                    <div className="bg-gray-200 h-full w-full flex items-center justify-center dark:bg-gray-700">
                      <User className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedUser.name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div>
                <p>
                  Status:{" "}
                  <span className={getStatusColor(selectedUser.status)}>
                    {selectedUser.status}
                  </span>
                </p>
                <p>
                  Joined:{" "}
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-2 w-48 flex-1">
                <p>Role:</p>
                {isEditing ? (
                  <Select
                    value={selectedUser.role}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {" "}
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="EDITOR">Editor</SelectItem>
                      <SelectItem value="READER">Reader</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p>{selectedUser.role}</p>
                )}
              </div>
            </div>
          )}

          <DialogClose asChild>
            {isEditing ? (
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="default" onClick={hadnleSubmit}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Close
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Close
              </Button>
            )}
          </DialogClose>
        </DialogContent>
      </Dialog>
    </ContentCard>
  );
};

export default UserManagement;
