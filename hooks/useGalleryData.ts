import useSWR from "swr";

interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
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

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to fetch");
  return data.data;
};

export const useGalleryData = () => {
  const { data: categories = [], error: categoriesError } = useSWR<Category[]>(
    "/api/categories",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  const {
    data: videos = [],
    error: videosError,
    isLoading,
  } = useSWR<Video[]>("/api/videos", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });

  return {
    categories,
    videos,
    isLoading,
    error: categoriesError || videosError,
  };
};
