"use client";
import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import RichTextEditor from "../posts/RichTextEditor";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,

} from "@/components/ui/select";
interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface CreatePostDialogProps {
  onPostCreated?: () => void;
}

export function CreatePostDialog({ onPostCreated }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    category: "",
    tags: [] as string[],
    imageUrl: "",
    isPublished: false,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCategoriesAndTags();
    }
  }, [open]);

  useEffect(() => {
    if (formData.title && !slugManuallyEdited) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")
        .trim();

      setFormData((prevData) => ({
        ...prevData,
        slug: generatedSlug,
      }));
    }
  }, [formData.title, slugManuallyEdited]);

  const fetchCategoriesAndTags = async () => {
    setIsLoading(true);
    try {
      const [categoriesResponse, tagsResponse] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/tags"),
      ]);

      if (categoriesResponse.ok && tagsResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        const tagsData = await tagsResponse.json();

        setCategories(categoriesData);
        setTags(tagsData);
      } else {
        console.error("Failed to fetch categories or tags");
      }
    } catch (err) {
      console.error("Error fetching categories and tags:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "slug" && !slugManuallyEdited) {
      setSlugManuallyEdited(true);
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prevData) => {
      const currentTags = [...prevData.tags];

      if (currentTags.includes(tagId)) {
        return {
          ...prevData,
          tags: currentTags.filter((id) => id !== tagId),
        };
      } else {
        return {
          ...prevData,
          tags: [...currentTags, tagId],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          categoryId: formData.category,
          tagIds: formData.tags,
          imageUrl: formData.imageUrl || null,
          published: formData.isPublished,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({
          title: "",
          slug: "",
          content: "",
          category: "",
          tags: [],
          imageUrl: "",
          isPublished: false,
        });
        setSlugManuallyEdited(false);
        setOpen(false);
        toast.success("Post created successfully!");
        onPostCreated?.();
      } else {
        toast.error(data.error || "Failed to create post");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      toast.error("Something went wrong!");
    } finally {
      setFormSubmitting(false);
    }
  };

  const resetDialog = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      category: "",
      tags: [],
      imageUrl: "",
      isPublished: false,
    });
    setSlugManuallyEdited(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetDialog();
      }}
    >
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusCircle size={18} />
          <span>Create Post</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl md:max-w-3xl lg:max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Create New Blog Post</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">
              Loading categories and tags...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter post title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug{" "}
                <span className="text-sm text-gray-500">
                  (auto-generated from title, editable)
                </span>
              </Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(value) =>
                  setFormData({ ...formData, content: value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                defaultValue=""
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Button
                    key={tag.id}
                    type="button"
                    variant={
                      formData.tags.includes(tag.id) ? "default" : "outline"
                    }
                    size="sm"
                    className="h-8 px-3 text-sm"
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    {tag.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="Enter image URL"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="publishNow"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPublished: !!checked })
                  }
                />
                <Label htmlFor="publishNow">Publish Now?</Label>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={formSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formSubmitting}>
                {formSubmitting ? "Creating..." : "Create Post"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
