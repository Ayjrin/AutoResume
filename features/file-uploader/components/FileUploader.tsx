'use client';

import { useRef, useCallback, useState } from 'react';
import { cn } from '@/shared/utils/utils';
import { Upload, File as FileIcon, X, Loader2 } from 'lucide-react';
import { useFileUpload, ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '../hooks/useFileUpload';

export interface FileUploaderProps {
  onFileSelect?: (file: File, base64?: string) => void;
  onFilesSelect?: (files: File[], base64Array?: string[]) => void;
  onFileError?: (error: string) => void;
  className?: string;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
}

export function FileUploader({
  onFileSelect,
  onFilesSelect,
  onFileError,
  className,
  accept = ACCEPTED_FILE_TYPES.join(','),
  maxSize = MAX_FILE_SIZE,
  multiple = false,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    file, 
    files,
    fileError, 
    isLoading,
    handleFileSelect: processFile,
    handleFilesSelect: processFiles,
    clearFile,
    clearFiles,
    removeFile
  } = useFileUpload({
    maxSize,
    acceptedTypes: ACCEPTED_FILE_TYPES,
    onSuccess: onFileSelect,
    onMultipleSuccess: onFilesSelect,
    onError: onFileError,
    multiple
  });

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (multiple) {
        // Convert FileList to array
        const droppedFiles = Array.from(e.dataTransfer.files);
        processFiles(droppedFiles);
      } else {
        // Just use the first file
        const droppedFile = e.dataTransfer.files[0];
        processFile(droppedFile);
      }
    }
  }, [processFile, processFiles, multiple]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (multiple) {
        // Convert FileList to array
        const selectedFiles = Array.from(e.target.files);
        processFiles(selectedFiles);
      } else {
        // Just use the first file
        const selectedFile = e.target.files[0];
        processFile(selectedFile);
      }
    }
  }, [processFile, processFiles, multiple]);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removeSelectedFile = useCallback(() => {
    clearFile();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [clearFile]);

  return (
    <div className={cn('w-full', className)}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileInputChange}
        multiple={multiple}
      />
      {files.length === 0 ? (
        <div
          className={cn(
            'w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors',
            isDragging 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
              : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600',
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm font-medium mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Supports images (JPEG, PNG, WebP, HEIC) and documents (PDF, TXT, DOC, etc.)
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Max file size: {maxSize / (1024 * 1024)}MB
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 text-blue-500 mr-3 animate-spin" />
                ) : (
                  <FileIcon className="h-6 w-6 text-blue-500 mr-3" />
                )}
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs">
                    {file.name}
                  </p>
                  <div className="flex text-base text-gray-600">
                    {(file.size / 1024).toFixed(2)} KB
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Remove file"
                disabled={isLoading}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          ))}
          
          {multiple && (
            <button
              onClick={handleButtonClick}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium transition-colors"
            >
              <Upload className="h-4 w-4 mr-1" />
              Add more files
            </button>
          )}
        </div>
      )}
      
      {fileError && (
        <div className="mt-2 p-2 bg-red-50 text-red-600 rounded-md text-sm">
          {fileError}
        </div>
      )}
    </div>
  );
}
