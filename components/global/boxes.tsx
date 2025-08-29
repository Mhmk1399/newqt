import Image from "next/image";
import { MdCameraEnhance, MdSupport } from "react-icons/md";

const WhyChoose = () => {
  return (
    <section className="px-8 py-16 max-w-5xl mx-auto">
      <div className="relative flex flex-col items-center gap-4 mb-12">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-500/20 rounded-full blur-xl" />
        <div className="absolute -top-2 right-12 w-2 h-2 bg-blue-300 rounded-full animate-ping" />

        <div className="flex items-center gap-4 w-full max-w-2xl">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[#2563eb]/80 to-transparent" />
          <h2 className="text-4xl font-bold text-center relative z-10">
            چرا <span className="text-[#2563eb]">کانتنت فکتوری</span> را انتخاب
            کنید
          </h2>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-[#2563eb]/80 to-transparent" />
        </div>

        <span className="text-gray-500 text-lg font-medium mt-2">
          تولید محتوای حرفه‌ای با بهترین کیفیت
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-b from-[#60a5fa] to-[#2563eb]">
            <MdCameraEnhance className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mt-4 text-[#2563eb]">
            خدمات تخصصی عکاسی
          </h3>
          <p className="text-gray-600 mt-2">
            ما با بهترین تجهیزات و کادر حرفه‌ای، تمام نیازهای عکاسی شما را پوشش
            می‌دهیم
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-b from-[#60a5fa] to-[#2563eb]">
            <MdSupport className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mt-4 text-[#2563eb]">
            پشتیبانی ۲۴ ساعته
          </h3>
          <p className="text-gray-600 mt-2">
            تیم ما در تمام مراحل پروژه، آماده پاسخگویی و ارائه مشاوره تخصصی به
            شما است
          </p>
        </div>

        {/* Card 3 */}
        {/* Combined Card 3 & 5 with Neon Effect */}
        <div
          className="relative col-span-1 row-span-2 p-8 rounded-2xl overflow-hidden 
                      bg-gradient-to-br from-[#2563eb] via-[#60a5fa] to-[#2563eb]
                      shadow-[0_0_30px_rgba(37,99,235,0.5)]
                      hover:shadow-[0_0_50px_rgba(37,99,235,0.7)]
                      transition-all duration-500 ease-in-out
                      before:content-['']
                      before:absolute before:inset-0
                      before:bg-gradient-to-br before:from-transparent before:via-[rgba(96,165,250,0.2)] before:to-transparent
                      before:animate-gradient-shift"
        >
          <div className="relative z-10 flex flex-col items-center text-center space-y-10 md:space-y-28">
            <h3
              className="text-2xl font-bold text-white 
                         [text-shadow:_0_0_10px_rgba(255,255,255,0.5)]"
            >
              تنوع خدمات تصویربرداری
            </h3>
            <p className="text-white/90 md:-mt-20">
              از عکاسی محصول تا تصویربرداری هوایی، تمام نیازهای بصری کسب و کار
              شما را برآورده می‌کنیم
            </p>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            <h3
              className="text-2xl font-bold text-white 
                         [text-shadow:_0_0_10px_rgba(255,255,255,0.5)]"
            >
              خدمات سفارشی
            </h3>
            <p className="text-white/90 md:-mt-20">
              ارائه خدمات منحصر به فرد مطابق با نیاز و سلیقه شما در تولید محتوای
              تصویری
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="col-span-1 md:col-span-2">
          <div className="relative rounded-2xl overflow-hidden group hover:shadow-xl transition-shadow duration-300">
            <Image
              src="/assets/images/cam2.jpg"
              alt="کیفیت برتر"
              width={2000}
              height={2000}
              className="h-[300px] object-cover brightness-50 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0  flex flex-col justify-center items-center text-white px-6">
              <h3 className="text-2xl font-semibold">کیفیت برتر تصویربرداری</h3>
              <p className="mt-2 text-center">
                با استفاده از پیشرفته‌ترین تجهیزات و تکنیک‌های روز دنیا، بهترین
                کیفیت را تضمین می‌کنیم
              </p>
            </div>
          </div>
        </div>

        {/* Card 5 */}
      </div>
    </section>
  );
};

export default WhyChoose;
