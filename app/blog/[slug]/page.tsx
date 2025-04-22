"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Head from "next/head";
import { format } from "date-fns";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Loading } from "@/components/common/Loading";
import { useSession } from "next-auth/react";
import { SaveButton } from "@/components/posts/slug/Save";
import { CommentButton } from "@/components/posts/slug/Comment";
import { ShareButton } from "@/components/posts/slug/Share";
import { LikeButton } from "@/components/posts/slug/Like";
import { toast } from "sonner";
import EditModal from "@/components/posts/slug/EditModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CommentSection } from "@/components/posts/slug/CommentSection";
import { useSearchParams } from "next/navigation";
import { Trash } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  User: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  Category: {
    id: string;
    name: string;
  }[];
  Tag: {
    id: string;
    name: string;
  }[];
  Comment: {
    id: string;
    content: string;
    createdAt: string;
    User: {
      id: string;
      name: string;
      image: string | null;
    };
  }[];
  Like: {
    id: string;
    userId: string;
  }[];
  SavedPost: {
    id: string;
    userId: string;
  }[];
}

interface BlogPostPageProps {
  initialPost: Post | null;
  error?: string | null;
}

export default function BlogPostPage({ initialPost, error: initialError }: BlogPostPageProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const userId = session?.user?.id as string;
  const userRole = session?.user?.role;
  const [post, setPost] = useState<Post | null>(initialPost);
  const [loading, setLoading] = useState<boolean>(!initialPost);
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [saved, setSaved] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || initialError;

  // Handle errors
  useEffect(() => {
    if (error === "no-access") {
      toast.error("You don't have access to do this action.");
      const timer = setTimeout(() => {
        router.replace(`/blog/${slug}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, router, slug]);

  useEffect(() => {
    if (initialPost) {
      const userLiked = Array.isArray(initialPost.Like) && 
        initialPost.Like.some((like) => like.userId === userId);
      const userSaved = Array.isArray(initialPost.SavedPost) && 
        initialPost.SavedPost.some((savedPost) => savedPost.userId === userId);
      
      setLiked(userLiked);
      setSaved(userSaved);
      setLikeCount(initialPost.Like.length);
      setCommentCount(initialPost.Comment.length);
    }
  }, [initialPost, userId]);

  useEffect(() => {
    if ((!initialPost || shouldRefetch()) && slug) {
      const fetchPost = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/posts/${slug}`, {
            next: { tags: [`post-${slug}`] } 
          });
          
          if (!response.ok) {
            throw new Error("Failed to fetch post");
          }
          
          const data = await response.json();
          setPost(data);
          
          const userLiked = Array.isArray(data.Like) && 
            data.Like.some((like: { userId: string }) => like.userId === userId);
          setLiked(userLiked);

          const userSaved = Array.isArray(data.SavedPost) && 
            data.SavedPost.some((savedPost: { userId: string }) => savedPost.userId === userId);
          setSaved(userSaved);

          setLikeCount(data.Like.length);
          setCommentCount(data.Comment.length);
        } catch (error) {
          console.error("Error fetching post:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [slug, userId, initialPost]);

  const shouldRefetch = () => {
    if (!initialPost) return true;
    return false;
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post?.id}/likes`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        toast.error("You need to be logged in to like a post.");
        return;
      }
      
      if (response.status === 404) {
        toast.error("Post not found.");
        return;
      }
      
      await fetch(`/api/revalidate?slug=${post?.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/posts/${post?.id}/save`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        toast.error("You need to be logged in to save a post.");
        return;
      }
      
      if (response.status === 404) {
        toast.error("Post not found.");
        return;
      }
      
      setSaved(!saved);
      toast.success(
        saved ? "Post removed from Read Later" : "Post saved for Read Later."
      );
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/posts/${post?.slug}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (res.ok) {
        toast.success("Post deleted.");
        await fetch('/api/revalidate?path=/blog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        router.push("/");
      } else {
        toast.error("Failed to delete post.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl font-medium text-gray-700 dark:text-gray-300">
          Post not found
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{post.title} | Your Blog Name</title>
        <meta name="description" content={post.content.substring(0, 160)} />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-black ">
        <header className="sticky top-0 z-50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-sm">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-3 w-full justify-between">
              <button
                onClick={() => router.back()}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back
              </button>
            </div>
          </div>
        </header>

        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="w-full flex flex-wrap gap-2 mb-4 justify-between">
            {post.Category.map((category) => (
              <span
                key={category.id}
                className="px-2 sm:px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium rounded-full flex items-center"
              >
                {category.name}
              </span>
            ))}
            {session && userId === post.User.id && userRole !== "READER" && (
              <div className="flex gap-2 items-center">
                <EditModal post={post} />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash className="h-4 w-4 text-red" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the post.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleDelete}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>

          <div className="flex items-center mb-6 sm:mb-8">
            {post.User.image && (
              <div className="flex-shrink-0">
                <Image
                  src={post.User.image}
                  alt={post.User.name}
                  width={36}
                  height={36}
                  className="rounded-full mr-3"
                />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {post.User.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(post.createdAt), "MMMM d, yyyy")} ·{" "}
                {Math.ceil(post.content.length / 1000)} min read
              </p>
            </div>
          </div>

          {post.imageUrl && (
            <div className="mb-6 sm:mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.imageUrl}
                alt={post.title}
                width={2024}
                height={400}
                unoptimized
                className="w-full h-auto md:h-96 object-cover object-center-top"
                priority
              />
            </div>
          )}

          <article className="mb-8 sm:mb-12">
            <div
              className="prose prose-sm sm:prose-base md:prose-lg dark:prose-invert max-w-none 
                [&_p]:mb-4 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline hover:[&_a]:text-blue-800 dark:hover:[&_a]:text-blue-300 
                [&_ol]:list-decimal [&_ul]:list-disc 
                [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 dark:[&_blockquote]:border-gray-600 [&_blockquote]:pl-4 [&_blockquote]:italic
                [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-4
                [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-3
                [&_img]:rounded-lg [&_code]:bg-gray-100 dark:[&_code]:bg-gray-800 [&_code]:p-1 [&_code]:rounded
                [&_hr]:my-8 [&_hr]:border-gray-200 dark:[&_hr]:border-gray-700"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
            {post.Tag.map((tag) => (
              <span
                key={tag.id}
                className="px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full"
              >
                #{tag.name}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-b border-gray-200 dark:border-gray-700 py-3 sm:py-4 mb-6 sm:mb-8">
            <div className="grid grid-cols-4 w-full gap-1">
              <div className="flex justify-center">
                <LikeButton
                  liked={liked}
                  likeCount={likeCount}
                  onToggleLike={handleLike}
                />
              </div>
              <div className="flex justify-center">
                <CommentButton commentCount={commentCount} />
              </div>
              <div className="flex justify-center">
                <ShareButton />
              </div>
              <div className="flex justify-center">
                <SaveButton saved={saved} onToggleSave={handleSave} />
              </div>
            </div>
          </div>

          <CommentSection postId={post.id} initialComments={post.Comment} />
        </main>
      </div>
    </>
  );
}