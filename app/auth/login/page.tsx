'use client';

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const handleLogin = (provider: string) => {
    const signInPromise = signIn(provider, {
      callbackUrl: "/",
    });
    if (signInPromise) {
      signInPromise.then((response) => {
        if (response?.error) {
          console.error("Login failed:", response.error);
        }
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-950">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Sign in to your account</p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 dark:border-gray-700"
            onClick={() => handleLogin("google")}
          >
            <Image
              src="/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 dark:border-gray-700"
            onClick={() => handleLogin("github")}
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
