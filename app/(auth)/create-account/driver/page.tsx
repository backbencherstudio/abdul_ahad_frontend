import React, { Suspense } from "react";
import DriverRegister from "../../_components/DriverRegister";
import { Loader2 } from "lucide-react";

export default function DriverCreateAccount() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#19CA32]" />
        </div>
      }
    >
      <DriverRegister />
    </Suspense>
  );
}
