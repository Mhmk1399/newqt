"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { FiVideo, FiFilter } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import gsap from "gsap";
import { useGalleryData } from "../../hooks/useGalleryData";
import VideoPlayer from "../video";

interface Category {
  _id: string;
  name: string;
  icon: string;
}

interface Video {
  _id: string;
  name: string;
  description: string;
  link: string;
  categoryId: {
    _id: string;
    name: string;
    icon: string;
  };
  isActive: boolean;
}

const GalleryGrid = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Data fetching
  const { categories: dbCategories, videos, isLoading } = useGalleryData();

  // Memoized filtered videos
  const filteredVideos = useMemo(() => {
    if (!selectedCategoryId) return videos;
    return videos.filter(
      (video: Video) =>
        video.categoryId && video.categoryId._id === selectedCategoryId
    );
  }, [videos, selectedCategoryId]);

  // Icon mapping

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Grid items animation
      gsap.from(".gallery-item", {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      // Background elements
      gsap.to(".floating-orb-1", {
        y: -20,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".floating-orb-2", {
        y: 15,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Modal animations
  const openModal = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");

    gsap.fromTo(
      ".modal-backdrop",
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    gsap.fromTo(
      ".modal-content",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.2)" }
    );
  };

  const closeModal = () => {
    gsap.to(".modal-content", {
      opacity: 0,
      y: 30,
      duration: 0.3,
      ease: "power2.in",
    });

    gsap.to(".modal-backdrop", {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        setIsModalOpen(false);
        document.body.style.overflow = "auto";
        document.body.classList.remove("modal-open");
        setTimeout(() => setSelectedVideo(null), 100);
      },
    });
  };

  // Close modal on escape key or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) closeModal();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        isModalOpen
      ) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <div
      ref={containerRef}
      className="relative pt-16 pb-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0A0A1A] to-[#05051F] min-h-screen"
      dir="rtl"
    >
      {/* Luxury Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb-1 absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full filter blur-[100px]"></div>
        <div className="floating-orb-2 absolute bottom-1/3 right-1/4 w-72 h-72 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full filter blur-[100px]"></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            گالری ویدیوها
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            مجموعه‌ای از بهترین آثار تولیدی ما
          </p>
        </div>

        {/* Filter Controls */}
        <div className="mb-8 flex flex-col items-center">
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-white">
                {selectedCategoryId
                  ? dbCategories.find(
                      (c: Category) => c._id === selectedCategoryId
                    )?.name || "ویدیوها"
                  : "همه ویدیوها"}
              </h2>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"
              >
                <FiFilter />
                <span>فیلترها</span>
              </button>
            </div>

            {/* Filter dropdown */}
            {showFilters && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-6 animate-fadeIn">
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => {
                      setSelectedCategoryId("");
                      setShowFilters(false);
                    }}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedCategoryId === ""
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                        : "bg-white/5 hover:bg-white/10 text-white"
                    }`}
                  >
                    همه ویدیوها
                  </button>

                  {dbCategories.map((category: Category) => (
                    <button
                      key={category._id}
                      onClick={() => {
                        setSelectedCategoryId(category._id);
                        setShowFilters(false);
                      }}
                      className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                        selectedCategoryId === category._id
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                          : "bg-white/5 hover:bg-white/10 text-white"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Gallery Grid */}
        <div ref={gridRef} className="relative">
          {isLoading ? (
            <div className="grid place-items-center min-h-[400px]">
              <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video: Video) => (
                <div
                  key={video._id}
                  className="gallery-item group relative rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-purple-500/20"
                  onClick={() => openModal(video)}
                >
                  <div className="aspect-video relative">
                    <VideoPlayer
                      src={video.link}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform">
                        <h3 className="text-white font-medium text-lg mb-1">
                          {video.name}
                        </h3>
                        <p className="text-white/80 text-sm line-clamp-2">
                          {video.description}
                        </p>
                      </div>
                    </div>

                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                        <FiVideo className="text-white text-2xl" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                <FiVideo className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-2xl font-medium text-white mb-2">
                ویدیویی یافت نشد
              </h3>
              <p className="text-gray-400 mb-6">
                در این دسته‌بندی فعلاً ویدیویی وجود ندارد
              </p>
              <button
                onClick={() => setSelectedCategoryId("")}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all"
              >
                نمایش همه ویدیوها
              </button>
            </div>
          )}
        </div>

        {/* Video Modal */}
        {isModalOpen && selectedVideo && (
          <div className="modal-backdrop fixed inset-0 z-[9999] bg-black/90 md:bg-black/70 backdrop-blur-md flex items-center justify-center md:p-4">
            <div
              ref={modalRef}
              className="modal-content relative w-full h-full md:w-full md:max-w-md  lg:max-w-xl md:h-auto bg-black md:rounded-lg overflow-hidden shadow-2xl"
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 md:top-4 md:right-4 z-20 w-12 h-12 md:w-10 md:h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all backdrop-blur-sm border border-white/20"
                onClick={closeModal}
              >
                <IoClose className="text-white text-2xl md:text-xl" />
              </button>

              {/* Video container - fullscreen on mobile, contained on desktop */}
              <div
                className="relative w-full h-full  md:h-170 flex items-center justify-center"
                style={{
                  aspectRatio: window.innerWidth < 768 ? "auto" : "",
                }}
              >
                <VideoPlayer
                  src={selectedVideo.link}
                  isModal={true}
                  autoPlay={true}
                  className="w-full h-full md:h-full object-contain md:object-cover"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryGrid;
