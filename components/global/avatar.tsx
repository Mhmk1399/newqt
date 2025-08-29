'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaUserCog } from 'react-icons/fa';

interface UserData {
  username: string;
  phoneNumber: string;
  id: string;
  role: string;
}

const Avatar = () => {
  const [userData] = useState<UserData | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading] = useState(true);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Measure content height for smooth animation
  useEffect(() => {
    if (isHovered && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    } else {
      setContentHeight(0);
    }
  }, [isHovered]);

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       const token = localStorage.getItem('token');
  //       if (!token) {
  //         setIsLoading(false);
  //         return;
  //       }

  //       const response = await fetch('/api/auth/id', {
  //         method: 'GET',
  //         headers: {
  //           'token': token
  //         }
  //       });

  //       if (response.ok) {
  //         const data = await response.json();
  //         setUserData(data);
  //       } else {
  //         console.error('Failed to fetch user data');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching user data:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchUserData();
  // }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gray-200/20 backdrop-blur-sm animate-pulse"></div>
    );
  }

  if (!userData) {
    return (
      <motion.div
        className="absolute top-4 left-4 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.button
          onClick={() => router.push('/login')}
          className="w-10 h-10 rounded-full bg-gray-200/20 backdrop-blur-sm border border-gray-500/50 flex items-center justify-center text-gray-300 hover:text-blue-400 transition-colors"
        >
          <FaUser size={16} />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div 
      className="absolute top-4 left-4 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Main container with fixed dimensions */}
        <motion.div
          animate={{ 
            width: isHovered ? 180 : 40,
            borderRadius: isHovered ? 16 : 20
          }}
          transition={{ 
            duration: 0.3, 
            ease: [0.4, 0.0, 0.2, 1] // Custom easing for smoother motion
          }}
          className="bg-gray-200/20 backdrop-blur-sm border border-gray-500/50 overflow-hidden"
        >
          {/* Top section with avatar and username */}
          <div className="flex items-center h-10">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-md font-bold text-gray-300">{userData.username.charAt(0).toUpperCase()}</span>
            </div>
            
            <motion.div
              animate={{ 
                opacity: isHovered ? 1 : 0,
                width: isHovered ? 'auto' : 0
              }}
              transition={{ 
                opacity: { duration: 0.2, delay: isHovered ? 0.1 : 0 },
                width: { duration: 0.2 }
              }}
              className="px-2 whitespace-nowrap overflow-hidden"
            >
              <span className="text-sm font-medium text-gray-300">{userData.username}</span>
            </motion.div>
          </div>
          
          {/* Dropdown content with fixed height animation */}
          <motion.div
            animate={{ 
              height: contentHeight,
              opacity: isHovered ? 1 : 0
            }}
            transition={{ 
              height: { 
                duration: 0.3, 
                delay: isHovered ? 0.15 : 0,
                ease: [0.4, 0.0, 0.2, 1]
              },
              opacity: { 
                duration: 0.2, 
                delay: isHovered ? 0.2 : 0
              }
            }}
            className="overflow-hidden"
            style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
          >
            {/* Content wrapper with ref for height measurement */}
            <div ref={contentRef} className="px-3  pt-1">
              <p className="text-xs text-gray-400 mb-2">{userData.phoneNumber}</p>
              
              
              
              <div className="flex flex-col gap-2 pt-5">
              {userData.role==='user'&& <motion.button
                  className="flex items-center gap-2 p-2 rounded-lg text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-700/40 transition-colors"
                  onClick={() => router.push('/dashboard')}
                  whileHover={{ x: 3 }}
                  dir="rtl"
                >
                  <FaUserCog size={14} className="text-blue-400" />
                  <span>پروفایل کاربری</span>
                </motion.button>}
                {userData.role==='admin'&& <motion.button
                  className="flex items-center gap-2 p-2 rounded-lg text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-700/40 transition-colors"
                  onClick={() => router.push('/admin')}
                  whileHover={{ x: 3 }}
                  dir="rtl"
                >
                  <FaUserCog size={14} className="text-blue-400" />
                  <span> پروفایل ادمین</span>
                </motion.button>}
                <motion.button
                  className="flex items-center gap-2 p-2 rounded-lg text-sm text-gray-300 hover:text-red-400 hover:bg-gray-700/40 transition-colors"
                  onClick={handleLogout}
                  whileHover={{ x: 3 }}
                  dir="rtl"
                >
                  <FaSignOutAlt size={14} className="text-red-400" />
                  <span>خروج از حساب</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Avatar;
