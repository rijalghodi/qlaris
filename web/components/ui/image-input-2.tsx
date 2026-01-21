"use client";

import { cn } from "@/lib/utils";
import { uploadFile } from "@/services/api-file";
import { Edit, Eye, Trash, Upload, X } from "lucide-react";
import Image from "next/image";
import React, {
  createContext,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
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
import { Spinner } from "./spinner";

// ===== Constants =====
const ACCEPT_TYPES = "image/png,image/jpeg,image/jpg,image/svg+xml,image/webp";
const MAX_FILE_SIZE_MB = 10;

// ===== Types =====
export type ImageInputProps = {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value?: string) => void;
  onReset?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  className?: string;
  maxSizeMB?: number;
  folder?: string;
  isPublic?: boolean;
  placeholder?: string;
  enableEdit?: boolean;
  enableDelete?: boolean;
  children?: React.ReactNode;
};

export type ImageInputRef = {
  isUploading: boolean;
};

type ImageInputContextValue = {
  displayUrl?: string;
  defaultValue?: string;
  isUploading: boolean;
  uploadProgress: number;
  isDragging: boolean;
  disabled: boolean;
  readOnly: boolean;
  error: boolean;
  placeholder: string;
  enableEdit: boolean;
  enableDelete: boolean;
  handleDrop: (files: File[]) => Promise<void>;
  handleRemove: () => void;
  handleTriggerEdit: () => void;
  setIsDragging: (value: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null> | null;
};

// ===== Context =====
const ImageInputContext = createContext<ImageInputContextValue | null>(null);

const useImageInputContext = () => {
  const context = useContext(ImageInputContext);
  if (!context) {
    throw new Error("ImageInput compound components must be used within ImageInput.Root");
  }
  return context;
};

// ===== Root Component =====
const ImageInputRoot = React.forwardRef<ImageInputRef, ImageInputProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onReset,
      disabled = false,
      readOnly = false,
      error = false,
      maxSizeMB = MAX_FILE_SIZE_MB,
      folder,
      isPublic,
      placeholder = "Drag & drop or select image",
      enableEdit = true,
      enableDelete = true,
      children,
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [displayUrl, setDisplayUrl] = useState<string | undefined>(defaultValue);

    useEffect(() => {
      setDisplayUrl(defaultValue);
    }, [defaultValue]);

    useImperativeHandle(ref, () => ({ isUploading }));

    const handleDrop = async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
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
      if (file.size / 1024 / 1024 > maxSizeMB) {
        toast.error(`File exceeds the ${maxSizeMB} MB limit.`);
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

    const handleRemove = () => {
      onChange?.(undefined);
      setDisplayUrl(undefined);
      onReset?.();
    };

    const handleTriggerEdit = () => {
      inputRef.current?.click();
    };

    const contextValue: ImageInputContextValue = {
      displayUrl,
      defaultValue,
      isUploading,
      uploadProgress,
      isDragging,
      disabled,
      readOnly,
      error,
      placeholder,
      enableEdit,
      enableDelete,
      handleDrop,
      handleRemove,
      handleTriggerEdit,
      setIsDragging,
      inputRef,
    };

    return <ImageInputContext.Provider value={contextValue}>{children}</ImageInputContext.Provider>;
  }
);
ImageInputRoot.displayName = "ImageInput.Root";

// ===== Upload Zone Component =====
type UploadZoneProps = {
  className?: string;
  children?: React.ReactNode;
};

const UploadZone = ({ className, children }: UploadZoneProps) => {
  const { isDragging, disabled, readOnly, error, handleDrop, setIsDragging, inputRef } =
    useImageInputContext();

  return (
    <label
      onClick={(e) => {
        if (disabled || readOnly) e.preventDefault();
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled || readOnly) return;
        const files = Array.from(e.dataTransfer.files);
        handleDrop(files);
      }}
      className={cn(
        "relative border-3 border-input border-dashed bg-input p-1 hover:bg-input/50 hover:border-ring rounded-xl overflow-hidden cursor-pointer flex justify-center items-center w-[150px] h-[100px] sm:w-[200px] sm:h-[140px] text-xs",
        error && "border-destructive",
        isDragging && "border-ring bg-input/50",
        disabled && "opacity-50",
        (disabled || readOnly) && "cursor-default",
        className
      )}
    >
      <input
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
};
UploadZone.displayName = "ImageInput.UploadZone";

// ===== Empty State Component =====
const EmptyState = () => {
  const { placeholder } = useImageInputContext();

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <Upload className="text-primary/90 h-5 w-5" />
      <span className="text-muted-foreground text-center">{placeholder}</span>
    </div>
  );
};
EmptyState.displayName = "ImageInput.EmptyState";

// ===== Uploading State Component =====
const UploadingState = () => {
  const { uploadProgress } = useImageInputContext();

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <Spinner className="text-primary/90" size="lg" />
      <span className="text-muted-foreground text-center">{`Uploading... ${uploadProgress}%`}</span>
    </div>
  );
};
UploadingState.displayName = "ImageInput.UploadingState";

// ===== Preview Component =====
type PreviewProps = {
  url: string;
};

const Preview = ({ url }: PreviewProps) => {
  return (
    <div className="relative group w-full h-full" data-slot="image-preview">
      <Image
        src={url}
        alt="Uploaded image"
        width={500}
        height={500}
        className="rounded-md object-cover w-full h-full"
      />
      <PreviewControls url={url} />
    </div>
  );
};
Preview.displayName = "ImageInput.Preview";

// ===== Preview Controls Component =====
type PreviewControlsProps = {
  url: string;
};

const PreviewControls = ({ url }: PreviewControlsProps) => {
  const {
    displayUrl,
    defaultValue,
    disabled,
    readOnly,
    enableEdit,
    enableDelete,
    handleRemove,
    handleTriggerEdit,
  } = useImageInputContext();

  return (
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
          <div className="relative w-full min-h-[300px]">
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
      {defaultValue && displayUrl !== defaultValue && enableDelete && (
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
  );
};
PreviewControls.displayName = "ImageInput.PreviewControls";

// ===== Main Composite Component =====
type ImageInputCompositeProps = ImageInputProps;

export const ImageInput = React.forwardRef<ImageInputRef, ImageInputCompositeProps>(
  (props, ref) => {
    return (
      <ImageInputRoot ref={ref} {...props}>
        <ImageInputContent />
      </ImageInputRoot>
    );
  }
);
ImageInput.displayName = "ImageInput";

// ===== Content Renderer =====
const ImageInputContent = () => {
  const { isUploading, displayUrl } = useImageInputContext();

  return (
    <UploadZone>
      {isUploading ? (
        <UploadingState />
      ) : displayUrl ? (
        <Preview url={displayUrl} />
      ) : (
        <EmptyState />
      )}
    </UploadZone>
  );
};
