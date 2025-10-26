"use client";

import { useState, useEffect, useRef } from "react";
import { RiPlayFill, RiStarFill, RiEyeFill, RiHeartFill, RiShareForwardFill } from "react-icons/ri";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";



gsap.registerPlugin(ScrollTrigger);

const InstagramHooksLanding = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isMounted) return;

    // Hero animation
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 100, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.5,
          stagger: 0.2,
          ease: "elastic.out(1, 0.5)",
        }
      );
    }

    // Scroll-triggered animations
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          stagger: 0.1,
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
            end: "bottom 20%",
            scrub: false,
          },
        }
      );
    }

    // Stats animation
    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.children,
        { opacity: 0, scale: 0.5, rotateY: 180 },
        {
          opacity: 1,
          scale: 1,
          rotateY: 0,
          duration: 1,
          stagger: 0.15,
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 85%",
          },
        }
      );
    }
  }, [isMounted]);

  const stats = [
    { icon: RiEyeFill, number: "87%", text: "افزایش بازدید", color: "text-blue-400" },
    { icon: RiHeartFill, number: "156%", text: "افزایش انگیجمنت", color: "text-red-400" },
    { icon: RiShareForwardFill, number: "203%", text: "افزایش اشتراک", color: "text-green-400" },
    { icon: RiStarFill, number: "95%", text: "رضایت مشتریان", color: "text-yellow-400" },
  ];

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014] relative overflow-hidden" dir="rtl">
      {/* Hero Section with Video Banner */}
      <section className="relative h-screen flex items-center justify-center" ref={heroRef}>
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="relative w-full h-full">
            <video
              src="/assets/instagram-hooks-banner.mp4"
              className="w-full h-full object-cover opacity-30"
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030014]/50 to-[#030014]/90"></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              هوک‌های
            </span>
            <br />
            <span className="text-white">اینستاگرام</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            راز موفقیت در اینستاگرام: چگونه با هوک‌های قدرتمند، مخاطبان را مجذوب کنید و انگیجمنت را 300% افزایش دهید
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg hover:scale-105 transform transition-all duration-300 shadow-2xl hover:shadow-purple-500/25"
            >
              <RiPlayFill className="inline-block ml-2 text-2xl group-hover:scale-110 transition-transform" />
              مشاهده ویدئو آموزشی
            </button>
            
            <Link
              href="/contact"
              className="px-8 py-4 border-2 border-purple-500 text-purple-400 rounded-full font-semibold text-lg hover:bg-purple-500 hover:text-white transition-all duration-300"
            >
              درخواست مشاوره رایگان
            </Link>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 left-16 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-10 w-12 h-12 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8" ref={statsRef}>
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <stat.icon className={`text-4xl ${stat.color} mx-auto mb-4`} />
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-400 text-sm">{stat.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-20 relative" ref={contentRef}>
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Introduction */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-white mb-8 text-center">
              چرا هوک‌های اینستاگرام اهمیت حیاتی دارند؟
            </h2>
            
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                در دنیای پرسرعت رسانه‌های اجتماعی، شما تنها <strong className="text-purple-400">3 ثانیه</strong> فرصت دارید تا توجه مخاطب را جلب کنید. هوک‌های اینستاگرام همان ابزاری هستند که این معجزه را رقم می‌زنند. آنها نه تنها باعث توقف مخاطب می‌شوند، بلکه او را وادار به تماشای کامل محتوا و انجام اقدام مطلوب شما می‌کنند.
              </p>
              
              <p className="text-gray-300 text-lg leading-relaxed">
                تحقیقات نشان می‌دهد که محتواهایی که از هوک‌های قوی استفاده می‌کنند، نرخ بازدید <strong className="text-green-400">87% بیشتر</strong> و نرخ انگیجمنت <strong className="text-blue-400">156% بالاتر</strong> دارند. این آمار تصادفی نیست، بلکه نتیجه درک عمیق روانشناسی مخاطب و استفاده هوشمندانه از تکنیک‌های جذب توجه است.
              </p>
            </div>
          </div>

          {/* What are Instagram Hooks */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-white mb-6">هوک اینستاگرام چیست و چگونه کار می‌کند؟</h3>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-lg rounded-xl p-6 border-r-4 border-purple-500">
                <p className="text-gray-300 text-lg leading-relaxed">
                  هوک در اینستاگرام، جمله، عبارت، یا تصویری است که در ابتدای ریل، پست، یا استوری شما قرار می‌گیرد و هدف آن جلب فوری توجه مخاطب است. این عنصر بحرانی تعیین می‌کند که کاربر محتوای شما را نادیده بگیرد یا متوقف شده و با آن درگیر شود.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
                  <h4 className="text-xl font-semibold text-purple-400 mb-4">انواع هوک‌های مؤثر:</h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full ml-3"></span>
                      هوک‌های سوالی (آیا می‌دانستید که...)
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full ml-3"></span>
                      هوک‌های آماری (90% مردم نمی‌دانند...)
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full ml-3"></span>
                      هوک‌های احساسی (نحوه‌ای که زندگیم را تغییر داد)
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full ml-3"></span>
                      هوک‌های لیستی (5 راه برای...)
                    </li>
                  </ul>
                </div>

                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
                  <h4 className="text-xl font-semibold text-yellow-400 mb-4">تأثیرات هوک‌های قوی:</h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full ml-3"></span>
                      افزایش زمان تماشا
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full ml-3"></span>
                      بهبود نرخ انگیجمنت
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full ml-3"></span>
                      افزایش فالوور
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full ml-3"></span>
                      بهبود رتبه‌بندی الگوریتم
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Psychology Behind Hooks */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-white mb-6">روانشناسی هوک‌های مؤثر</h3>
            
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/20">
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                موفقیت هوک‌ها بر اساس اصول روانشناختی عمیق استوار است. مغز انسان طوری طراحی شده که به محرک‌های خاصی واکنش فوری نشان دهد. این واکنش‌ها ریشه در غرایز بقا و کنجکاوی طبیعی انسان دارند.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <h5 className="font-semibold text-yellow-400 mb-2">اصل کمیابی</h5>
                  <p className="text-sm text-gray-400">ایجاد احساس فوریت و محدودیت</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <h5 className="font-semibold text-green-400 mb-2">اصل کنجکاوی</h5>
                  <p className="text-sm text-gray-400">ایجاد شکاف اطلاعاتی</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <h5 className="font-semibold text-purple-400 mb-2">اصل هیجان</h5>
                  <p className="text-sm text-gray-400">برانگیختن احساسات قوی</p>
                </div>
              </div>

              <p className="text-gray-300 text-lg leading-relaxed">
                هوک‌های مؤثر از این اصول برای ایجاد "حلقه کنجکاوی" استفاده می‌کنند. زمانی که مخاطب با هوکی مواجه می‌شود که سوال یا مشکلی را مطرح می‌کند، مغز او ناخودآگاه به دنبال پاسخ می‌گردد و این همان چیزی است که باعث ادامه تماشا می‌شود.
              </p>
            </div>
          </div>

          {/* Hook Creation Strategy */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-white mb-6">استراتژی خلق هوک‌های بی‌نظیر</h3>
            
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 backdrop-blur-lg rounded-xl p-6 border-l-4 border-green-500">
                <h4 className="text-2xl font-semibold text-green-400 mb-4">1. تحلیل مخاطب هدف</h4>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  قبل از ایجاد هر هوک، باید مخاطب خود را به صورت عمیق بشناسید. چه مشکلاتی دارند؟ چه چیزی آنها را نگران می‌کند؟ چه رویاهایی دارند؟ هوک‌های مؤثر مستقیماً به این سوالات پاسخ می‌دهند.
                </p>
                <div className="bg-white/10 rounded-lg p-4">
                  <strong className="text-green-300">مثال عملی:</strong>
                  <p className="text-gray-400 mt-2">
                    "آیا می‌دانستید که 95% کسب‌وکارها در اینستاگرام به دلیل عدم استفاده از هوک‌های صحیح شکست می‌خورند؟"
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-lg rounded-xl p-6 border-l-4 border-purple-500">
                <h4 className="text-2xl font-semibold text-purple-400 mb-4">2. استفاده از قدرت داستان</h4>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  انسان‌ها از طبیعت عاشق داستان هستند. هوک‌هایی که بر اساس قصه‌گویی ساخته می‌شوند، قدرت جذب بیشتری دارند. شروع با "زمانی که..." یا "داستان مشتری‌ای که..." می‌تواند بسیار مؤثر باشد.
                </p>
                <div className="bg-white/10 rounded-lg p-4">
                  <strong className="text-purple-300">مثال عملی:</strong>
                  <p className="text-gray-400 mt-2">
                    "داستان کسی که با یک پست اینستاگرام 10 میلیون تومان فروش داشت - و چطور شما هم می‌تونید"
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 backdrop-blur-lg rounded-xl p-6 border-l-4 border-red-500">
                <h4 className="text-2xl font-semibold text-red-400 mb-4">3. ایجاد تضاد و تعارض</h4>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  مغز انسان به تضاد و تعارض واکنش فوری نشان می‌دهد. هوک‌هایی که باورهای رایج را به چالش می‌کشند یا اطلاعات غیرمنتظره‌ای ارائه می‌دهند، بسیار جذاب هستند.
                </p>
                <div className="bg-white/10 rounded-lg p-4">
                  <strong className="text-red-300">مثال عملی:</strong>
                  <p className="text-gray-400 mt-2">
                    "چرا کیفیت بالای محتوا باعث شکست شما در اینستاگرام می‌شود؟"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Algorithm and Hooks */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-white mb-6">هوک‌ها و الگوریتم اینستاگرام</h3>
            
            <div className="bg-gradient-to-br from-indigo-900/20 to-cyan-900/20 backdrop-blur-lg rounded-2xl p-8 border border-indigo-500/20">
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                الگوریتم اینستاگرام به طور مستقیم از هوک‌های شما تأثیر می‌پذیرد. این الگوریتم بر اساس سه فاکتور اصلی عمل می‌کند: <strong className="text-cyan-400">زمان تماشا</strong>، <strong className="text-blue-400">نرخ انگیجمنت</strong>، و <strong className="text-purple-400">سرعت واکنش</strong>.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-xl font-semibold text-cyan-400 mb-4">تأثیر مثبت هوک‌ها:</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• افزایش average watch time</li>
                    <li>• بهبود completion rate</li>
                    <li>• افزایش تعداد کامنت‌ها</li>
                    <li>• بهبود نرخ save و share</li>
                    <li>• کاهش bounce rate</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-yellow-400 mb-4">نتایج الگوریتمی:</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• نمایش بیشتر در Explore</li>
                    <li>• قرارگیری در بالای فید</li>
                    <li>• پیشنهاد به کاربران مشابه</li>
                    <li>• افزایش organic reach</li>
                    <li>• بهبود کلی visibility</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-6">
                <h5 className="font-semibold text-green-400 mb-3">نکته طلایی:</h5>
                <p className="text-gray-300">
                  الگوریتم اینستاگرام هوک‌هایی را که در 3 ثانیه اول بیشترین engagement را دریافت می‌کنند، به عنوان محتوای "viral potential" طبقه‌بندی می‌کند و توزیع گسترده‌تری برای آنها در نظر می‌گیرد.
                </p>
              </div>
            </div>
          </div>

          {/* Measuring Success */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-white mb-6">اندازه‌گیری موفقیت هوک‌ها</h3>
            
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                موفقیت هوک‌های شما باید بر اساس معیارهای مشخص و قابل اندازه‌گیری ارزیابی شود. این معیارها نه تنها نشان‌دهنده عملکرد فعلی هستند، بلکه راهنمای بهبود آینده نیز محسوب می‌شوند.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-b from-blue-600/20 to-cyan-600/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-blue-400 mb-3">معیارهای اولیه</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• نرخ توقف در 3 ثانیه اول</li>
                    <li>• میانگین زمان تماشا</li>
                    <li>• درصد تماشای کامل</li>
                    <li>• سرعت دریافت لایک</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-b from-purple-600/20 to-pink-600/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-purple-400 mb-3">معیارهای انگیجمنت</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• تعداد کامنت‌ها</li>
                    <li>• نرخ اشتراک‌گذاری</li>
                    <li>• تعداد save ها</li>
                    <li>• کلیک روی پروفایل</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-b from-green-600/20 to-teal-600/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-green-400 mb-3">معیارهای تجاری</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• نرخ تبدیل به فالوور</li>
                    <li>• ترافیک وب‌سایت</li>
                    <li>• تولید لید</li>
                    <li>• فروش مستقیم</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-12 border border-purple-500/30">
              <h3 className="text-3xl font-bold text-white mb-4">آماده انقلاب در اینستاگرام خود هستید؟</h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                با استفاده از هوک‌های حرفه‌ای، محتوای خود را به ابزاری قدرتمند برای جذب مخاطب و افزایش فروش تبدیل کنید
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg hover:scale-105 transform transition-all duration-300 shadow-2xl"
                >
                  شروع همکاری
                </Link>
                <Link
                  href="/dashboard"
                  className="px-8 py-4 border-2 border-purple-500 text-purple-400 rounded-full font-semibold text-lg hover:bg-purple-500 hover:text-white transition-all duration-300"
                >
                  مشاهده نمونه کارها
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default InstagramHooksLanding;
