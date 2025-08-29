"use client";

import CategoryForm from "@/components/forms/CategoryForm";

const CategoriesPage = () => {
  return (
    <div className="min-h-screen   py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">
            مدیریت دسته‌بندی‌ها
          </h1>
          <p className="text-gray-500 text-lg">
            دسته‌بندی‌های جدید برای گالری خود ایجاد کنید
          </p>
        </div>

        <CategoryForm />
      </div>
    </div>
  );
};

export default CategoriesPage;
