"use client";
import React, { useState } from "react";
import bgImage from "@/public/Image/register/bgImage.png";
import carImage from "@/public/Image/register/registerLargeImg.png";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useGarageRegister } from "@/hooks/useGarageRegister";
import { EmailVerificationModal } from "@/components/reusable/EmailVerificationModal";

interface FormData {
  nameOfGarage: string;
  vtsNumber: string;
  primaryContactPerson: string;
  email: string;
  contactNumber: string;
  password: string;
  agreeToTerms: boolean;
}

export default function GarageRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();
  const router = useRouter();
  const {
    registerGarage,
    isLoading,
    error,
    showVerificationModal,
    registeredEmail,
    handleVerificationSuccess,
    closeVerificationModal,
  } = useGarageRegister();

  const onVerificationSuccess = () => {
    handleVerificationSuccess();
    reset();
  };

  const onSubmit = async (data: FormData) => {
    try {
      const response = await registerGarage(data);
      toast.success(response?.message || "Account created successfully");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
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
              Let's set up your membership
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 ">
              {/* Name of Garage Field */}
              <div>
                <Label
                  htmlFor="nameOfGarage"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Name of Garage
                </Label>
                <Input
                  id="nameOfGarage"
                  placeholder="Enter garage name"
                  type="text"
                  className="mt-2 py-5 border border-[#19CA32] focus:border-[#19CA32] focus:ring-[#19CA32] text-base px-4 rounded-lg"
                  {...register("nameOfGarage", {
                    required: "Garage name is required",
                  })}
                />
                {errors.nameOfGarage && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.nameOfGarage.message}
                  </p>
                )}
              </div>

              {/* VTS Number Field */}
              <div>
                <Label
                  htmlFor="vtsNumber"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  VTS Number
                </Label>
                <Input
                  id="vtsNumber"
                  placeholder="Enter VTS number"
                  type="text"
                  className="mt-2 py-5 border border-[#19CA32] focus:border-[#19CA32] focus:ring-[#19CA32] text-base px-4 rounded-lg"
                  {...register("vtsNumber", {
                    required: "VTS number is required",
                  })}
                />
                {errors.vtsNumber && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.vtsNumber.message}
                  </p>
                )}
              </div>

              {/* Primary Contact Person Field */}
              <div>
                <Label
                  htmlFor="primaryContactPerson"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Primary Contact Person
                </Label>
                <Input
                  id="primaryContactPerson"
                  placeholder="Enter contact person name"
                  type="text"
                  className="mt-2 py-5 border border-[#19CA32] focus:border-[#19CA32] focus:ring-[#19CA32] text-base px-4 rounded-lg"
                  {...register("primaryContactPerson", {
                    required: "Primary contact person is required",
                  })}
                />
                {errors.primaryContactPerson && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.primaryContactPerson.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Email
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

              {/* Contact Number Field */}
              <div>
                <Label
                  htmlFor="contactNumber"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Contact Number
                </Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  placeholder="Enter your contact number"
                  className="mt-2 py-5 border border-[#19CA32] focus:border-[#19CA32] focus:ring-[#19CA32] text-base px-4 rounded-lg"
                  {...register("contactNumber", {
                    required: "Contact number is required",
                  })}
                />
                {errors.contactNumber && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.contactNumber.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Password
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

              {errors.agreeToTerms && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.agreeToTerms.message}
                </p>
              )}

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer bg-[#19CA32] hover:bg-[#19CA32] disabled:bg-[#19CA32]/70 disabled:cursor-not-allowed text-white py-5 rounded-lg font-medium text-base transition-all duration-200 hover:shadow-lg hover:shadow-green-500 disabled:hover:shadow-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Please wait...</span>
                  </div>
                ) : (
                  "Continue"
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <span className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login/garage"
                    className="text-[#19CA32] hover:underline font-medium"
                  >
                    Log in
                  </Link>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={closeVerificationModal}
        email={registeredEmail}
        onVerificationSuccess={onVerificationSuccess}
      />
    </div>
  );
}
