import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Upload, ImageIcon, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface AzureUploadProps {
  onImageUpload: (url: string, fileName: string) => void;
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
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");
    setUploadProgress(0);

    try {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size exceeds 5MB limit");
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file");
      }

      const sasResponse = await fetch("/api/generate-sas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
        }),
      });

      if (!sasResponse.ok) {
        const errorData = await sasResponse.json();
        throw new Error(errorData.error || "Failed to get upload URL");
      }

      const { uploadUrl, blobName, readUrl } = await sasResponse.json();

      await uploadFileWithProgress(file, uploadUrl);

      console.log("Upload successful");
      onImageUpload(readUrl, blobName);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFileWithProgress = (
    file: File,
    uploadUrl: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("x-ms-blob-type", "BlockBlob");
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error during upload"));
      };

      xhr.send(file);
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
            <span>Uploading... {uploadProgress}%</span>
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
        You can upload images up to 5MB in size and in JPEG, PNG, or GIF
        formats.
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

      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {currentImageUrl && (
        <div className="relative w-full h-40 mt-2 rounded-md overflow-hidden">
          <Image
            src={currentImageUrl}
            alt="Uploaded Image"
            width={1000}
            height={600}
            className="rounded-md"
            
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
