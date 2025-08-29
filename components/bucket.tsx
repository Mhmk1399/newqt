'use client';

import { useState } from 'react';
import { FiUpload, FiImage, FiCheck, FiX } from 'react-icons/fi';

interface UploadResult {
  success: boolean;
  url: string;
  message: string;
}

export default function ImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!file) {
      setError('لطفا ابتدا فایل را انتخاب کنید');
      return;
    }

    const userToken = localStorage.getItem('userToken') || localStorage.getItem('token');
    if (!userToken) {
      setError('لطفا ابتدا وارد حساب کاربری خود شوید');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadResult(result);
      } else {
        setError(result.error || 'آپلود ناموفق');
      }
    } catch (error) {
      console.log(error)
      setError('خطا در ارتباط با سرور. لطفا دوباره تلاش کنید.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div dir="rtl" className="max-w-md mx-auto bg-gradient-to-br from-[#0A0A2E]/95 to-[#1A1A4A]/95 backdrop-blur-2xl rounded-3xl p-8 border border-white/20">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center">
          <FiImage className="text-2xl text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">آپلود تصویر</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-white font-medium mb-2">
            انتخاب تصویر
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
            disabled={uploading}
          />
        </div>

        {file && (
          <div className="p-4 bg-white/10 border border-white/20 rounded-2xl">
            <p className="text-white text-sm">
              فایل انتخاب شده: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 text-sm flex items-center gap-2">
            <FiX className="text-lg" />
            {error}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl flex items-center justify-center gap-2"
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <FiUpload className="text-xl" />
              آپلود تصویر
            </>
          )}
        </button>
      </div>

      {uploadResult && (
        <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <FiCheck className="text-green-400 text-lg" />
            <h3 className="font-semibold text-green-400">آپلود موفق!</h3>
          </div>
          <p className="text-sm text-green-300 mb-3">
            تصویر شما با موفقیت به ArvanCloud آپلود شد.
          </p>
          <div className="mt-3">
            <p className="text-sm font-medium text-white mb-2">لینک تصویر:</p>
            <a
              href={uploadResult.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 text-sm break-all hover:underline"
            >
              {uploadResult.url}
            </a>
          </div>
          {uploadResult.url && (
            <div className="mt-4">
              <img
                src={uploadResult.url}
                alt="Uploaded preview"
                className="max-w-full h-auto rounded-2xl shadow-lg"
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}