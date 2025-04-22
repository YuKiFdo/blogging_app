'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { MessageSquare, ThumbsUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function MobileSignInBanner() {
  const { data: session } = useSession();

  if (session) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 p-4 md:hidden shadow-lg"
    >
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span>Join the conversation</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
            <ThumbsUp className="h-4 w-4 text-primary" />
            <span>Show your support</span>
          </div>
        </div>
        <Button
          asChild
          size="sm"
          className="bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 transition-all duration-200 hover:scale-105"
        >
          <Link href="/auth/login">
            Sign In
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
