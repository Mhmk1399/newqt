"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { BsArrowLeft, BsChevronLeft, BsChevronRight } from "react-icons/bs";

interface BlogPost {
  slug: string;
  _id: string;
  title: string;
  description: string;
  image: string;
  userId: {
    _id: string;
    username: string;
  };
  user: string;
  content: string;
  seoTitle: string;
  tags: string[];
  readTime: number;
  createdAt: string;
  updatedAt: string;
}

const BlogSlider: React.FC<{ title?: string }> = ({ title = "آخرین مطالب وبلاگ" }) => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(
        /[^\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u200C\u200Fa-z0-9-]/g,
        ""
      )
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  useEffect(() => {
    async function fetchBlogs() {
      try {
        setLoading(true);
        const fetchedBlogs = await fetch("/api/blog", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await fetchedBlogs.json();
        const mappedBlogs = data.blogs.map((blog: BlogPost) => ({
          _id: blog._id,
          title: blog.title,
          slug: generateSlug(blog.title),
          description: blog.description,
          coverImage: "/assets/images/fade3.jpg", // Default image
          user: blog.userId.username,
          date: new Date(blog.createdAt),
          readTime: blog.readTime,
          tags: blog.tags,
          seoTitle: blog.seoTitle,
        }));

        setBlogs(mappedBlogs);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto my-12 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#60a5fa]">{title}</h2>
        </div>
        <div className="flex space-x-4 rtl:space-x-reverse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[260px] h-[350px] bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto my-12 px-4" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-[#60a5fa]">{title}</h2>
          
          {/* Navigation Buttons - Now next to the title */}
          <div className="flex gap-2 hover:translate-x-1 transition-transform">
            <button 
              onClick={scrollRight}
              className="bg-white/80 hover:bg-white text-[#60a5fa] p-2 rounded-full shadow-md"
              aria-label="Scroll right"
            >
              <BsChevronRight size={20} />
            </button>
            
            <button 
              onClick={scrollLeft}
              className="bg-white/80 hover:bg-white text-[#60a5fa] p-2 rounded-full shadow-md"
              aria-label="Scroll left"
            >
              <BsChevronLeft size={20} />
            </button>
          </div>
        </div>
        
        <Link href="/blogs" className="text-[#60a5fa] flex items-center gap-2 hover:underline">
          مشاهده همه
          <BsArrowLeft />
        </Link>
      </div>

      {/* Scrollable Blog Container */}
      <div 
        ref={sliderRef}
        className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {blogs.map((blog) => (
          <Link
            href={`/blogs/${blog._id}:${blog.slug}`}
            key={blog._id}
            className="min-w-[260px] flex-shrink-0"
          >
            <article className="bg-white/30 rounded-lg h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="relative h-48 group overflow-hidden">
                <Image
                  src={"/assets/images/works/cop1.jpg"}
                  alt={blog.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[#e5d8d0] my-auto bg-[#a37462]/10 px-4 py-2 rounded-t-lg text-lg font-bold flex items-center gap-2 transform translate-y-full group-hover:translate-y-0 transition-all duration-300">
                    مشاهده وبلاگ
                    <BsArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" />
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-xl font-bold text-[#60a5fa] mb-2 line-clamp-2">
                  {blog.title}
                </h2>
                <p className="text-stone-600 flex-grow line-clamp-3 mb-4">
                  {blog.description?.slice(0, 30)} ...
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {blog.tags?.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="border-[#60a5fa] border bg-white text-[#60a5fa] px-2 py-1 rounded-lg text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-[#60a5fa]">{blog?.user}</span>
                  </div>
                  <span className="text-blue-500">
                    {blog.readTime} دقیقه مطالعه
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BlogSlider;
