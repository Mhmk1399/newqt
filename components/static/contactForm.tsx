"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { IoSend, IoLocation, IoCheckmarkCircle } from "react-icons/io5";
import toast from "react-hot-toast";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FormData,
  contactInfo,
  formFields,
  serviceOptions,
} from "../../data/contactForm";
import Link from "next/link";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const ContactForm = () => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    service: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contactInfoRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animations
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      headerTl
        .from(".contact-title", {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: "power2.out",
        })
        .from(
          ".contact-divider",
          { width: 0, opacity: 0, duration: 0.8 },
          "-=0.6"
        )
        .from(
          ".contact-description",
          { opacity: 0, y: 20, duration: 0.8 },
          "-=0.4"
        );

      // Contact info animations
      gsap.from(".contact-info-card", {
        opacity: 0,
        x: -50,
        duration: 0.8,
        scrollTrigger: {
          trigger: contactInfoRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(".contact-info-item", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: {
          trigger: contactInfoRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      // Form animations
      gsap.from(".form-container", {
        opacity: 0,
        x: 50,
        duration: 0.8,
        scrollTrigger: {
          trigger: formContainerRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(".form-field", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: {
          trigger: formRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // Map section
      gsap.from(".map-section", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        scrollTrigger: {
          trigger: mapRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // FAQ section
      gsap.from(".faq-title", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        scrollTrigger: {
          trigger: faqRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // CTA section
      gsap.from(".cta-section", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // Floating animations
      gsap.to(".floating-orb-1", {
        y: -20,
        x: 20,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });

      gsap.to(".floating-orb-2", {
        y: 20,
        x: -15,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: 2,
      });

      gsap.to(".floating-orb-3", {
        y: -15,
        x: 10,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: 4,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    let isValid = true;

    // Validate required fields
    formFields.forEach((field) => {
      if (field.required && !formData[field.name as keyof FormData]) {
        newErrors[field.name as keyof FormData] = `${field.label} الزامی است`;
        isValid = false;
      }
    });

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "فرمت ایمیل صحیح نیست";
      isValid = false;
    }

    // Validate phone format (simple validation)
    if (formData.phone && !/^((\+|00)98|0)?9\d{9}$/.test(formData.phone)) {
      newErrors.phone = "شماره موبایل صحیح نیست";
      isValid = false;
    }

    // Validate message
    if (!formData.message) {
      newErrors.message = "پیام الزامی است";
      isValid = false;
    } else if (formData.message.length < 10) {
      newErrors.message = "پیام باید حداقل ۱۰ کاراکتر باشد";
      isValid = false;
    }

    // Validate service selection
    if (!formData.service) {
      newErrors.service = "انتخاب خدمات الزامی است";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("لطفاً خطاهای فرم را برطرف کنید");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success
      setIsSubmitted(true);
      toast.success("پیام شما با موفقیت ارسال شد");

      // Reset form after delay
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          service: "",
        });
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      console.log(error);

      toast.error("خطا در ارسال پیام. لطفاً دوباره تلاش کنید");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden pb-20 bg-[#030014]"
      dir="rtl"
    >
      {/* Enhanced Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/cam1.jpg"
          alt="Background"
          fill
          className="object-cover opacity-15"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#030014] via-[#0A0A2E]/90 to-[#030014]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-[#030014]/50"></div>
      </div>

      {/* Luxury Decorative Elements */}
      <div className="floating-orb-1 absolute top-20 left-10 w-80 h-80 bg-gradient-to-r from-purple-500/15 to-violet-500/15 rounded-full filter blur-3xl"></div>
      <div className="floating-orb-2 absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-500/15 to-rose-500/15 rounded-full filter blur-3xl"></div>
      <div className="floating-orb-3 absolute bottom-40 left-20 w-72 h-72 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full filter blur-3xl"></div>

      {/* Luxury grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Content container */}
      <div className="relative z-10 max-w-8xl mx-auto py-24 px-6 md:px-12">
        {/* Luxury Section Header */}
        <div ref={titleRef} className="text-center mb-20">
          <div className="relative inline-block">
            <h2 className="contact-title text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 relative z-10">
              تماس با ما
            </h2>
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-2xl rounded-full opacity-50"></div>
          </div>

          <div
            className="contact-divider h-1.5 w-32 mx-auto rounded-full mb-8 shadow-lg"
            style={{
              background: "linear-gradient(90deg, #8B5CF6, #EC4899, #3B82F6)",
              boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
            }}
          />

          <p className="contact-description text-gray-300 max-w-3xl mx-auto text-xl leading-relaxed">
            ما مشتاق شنیدن نظرات و پیشنهادات شما هستیم. برای درخواست مشاوره یا
            همکاری با ما تماس بگیرید.
          </p>
        </div>

        {/* Luxury Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Enhanced Contact Information */}
          <div ref={contactInfoRef} className="lg:col-span-5 space-y-8">
            <div className="contact-info-card relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl">
              {/* Luxury decorative corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-tr-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-bl-3xl"></div>

              <h3 className="text-3xl font-bold text-white mb-8 relative z-10">
                اطلاعات تماس
              </h3>

              <div className="space-y-8 relative z-10">
                {contactInfo.map((info, index) => (
                  <div
                    key={index}
                    className="contact-info-item flex items-start gap-6 group cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-all duration-300 shadow-lg">
                      {info.icon && (
                        <info.icon className="text-2xl text-white" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="text-white font-bold text-lg mb-2 group-hover:text-purple-300 transition-colors">
                        {info.title}
                      </h4>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="text-gray-300 hover:text-white transition-colors duration-300 text-lg"
                          target={
                            info.link.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            info.link.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                        >
                          {info.details}
                        </a>
                      ) : (
                        <p className="text-gray-300 text-lg leading-relaxed">
                          {info.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Luxury Social Media Section */}
            <div className="contact-info-card relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">
                ما را در شبکه‌های اجتماعی دنبال کنید
              </h3>

              <div className="flex gap-4 mt-8">
                {[
                  { name: "Instagram", icon: "I", color: "#E1306C", href: "" },
                  { name: "LinkedIn", icon: "L", color: "#0077B5", href: "" },
                  { name: "Telegram", icon: "T", color: "#0088cc", href: "" },
                ].map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:-translate-y-2 hover:scale-110 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${social.color}40, ${social.color}20)`,
                      border: `1px solid ${social.color}30`,
                      boxShadow: `0 8px 25px -5px ${social.color}40`,
                    }}
                  >
                    <span className="text-white text-xl font-bold">
                      {social.icon}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-white/10 backdrop-blur-sm">
                <p className="text-white/90 text-lg leading-relaxed">
                  ساعات پاسخگویی: شنبه تا چهارشنبه از ساعت ۹ صبح تا ۵ بعدازظهر
                </p>
              </div>
            </div>
          </div>

          {/* Luxury Contact Form */}
          <div ref={formContainerRef} className="lg:col-span-7">
            <div className="form-container relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl overflow-hidden">
              {/* Enhanced Decorative Elements */}
              <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 filter blur-3xl"></div>
              <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-gradient-to-tr from-pink-500/20 to-rose-500/20 filter blur-3xl"></div>
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/15 to-cyan-500/15 filter blur-2xl"></div>

              <h3 className="text-3xl font-bold text-white mb-10 relative z-10">
                فرم تماس
              </h3>

              {isSubmitted ? (
                <div className="text-center py-20 relative z-10">
                  <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-green-500/30 to-emerald-500/30 flex items-center justify-center border border-green-400/30 shadow-2xl">
                    <IoCheckmarkCircle className="text-4xl text-green-400" />
                  </div>

                  <h4 className="text-3xl font-bold text-white mb-4">
                    پیام شما با موفقیت ارسال شد
                  </h4>

                  <p className="text-gray-300 text-xl mb-8 leading-relaxed">
                    از تماس شما متشکریم. کارشناسان ما در اسرع وقت با شما تماس
                    خواهند گرفت.
                  </p>
                </div>
              ) : (
                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="space-y-8 relative z-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {formFields.map((field) => (
                      <div
                        key={field.id}
                        className={`form-field ${
                          field.id === "subject" ? "md:col-span-2" : ""
                        }`}
                      >
                        <label
                          htmlFor={field.id}
                          className="block text-white font-bold text-lg mb-3"
                        >
                          {field.label}
                          {field.required && (
                            <span className="text-red-400 mr-2">*</span>
                          )}
                        </label>

                        <div className="relative">
                          <input
                            type={field.type}
                            id={field.id}
                            name={field.name}
                            value={formData[field.name as keyof FormData]}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            required={field.required}
                            minLength={field.minLength}
                            maxLength={field.maxLength}
                            pattern={field.pattern}
                            className={`w-full px-6 py-4 bg-white/10 border-2 ${
                              errors[field.name as keyof FormData]
                                ? "border-red-400 focus:border-red-400"
                                : "border-white/20 focus:border-purple-400"
                            } rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 text-white placeholder-gray-400 transition-all duration-300 backdrop-blur-sm text-lg`}
                          />
                          {/* Luxury input glow effect */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>

                        {errors[field.name as keyof FormData] && (
                          <p className="mt-2 text-red-400 text-sm font-medium">
                            {errors[field.name as keyof FormData]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="form-field">
                    <label
                      htmlFor="service"
                      className="block text-white font-bold text-lg mb-3"
                    >
                      خدمات مورد نظر{" "}
                      <span className="text-red-400 mr-2">*</span>
                    </label>

                    <div className="relative">
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className={`w-full px-6 py-4 bg-white/10 border-2 ${
                          errors.service
                            ? "border-red-400 focus:border-red-400"
                            : "border-white/20 focus:border-purple-400"
                        } rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 text-white appearance-none transition-all duration-300 backdrop-blur-sm text-lg cursor-pointer`}
                      >
                        <option value="" disabled className="bg-gray-900">
                          انتخاب کنید
                        </option>
                        {serviceOptions.map((option) => (
                          <option
                            className="bg-gray-900 text-white"
                            key={option.id}
                            value={option.id}
                          >
                            {option.name}
                          </option>
                        ))}
                      </select>
                      {/* Custom dropdown arrow */}
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-6 h-6 text-white/60"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>

                    {errors.service && (
                      <p className="mt-2 text-red-400 text-sm font-medium">
                        {errors.service}
                      </p>
                    )}
                  </div>

                  <div className="form-field">
                    <label
                      htmlFor="message"
                      className="block text-white font-bold text-lg mb-3"
                    >
                      پیام <span className="text-red-400 mr-2">*</span>
                    </label>

                    <div className="relative">
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="پیام خود را بنویسید..."
                        rows={6}
                        className={`w-full px-6 py-4 bg-white/10 border-2 ${
                          errors.message
                            ? "border-red-400 focus:border-red-400"
                            : "border-white/20 focus:border-purple-400"
                        } rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 text-white placeholder-gray-400 transition-all duration-300 backdrop-blur-sm text-lg resize-none`}
                      />
                      {/* Luxury textarea glow effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>

                    {errors.message && (
                      <p className="mt-2 text-red-400 text-sm font-medium">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <div className="form-field flex justify-center pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative px-12 py-5 cursor-pointer bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 rounded-2xl text-white font-bold text-lg flex items-center gap-3 transition-all duration-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-2xl hover:shadow-purple-500/25 hover:scale-105 overflow-hidden"
                      style={{
                        boxShadow: "0 20px 40px -10px rgba(139, 92, 246, 0.4)",
                      }}
                    >
                      {/* Button glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {isSubmitting ? (
                        <>
                          <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span className="relative z-10">در حال ارسال...</span>
                        </>
                      ) : (
                        <>
                          <span className="relative z-10">ارسال پیام</span>
                          <IoSend className="rotate-180 text-xl relative z-10 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Luxury Map Section */}
        <div ref={mapRef} className="mt-24">
          <div className="map-section relative rounded-3xl overflow-hidden border-2 border-white/20 h-[500px] shadow-2xl">
            {/* Enhanced map placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A2E] via-[#1A1A4A] to-[#2A2A5A] flex items-center justify-center">
              {/* Decorative grid pattern */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: "30px 30px",
                  }}
                ></div>
              </div>

              <div className="text-center relative z-10">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center border border-white/20 shadow-2xl">
                  <IoLocation className="text-white text-3xl" />
                </div>
                <h3 className="text-white text-3xl font-bold mb-4">
                  موقعیت ما روی نقشه
                </h3>
                <p className="text-gray-300 max-w-lg mx-auto text-lg leading-relaxed mb-8">
                  برای مشاهده موقعیت دقیق ما روی نقشه و دریافت مسیر دقیق، کلیک
                  کنید
                </p>
                <button className="px-10 py-4 cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl">
                  <Link href={"https://maps.app.goo.gl/bRB2g1Kx7iMppx8EA"}>
                    نمایش نقشه تعاملی
                  </Link>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Luxury FAQ Section */}
        <div className="mt-32">
          <h3 className=" text-3xl md:text-4xl font-bold text-white mb-16 text-center">
            سوالات متداول
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "چگونه می‌توانم پروژه خود را به شما بسپارم؟",
                answer:
                  "شما می‌توانید از طریق فرم تماس بالا، تماس تلفنی یا ایمیل با ما در ارتباط باشید. کارشناسان ما در اسرع وقت با شما تماس گرفته و مشاوره رایگان ارائه می‌دهند.",
              },
              {
                question: "هزینه خدمات شما چگونه محاسبه می‌شود؟",
                answer:
                  "هزینه خدمات ما بر اساس نوع پروژه، حجم کار، زمان تحویل و پیچیدگی آن متغیر است. برای دریافت قیمت دقیق، می‌توانید درخواست مشاوره و استعلام قیمت دهید.",
              },
              {
                question: "مدت زمان انجام پروژه‌ها چقدر است؟",
                answer:
                  "زمان تحویل پروژه‌ها بسته به نوع و حجم آن متفاوت است. معمولاً پروژه‌های کوچک بین ۳ تا ۷ روز و پروژه‌های بزرگتر بین ۲ تا ۴ هفته زمان می‌برند.",
              },
              {
                question: "آیا امکان اصلاح و تغییر در پروژه وجود دارد؟",
                answer:
                  "بله، ما معمولاً تا دو مرحله اصلاحات جزئی را بدون هزینه اضافی انجام می‌دهیم. برای تغییرات اساسی ممکن است هزینه اضافی در نظر گرفته شود.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="faq-item group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2"
              >
                {/* Luxury corner decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <h4 className="text-xl font-bold text-white mb-4 leading-relaxed group-hover:text-purple-300 transition-colors">
                  {faq.question}
                </h4>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Luxury Call to Action */}
        <div ref={ctaRef} className="mt-32">
          <div className="cta-section relative text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-16 border border-white/20 shadow-2xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full filter blur-2xl"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-tl from-pink-500/20 to-transparent rounded-full filter blur-2xl"></div>

            <div className="relative z-10">
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
                آماده همکاری با ما هستید؟
              </h3>
              <p className="text-gray-300 text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
                با کارخانه محتوا تماس بگیرید و اولین قدم را برای ارتقای استراتژی
                محتوای خود بردارید.
              </p>
              <button
                className="group relative px-12 py-5 rounded-2xl text-white font-bold text-xl transition-all duration-500 hover:scale-105 shadow-2xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #8B5CF6, #EC4899, #3B82F6)",
                  boxShadow: "0 20px 40px -10px rgba(139, 92, 246, 0.6)",
                }}
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 cursor-pointer bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Link href={"tel:09015528576"} className="relative z-10">
                  مشاوره رایگان
                </Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
