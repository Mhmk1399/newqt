import toast from "react-hot-toast";

interface CallConfig {
  phoneNumber?: string;
}

class CallManager {
  private defaultPhoneNumber = "+98-2166958702"; // Your default number

  public makeCall = (config: CallConfig = {}) => {
    const { phoneNumber = this.defaultPhoneNumber } = config;

    this.executeCall(phoneNumber);
  };

  private executeCall = (phoneNumber: string) => {
    try {
      const isMobile = this.isMobileDevice();

      if (isMobile) {
        window.location.href = `tel:${phoneNumber}`;
      } else {
        this.handleDesktopCall(phoneNumber);
      }
    } catch (error) {
      console.error("مشکلی در برقراری تماس به وجود آمده است:", error);
      this.showErrorMessage();
    }
  };

  private handleDesktopCall = async (phoneNumber: string) => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      this.showSuccessMessage(phoneNumber);
    } catch (error) {
      // Fallback for older browsers
      this.fallbackCopyToClipboard(phoneNumber);
    }
  };

  private fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    this.showSuccessMessage(text);
  };

  private isMobileDevice = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  private showSuccessMessage = (phoneNumber: string) => {
    // You can replace this with a toast notification
    toast.success(`شماره تلفن کپی شد: ${phoneNumber}`);
  };

  private showErrorMessage = () => {
    toast.error("خطا در برقراری تماس. لطفاً دوباره تلاش کنید.");
  };
}

// Export singleton instance
export const callManager = new CallManager();

// Export simple function for direct use
export const makeCall = callManager.makeCall;
