"use client";
import React, { useState } from "react";
import bgImage from "@/public/Image/register/bgImage.png";
import carImage from "@/public/Image/register/registerLargeImg.png";
import Link from "next/link";
import { ArrowLeft, EyeOff } from "lucide-react";
import { Eye } from "lucide-react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { EmailVerificationModal } from "@/components/reusable/EmailVerificationModal";

interface FormData {
  email: string;
  password: string;
  agreeToTerms: boolean;
}

export default function GarageLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { loginWithType } = useAuth();

  // Verification modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");

  const handleVerificationSuccess = () => {
    setShowVerifyModal(false);
    setVerifyEmail("");
  };

  const openVerificationModal = (email: string) => {
    setVerifyEmail(email);
    setShowVerifyModal(true);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const result = await loginWithType(data.email, data.password, "GARAGE");
      if (result.success) {
        toast.success(result.message);
        router.push("/garage/garage-profile");
      } else {
        // Check if error is related to verification
        if (
          result.message.toLowerCase().includes("verify") ||
          result.message.toLowerCase().includes("verification")
        ) {
          openVerificationModal(data.email);
        }
        toast.error(result.message);
      }
    } catch (error: any) {
      if (
        error.message?.toLowerCase().includes("verify") ||
        error.message?.toLowerCase().includes("verification")
      ) {
        openVerificationModal(data.email);
      }
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleBack = () => {
    router.back();
  };
  return (
    <div className="min-h-screen flex flex-col lg:flex-row p-4  gap-4">
      <div
        className="flex-1 lg:flex-1 text-white relative overflow-hidden rounded-2xl min-h-[50vh] lg:min-h-full"
        style={{
          backgroundImage: `url(${bgImage.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 p-6 lg:p-12 flex flex-col h-full">
          <div className="flex-shrink-0">
            {/* back button */}
            <button
              onClick={handleBack}
              className="flex justify-start cursor-pointer border border-white  rounded-full p-2 w-fit group mb-4"
            >
              <div className="text-white font-bold text-4xl md:text-5xl xl:text-6xl font-arial-rounded text-center group-hover:scale-150 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 text-white flex-shrink-0" />
              </div>
            </button>

            <div className="text-white font-bold text-4xl md:text-5xl xl:text-6xl font-arial-rounded text-center">
              <Link href="/">simplymot.co.uk</Link>
            </div>
          </div>

          <div className="flex-1 flex justify-center items-center min-h-0">
            <Image
              src={carImage}
              alt="Car with people illustration"
              className="max-w-sm md:max-w-2xl w-full h-auto object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 lg:flex-1 flex items-center justify-center rounded-2xl">
        <div className="w-full max-w-full  lg:max-w-lg xl:max-w-xl">
          <div className="bg-white rounded-xl border border-[#19CA32]  p-8 sm:p-10 ">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-8 sm:mb-10">
              Member Login
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 ">
              {/* Email Field */}
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="mt-2 py-5 border border-[#19CA32] focus:border-[#19CA32] focus:ring-[#19CA32] text-base px-4 rounded-lg"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="py-5 pr-12 border border-[#19CA32] focus:border-[#19CA32] focus:ring-[#19CA32] text-base px-4 rounded-lg"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-[#19CA32] cursor-pointer" />
                    ) : (
                      <Eye className="h-5 w-5 text-[#19CA32] cursor-pointer" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {/* forget password */}
              <div className="flex justify-end ">
                <Link
                  href="/forgot-password"
                  className="text-[#19CA32] underline  text-sm hover:scale-105 transition-all duration-300"
                >
                  Forget Password
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer bg-[#19CA32] hover:bg-[#19CA32] disabled:bg-[#19CA32]/70 disabled:cursor-not-allowed text-white py-5 rounded-lg font-medium text-base transition-all duration-200  hover:shadow-lg hover:shadow-green-500"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Please wait...</span>
                  </div>
                ) : (
                  "Log in Account"
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <span className="text-sm text-gray-600">
                  Don’t have account ?{" "}
                  <Link
                    href="/create-account/garage"
                    className="text-[#19CA32] underline font-medium"
                  >
                    Create Account
                  </Link>
                </span>
              </div>

              {/* Resend Verification Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    const email = (
                      document.getElementById("email") as HTMLInputElement
                    )?.value;
                    if (email) {
                      openVerificationModal(email);
                    } else {
                      toast.error("Please enter your email first to verify");
                    }
                  }}
                  className="text-sm text-gray-500 hover:text-[#19CA32] hover:underline transition-all duration-200"
                >
                  Need to verify your email? Click here
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        email={verifyEmail}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </div>
  );
}
