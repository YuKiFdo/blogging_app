import React from "react";
import { MyBlogs } from "@/components/my-blog/blog-tab";
import { Navbar } from "@/components/main/navbar/Navbar";

function page() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">My Blogs</h1>
          <MyBlogs />
        </div>
      </main>
    </div>
  );
}

export default page;
