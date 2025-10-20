"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({ 
  onImageSelect, 
  currentImage, 
  className,
  disabled = false 
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload-character-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      onImageSelect(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onImageSelect("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">Character Reference Image (Optional)</Label>
      
      {currentImage ? (
        <div className="relative">
          <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage}
              alt="Character reference"
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0"
              onClick={handleRemoveImage}
              disabled={disabled || isUploading}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors",
            disabled || isUploading 
              ? "opacity-50 cursor-not-allowed bg-gray-50" 
              : "hover:border-gray-400 hover:bg-gray-50"
          )}
          onClick={handleClick}
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
              <p className="text-sm text-gray-600 mt-2">Uploading...</p>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, GIF up to 10MB
              </p>
            </>
          )}
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
