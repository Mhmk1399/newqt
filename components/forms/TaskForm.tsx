"use client";

import React, { useState, useEffect } from "react";
import DynamicForm from "./DynamicForm";
import { FormConfig } from "@/types/form";

interface TaskFormProps {
  onSuccess?: (data: string) => void;
  onError?: (error: string) => void;
}

interface ServiceRequest {
  _id: string;
  notes: string;
  requirements: string;
  title: string;

  projectId: {
    title: string;
  };
  serviceId: {
    name: string;
  };
}

interface Team {
  _id: string;
  name: string;
  specialization: string;
}

interface User {
  _id: string;
  name: string;
  role: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSuccess, onError }) => {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch available data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceRequestsResponse, teamsResponse, usersResponse] =
          await Promise.all([
            fetch("/api/service-requests"),
            fetch("/api/teams"),
            fetch("/api/users"),
          ]);

        const serviceRequestsResult = await serviceRequestsResponse.json();
        console.log("serviceRequestsResult:", serviceRequestsResult);
        const teamsResult = await teamsResponse.json();
        const usersResult = await usersResponse.json();

        if (serviceRequestsResult.success) {
          setServiceRequests(serviceRequestsResult.data);
        }

        if (teamsResult.success) {
          setTeams(teamsResult.data);
        }

        if (usersResult.success) {
          setUsers(usersResult.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const taskFormConfig: FormConfig = {
    title: "ساخت وظیفه جدید",
    description: "ایجاد یک وظیفه برای اجرای درخواست سرویس",
    endpoint: "/api/tasks",
    method: "POST",
    submitButtonText: "ثبت وظیفه",
    onSuccess,
    onError,
    errorMessage: "خطا در ثبت وظیفه",
    successMessage: "وظیفه با موفقیت ثبت شد",
    validationErrorMessage: "لطفا همه فیلدها را به درستی پر کنید",
    fields: [
      {
        name: "serviceRequestId",
        label: "درخواست سرویس",
        type: "select",
        required: true,
        options: [
          { value: "", label: "انتخاب کنید" },
          ...serviceRequests.map((request) => ({
            value: request._id,
            label: `${request?.title} (${request.requirements.substring(
              0,
              50
            )}...)`,
          })),
        ],
        description:
          "درخواست سرویسی که این وظیفه به آن تعلق دارد را انتخاب کنید",
      },
      {
        name: "title",
        label: "نام وظیفه",
        type: "text",
        placeholder: "نام وظیفه را وارد کنید",
        required: true,
        validation: {
          minLength: 3,
          maxLength: 100,
        },
        description: "عنوان واضح و توصیفی برای وظیفه",
      },
      {
        name: "description",
        label: "توضیحات وظیفه",
        type: "textarea",
        placeholder: "شرح مفصلی از وظیفه را وارد کنید",
        required: true,
        validation: {
          minLength: 10,
          maxLength: 1000,
        },
        description: "شرح مفصلی از آنچه باید انجام شود",
      },
      {
        name: "priority",
        label: "اولویت وظیفه",
        type: "select",
        required: true,
        defaultValue: "medium",
        options: [
          { value: "", label: "انتخاب کنید" },

          { value: "low", label: "کم اولویت" },
          { value: "medium", label: "متوسط اولویت" },
          { value: "high", label: "بالا اولویت" },
          { value: "urgent", label: "فوری" },
        ],
        description: "سطح اولویت برای این وظیفه",
      },
      {
        name: "status",
        label: "وضعیت وظیفه",
        type: "select",
        required: true,
        defaultValue: "todo",
        options: [
          { value: "todo", label: "انجام نشده" },
          { value: "in-progress", label: "در حال انجام" },
          { value: "review", label: "در حال بررسی" },
          { value: "completed", label: "انجام شده" },
          { value: "cancelled", label: "لغو شده" },
        ],
        description: "وضعیت فعلی وظیفه",
      },
      {
        name: "assignedTeamId",
        label: "تیم تعیین‌شده (اختیاری)",
        type: "select",
        required: false,
        options: [
          { value: "", label: "انتخاب کنید" },
          ...teams.map((team) => ({
            value: team._id,
            label: `${team.name} (${team.specialization})`,
          })),
        ],
        description: "اختیاری: این وظیفه را به یک تیم خاص اختصاص دهید",
      },
      {
        name: "assignedUserId",
        label: "کاربر تعیین‌شده (اختیاری)",
        type: "select",
        required: false,
        options: [
          { value: "", label: "انتخاب کنید" },
          ...users.map((user) => ({
            value: user._id,
            label: `${user.name} (${user.role})`,
          })),
        ],
        description: "اختیاری: این وظیفه را به یک کاربر خاص اختصاص دهید",
      },
      {
        name: "startDate",
        label: "تاریخ شروع",
        type: "date",
        required: false,
        description: "اختیاری: تاریخ شروع وظیفه",
      },
      {
        name: "dueDate",
        label: "تاریخ انقضا",
        type: "date",
        required: false,
        description: "اختیاری: تاریخ انقضا وظیفه",
      },
      {
        name: "deliverables",
        label: "تاریخ تحویل",
        type: "date",
        placeholder: "تاریخ تحویل وظیفه را وارد کنید",
        required: false,
        validation: {
          maxLength: 500,
        },
        description: "اختیاری: تاریخ تحویل وظیفه",
      },
      {
        name: "notes",
        label: "یادداشت‌ها",
        type: "textarea",
        placeholder: "یادداشت‌های اضافی یا دستورالعمل‌های ویژه را وارد کنید",
        required: false,
        validation: {
          maxLength: 500,
        },
        description: "اختیاری: یادداشت‌های اضافی یا دستورالعمل‌های ویژه",
      },
    ],
  };

  // Show loading while fetching data
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">
            در حال بارگیری درخواست‌های سرویس، تیم‌ها و کاربران...
          </p>
        </div>
      </div>
    );
  }

  // Show error if no service requests available
  if (serviceRequests.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <p className="text-red-600">
            هیچ درخواست خدماتی موجود نیست. لطفاً ابتدا درخواست‌های خدماتی ایجاد
            کنید.
          </p>
        </div>
      </div>
    );
  }

  return <DynamicForm config={taskFormConfig} />;
};

export default TaskForm;
