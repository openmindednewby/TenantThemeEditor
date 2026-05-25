/**
 * Content Service API hooks for file uploads.
 */
import { useMutation } from '@tanstack/react-query';

import { contentClient } from './client';

interface UploadResult {
  contentId: string;
  url: string;
}

async function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await contentClient.post<UploadResult>(
    '/upload',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

/** Upload a file to ContentService. */
export function useUploadFile() {
  return useMutation({
    mutationFn: uploadFile,
  });
}
