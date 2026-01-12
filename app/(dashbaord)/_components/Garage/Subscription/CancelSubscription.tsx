import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCancelSubscriptionMutation,
  useAppDispatch,
  subscriptionApi,
} from "@/rtk";
import { useSubscriptionUpdate } from "@/hooks/useSubscriptionUpdate";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

interface CancelSubscriptionProps {
  currentSubscription: any;
}

export default function CancelSubscription({
  currentSubscription,
}: CancelSubscriptionProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [cancelType, setCancelType] = useState<"immediate" | "at_period_end">(
    "at_period_end"
  );
  const [reason, setReason] = useState("");
  const [cancelSubscription] = useCancelSubscriptionMutation();
  const { triggerUpdate } = useSubscriptionUpdate();

  const handleCancelSubscription = async () => {
    setIsCancelLoading(true);
    try {
      const result = await cancelSubscription({
        cancel_type: cancelType,
        reason: reason.trim() || undefined,
      }).unwrap();

      if (result.success) {
        // Show success toast with API message or fallback text
        toast.success(
          result.message ||
            (cancelType === "immediate"
              ? "Subscription cancelled immediately."
              : "Subscription will cancel at period end.")
        );

        // Close modal and reset form
        setShowCancelModal(false);
        setCancelType("at_period_end");
        setReason("");

        // Wait a moment for backend to process, then invalidate cache
        setTimeout(() => {
          // Manually invalidate cache to force immediate update
          dispatch(
            subscriptionApi.util.invalidateTags([
              "Subscription",
              "SubscriptionsMe",
            ])
          );

          // Trigger update hook
          triggerUpdate();
        }, 500);
      }
    } catch (error) {
      const err: any = error;
      const apiMessage =
        err?.data?.message?.message ||
        err?.data?.message ||
        err?.error ||
        "Failed to cancel subscription.";
      toast.error(apiMessage);
    } finally {
      setIsCancelLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowCancelModal(false);
    // Reset form when closing
    setCancelType("at_period_end");
    setReason("");
  };

  if (!currentSubscription || currentSubscription.status !== "ACTIVE") {
    return null;
  }

  return (
    <>
      {/* Cancel Subscription Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowCancelModal(true)}
          className="w-full cursor-pointer bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 py-2.5 px-6 rounded-lg font-medium transition-all duration-200 flex items-center text-sm justify-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Cancel Subscription
        </button>
      </div>

      {/* Cancel Confirmation Modal */}
      <CustomReusableModal
        isOpen={showCancelModal}
        onClose={handleCloseModal}
        title="Cancel Subscription"
        className="max-w-xl max-h-[90vh] overflow-y-auto"
        customHeader={
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Cancel Subscription
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>
          </div>
        }
      >
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Are you sure you want to cancel your subscription? You'll lose
            access to all premium features.
          </p>

          {/* Cancel Type Selection */}
          {/* <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            When would you like to cancel?
                        </label>
                        <Select
                            value={cancelType}
                            onValueChange={(value: 'immediate' | 'at_period_end') => setCancelType(value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select cancellation type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="at_period_end">At Period End</SelectItem>
                                <SelectItem value="immediate">Immediately</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="mt-2 text-xs text-gray-500">
                            {cancelType === 'at_period_end'
                                ? 'Keep access until the end of your current billing period'
                                : 'Cancel right now and lose access immediately'
                            }
                        </div>
                    </div> */}

          {/* Warning Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  Important Notice
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  {cancelType === "immediate"
                    ? "Your subscription will be cancelled immediately and you will lose access to all premium features right now."
                    : "Your subscription will remain active until the end of your current billing period."}
                </p>
              </div>
            </div>
          </div>

          {/* Reason Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for cancellation (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please let us know why you're cancelling..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg  resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {reason.length}/500 characters
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCloseModal}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <X className="w-4 h-4" />
              Keep Subscription
            </button>
            <button
              onClick={handleCancelSubscription}
              disabled={isCancelLoading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {isCancelLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Yes, Cancel
                </>
              )}
            </button>
          </div>
        </div>
      </CustomReusableModal>
    </>
  );
}
