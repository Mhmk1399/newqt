import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaPlay,
  FaPause,
  FaExpand,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";

const CustomVideoPlayer = ({
  videoUrl,
}: {
  videoUrl: string;
  cinematicMode?: boolean;
  miniMode?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) * 100);
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("loadedmetadata", () => setDuration(video.duration));

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    videoRef.current.currentTime = (percentage / 100) * duration;
  };

  return (
    <div className="relative group aspect-video w-full bg-black rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={videoUrl}
        onClick={togglePlay}
        muted={isMuted}
      />

      {/* Center Play Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isPlaying ? 0 : 0.7 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   w-20 h-20 flex items-center justify-center
                   bg-black/50 rounded-full cursor-pointer"
        onClick={togglePlay}
      >
        <FaPlay size={40} className="text-white ml-2" />
      </motion.div>

      {/* Controls Container */}
      <div className="absolute inset-x-0 bottom-0 z-50">
        {/* Progress Bar */}
        <div
          className="w-full h-1 bg-gray-600/50 cursor-pointer
                     hover:h-2 transition-all duration-200"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-yellow-400 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlay}
              className="w-10 h-10 flex items-center justify-center
                       bg-yellow-400 rounded-full text-black"
            >
              {isPlaying ? (
                <FaPause size={16} />
              ) : (
                <FaPlay size={16} className="ml-1" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 flex items-center justify-center
                       bg-white/10 rounded-full text-white
                       hover:bg-white/20 transition-colors"
            >
              {isMuted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => videoRef.current?.requestFullscreen()}
            className="ml-auto w-8 h-8 flex items-center justify-center
                     bg-white/10 rounded-full text-white
                     hover:bg-white/20 transition-colors"
          >
            <FaExpand size={14} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;
