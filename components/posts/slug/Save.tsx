import { FiBookmark } from "react-icons/fi";

interface SaveButtonProps {
  saved: boolean;
  onToggleSave: () => void;
}

export const SaveButton = ({ saved, onToggleSave }: SaveButtonProps) => {
  return (
    <button
      onClick={onToggleSave}
      className={`flex items-center space-x-1 ${saved ? "text-indigo-500" : "text-gray-500"} hover:text-indigo-500`}
    >
      <FiBookmark className="w-5 h-5" />
      <span>Save</span>
    </button>
  );
};
