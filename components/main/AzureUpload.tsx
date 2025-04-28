import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Upload, ImageIcon, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface AzureUploadProps {
  onImageUpload: (url: string) => void;
  currentImageUrl?: string;
  onRemoveImage: () => void;
}

export function AzureUpload({
  onImageUpload,
  currentImageUrl,
  onRemoveImage,
}: AzureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size exceeds 5MB limit");
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file");
      }

      let base64Data = await fileToBase64(file);
      base64Data = base64Data.split(",")[1];

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64Image: base64Data,
          fileName: file.name,
          contentType: file.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      console.log("Upload successful:", data);
      onImageUpload(data.url);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="w-full space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        className="w-full h-12 flex items-center justify-center gap-2"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <div className="flex items-center gap-2">
            <Loader2 size={18} className="animate-spin" />
            <span>Uploading...</span>
          </div>
        ) : currentImageUrl ? (
          <div className="flex items-center gap-2">
            <ImageIcon size={18} />
            <span>Change Image</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Upload size={18} />
            <span>Upload Image</span>
          </div>
        )}
      </Button>

      <p className="text-sm text-gray-500 mt-1">
        You can upload images up to 5MB in size and in JPEG, PNG, or GIF formats.
      </p>

      {currentImageUrl && !isUploading && (
        <div className="flex justify-end mt-2">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemoveImage}
          >
            <X size={16} className="mr-1" />
            Remove Image
          </Button>
        </div>
      )}

      {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}

      {currentImageUrl && (
        <div className="relative w-full h-40 mt-2 rounded-md overflow-hidden">
          <Image
            src={currentImageUrl}
            alt="Uploaded Image"
            width={1000}
            height={600}
            className="rounded-md "
            objectPosition="center"
            objectFit="cover"
            priority
            onError={() => {
              setUploadError("Failed to load image");
              onRemoveImage(); 
            }}
          />
        </div>
      )}
    </div>
  );
}
