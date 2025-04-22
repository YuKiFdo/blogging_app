import { FiHeart } from "react-icons/fi";

interface LikeButtonProps {
  liked: boolean;
  likeCount: number;
  onToggleLike: () => void;
}

export const LikeButton = ({ liked, likeCount, onToggleLike }: LikeButtonProps) => {
  return (
    <button
      onClick={onToggleLike}
      className={`flex items-center space-x-1 ${liked ? "text-red-500" : "text-gray-500"} hover:text-red-500`}
    >
      <FiHeart className="w-5 h-5" />
      <span>{likeCount}</span>
    </button>
  );
};
