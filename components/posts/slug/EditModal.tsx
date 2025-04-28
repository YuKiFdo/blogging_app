"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import RichTextEditor from "@/components/posts/RichTextEditor";
import { useRouter } from "next/navigation";
import { AzureUpload } from "@/components/main/AzureUpload"; // Import your AzureUpload component

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  imageUrl: string | null;
  Category: Category[];
  Tag: Tag[];
}

interface EditModalProps {
  post: Post;
}

export default function EditModal({ post }: EditModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [slug, setSlug] = useState(post.slug);
  const [imageUrl, setImageUrl] = useState(post.imageUrl || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    post.Category.map((c) => c.id)
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    post.Tag.map((t) => t.id)
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/tags"),
        ]);

        if (!categoriesRes.ok || !tagsRes.ok) {
          throw new Error("Failed to fetch categories or tags");
        }

        const [categoriesData, tagsData] = await Promise.all([
          categoriesRes.json(),
          tagsRes.json(),
        ]);

        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error("Error fetching categories and tags:", error);
        toast.error("Failed to load categories and tags");
      }
    };

    if (open) {
      fetchCategoriesAndTags();
    }
  }, [open]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${post.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug,
          content,
          imageUrl,
          categoryIds: selectedCategories,
          tagIds: selectedTags,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      toast.success("Post updated successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    const newSlug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setSlug(newSlug);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl p-4 sm:p-6 flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Title</label>
            <Input
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter post title"
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Slug</label>
            <Input
              value={slug}
              readOnly
              className="bg-muted w-full"
              placeholder="Slug will be generated automatically"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Featured Image
            </label>
            <AzureUpload
              onImageUpload={(url) => setImageUrl(url)}
              currentImageUrl={imageUrl}
              onRemoveImage={() => setImageUrl("")}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Content</label>
            <div className="w-full">
              <RichTextEditor content={content} onChange={setContent} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategories.includes(category.id)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="h-8 px-3 text-sm"
                  onClick={() => {
                    setSelectedCategories((prev) =>
                      prev.includes(category.id)
                        ? prev.filter((id) => id !== category.id)
                        : [...prev, category.id]
                    );
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Button
                  key={tag.id}
                  variant={
                    selectedTags.includes(tag.id) ? "default" : "outline"
                  }
                  size="sm"
                  className="h-8 px-3 text-sm"
                  onClick={() => {
                    setSelectedTags((prev) =>
                      prev.includes(tag.id)
                        ? prev.filter((id) => id !== tag.id)
                        : [...prev, tag.id]
                    );
                  }}
                >
                  {tag.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
