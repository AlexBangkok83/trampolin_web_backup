import { Metadata } from 'next';
import { CsvUpload } from '@/components/forms/file-upload/csv-upload';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'CSV Upload | Trampolin',
  description: 'Upload and process CSV files',
};

export default function CsvUploadPage() {
  // For static export, authentication is handled client-side

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">CSV File Upload</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Upload CSV files to process and analyze your data. Files up to 10MB are supported.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <CsvUpload
              onUploadComplete={(result) => {
                if (result.success) {
                  console.log('Upload completed successfully:', result);
                  // You can add navigation or other success actions here
                } else {
                  console.error('Upload failed:', result.message);
                }
              }}
              onUploadStart={() => {
                console.log('Upload started');
              }}
            />
          </div>

          <div className="mt-8 rounded-lg bg-blue-50 p-6 dark:bg-blue-950">
            <h3 className="mb-3 text-lg font-semibold text-blue-900 dark:text-blue-100">
              CSV Upload Guidelines
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>• CSV files must include headers in the first row</li>
              <li>• Maximum file size: 10MB</li>
              <li>• Supported formats: .csv files only</li>
              <li>• Empty rows will be automatically skipped</li>
              <li>• Duplicate headers are not allowed</li>
              <li>• Files with too many errors (&gt;50% of rows) will be rejected</li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
