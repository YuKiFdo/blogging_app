"use client";

import ContentCard from "./content-card";
import { useState, useEffect } from "react";
import {
  Users,
  FileText,
  MessageSquare,
  ThumbsUp,
  CheckCircle,
  Clock,
  Award,
  TrendingUp,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface topPosts {
  mostLiked: {
    id: string;
    title: string;
    slug: string;
    imageUrl: string | null;
    excerpt: string;
    createdAt: string;
    User?: {
      name?: string | null;
      image?: string | null;
    };
    likeCount: number;
  };
  mostCommented: {
    id: string;
    title: string;
    slug: string;
    imageUrl: string | null;
    excerpt: string;
    createdAt: string;
    User?: {
      name?: string | null;
      image?: string | null;
    };
    commentCount: number;
  };
}

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  publishedPosts: number;
  unpublishedPosts: number;
}

const DashboardOverview = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [topPosts, setTopPosts] = useState<topPosts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats and top posts data
    const fetchData = async () => {
      try {
        const [statsRes, topPostsRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/stats/top-posts"),
        ]);

        const statsData = await statsRes.json();
        const topPostsData = await topPostsRes.json();

        setStats(statsData);
        setTopPosts(topPostsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Return loading state if data is not yet fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      change: "+12%",
      icon: <Users size={24} className="text-blue-500" />,
      color: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Total Posts",
      value: stats?.totalPosts || 0,
      change: "+5%",
      icon: <FileText size={24} className="text-purple-500" />,
      color: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Comments",
      value: stats?.totalComments || 0,
      change: "+18%",
      icon: <MessageSquare size={24} className="text-emerald-500" />,
      color: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Likes",
      value: stats?.totalLikes || 0,
      change: "+25%",
      icon: <ThumbsUp size={24} className="text-sky-500" />,
      color: "bg-sky-50 dark:bg-sky-900/20",
    },
    {
      title: "Published",
      value: stats?.publishedPosts || 0,
      change: "+22%",
      icon: <CheckCircle size={24} className="text-green-500" />,
      color: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Pending",
      value: stats?.unpublishedPosts || 0,
      change: "-8%",
      icon: <Clock size={24} className="text-amber-500" />,
      color: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <ContentCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Analytics Overview
          </h2>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Last 30 days
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl shadow-sm ${stat.color} border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                  {stat.icon}
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value.toLocaleString()}
                </span>
                <span
                  className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                    stat.change.startsWith("+")
                      ? "text-green-800 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
                      : "text-red-800 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ContentCard>
          <div className="flex items-center space-x-2 mb-4">
            <Award size={24} className="text-yellow-500" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Most Liked Post
            </h3>
          </div>

          {topPosts?.mostLiked ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-100 dark:border-yellow-800/30">
              {topPosts.mostLiked.imageUrl && (
                <div className="relative h-40 w-full mb-3 rounded-lg overflow-hidden">
                  <Image
                    src={topPosts.mostLiked.imageUrl}
                    alt={topPosts.mostLiked.title}
                    fill
                    className="object-cover w-full h-full"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}

              <h4 className="font-medium text-gray-900 dark:text-white text-lg mb-2 line-clamp-1">
                {topPosts.mostLiked.title}
              </h4>

              <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm line-clamp-2">
                {topPosts.mostLiked.excerpt}
              </p>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1.5">
                    {topPosts.mostLiked.User?.image ? (
                      <div className="h-6 w-6 rounded-full overflow-hidden">
                        <Image
                          src={topPosts.mostLiked.User.image}
                          alt={topPosts.mostLiked.User.name || "Author"}
                          width={24}
                          height={24}
                          className="object-cover h-full w-full"
                        />
                      </div>
                    ) : (
                      <User size={18} className="text-gray-500" />
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {topPosts.mostLiked.User?.name || "Unknown author"}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(topPosts.mostLiked.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ThumbsUp
                    size={16}
                    className="text-yellow-600 dark:text-yellow-400"
                  />
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                    {topPosts.mostLiked.likeCount} likes
                  </span>
                </div>
                <Link
                  href={`/blog/${topPosts.mostLiked.slug}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Post →
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">
              No data available
            </div>
          )}
        </ContentCard>

        <ContentCard>
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp size={24} className="text-indigo-500" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Most Commented Post
            </h3>
          </div>

          {topPosts?.mostCommented ? (
            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
              {topPosts.mostCommented.imageUrl && (
                <div className="relative h-40 w-full mb-3 rounded-lg overflow-hidden">
                  <Image
                    src={topPosts.mostCommented.imageUrl}
                    alt={topPosts.mostCommented.title}
                    fill
                    className="object-cover w-full h-full"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}

              <h4 className="font-medium text-gray-900 dark:text-white text-lg mb-2 line-clamp-1">
                {topPosts.mostCommented.title}
              </h4>

              <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm line-clamp-2">
                {topPosts.mostCommented.excerpt}
              </p>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1.5">
                    {topPosts.mostCommented.User?.image ? (
                      <div className="h-6 w-6 rounded-full overflow-hidden">
                        <Image
                          src={topPosts.mostCommented.User.image}
                          alt={topPosts.mostCommented.User.name || "Author"}
                          width={24}
                          height={24}
                          className="object-cover h-full w-full"
                        />
                      </div>
                    ) : (
                      <User size={18} className="text-gray-500" />
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {topPosts.mostCommented.User?.name || "Unknown author"}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(topPosts.mostCommented.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare
                    size={16}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                    {topPosts.mostCommented.commentCount} comments
                  </span>
                </div>
                <Link
                  href={`/blog/${topPosts.mostCommented.slug}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Post →
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">
              No data available
            </div>
          )}
        </ContentCard>
      </div>
    </div>
  );
};

export default DashboardOverview;
