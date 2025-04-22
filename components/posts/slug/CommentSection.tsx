"use client";
import React, { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Trash2, Edit, Send, X } from "lucide-react";
import RichTextEditor from "@/components/posts/RichTextEditor";

interface User {
  id: string;
  name: string;
  image: string | null;
}

interface CommentType {
  id: string;
  content: string;
  createdAt: string;
  User: User;
}

interface CommentSectionProps {
  postId: string;
  initialComments: CommentType[];
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentType[]>(initialComments);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [editCommentContent, setEditCommentContent] = useState("");

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error("You need to be logged in to comment.");
      return;
    }

    if (!newCommentContent.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newCommentContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const addedComment = await response.json();

      setComments([...comments, addedComment]);
      setNewCommentContent("");
      toast.success("Comment added successfully!");
    } catch (error) {
      toast.error("Error posting comment. Please try again.");
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editCommentContent.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editCommentContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to update comment");
      }

      const updatedComment = await response.json();

      setComments(
        comments.map((comment) =>
          comment.id === commentId ? updatedComment : comment
        )
      );

      setEditingCommentId(null);
      setEditCommentContent("");
      toast.success("Comment updated successfully!");
    } catch (error) {
      toast.error("Error updating comment. Please try again.");
      console.error("Error updating comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      setComments(comments.filter((comment) => comment.id !== commentId));
      toast.success("Comment deleted successfully!");
    } catch (error) {
      toast.error("Error deleting comment. Please try again.");
      console.error("Error deleting comment:", error);
    }
  };

  const startEditing = (comment: CommentType) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditCommentContent("");
  };

  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-foreground">
        Comments ({comments.length})
      </h2>

      {comments.length > 0 ? (
        <div className="space-y-6 mt-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4">
              {comment.User.image && (
                <Image
                  src={comment.User.image}
                  alt={comment.User.name}
                  width={50}
                  height={50}
                  className="rounded-full w-10 h-10 flex-shrink-0"
                />
              )}
              <div className="flex-1">
                {editingCommentId === comment.id ? (
                  <div className="bg-white dark:bg-card p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                    <div className="flex justify-between mb-2">
                      <p className="font-medium text-gray-900">
                        {comment.User.name}
                      </p>
                      <button
                        onClick={cancelEditing}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Cancel editing"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <RichTextEditor
                      content={editCommentContent}
                      onChange={setEditCommentContent}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        disabled={isSubmitting}
                        className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary/80 transition flex items-center gap-1"
                      >
                        <Send size={14} /> {isSubmitting ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-card p-4 rounded-lg">
                    <div className="flex justify-between">
                      <p className="font-medium text-foreground">
                        {comment.User.name}
                      </p>
                      {session?.user?.id === comment.User.id && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(comment)}
                            className="text-foreground hover:text-primary transition"
                            aria-label="Edit comment"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-foreground hover:text-red-600 transition"
                            aria-label="Delete comment"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div
                      className="text-foreground dark:text-foreground/70 mt-1 prose prose-sm max-w-none [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800"
                      dangerouslySetInnerHTML={{ __html: comment.content }}
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500 darl mt-1">
                  {format(new Date(comment.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          No comments yet. Be the first to comment!
        </p>
      )}

      <form onSubmit={handleAddComment} className="mt-6">
        <div className="bg-card p-4 rounded-lg border border-gray-300 dark:border-gray-700">
          <RichTextEditor
            content={newCommentContent}
            onChange={setNewCommentContent}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!session?.user || isSubmitting || !newCommentContent.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition disabled:bg-primary/40 dark:disabled:bg-primary/5 dark:disabled:text-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={16} />
              {isSubmitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}