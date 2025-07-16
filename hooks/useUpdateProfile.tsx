import { useState } from "react";
import { changesProfileApi } from "@/apis/auth/updateProfile";

interface UpdateProfileResult {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  mutate: (data: any) => Promise<void>;
}

export function useUpdateProfile(): UpdateProfileResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mutate = async (data: any) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await changesProfileApi(data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, success, mutate };
}
