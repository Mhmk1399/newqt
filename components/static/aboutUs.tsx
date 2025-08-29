"use client";
import { useState, useRef, useEffect, createElement } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { companyValues, teamMembers, timelineEvents } from "../../data/aboutUs";
import Link from "next/link";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const AboutUs = () => {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  console.log(isMobile)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax background
      gsap.to(backgroundRef.current, {
        y: "30%",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      // Hero animations
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      heroTl
        .from(".hero-title", {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: "power2.out",
        })
        .from(".hero-divider", { width: 0, opacity: 0, duration: 0.8 }, "-=0.6")
        .from(
          ".hero-description",
          { opacity: 0, y: 20, duration: 0.8 },
          "-=0.4"
        )
        .from(".hero-buttons", { opacity: 0, y: 20, duration: 0.8 }, "-=0.2")
        .from(".scroll-indicator", { opacity: 0, duration: 0.8 }, "-=0.2");

      // Scroll indicator animation
      gsap.to(".scroll-dot", {
        y: 12,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });

      // Story section
      gsap.from(".story-image", {
        opacity: 0,
        x: -50,
        duration: 0.8,
        scrollTrigger: {
          trigger: ".story-section",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(".story-content", {
        opacity: 0,
        x: 50,
        duration: 0.8,
        scrollTrigger: {
          trigger: ".story-section",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // Values section
      gsap.from(".values-header", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        scrollTrigger: {
          trigger: valuesRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(".value-card", {
        opacity: 0,
        y: 30,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: {
          trigger: valuesRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      // Timeline section
      gsap.from(".timeline-header", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        scrollTrigger: {
          trigger: timelineRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // Timeline events with alternating left/right animations
      gsap.utils
            .toArray<HTMLElement>(".timeline-event")
            .forEach((event: HTMLElement, index: number) => {
              const isEven = index % 2 === 0;
    
              gsap.from(event, {
            opacity: 0,
            x: isEven ? -100 : 100,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: event,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });
        });

      // Team section
      gsap.from(".team-header", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        scrollTrigger: {
          trigger: teamRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

  

      // Stats section
      gsap.from(".stats-container", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(".stat-item", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      // Floating animations
      gsap.to(".floating-orb-1", {
        scale: 1.1,
        x: 20,
        y: -20,
        duration: 15,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });

      gsap.to(".floating-orb-2", {
        scale: 1.15,
        x: -15,
        y: 15,
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: 2,
      });

      // Decorative elements
      gsap.to(".decorative-circle-1", {
        scale: 1.2,
        opacity: 0.5,
        rotate: 90,
        duration: 15,
        repeat: -1,
        yoyo: true,
      });

      gsap.to(".decorative-circle-2", {
        scale: 1.3,
        opacity: 0.4,
        rotate: -90,
        duration: 10,
        repeat: -1,
        yoyo: true,
        delay: 2,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Get selected team member

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#030014]"
      dir="rtl" // RTL for Persian content
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050118] to-[#030014] opacity-80"></div>

      {/* Animated background image with parallax */}
      <div ref={backgroundRef} className="absolute inset-0 opacity-20">
        <Image
          src="/assets/images/cam1.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-[#030014]/70 to-transparent"></div>
      </div>

      {/* Content container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20">
        {/* Hero section */}
        <div
          ref={heroRef}
          className="min-h-[80vh] flex flex-col justify-center"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              ما{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                کارخانه محتوا
              </span>{" "}
              هستیم
            </h1>

            <div
              className="hero-divider h-1 w-20 mx-auto rounded-full mb-8"
              style={{
                background: "linear-gradient(90deg, #8B5CF6, #EC4899)",
              }}
            />

            <p className="hero-description text-gray-300 text-lg md:text-xl mb-10 leading-relaxed">
              ما یک تیم خلاق و متخصص هستیم که با ترکیب هنر و استراتژی، محتوای
              منحصر به فردی برای برندها خلق می‌کنیم. هدف ما کمک به کسب و کارها
              برای برقراری ارتباط مؤثر با مخاطبان و رشد در دنیای دیجیتال است.
            </p>

            <div className="hero-buttons flex flex-wrap justify-center gap-4">
              <button
                className="px-8 py-3 rounded-full text-white font-medium transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(90deg, #8B5CF6, #EC4899)",
                  boxShadow: "0 8px 20px -5px rgba(139, 92, 246, 0.5)",
                }}
              >
                <Link href="/contact">تماس با ما</Link>
              </button>

              <button
                className="px-8 py-3 rounded-full text-white font-medium border border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              >
                <Link href="/works">مشاهده نمونه کارها</Link>
              </button>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="text-gray-400 text-sm mb-2">بیشتر بدانید</span>
            <div className="w-6 h-10 rounded-full border-2 border-gray-400 flex justify-center p-1">
              <div className="scroll-dot w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>
        </div>

        {/* Our story section */}
        <div className="story-section py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="story-image relative rounded-2xl overflow-hidden aspect-square">
              <Image
                src="/assets/images/cam2.jpg"
                alt="Our Story"
                fill
                className="object-cover"
              />

              {/* Decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 via-transparent to-transparent mix-blend-overlay"></div>

              <div
                className="decorative-circle-1 absolute -bottom-10 -right-10 w-40 h-40 rounded-full border border-white/10"
                style={{
                  background:
                    "radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 70%)",
                }}
              />

              <div
                className="decorative-circle-2 absolute -top-5 -left-5 w-20 h-20 rounded-full border border-white/10"
                style={{
                  background:
                    "radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.1) 50%, transparent 70%)",
                }}
              />
            </div>

            <div className="story-content">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                داستان ما
              </h2>

              <div className="h-1 w-20 rounded-full mb-8 bg-gradient-to-r from-purple-500 to-pink-500"></div>

              <div className="space-y-6 text-gray-300">
                <p>
                  کارخانه محتوا در سال ۱۳۹۷ با هدف ارائه خدمات تخصصی تولید محتوا
                  به کسب و کارها تأسیس شد. ما با یک تیم کوچک اما پرانگیزه شروع
                  کردیم و با تمرکز بر کیفیت و خلاقیت، توانستیم اعتماد مشتریان را
                  جلب کنیم.
                </p>

                <p>
                  با گذشت زمان، خدمات خود را گسترش دادیم و از تولید محتوای متنی
                  به سمت تولید ویدیو، عکاسی، طراحی گرافیک و استراتژی‌های دیجیتال
                  مارکتینگ حرکت کردیم. امروز، ما یک آژانس کامل خدمات محتوایی
                  هستیم که به برندها کمک می‌کنیم تا داستان خود را به شکلی جذاب و
                  تأثیرگذار بیان کنند.
                </p>

                <p>
                  فلسفه ما ساده است: ترکیب هنر، استراتژی و تکنولوژی برای خلق
                  محتوایی که نه تنها زیباست، بلکه نتایج واقعی برای کسب و کارها
                  به ارمغان می‌آورد.
                </p>
              </div>

              <div className="mt-10 flex gap-8">
                <div>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                    +۵
                  </div>
                  <div className="text-gray-400 text-sm">سال تجربه</div>
                </div>

                <div>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                    +۱۰۰
                  </div>
                  <div className="text-gray-400 text-sm">مشتری راضی</div>
                </div>

                <div>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                    +۵۰۰
                  </div>
                  <div className="text-gray-400 text-sm">پروژه موفق</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our values section */}
        <div ref={valuesRef} className="py-20">
          <div className="values-header text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ارزش‌های ما
            </h2>

            <div
              className="h-1 w-20 mx-auto rounded-full mb-6"
              style={{
                background: "linear-gradient(90deg, #8B5CF6, #EC4899)",
              }}
            />

            <p className="text-gray-300 max-w-2xl mx-auto">
              ارزش‌های اصلی که هدایت‌کننده کار ما هستند و به ما کمک می‌کنند تا
              بهترین خدمات را به مشتریان ارائه دهیم
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyValues.map((value) => (
              <div
                key={value.id}
                className="value-card relative p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: `1px solid ${value.color}30`,
                  boxShadow: `0 10px 30px -5px ${value.color}10`,
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-6 text-2xl"
                  style={{
                    backgroundColor: `${value.color}20`,
                    color: value.color,
                  }}
                >
                  <>{value.icon && createElement(value.icon)}</>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">
                  {value.title}
                </h3>

                <p className="text-gray-300">{value.description}</p>

                {/* Decorative corner */}
                <div
                  className="absolute top-0 right-0 w-20 h-20 opacity-10"
                  style={{
                    background: `radial-gradient(circle at top right, ${value.color}50, transparent 70%)`,
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline section */}
        <div ref={timelineRef} className="py-20">
          <div className="timeline-header text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              مسیر ما
            </h2>

            <div
              className="h-1 w-20 mx-auto rounded-full mb-6"
              style={{
                background: "linear-gradient(90deg, #8B5CF6, #EC4899)",
              }}
            />

            <p className="text-gray-300 max-w-2xl mx-auto">
              نگاهی به مسیر رشد و تکامل کارخانه محتوا از ابتدا تا امروز
            </p>
          </div>

          <div className="relative" dir="rtl">
            {/* Timeline center line */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-purple-500/50 via-pink-500/50 to-blue-500/50"></div>

            {/* Timeline events */}
            <div className="space-y-8 relative">
              {timelineEvents.map((event, index) => (
                <div
                  key={event.year}
                  className="timeline-event relative flex items-center"
                  data-index={index}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white bg-[#030014] z-10"></div>

                  {/* Left side content (even index) */}
                  {index % 2 === 0 && (
                    <>
                      <div className="w-1/2 pl-8 text-center">
                        <div
                          className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4"
                          style={{
                            backgroundColor: `${event.color}20`,
                            color: event.color,
                          }}
                        >
                          {event.year}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">
                          {event.title}
                        </h3>
                        <p className="text-gray-300">{event.description}</p>
                      </div>
                      <div className="w-1/2 pl-8 flex justify-center items-center">
                        <div className="relative">
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl z-10 transition-all duration-300 hover:scale-110"
                            style={{
                              backgroundColor: `${event.color}20`,
                              color: event.color,
                              boxShadow: `0 0 20px ${event.color}30`,
                            }}
                          >
                            {createElement(event.icon)}
                          </div>
                          <div
                            className="absolute inset-0 w-24 h-24 -translate-x-1 -translate-y-1 rounded-full opacity-20"
                            style={{
                              background: `radial-gradient(circle, ${event.color}30 0%, transparent 70%)`,
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Right side content (odd index) */}
                  {index % 2 === 1 && (
                    <>
                      <div className="w-1/2 pr-8 flex text-center justify-center items-center">
                        <div className="relative">
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl z-10 transition-all duration-300 hover:scale-110"
                            style={{
                              backgroundColor: `${event.color}20`,
                              color: event.color,
                              boxShadow: `0 0 20px ${event.color}30`,
                            }}
                          >
                            {createElement(event.icon)}
                          </div>
                          <div
                            className="absolute inset-0 w-24 h-24 translate-x-1 -translate-y-1 rounded-full opacity-20"
                            style={{
                              background: `radial-gradient(circle, ${event.color}30 0%, transparent 70%)`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="w-1/2 pr-8 text-center">
                        <div
                          className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4"
                          style={{
                            backgroundColor: `${event.color}20`,
                            color: event.color,
                          }}
                        >
                          {event.year}
                        </div>
                        <h3 className="md:text-xl font-bold text-white mb-3">
                          {event.title}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {event.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team section */}
        <div ref={teamRef} className="py-20">
          <div className="team-header text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              تیم ما
            </h2>

            <div
              className="h-1 w-20 mx-auto rounded-full mb-6"
              style={{
                background: "linear-gradient(90deg, #8B5CF6, #EC4899)",
              }}
            />

            <p className="text-gray-300 max-w-2xl mx-auto">
              با افراد خلاق و متخصصی آشنا شوید که کارخانه محتوا را به یک آژانس
              برتر تبدیل کرده‌اند
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={member.id + index}
                className={`team-member relative rounded-2xl overflow-hidden backdrop-blur-sm cursor-pointer transition-all duration-300 hover:-translate-y-2 ${
                  selectedMember && selectedMember !== member.id
                    ? "opacity-60 scale-95"
                    : "opacity-100 scale-100"
                }`}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                onClick={() =>
                  setSelectedMember(
                    selectedMember === member.id ? null : member.id
                  )
                }
              >
                {/* Member image */}
                <div className="relative aspect-[3/4]">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent"></div>
                </div>

                {/* Member info */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">{member.role}</p>

                  {/* Social links */}
                  <div className="flex gap-3">
                    {member.socialLinks.instagram && (
                      <a
                        href={member.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
                        </svg>
                      </a>
                    )}

                    {member.socialLinks.linkedin && (
                      <a
                        href={member.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
                        </svg>
                      </a>
                    )}

                    {member.socialLinks.twitter && (
                      <a
                        href={member.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>

                {/* Bio overlay (visible when selected) */}
                {selectedMember === member.id && (
                  <div className="absolute inset-0 bg-gradient-to-b from-[#030014]/90 to-[#030014]/90 backdrop-blur-sm p-6 flex flex-col justify-center transition-opacity duration-300">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">{member.role}</p>
                    <p className="text-gray-300">{member.bio}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats section */}
        <div ref={statsRef} className="py-20">
          <div
            className="stats-container p-8 rounded-2xl backdrop-blur-lg"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "+۱۰۰", label: "مشتری راضی", color: "#8B5CF6" },
                { value: "+۵۰۰", label: "پروژه موفق", color: "#EC4899" },
                { value: "+۵", label: "سال تجربه", color: "#3B82F6" },
                { value: "+۹۸٪", label: "رضایت مشتری", color: "#10B981" },
              ].map((stat, index) => (
                <div key={index} className="stat-item text-center">
                  <h3
                    className="text-4xl md:text-5xl font-bold mb-2"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </h3>
                  <p className="text-gray-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonial section */}
        <div className="py-20">
          <div className="testimonial-header text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              نظرات مشتریان
            </h2>

            <div
              className="h-1 w-20 mx-auto rounded-full mb-6"
              style={{
                background: "linear-gradient(90deg, #8B5CF6, #EC4899)",
              }}
            />

            <p className="text-gray-300 max-w-2xl mx-auto">
              آنچه مشتریان ما درباره همکاری با کارخانه محتوا می‌گویند
            </p>
          </div>

          <div className="testimonial-content relative">
            <div
              className="p-8 rounded-2xl backdrop-blur-lg"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="w-24 h-24 md:w-32 md:h-32 relative rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src="/assets/images/cam2.jpg" // Replace with testimonial image
                    alt="مشتری راضی"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-white/20 rounded-full"></div>
                </div>

                <div className="flex-1">
                  <div className="mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-400 text-xl ml-1">
                        ★
                      </span>
                    ))}
                  </div>

                  <p className="text-white/90 text-lg mb-6 leading-relaxed">
                    همکاری با کارخانه محتوا یکی از بهترین تصمیمات کسب و کار ما
                    بود. آنها نه تنها محتوای با کیفیت بالا تولید کردند، بلکه
                    استراتژی دیجیتال ما را کاملاً متحول کردند. نتایج فراتر از
                    انتظارات ما بود و ما توانستیم افزایش چشمگیری در ترافیک سایت
                    و تعامل مخاطبان خود مشاهده کنیم.
                  </p>

                  <div>
                    <h4 className="text-white font-bold text-lg">سارا محمدی</h4>
                    <p className="text-gray-400">
                      مدیر بازاریابی، شرکت نوآوران دیجیتال
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div
              className="floating-orb-1 absolute -top-10 -right-10 w-20 h-20 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
              }}
            />

            <div
              className="floating-orb-2 absolute -bottom-5 -left-5 w-10 h-10 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)",
                border: "1px solid rgba(236, 72, 153, 0.3)",
              }}
            />
          </div>
        </div>

        {/* Call to action */}
        <div className="cta-section py-20">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              آماده همکاری با ما هستید؟
            </h2>

            <p className="text-gray-300 mb-10 max-w-2xl mx-auto">
              با کارخانه محتوا تماس بگیرید و اولین قدم را برای ارتقای استراتژی
              محتوای خود بردارید.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                className="px-8 py-3 rounded-full text-white font-medium transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(90deg, #8B5CF6, #EC4899)",
                  boxShadow: "0 8px 20px -5px rgba(139, 92, 246, 0.5)",
                }}
              >
                <Link href="/contact">تماس با ما</Link>
              </button>

              <button
                className="px-8 py-3 rounded-full text-white font-medium border border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              >
                <Link href="/works">مشاهده نمونه کارها</Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
