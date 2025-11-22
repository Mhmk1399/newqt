"use client";

import { useState } from "react";
import { FiPhone, FiMail, FiExternalLink } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";

interface CoWorker {
  _id: string;
  name: string;
  email?: string;
  phoneNumber: string;
  experties: string;
  description?: string;
  images: {
    main?: string;
    thumbnails?: string[];
  };
  resomeLink?: string;
  socialLinks?: object;
}

interface Props {
  coworker: CoWorker;
  className?: string;
}

const CoworkerShowcaseCard = ({ coworker, className = "" }: Props) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 ${className}`}
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        {coworker.images.main && !imageError ? (
          <img
            src={coworker.images.main}
            alt={coworker.name}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <div className="text-white/60 text-4xl font-bold">
              {coworker.name.charAt(0)}
            </div>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-2">
              {coworker.phoneNumber && (
                <Link
                  href={`tel:${coworker.phoneNumber}`}
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <FiPhone className="text-white text-sm" />
                </Link>
              )}
              {coworker.email && (
                <Link
                  href={`mailto:${coworker.email}`}
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <FiMail className="text-white text-sm" />
                </Link>
              )}
              {coworker.resomeLink && (
                <Link
                  href={coworker.resomeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <FiExternalLink className="text-white text-sm" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-white font-bold text-lg mb-4">{coworker.name}</h3>
        <button
          onClick={() => (window.location.href = `/models/${coworker._id}`)}
          className="w-full cursor-pointer px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all"
        >
          اطلاعات بیشتر
        </button>
      </div>
    </div>
  );
};

export default CoworkerShowcaseCard;
