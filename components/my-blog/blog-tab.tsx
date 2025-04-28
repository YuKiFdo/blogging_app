"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt?: string;
  imageUrl?: string;
}

export function MyBlogs() {
  const [publishedBlogs, setPublishedBlogs] = useState<Blog[]>([]);
  const [pendingBlogs, setPendingBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const userId = session?.user?.id || null;

  const fetchBlogs = async () => {
    setLoading(true);
    const response = await fetch(`/api/posts?authorId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      const { posts } = data;
      setPublishedBlogs(
        posts.filter((post: { published: boolean }) => post.published)
      );
      setPendingBlogs(
        posts.filter((post: { published: boolean }) => !post.published)
      );
    } else {
      console.error("Failed to fetch blogs:", data.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, [userId]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      <Tabs defaultValue="published">
        <TabsList className="flex space-x-4 mb-6 active:bg-gray-100 dark:active:bg-gray-900 rounded-lg p-1">
          <TabsTrigger
            value="published"
            className="px-6 py-3 text-lg font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition duration-300"
          >
            Published Blogs
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="px-6 py-3 text-lg font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition duration-300"
          >
            Pending Blogs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="published">
          {loading ? (
            <div className="flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-6">
              {publishedBlogs.length > 0 ? (
                publishedBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="flex-shrink-0">
                      <Image
                        src={blog.imageUrl || "/placeholder.png"}
                        alt={blog.title}
                        width={500}
                        height={300}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    </div>
                    <div className="flex flex-col justify-between">
                      <h2 className="font-semibold text-2xl text-gray-900 dark:text-white">
                        {blog.title}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                      <p
                        className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300 line-clamp-3 sm:line-clamp-4 [&_p]:mb-0 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline hover:[&_a]:text-blue-800 dark:hover:[&_a]:text-blue-500 [&_ol]:list-decimal [&_ul]:list-disc [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 dark:[&_blockquote]:border-gray-600 [&_blockquote]:pl-4 [&_blockquote]:italic"
                        dangerouslySetInnerHTML={{
                          __html: blog.content.substring(0, 100) + "...",
                        }}
                      />
                      <Button
                        className="mt-4 w-full dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.location.href = `/blog/${blog.slug}`;
                        }}
                      >
                        View Full Post
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No published blogs found.
                </p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {loading ? (
            <div className="flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-6">
              {pendingBlogs.length > 0 ? (
                pendingBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="flex-shrink-0">
                      <Image
                        src={blog.imageUrl || "/placeholder.png"}
                        alt={blog.title}
                        width={500}
                        height={300}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    </div>
                    <div className="flex flex-col justify-between">
                      <h2 className="font-semibold text-2xl text-gray-900 dark:text-white">
                        {blog.title}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                      <p
                        className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300 line-clamp-3 sm:line-clamp-4 [&_p]:mb-0 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline hover:[&_a]:text-blue-800 dark:hover:[&_a]:text-blue-500 [&_ol]:list-decimal [&_ul]:list-disc [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 dark:[&_blockquote]:border-gray-600 [&_blockquote]:pl-4 [&_blockquote]:italic"
                        dangerouslySetInnerHTML={{
                          __html: blog.content.substring(0, 150) + "...",
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No pending blogs found.
                </p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
