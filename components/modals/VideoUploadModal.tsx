"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IoClose, 
  IoVideocam, 
  IoCloudUpload, 

} from "react-icons/io5";
import { FaVideo, FaPlay, FaUpload, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

interface VideoUploadModalProps {
  isOpen: boolean;
  taskId: string;
  onClose: () => void;
  onSuccess: (videoUrl: string) => void;
  onError: (error: string) => void;
}

const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  taskId,
  onClose,
  onSuccess,
  onError,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 300 * 1024 * 1024; // 300MB
  const ALLOWED_FORMATS = ['mp4', 'webm', 'ogg', 'avi', 'mov'];

  const resetModal = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setIsUploading(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      resetModal();
      onClose();
    }
  };

  const validateFile = (file: File): string | null => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !ALLOWED_FORMATS.includes(fileExtension)) {
      return `فرمت فایل پشتیبانی نمی‌شود. فرمت‌های مجاز: ${ALLOWED_FORMATS.join(', ')}`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `حجم فایل نباید بیشتر از ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB باشد`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file);
    
    if (validation) {
      toast.error(validation);
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL for video
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      handleFileSelect(file);
    } else {
      toast.error("لطفاً فقط فایل‌های ویدیویی را آپلود کنید");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("لطفاً ویدیویی را انتخاب کنید");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('taskId', taskId);

      // Simulate progress (since we can't track actual upload progress easily with fetch)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success(result.message || "ویدیو با موفقیت آپلود شد");
          onSuccess(result.videoUrl);
          setTimeout(() => {
            resetModal();
            onClose();
          }, 1000);
        } else {
          throw new Error(result.error || "خطا در آپلود ویدیو");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در آپلود ویدیو");
      }
    } catch (error) {
      console.error('Video upload error:', error);
      const errorMessage = error instanceof Error ? error.message : "خطا در آپلود ویدیو";
      toast.error(errorMessage);
      onError(errorMessage);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl w-full max-w-2xl shadow-2xl border border-white/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
          }}
        >
          {/* Decorative corner elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-tr-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-bl-3xl"></div>
          
          <div className="p-8 relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded-full">
                  <FaVideo className="text-purple-400 text-xl" />
                </div>
                <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text">
                  آپلود ویدیو
                </h3>
              </div>
              <button 
                onClick={handleClose} 
                disabled={isUploading}
                className="text-white/70 hover:text-white transition-colors disabled:opacity-50"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* Upload Area */}
            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-purple-400 bg-purple-500/10' 
                    : 'border-white/30 hover:border-white/50 hover:bg-white/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <IoVideocam className="mx-auto text-6xl text-white/50 mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">
                  ویدیو خود را انتخاب کنید
                </h4>
                <p className="text-white/70 mb-4">
                  فایل را اینجا بکشید و رها کنید یا روی دکمه زیر کلیک کنید
                </p>
                <p className="text-white/50 text-sm mb-6">
                  فرمت‌های مجاز: MP4, WebM, OGG, AVI, MOV | حداکثر حجم: 300MB
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 flex items-center gap-3 mx-auto"
                >
                  <IoCloudUpload className="text-xl" />
                  انتخاب ویدیو
                </motion.button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              // File Preview and Upload Section
              <div className="space-y-6">
                {/* Video Preview */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-start gap-4">
                    {previewUrl && (
                      <div className="relative w-32 h-24 bg-black rounded-lg overflow-hidden flex-shrink-0">
                        <video 
                          src={previewUrl} 
                          className="w-full h-full object-cover"
                          controls={false}
                          muted
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <FaPlay className="text-white text-xl" />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate mb-2">
                        {selectedFile.name}
                      </h4>
                      <p className="text-white/70 text-sm mb-1">
                        حجم: {formatFileSize(selectedFile.size)}
                      </p>
                      <p className="text-white/70 text-sm">
                        نوع: {selectedFile.type}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        if (previewUrl) {
                          URL.revokeObjectURL(previewUrl);
                        }
                      }}
                      disabled={isUploading}
                      className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">در حال آپلود...</span>
                      <span className="text-white/70">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <motion.div 
                        className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClose}
                    disabled={isUploading}
                    className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
                  >
                    انصراف
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUpload}
                    disabled={isUploading || !selectedFile}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                        آپلود...
                      </>
                    ) : (
                      <>
                        <FaUpload />
                        آپلود ویدیو
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoUploadModal;