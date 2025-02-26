// components/ImageUpload.js
import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function ImageUpload({ value, onChange, onRemove, disabled }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        validateAndProcessFile(file, onChange);
      }
    },
    [onChange]
  );

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file, onChange);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative 
          border-2 
          border-dashed 
          rounded-lg 
          p-4
          transition-all
          duration-200
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-gray-400"
          }
        `}
      >
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          {value ? (
            <div className="relative w-40 mx-auto">
              {" "}
              {/* Reduced width container */}
              <div className="aspect-square relative rounded-lg overflow-hidden">
                {" "}
                {/* Square aspect ratio */}
                <Image
                  src={value}
                  alt="Upload preview"
                  fill
                  className="object-cover"
                />
              </div>
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove?.();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="p-4 rounded-full bg-gray-50">
                <Upload className="h-6 w-6 text-gray-400" />{" "}
                {/* Slightly smaller icon */}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Drop your image here, or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum file size: 5MB • Formats: JPEG, PNG, WebP
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Validation helper
function validateAndProcessFile(file, onChange) {
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    toast({
      title: "Invalid file type",
      description: "Please upload JPEG, PNG, or WebP images only.",
      variant: "destructive",
    });
    return;
  }

  if (file.size > maxSize) {
    toast({
      title: "File too large",
      description: "Maximum file size is 5MB.",
      variant: "destructive",
    });
    return;
  }

  // Create preview URL and trigger change
  const previewUrl = URL.createObjectURL(file);
  onChange?.({ file, previewUrl });
}
