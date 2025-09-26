"use client";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import gsap from "gsap";
import {
  BiUser,
  BiPhone,
  BiLock,
  BiLockAlt,
  BiLogIn,
  BiUserPlus,
  BiShield,
  BiStar,
  BiShow,
  BiHide,
} from "react-icons/bi";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const switchButtonRef = useRef<HTMLButtonElement>(null);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial page load animation
      const tl = gsap.timeline();

      tl.from(containerRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: "back.out(1.7)",
      })
        .from(
          ".auth-title",
          {
            opacity: 0,
            y: -30,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.4"
        )
        .from(
          ".auth-form-field",
          {
            opacity: 0,
            y: 20,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.3"
        )
        .from(
          ".auth-submit-btn",
          {
            scale: 0.9,
            duration: 0.5,
            ease: "back.out(1.7)",
          },
          "-=0.2"
        )
        .from(
          ".auth-switch-btn",
          {
            y: 10,
            duration: 0.4,
            ease: "power2.out",
          },
          "-=0.1"
        );

      // Floating animation for decorative elements
      gsap.to(".floating-orb-1", {
        y: -20,
        x: 10,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });

      gsap.to(".floating-orb-2", {
        y: 15,
        x: -15,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: 1,
      });

      gsap.to(".floating-orb-3", {
        y: -10,
        x: 20,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: 2,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Form switch animation
  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(
        ".auth-form-field",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );

      gsap.fromTo(
        ".auth-title",
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
      );
    }
  }, [isLogin]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!isLogin && formData.name.length < 3) {
      newErrors.name = "نام باید حداقل ۳ حرف باشد";
    }

    if (formData.phone.length !== 11) {
      newErrors.phone = "شماره موبایل باید ۱۱ رقم باشد";
    }

    if (formData.password.length < 6) {
      newErrors.password = "رمز عبور باید حداقل ۶ کاراکتر باشد";
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "رمز عبور مطابقت ندارد";
    }

    if (!isLogin && !formData.userType) {
      newErrors.userType = "لطفا نوع کاربری را انتخاب کنید";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (phoneNumber: string, password: string) => {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "login", phoneNumber, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("userToken", data.data.userToken);
      return {
        token: data.data.userToken,
        user: {
          id: data.data.userId,
          name: formData.name,
        },
      };
    } catch (error) {
      console.log(error);
      throw new Error("Login failed");
    }
  };

  const handleSignup = async (
    name: string,
    phoneNumber: string,
    password: string,
    userType: string
  ) => {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "signup",
          name,
          phoneNumber,
          password,
          userType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      localStorage.setItem("userToken", data.data.userToken);
      return {
        token: data.data.userToken,
        user: {
          name: data.data.name,
        },
      };
    } catch (error) {
      console.log(error);
      throw new Error("خطا در ثبت نام");
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        if (isLogin) {
          const userData = await handleLogin(formData.phone, formData.password);
          toast.success(`خوش آمدید ${userData.user.name}`);
          window.open("/dashboard", "_blank");
        } else {
          const userData = await handleSignup(
            formData.name,
            formData.phone,
            formData.password,
            formData.userType
          );
          toast.success(`ثبت نام ${userData.user.name} موفقیت انجام شد`);

          window.open("/dashboard", "_blank");
        }
      } catch (error) {

        toast.error("خطا در ورود به سیستم");

      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleModeSwitch = () => {
    // Switch animation
    gsap.to(".auth-form-field", {
      opacity: 0,
      y: -10,
      duration: 0.3,
      stagger: 0.05,
      onComplete: () => {
        setIsLogin(!isLogin);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setShowForgotPassword(false);
      },
    });
  };

  const handleForgotPassword = async () => {
    if (!formData.phone) {
      setErrors({ phone: "لطفاً شماره تلفن خود را وارد کنید" });
      return;
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "خطا در ارسال کد بازیابی");
      }

      toast.success("کد بازیابی به شماره شما ارسال شد");
      setShowForgotPassword(false);
    } catch (error: any) {
      toast.error(error.message || "خطا در ارسال کد بازیابی");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[#030014] via-[#0A0A2E] to-[#030014]"
      dir="rtl"
    >
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="floating-orb-1 absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-full filter blur-3xl"></div>
        <div className="floating-orb-2 absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full filter blur-3xl"></div>
        <div className="floating-orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full filter blur-3xl"></div>

        {/* Luxury grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
      </div>

      {/* Main Auth Container */}
      <div
        ref={containerRef}
        className="relative z-10 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl p-10 w-full max-w-lg shadow-2xl border border-white/20"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Decorative corner elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-tr-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-bl-3xl"></div>

        {/* Header with luxury styling */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 mb-6 border border-white/20 shadow-xl">
            {isLogin ? (
              <BiLogIn className="text-white text-3xl" />
            ) : (
              <BiUserPlus className="text-white text-3xl" />
            )}
          </div>

          <h2 className="auth-title text-4xl font-bold text-white mb-2 relative">
            {isLogin ? "ورود" : "ثبت نام"}
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl rounded-full opacity-50"></div>
          </h2>

          <p className="text-gray-300 text-lg">
            {isLogin
              ? "به حساب کاربری خود وارد شوید"
              : "حساب کاربری جدید ایجاد کنید"}
          </p>
        </div>

        {/* Luxury Form */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-6 relative z-10"
        >
          {!isLogin && (
            <div className="auth-form-field relative group">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                <BiUser className="text-purple-400 text-xl group-focus-within:text-purple-300 transition-colors" />
              </div>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-6 py-4 pr-12 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 backdrop-blur-sm text-lg"
                placeholder="نام و نام خانوادگی"
              />
              {/* Input glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              {errors.name && (
                <span className="text-red-400 text-sm block mt-2 font-medium">
                  {errors.name}
                </span>
              )}
            </div>
          )}

          <div className="auth-form-field relative group">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
              <BiPhone className="text-purple-400 text-xl group-focus-within:text-purple-300 transition-colors" />
            </div>
            <input
              name="phone"
              type="number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-6 py-4 pr-12 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 backdrop-blur-sm text-lg"
              placeholder="شماره موبایل"
              dir="ltr"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

            {errors.phone && (
              <span className="text-red-400 text-sm block mt-2 font-medium">
                {errors.phone}
              </span>
            )}
          </div>

          <div className="auth-form-field relative group">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
              <BiLock className="text-purple-400 text-xl group-focus-within:text-purple-300 transition-colors" />
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-6 py-4 pr-12 pl-12 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 backdrop-blur-sm text-lg"
              placeholder="رمز عبور"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-purple-400 hover:text-purple-300 transition-colors"
            >
              {showPassword ? (
                <BiHide className="text-xl" />
              ) : (
                <BiShow className="text-xl" />
              )}
            </button>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

            {errors.password && (
              <span className="text-red-400 text-sm block mt-2 font-medium">
                {errors.password}
              </span>
            )}
          </div>

          {!isLogin && (
            <>
              <div className="auth-form-field relative group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                  <BiLockAlt className="text-purple-400 text-xl group-focus-within:text-purple-300 transition-colors" />
                </div>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-6 py-4 pr-12 pl-12 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 backdrop-blur-sm text-lg"
                  placeholder="تکرار رمز عبور"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <BiHide className="text-xl" />
                  ) : (
                    <BiShow className="text-xl" />
                  )}
                </button>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                {errors.confirmPassword && (
                  <span className="text-red-400 text-sm block mt-2 font-medium">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <div className="auth-form-field space-y-4">
                <label className="block text-white font-medium text-lg">
                  نوع کاربری
                </label>
                <div className="grid grid-cols-1 gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, userType: "customer" })
                    }
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                      formData.userType === "customer"
                        ? "border-purple-400 bg-purple-500/20 text-white"
                        : "border-white/20 bg-white/10 text-gray-300 hover:border-purple-400/50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold mb-1">
                        ثبت نام دریافت کننده خدمات
                      </div>
                      <div className="text-sm opacity-80">
                        برای مشتریان و دریافت کنندگان خدمات
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, userType: "coworker" })
                    }
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                      formData.userType === "coworker"
                        ? "border-purple-400 bg-purple-500/20 text-white"
                        : "border-white/20 bg-white/10 text-gray-300 hover:border-purple-400/50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold mb-1">
                        ثبت نام ارائه دهنده خدمات
                      </div>
                      <div className="text-sm opacity-80">
                        برای همکاران و ارائه دهندگان خدمات
                      </div>
                    </div>
                  </button>
                </div>

                {errors.userType && (
                  <span className="text-red-400 text-sm block mt-2 font-medium">
                    {errors.userType}
                  </span>
                )}
              </div>
            </>
          )}

          {/* Luxury Submit Button */}
          <button
            className="auth-submit-btn group relative w-full py-5 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-500 hover:scale-105 shadow-2xl overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: isLogin
                ? "linear-gradient(135deg, #8B5CF6, #EC4899, #3B82F6)"
                : "linear-gradient(135deg, #10B981, #3B82F6, #8B5CF6)",
              boxShadow: "0 20px 40px -10px rgba(139, 92, 246, 0.6)",
            }}
            type="submit"
            disabled={isLoading}
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {isLoading ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="relative z-10">در حال پردازش...</span>
              </>
            ) : (
              <>
                {isLogin ? (
                  <BiLogIn className="text-xl relative z-10" />
                ) : (
                  <BiUserPlus className="text-xl relative z-10" />
                )}
                <span className="relative z-10">
                  {isLogin ? "ورود" : "ثبت نام"}
                </span>
              </>
            )}
          </button>

          {/* Forgot Password Link - Only show in login mode */}
          {isLogin && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-purple-400 hover:text-purple-300 text-sm transition-colors duration-300 hover:underline"
              >
                رمز عبور خود را فراموش کرده‌اید؟
              </button>
            </div>
          )}
        </form>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BiLock className="text-purple-400 text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">بازیابی رمز عبور</h3>
                <p className="text-white/70 text-sm">
                  شماره تلفن خود را وارد کنید تا کد بازیابی برای شما ارسال شود
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                    <BiPhone className="text-purple-400 text-xl group-focus-within:text-purple-300 transition-colors" />
                  </div>
                  <input
                    name="phone"
                    type="number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-6 py-4 pr-12 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 backdrop-blur-sm text-lg"
                    placeholder="شماره موبایل"
                    dir="ltr"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>

                {errors.phone && (
                  <span className="text-red-400 text-sm block font-medium">
                    {errors.phone}
                  </span>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setErrors({});
                    }}
                    className="flex-1 py-3 px-6 rounded-2xl border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                  >
                    ارسال کد
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Switch Mode Button */}
        <div className="text-center mt-8 relative z-10">
          <button
            ref={switchButtonRef}
            onClick={handleModeSwitch}
            className="auth-switch-btn group flex items-center justify-center gap-3 mx-auto px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300 hover:scale-105 backdrop-blur-sm"
          >
            <span className="text-lg">
              {isLogin ? "ثبت نام نکرده‌اید؟" : "قبلاً ثبت نام کرده‌اید؟"}
            </span>
            {isLogin ? (
              <BiUserPlus className="text-xl text-purple-400 group-hover:text-purple-300 transition-colors" />
            ) : (
              <BiLogIn className="text-xl text-purple-400 group-hover:text-purple-300 transition-colors" />
            )}
          </button>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-gray-400 text-sm">
          <BiShield className="text-green-400" />
          <span>اتصال امن و رمزگذاری شده</span>
          <BiStar className="text-yellow-400" />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
