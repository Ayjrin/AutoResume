'use client';

import { useState, useCallback } from 'react';

// Supported file types for resume processing
export const ACCEPTED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  // Documents
  'application/pdf',
  'text/plain',
  'text/html',
  'text/css',
  'text/javascript',
  'application/json',
  'application/xml',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface UseFileUploadOptions {
  maxSize?: number;
  acceptedTypes?: string[];
  onSuccess?: (file: File, base64?: string) => void;
  onMultipleSuccess?: (files: File[], base64Array?: string[]) => void;
  onError?: (error: string) => void;
  multiple?: boolean;
}

interface UseFileUploadResult {
  file: File | null;
  files: File[];
  fileError: string | null;
  isLoading: boolean;
  handleFileSelect: (file: File) => void;
  handleFilesSelect: (files: File[]) => void;
  handleFileError: (error: string) => void;
  clearFile: () => void;
  clearFiles: () => void;
  removeFile: (fileIndex: number) => void;
  validateFile: (file: File) => string | null;
  convertFileToBase64: (file: File) => Promise<string>;
}

export function useFileUpload({
  maxSize = MAX_FILE_SIZE,
  acceptedTypes = ACCEPTED_FILE_TYPES,
  onSuccess,
  onMultipleSuccess,
  onError,
  multiple = false,
}: UseFileUploadOptions = {}): UseFileUploadResult {
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    if (!file) return 'No file selected';
    
    if (!acceptedTypes.includes(file.type)) {
      return 'File type not supported';
    }
    
    if (file.size > maxSize) {
      return `File size exceeds the maximum limit of ${maxSize / (1024 * 1024)}MB`;
    }
    
    return null;
  }, [acceptedTypes, maxSize]);

  const convertFileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    const error = validateFile(file);
    
    if (error) {
      setFileError(error);
      setFile(null);
      onError?.(error);
      return;
    }
    
    setIsLoading(true);
    setFileError(null);
    
    try {
      setFile(file);
      
      // If multiple mode is enabled, add to files array
      if (multiple) {
        setFiles(prevFiles => [...prevFiles, file]);
      } else {
        setFiles([file]); // In single mode, replace any existing file
      }
      
      if (onSuccess) {
        // Only convert to base64 if onSuccess handler is provided
        const base64 = await convertFileToBase64(file);
        onSuccess(file, base64);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file';
      setFileError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [validateFile, convertFileToBase64, onSuccess, onError, multiple]);

  const handleFilesSelect = useCallback(async (newFiles: File[]) => {
    setIsLoading(true);
    setFileError(null);
    
    try {
      // Validate all files
      for (const file of newFiles) {
        const error = validateFile(file);
        if (error) {
          setFileError(error);
          onError?.(error);
          setIsLoading(false);
          return;
        }
      }
      
      // Set the last file as the current file for display purposes
      if (newFiles.length > 0) {
        setFile(newFiles[newFiles.length - 1]);
      }
      
      // Update files array based on multiple mode
      if (multiple) {
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
      } else {
        // In single mode, use only the last file
        setFiles(newFiles.length > 0 ? [newFiles[newFiles.length - 1]] : []);
      }
      
      if (onMultipleSuccess) {
        // Convert all files to base64 if handler is provided
        const base64Array = await Promise.all(newFiles.map(convertFileToBase64));
        onMultipleSuccess(newFiles, base64Array);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process files';
      setFileError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [validateFile, convertFileToBase64, onMultipleSuccess, onError, multiple]);

  const handleFileError = useCallback((error: string) => {
    setFileError(error);
    setFile(null);
    onError?.(error);
  }, [onError]);

  const clearFile = useCallback(() => {
    setFile(null);
    setFileError(null);
    if (!multiple) {
      setFiles([]);
    }
  }, [multiple]);

  const clearFiles = useCallback(() => {
    setFile(null);
    setFiles([]);
    setFileError(null);
  }, []);
  
  const removeFile = useCallback((fileIndex: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles.splice(fileIndex, 1);
      
      // If we removed all files, clear the current file
      if (newFiles.length === 0) {
        setFile(null);
      } else if (file && prevFiles[fileIndex] === file) {
        // If we removed the currently displayed file, update to the last file
        setFile(newFiles[newFiles.length - 1]);
      }
      
      return newFiles;
    });
  }, [file]);

  return {
    file,
    files,
    fileError,
    isLoading,
    handleFileSelect,
    handleFilesSelect,
    handleFileError,
    clearFile,
    clearFiles,
    removeFile,
    validateFile,
    convertFileToBase64
  };
}
