"use client";

import { useState, useEffect, useRef } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { RiDownloadFill, RiShareFill, RiCloseFill } from "react-icons/ri";
import gsap from "gsap";

interface QRCodeGeneratorProps {
  url?: string;
  size?: number;
  title?: string;
  description?: string;
  className?: string;
  showDownload?: boolean;
  showShare?: boolean;
}

const QRCodeGenerator = ({
  url = "https://qtstudio.art", // Replace with your actual domain
  size = 200,
  title = "اسکن کنید",
  description = "برای دسترسی سریع به وب‌سایت ما QR کد را اسکن کنید",
  className = "",
  showDownload = true,
  showShare = true,
}: QRCodeGeneratorProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (isMounted && qrRef.current) {
      gsap.fromTo(
        qrRef.current,
        { opacity: 0, scale: 0.8, rotateY: 180 },
        { 
          opacity: 1, 
          scale: 1, 
          rotateY: 0, 
          duration: 1, 
          ease: "elastic.out(1, 0.5)" 
        }
      );
    }
  }, [isMounted]);

  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [isModalOpen]);

  const downloadQR = () => {
    const svg = document.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        link.download = 'qr-code.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        URL.revokeObjectURL(svgUrl);
      };
      
      img.src = svgUrl;
    }
  };

  const shareQR = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: description,
          url: url,
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(url);
        alert('لینک کپی شد!');
      }
    } catch (err) {
      console.log('Error sharing:', err);
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(url);
      alert('لینک کپی شد!');
    }
  };

  if (!isMounted) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className={`relative h-screen  ${className}`} ref={qrRef}>
        <div className=" p-6 border  py-32 transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>

          {/* QR Code */}
          <div 
            className="flex justify-center mb-4 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="p-4 bg-white rounded-xl shadow-2xl hover:scale-105 transition-transform duration-300">
              <QRCode
                value={url}
                size={size}
                bgColor="#ffffff"
                fgColor="#030014"
                level="H"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            {showDownload && (
              <button
                onClick={downloadQR}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white text-sm font-semibold hover:scale-105 transition-all duration-300"
              >
                <RiDownloadFill />
                دانلود
              </button>
            )}
            
            {showShare && (
              <button
                onClick={shareQR}
                className="flex items-center gap-2 px-4 py-2 border border-purple-500 text-purple-400 rounded-full text-sm font-semibold hover:bg-purple-500 hover:text-white transition-all duration-300"
              >
                <RiShareFill />
                اشتراک
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            ref={modalRef}
            className="bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] rounded-2xl p-8 border border-purple-500/30 max-w-md w-full"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">{title}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <RiCloseFill size={24} />
              </button>
            </div>

            {/* Large QR Code */}
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-white rounded-xl shadow-2xl">
                <QRCode
                  value={url}
                  size={250}
                  bgColor="#ffffff"
                  fgColor="#030014"
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>

            {/* URL Display */}
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-2">آدرس وب‌سایت:</p>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <span className="text-purple-400 font-mono text-sm">{url}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={downloadQR}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold hover:scale-105 transition-all duration-300"
              >
                <RiDownloadFill />
                دانلود با کیفیت بالا
              </button>
              
              <button
                onClick={shareQR}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-purple-500 text-purple-400 rounded-full font-semibold hover:bg-purple-500 hover:text-white transition-all duration-300"
              >
                <RiShareFill />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QRCodeGenerator;