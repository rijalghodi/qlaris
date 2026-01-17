"use client";

import { BgRectanglePattern } from "./bg-rectangle-pattern";
import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { cn } from "@/lib/utils";
import { Edit, Eye, ImageUp, PlusCircle, Trash, Upload, X } from "lucide-react";
import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "./spinner";
import Image from "next/image";
import { uploadFile } from "@/services/api-file";

export type ImageInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> & {
  name?: string;
  label?: string;
  value?: string;
  error?: boolean;
  maxFileSizeMB?: number;
  onResetFile?: () => void;
  onChange?: (value?: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  folder?: string;
  isPublic?: boolean;
  maxSizeMB?: number;
  defaultValueUrl?: string;
  enableDelete?: boolean;
  enableEdit?: boolean;
};
const ACCEPT_TYPES = "image/png,image/jpeg,image/jpg,image/svg+xml,image/webp";
const MAX_FILE_SIZE_MB = 10;

export type ImageInputRef = {
  isUploading: boolean;
};

export const ImageInput = React.forwardRef<ImageInputRef, ImageInputProps>(
  (
    {
      maxFileSizeMB = MAX_FILE_SIZE_MB,
      onChange,
      name,
      value,
      error,
      onResetFile,
      disabled,
      readOnly,
      placeholder = "Drag & drop or select image",
      folder,
      maxSizeMB,
      isPublic,
      defaultValueUrl,
      className,
      enableDelete = true,
      enableEdit = true,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [displayUrl, setDisplayUrl] = useState<string | undefined>(defaultValueUrl ?? undefined);

    useEffect(() => {
      setDisplayUrl(defaultValueUrl);
    }, [defaultValueUrl]);

    useImperativeHandle(ref, () => ({ isUploading }));

    const handleDrop = async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0]; // Only take the first file

      if (!file) return;

      // Validate file type
      const acceptTypes = ACCEPT_TYPES.split(",").map((t) => t.trim().toLowerCase());
      const extWithDot = file.name.split(".").pop()?.toLowerCase();
      const fileType = file.type.toLowerCase();

      const isAccepted =
        acceptTypes.includes(fileType) || (extWithDot && acceptTypes.includes(`.${extWithDot}`));

      if (!isAccepted) {
        toast.error("Only image files (PNG, JPEG, WEBP, SVG) are allowed.");
        return;
      }

      // Validate file size
      if (file.size / 1024 / 1024 > maxFileSizeMB) {
        toast.error(`File exceeds the ${maxFileSizeMB} MB limit.`);
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const res = await uploadFile({
          file,
          onUploadProgress: (progress) => {
            setUploadProgress(Math.floor((progress.loaded / (progress.total || 1)) * 100));
          },
          isPublic,
          folder,
        });

        const url = res?.data?.url;
        const key = res?.data?.key;

        if (url) {
          onChange?.(key);
          setDisplayUrl(url);
        }
      } catch (err) {
        toast.error("Failed to upload image", { description: String((err as any)?.message) });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleRemove = () => {
      onChange?.(undefined);
      setDisplayUrl(undefined);
      onResetFile?.();
    };

    const handleTriggerEdit = () => {
      inputRef.current?.click();
    };

    const renderUploadLabel = (children: React.ReactNode) => (
      <label
        onClick={(e) => {
          if (disabled || readOnly) e.preventDefault();
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragEnter}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (disabled || readOnly) return;
          const files = Array.from(e.dataTransfer.files);
          handleDrop(files);
        }}
        className={cn(
          "relative border-3 border-input border-dashed bg-input hover:bg-input/50 hover:border-ring rounded-xl overflow-hidden cursor-pointer flex justify-center items-center w-[150px] h-[100px] sm:w-[200px] sm:h-[140px] text-xs",
          error && "border-destructive",
          isDragging && "border-ring bg-input/50",
          disabled && "opacity-50",
          (disabled || readOnly) && "cursor-default",
          className
        )}
        ref={ref as React.Ref<HTMLLabelElement>}
      >
        <input
          {...props}
          ref={inputRef}
          type="file"
          accept={ACCEPT_TYPES}
          multiple={false}
          disabled={disabled || readOnly}
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            await handleDrop(files);
            e.target.value = "";
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        {children}
      </label>
    );

    // Render preview
    const renderPreview = (url: string) => (
      <div className="relative group w-full h-full" data-slot="image-preview">
        <Image
          src={url}
          alt="Uploaded image"
          width={500}
          height={500}
          className="rounded-md object-cover w-full h-full"
        />

        {/* Control buttons overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
          {/* View button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="bg-white/30 hover:bg-white/40 text-white border-white/30"
                title="View image"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="p-6 w-fit" showCloseButton={false}>
              <DialogHeader className="sr-only">
                <DialogTitle>Image Preview</DialogTitle>
                <DialogDescription className="sr-only">Image Preview</DialogDescription>
              </DialogHeader>
              <div className="relative w-full min-h-[300px] ">
                <BgRectanglePattern className="absolute inset-0 z-0" />
                <DialogClose className="absolute z-10 top-1 right-1" asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="bg-background/50 hover:bg-background/70 text-foreground hover:text-foreground border-white/30"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
                <Image
                  src={url}
                  alt="Full size image"
                  className="object-contain w-full h-full relative"
                  width={500}
                  height={500}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit button */}
          {enableEdit && (
            <Button
              onClick={handleTriggerEdit}
              type="button"
              variant="ghost"
              size="icon-sm"
              className="bg-white/30 hover:bg-white/40 text-white border-white/30"
              title="Change image"
              disabled={disabled || readOnly}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}

          {/* Remove button - only show if not default value */}
          {defaultValueUrl && displayUrl !== defaultValueUrl && enableDelete && (
            <Button
              onClick={handleRemove}
              type="button"
              variant="ghost"
              size="icon-sm"
              className="bg-red-500/30 hover:bg-red-500/40 text-white border-red-500/30"
              title="Remove image"
              disabled={disabled || readOnly}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );

    // Render empty file input
    if (isUploading) {
      return renderUploadLabel(
        <div className="flex flex-col items-center justify-center gap-3 p-4">
          <Spinner className="text-primary/90" size="lg" />
          <span className="text-muted-foreground text-center">{`Uploading... ${uploadProgress}%`}</span>
        </div>
      );
    }

    // Render empty file input
    if (!displayUrl) {
      return renderUploadLabel(
        <div className="flex flex-col items-center justify-center gap-3 p-4">
          <Upload className="text-primary/90 h-5 w-5" />
          <span className="text-muted-foreground text-center">{placeholder}</span>
        </div>
      );
    }

    // Render single file input with preview
    return renderUploadLabel(renderPreview(displayUrl!));
  }
);

ImageInput.displayName = "ImageInput";
