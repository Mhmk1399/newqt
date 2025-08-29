"use client";

import { useState } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import { FaRegCalendarAlt } from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AttendanceForm() {
  const [workDate, setWorkDate] = useState<DateObject | null>(new DateObject());
  const [inTime, setInTime] = useState<DateObject | null>(null);
  const [outTime, setOutTime] = useState<DateObject | null>(null);

  const handleSubmit = async () => {
    if (!workDate || !inTime || !outTime) {
      toast("لطفا همه فیلدها را کامل کنید");
      return;
    }

    const formattedDate = workDate.toDate(); // Converts to JS Date (Gregorian)
    const formattedInTime = inTime.format("HH:mm");
    const formattedOutTime = outTime.format("HH:mm");

    const getCustomerIdFromToken = (): string | null => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          console.error("No customer token found in localStorage");
          return null;
        }

        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        console.log("Decoded token:", decodedToken);

        if (decodedToken.userId) {
          return decodedToken.userId;
        } else {
          console.error("customerId not found in token payload");
          return null;
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    };

    try {
      const userId = getCustomerIdFromToken();
      const res = await fetch("/api/presence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formattedDate,
          startHour: formattedInTime,
          endHour: formattedOutTime,
          user: userId, // 👈 Replace this with the actual user ID (or get from session if authenticated)
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(" حضور با موفقیت ثبت شد");
        // Reset form
        setWorkDate(new DateObject());
        setInTime(null);
        setOutTime(null);
      } else {
        toast.error(" خطا در ثبت حضور");
      }
    } catch (error) {
      console.log("خطا در ارسال:", error);
      toast.error(" خطا در ارتباط با سرور");
    }
  };

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto flex justify-center items-stretch flex-col bg-white text-black p-6 rounded-2xl "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      dir="rtl"
    >
      <h2 className="text-2xl font-bold mb-6 border-b pb-3 text-center">
        فرم حضور و غیاب
      </h2>

      {/* تاریخ کارکرد */}
      <div className="mb-4 w-full">
        <label className="text-sm mb-2 block">تاریخ روز</label>
        <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg">
          <FaRegCalendarAlt className="text-gray-400" />
          <DatePicker
            value={workDate}
            onChange={setWorkDate}
            calendar={persian}
            locale={persian_fa}
            format="YYYY/MM/DD"
            inputClass="w-full bg-transparent p-2 text-black focus:outline-none border rounded-lg"
            calendarPosition="top-right"
          />
        </div>
      </div>

      {/* ساعت ورود */}
      <div className="mb-4 w-full">
        <label className="text-sm mb-2 block">ساعت ورود</label>
        <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg">
          <MdAccessTime className="text-gray-400" />
          <DatePicker
            value={inTime}
            onChange={setInTime}
  plugins={[<TimePicker key="intime-picker" position="bottom" />]}            key={"inTimePicker"}
            format="HH:mm"
            inputClass="w-full bg-transparent p-2 text-black focus:outline-none border rounded-lg"
            calendarPosition="bottom-right"
            className="text-black"
          />
        </div>
      </div>

      {/* ساعت خروج */}
      <div className="mb-4 w-full">
        <label className="text-sm mb-2 block">ساعت خروج</label>
        <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg w-full">
          <MdAccessTime className="text-gray-400" />
          <DatePicker
            value={outTime}
            onChange={setOutTime}
plugins={[<TimePicker key="outtime-picker" position="bottom" />]}            key={"outTimePicker"}
            format="HH:mm"
            inputClass="w-full bg-transparent p-2 text-black focus:outline-none border rounded-lg"
            calendarPosition="bottom-right"
            className="text-black"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className=" py-3 px-12 bg-blue-500 text-white rounded-xl hover:opacity-90 transition font-bold"
      >
        ثبت حضور و غیاب
      </button>
    </motion.div>
  );
}
