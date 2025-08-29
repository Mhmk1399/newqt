"use client";
import { lazy, Suspense } from "react";
import HeroSection from "@/components/static/hero-section";

// Lazy load heavy components
const ServicesShowcase = lazy(() => import("@/components/static/services"));
const ContentCreationProcess = lazy(
  () => import("@/components/static/contentCreationProcess")
);
const ContentCreationLab = lazy(
  () => import("@/components/static/contentCreationLab")
);

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#030014]">
    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const MainContainer = () => {
  return (
    <main className="scroll-smooth">
      <HeroSection />
      <Suspense fallback={<LoadingSpinner />}>
        <ServicesShowcase />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <ContentCreationProcess />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <ContentCreationLab />
      </Suspense>
    </main>
  );
};
export default MainContainer;
