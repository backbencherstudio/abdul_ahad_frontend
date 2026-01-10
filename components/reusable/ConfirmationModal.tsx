import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  isLoading?: boolean;
}

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
}: ConfirmationModalProps) {
  const variantConfig = {
    danger: {
      icon: AlertCircle,
      iconColor: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-100",
      buttonClass: "bg-rose-600 hover:bg-rose-700 shadow-rose-200",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
      buttonClass: "bg-amber-600 hover:bg-amber-700 shadow-amber-200",
    },
    info: {
      icon: Info,
      iconColor: "text-[#19CA32]",
      bgColor: "bg-[#19CA32]/10",
      borderColor: "border-[#19CA32]/20",
      buttonClass: "bg-[#19CA32] hover:bg-[#16b82e] shadow-[#19CA32]/20",
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
      buttonClass: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && !isLoading && onClose()}
    >
      <AlertDialogContent className="max-w-[400px] p-0 overflow-hidden border-none rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          <AlertDialogHeader className="space-y-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div
                className={`p-4 rounded-2xl ${config.bgColor} ${config.borderColor} border-2 animate-bounce-subtle`}
              >
                <Icon className={`w-10 h-10 ${config.iconColor}`} />
              </div>
              <div className="space-y-2">
                <AlertDialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">
                  {title}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-500 text-base leading-relaxed">
                  {description}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <div className="mt-8 flex flex-col gap-3">
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              disabled={isLoading}
              className={`${config.buttonClass} w-full py-6 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                confirmText
              )}
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={onClose}
              disabled={isLoading}
              className="w-full py-6 text-gray-500 font-semibold bg-gray-50 hover:bg-gray-100 border-none rounded-xl transition-all duration-200 cursor-pointer"
            >
              {cancelText}
            </AlertDialogCancel>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
