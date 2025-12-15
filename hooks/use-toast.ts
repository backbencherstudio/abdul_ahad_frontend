import { toast as reactToastify } from "react-toastify"

interface ToastOptions {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const toast = ({ title, description, variant = "default" }: ToastOptions) => {
    const message = title && description ? `${title}: ${description}` : title || description || ""
    
    if (variant === "destructive") {
      reactToastify.error(message)
    } else {
      reactToastify.success(message)
    }
  }

  return { toast }
}
