import { FiMessageSquare } from "react-icons/fi";

interface CommentButtonProps {
  commentCount: number;
}

export const CommentButton = ({ commentCount }: CommentButtonProps) => {
  return (
    <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
      <FiMessageSquare className="w-5 h-5" />
      <span>{commentCount}</span>
    </button>
  );
};
