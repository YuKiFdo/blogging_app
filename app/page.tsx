"use client";
import { Navbar } from "@/components/main/navbar/Navbar";
import { BlogCard } from "@/components/main/BlogCard";
import { MobileSignInBanner } from "@/components/common/MobileSignInBanner";
import { useState, useEffect } from "react";
import { Loading } from "@/components/common/Loading";
import { CreatePostDialog } from "@/components/main/CreatePost";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
}

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>('all');
  const [searchAuthor, setSearchAuthor] = useState<string>("");
  const [authorSuggestions, setAuthorSuggestions] = useState<
    { name: string; image?: string | null }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const allAuthors = Array.from(
    new Map(blogs.map((blog) => [blog.User.name, blog.User.image])).entries()
  ).map(([name, image]) => ({ name, image }));

  useEffect(() => {
    if (searchAuthor.trim() !== "") {
      const filtered = allAuthors.filter((author) =>
        author.name.toLowerCase().includes(searchAuthor.toLowerCase())
      );
      console.log("Filtered authors:", filtered);
      setAuthorSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchAuthor, blogs]);

  const filteredBlogs = blogs.filter((blog) => {
    const categoryMatch =
      !selectedCategory || selectedCategory === "all"
        ? true
        : blog.Category.some((cat) => cat.name === selectedCategory);

    const tagMatch =
      !selectedTag || selectedTag === "all"
        ? true
        : blog.Tag.some((tag) => tag.name === selectedTag);

    const authorMatch = searchAuthor
      ? blog.User.name.toLowerCase().includes(searchAuthor.toLowerCase())
      : true;

    return categoryMatch && tagMatch && authorMatch;
  });

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/posts");
      const data = await response.json();

      if (response.ok) {
        console.log("Fetched posts:", data.posts);
        setBlogs(data.posts);
      } else {
        setError(data.error || "Failed to fetch posts");
      }
    } catch (error) {
      setError("An error occurred while fetching posts.");
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Latest Blog Posts</h1>
          {session && userRole !== "READER" && (
            <CreatePostDialog onPostCreated={fetchBlogs} />
          )}
        </div>
        {loading && <Loading justify="start" margin="mt-25" />}
        {error && (
          <div className="text-red-500 text-sm sm:text-base">{error}</div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-4 w-full sm:w-auto">
            <Select
              value={selectedCategory || ""}
              onValueChange={(value) => setSelectedCategory(value)}
            >
              <SelectTrigger className="md:w-[180px] w-full">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {[...new Set(blogs.flatMap((b) => b.Category.map((c) => c.name)))].map(
                  (name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            <Select
              value={selectedTag || ""}
              onValueChange={(value) => setSelectedTag(value)}
            >
              <SelectTrigger className="md:w-[180px] w-full">
                <SelectValue placeholder="Filter by Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {[...new Set(blogs.flatMap((b) => b.Tag.map((t) => t.name)))].map(
                  (name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            </div>

            <div className="relative w-full md:w-[180px]">
              <Input
                type="text"
                placeholder="Filter by Author"
                value={searchAuthor}
                onChange={(e) => setSearchAuthor(e.target.value)}
                className="w-full"
                onFocus={() => {
                  if (searchAuthor) setShowSuggestions(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 100);
                }}
              />
              {showSuggestions && (
                <div className="absolute z-10 w-full text-foreground border border-gray-700 bg-card rounded shadow-md max-h-40 overflow-y-auto">
                  {authorSuggestions.length > 0 ? (
                    authorSuggestions.map((author) => (
                      <div
                        key={author.name}
                        className="flex items-center px-3 py-2 gap-2 hover:bg-accent cursor-pointer text-sm text-foreground"
                        onClick={() => {
                          setSearchAuthor(author.name);
                          setShowSuggestions(false);
                        }}
                      >
                        {author.image ? (
                          <Image
                            src={author.image}
                            alt={author.name}
                            className="w-6 h-6 rounded-full object-cover"
                            width={24}
                            height={24}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-muted" />
                        )}
                        <span>{author.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No authors found
                    </div>
                  )}
                </div>
              )}
            </div>

            {(selectedCategory !=='all' || selectedTag !=='all' || searchAuthor) && (
              <Button
              className="w-full sm:w-auto"
                variant="outline"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedTag("all");
                  setSearchAuthor("");
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredBlogs.map((blog) => (
            <BlogCard
              key={blog.id}
              slug={blog.slug}
              date={new Date(blog.createdAt).toLocaleDateString()}
              title={blog.title}
              image={blog.imageUrl}
              category={blog.Category.map((category) => category.name).join(", ")}
              tags={blog.Tag.map((tag) => tag.name).join(", ")}
              excerpt={blog.content.substring(0, 100) + "..."}
              author={blog.User.name}
            />
          ))}
        </div>
      </main>
      <MobileSignInBanner />
    </div>
  );
}
