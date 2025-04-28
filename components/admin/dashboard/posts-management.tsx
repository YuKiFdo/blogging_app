"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, EyeOff, Search, Check, Clock } from "lucide-react";
import ContentCard from "./content-card";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { toast } from "sonner";

interface Blog {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  slug: string;
  User: {
    name: string;
    image: string | null;
  };
  Category: {
    name: string;
  }[];
  Tag: {
    name: string;
  }[];
  createdAt: string;
  published: boolean;
}

const PostsManagement = () => {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<Blog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        setPosts(data.posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const getStatusBadge = (published: boolean) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          published
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        }`}
      >
        {published ? (
          <>
            <Check className="mr-1 h-3 w-3" />
            Published
          </>
        ) : (
          <>
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </>
        )}
      </span>
    );
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.User.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.Category.some((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleRowClick = (post: Blog) => {
    setSelectedPost(post);
    setIsDialogOpen(true);
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

  const handlePublishClick = async (postId: string, published: boolean) => {
    try {
      const response = await fetch(`/api/posts/${postId}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ published }),
      });

      if (response.status === 404) {
        toast.error("Post not found");
        return;
      }

      if (response.status === 400) {
        toast.error(`Post already ${published ? "published" : "unpublished"}`);
        return;
      }

      if (response.status === 401) {
        toast.error("Unauthorized action");
        return;
      }

      // Get the updated post from the server response
      const updatedPost = await response.json();

      // Update the local state to reflect the changes in the UI
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === updatedPost.id
            ? { ...post, published: updatedPost.published }
            : post
        )
      );

      toast.success(
        published
          ? "Post published successfully!"
          : "Post unpublished successfully!"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(
        published ? "Failed to publish post" : "Failed to unpublish post"
      );
    }
  };

  if (error) {
    return <ContentCard>Error: {error}</ContentCard>;
  }

  return (
    <ContentCard className="dark:bg-gray-900 dark:border-gray-700">
      <h2 className="text-xl font-medium mb-4 text-gray-900 dark:text-gray-100">
        Posts Management
      </h2>
      <div className="flex justify-end items-center mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search posts..."
            className="pl-8 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-900 dark:text-gray-100">
          <thead className="border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left py-3 font-medium">Title</th>
              <th className="text-left py-3 font-medium">Author</th>
              <th className="text-left py-3 font-medium">Categories</th>
              <th className="text-left py-3 font-medium">Status</th>
              <th className="text-left py-3 font-medium">Date</th>
              <th className="text-right py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => handleRowClick(post)}
                >
                  <td className="py-3">{post.title}</td>
                  <td className="py-3">{post.User.name}</td>
                  <td className="py-3">
                    {post.Category.map((cat) => cat.name).join(", ")}
                  </td>
                  <td className="py-3">{getStatusBadge(post.published)}</td>
                  <td className="py-3">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td
                    className="py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {post.published ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 dark:text-red-400"
                        onClick={() => handlePublishClick(post.slug, false)} // Pass false to un
                      >
                        <EyeOff className="mr-1 h-4 w-4" />
                        Unpublish
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 dark:text-green-400"
                        onClick={() => handlePublishClick(post.slug, true)}
                      >
                        <Send className="mr-1 h-4 w-4" />
                        Publish
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No posts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Post Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="md:min-w-3xl max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">
              {selectedPost?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {selectedPost.User.image && (
                    <Image
                      src={selectedPost.User.image}
                      alt={selectedPost.User.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span>{selectedPost.User.name}</span>
                </div>
                <div>{getStatusBadge(selectedPost.published)}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(selectedPost.createdAt).toLocaleDateString()}
                </div>
              </div>

              {selectedPost.imageUrl && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <Image
                    src={selectedPost.imageUrl}
                    alt={selectedPost.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="prose max-w-none dark:prose-dark">
                <div
                  dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedPost.Category.map((category) => (
                  <span
                    key={category.name}
                    className="px-2 py-1 bg-gray-100 rounded-md text-sm dark:bg-gray-700 dark:text-gray-300"
                  >
                    {category.name}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedPost.Tag.map((tag) => (
                  <span
                    key={tag.name}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm dark:bg-blue-900 dark:text-blue-200"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ContentCard>
  );
};

export default PostsManagement;
