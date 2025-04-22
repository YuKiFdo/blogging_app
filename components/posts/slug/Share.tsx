import { FiShare2 } from "react-icons/fi";
import { toast } from "sonner";

export const ShareButton = () => {
  const handleShare = async () => {
    const shareData = {
      title: document.title,
      text: "Check this out!",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        toast.error("Share canceled or failed.");
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied to clipboard!");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        toast.error("Failed to copy link.");
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
    >
      <FiShare2 className="w-5 h-5" />
      <span>Share</span>
    </button>
  );
};
