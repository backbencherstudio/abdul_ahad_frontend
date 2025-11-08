"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function SubscriptionCancelPage() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/garage/subscription");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div
        className={`max-w-xl w-full transform-gpu transition-all duration-500 ease-out
          }`}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div>
            <DotLottieReact
              src="https://lottie.host/02e17ed2-86fd-4584-ad97-205457f21aab/o4mfWhRrYm.lottie"
              loop
              width={300}
              autoplay
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-red-600">Payment Cancelled</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-md">
            Your payment has been cancelled. Please try again or contact support if you have any issues.
          </p>

          <Button onClick={handleGoHome} className="mt-2 cursor-pointer bg-black hover:bg-black/90">Go to plan</Button>

        </div>
      </div>
    </div>
  );
}

