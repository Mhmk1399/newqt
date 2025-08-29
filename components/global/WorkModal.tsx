"use client";
import { motion, AnimatePresence } from "framer-motion";
import { WorkExample } from "../../lib/works";
import { IoCloseCircle } from "react-icons/io5";

interface WorkModalProps {
  work: WorkExample;
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkModal({ work, isOpen, onClose }: WorkModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-4xl mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 z-10 text-white hover:scale-110 transition"
              >
                <IoCloseCircle size={32} />
              </button>

              <div className=" relative">
                <video
                  className="w-full h-[300px] object-cover"
                  controls
                  autoPlay
                  src={work.videoUrl}
                />
              </div>

              <div className="p-8" dir="rtl">
                <h2 className="md:text-2xl font-bold md:mb-4">{work.title}</h2>
                <p className="text-gray-600 text-sm mb-2 md:mb-6">
                  {work.description}
                </p>

                <div className="grid md:grid-cols-2 md:gap-8">
                  <div className="md:space-y-4">
                    <h3 className="font-bold md:text-lg">جزئیات پروژه</h3>
                    <ul className="space-y-2 text-sm">
                      <li>مشتری: {work.client}</li>
                      <li>مدت زمان: {work.duration}</li>
                      <li>تیم: {work.team}</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">دستاوردها</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="md:text-2xl font-bold text-blue-600">
                          {work.stats?.views?.toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-800">بازدید</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="md:text-2xl font-bold text-green-600">
                          {work.stats?.engagement}
                        </p>
                        <p className="text-xs text-green-800">تعامل</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="md:text-2xl font-bold text-purple-600">
                          {work.stats?.reach}
                        </p>
                        <p className="text-xs text-purple-800">دسترسی</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
