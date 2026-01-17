import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosProgressEvent, GenericAbortSignal } from "axios";

import { apiClient } from "./api-client";
import { GResponse } from "./type";

export type UploadFileRequest = {
  file: File;
  isPublic?: boolean;
  folder?: string;
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  signal?: GenericAbortSignal;
};

export type FileResponse = {
  key: string;
  url: string;
};

export type UploadFileResponse = GResponse<FileResponse>;

export const uploadFile = async ({
  file,
  isPublic,
  folder,
  onUploadProgress,
  signal,
}: UploadFileRequest): Promise<UploadFileResponse> => {
  const data = new FormData();
  data.append("file", file);
  if (isPublic !== undefined) data.append("isPublic", String(isPublic));
  if (folder !== undefined) data.append("folder", folder);

  const response = await apiClient.post<UploadFileResponse>("/files", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
    signal,
  });

  return response.data;
};

// Upload Hook

export const useUploadFile = (
  options?: UseMutationOptions<UploadFileResponse, Error, UploadFileRequest, unknown>
) => {
  // const { toast } = useToast();

  const m = useMutation({
    mutationFn: uploadFile,
    onError: (error) => {
      throw new Error(error.message);
    },
    ...options,
  });

  return {
    ...m,
    uploadFile: async (request: UploadFileRequest) => {
      const response = await uploadFile(request as any);
      return response.data;
    },
  };
};
