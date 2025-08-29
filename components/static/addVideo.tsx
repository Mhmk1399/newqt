"use client";

import VideoForm from "@/components/forms/VideoForm";

const VideosPage = () => {
  return (
    <div className="min-h-screen   py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">مدیریت ویدیوها</h1>
          <p className="text-gray-500 text-lg">ویدیوهای جدید را آپلود کنید</p>
        </div>

        <VideoForm />
      </div>
    </div>
  );
};

export default VideosPage;
