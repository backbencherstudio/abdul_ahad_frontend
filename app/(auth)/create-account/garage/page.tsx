import React, { Suspense } from "react";
import GarageRegister from "../../_components/GarageRegister";
import { Loader2 } from "lucide-react";

export default function GarageCreateAccount() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#19CA32]" />
        </div>
      }
    >
      <GarageRegister />
    </Suspense>
  );
}
