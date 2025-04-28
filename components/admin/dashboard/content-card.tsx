"use client";

interface ContentCardProps {
  children: React.ReactNode;
  className?: string;
}

const ContentCard = ({ children, className = "" }: ContentCardProps) => (
  <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

export default ContentCard;
