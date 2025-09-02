'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadResult {
  success: boolean;
  message: string;
  recordsProcessed?: number;
  uploadId?: string;
}

interface CsvUploadProps {
  onUploadComplete?: (result: UploadResult) => void;
  onUploadStart?: () => void;
  maxSize?: number; // in bytes
  className?: string;
}

export function CsvUpload({
  onUploadComplete,
  onUploadStart,
  maxSize = 10 * 1024 * 1024, // 10MB default
  className = '',
}: CsvUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setProgress(0);
    setUploadResult(null);
    onUploadStart?.();

    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setProgress(percentComplete);
        }
      });

      const response = await new Promise<Response>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(
              new Response(xhr.responseText, {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: new Headers({
                  'Content-Type': 'application/json',
                }),
              }),
            );
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.open('POST', '/api/upload/csv');
        xhr.send(formData);
      });

      const result = await response.json();

      if (result.success) {
        const successResult: UploadResult = {
          success: true,
          message: result.message,
          recordsProcessed: result.recordsProcessed,
          uploadId: result.uploadId,
        };
        setUploadResult(successResult);
        onUploadComplete?.(successResult);
      } else {
        const errorResult: UploadResult = {
          success: false,
          message: result.error || 'Upload failed',
        };
        setUploadResult(errorResult);
        onUploadComplete?.(errorResult);
      }
    } catch (error) {
      const errorResult: UploadResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
      };
      setUploadResult(errorResult);
      onUploadComplete?.(errorResult);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxSize,
    multiple: false,
  });

  const handleUpload = () => {
    if (selectedFile) {
      uploadFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
        } ${uploading ? 'pointer-events-none opacity-50' : ''} `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <Upload className="h-12 w-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {isDragActive ? 'Drop your CSV file here' : 'Upload CSV File'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag and drop a CSV file here, or click to select
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Maximum file size: {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{fileRejections[0].errors[0].message}</AlertDescription>
        </Alert>
      )}

      {/* Selected File */}
      {selectedFile && (
        <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{selectedFile.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!uploading && !uploadResult && (
                <>
                  <Button onClick={handleUpload} size="sm">
                    Upload
                  </Button>
                  <Button onClick={handleRemoveFile} variant="outline" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </div>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <Alert variant={uploadResult.success ? 'default' : 'destructive'}>
          {uploadResult.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {uploadResult.message}
            {uploadResult.recordsProcessed && (
              <span className="mt-1 block text-sm">
                Successfully processed {uploadResult.recordsProcessed} records
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
