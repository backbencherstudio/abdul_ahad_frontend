"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { useCreateContactMessageMutation } from "@/rtk/api/contact/contactApi";

type ContactFormValues = {
  name: string;
  email: string;
  phone_number: string;
  message: string;
};

export default function ContactUs() {
  const [createContactMessage, { isLoading }] =
    useCreateContactMessageMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      const response = await createContactMessage(data).unwrap();
      toast.success(response.message || "Form submitted successfully");
      reset();
    } catch (error: any) {
      console.error("Error submitting form:", error);
      const errorMessage = Array.isArray(error?.data?.message)
        ? error.data.message.join(", ")
        : error?.data?.message || "Failed to submit form. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] py-8">
      <div className="w-full max-w-lg rounded-lg border border-[#14A228] shadow-lg">
        <div className="bg-[#14A228] text-white p-4 rounded-t-lg">
          <h1 className="text-xl font-inder font-semibold ">Contact Us</h1>
        </div>
        <div className="p-6 bg-white rounded-b-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">
                Name
              </Label>
              <Input
                id="name"
                placeholder=""
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder=""
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Please enter a valid email address",
                  },
                })}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="phone_number"
                className="text-gray-700 font-medium"
              >
                Phone Number
              </Label>
              <Input
                id="phone_number"
                type="tel"
                placeholder=""
                {...register("phone_number", {
                  required: "Phone number is required",
                  minLength: {
                    value: 10,
                    message: "Phone number must be at least 10 digits",
                  },
                })}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              {errors.phone_number && (
                <p className="text-red-500 text-sm">
                  {errors.phone_number.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-gray-700 font-medium">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder=""
                {...register("message", {
                  required: "Message is required",
                  minLength: {
                    value: 10,
                    message: "Message must be at least 10 characters",
                  },
                })}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500 min-h-[120px] resize-none"
              />
              {errors.message && (
                <p className="text-red-500 text-sm">{errors.message.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-md mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Messages"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
