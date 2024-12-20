import { toast } from 'sonner';

export const useToast = () => {
  const showError = (message: string) => {
    toast.error(message, {
      duration: 4000,
    });
  };

  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 3000,
    });
  };

  const showLoading = (message: string) => {
    return toast.loading(message, {
      duration: Infinity, // Will need to be manually dismissed
    });
  };

  return {
    showError,
    showSuccess,
    showLoading,
    toast, // Expose the raw toast function for custom needs
  };
};
