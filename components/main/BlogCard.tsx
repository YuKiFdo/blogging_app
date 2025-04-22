import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface BlogCardProps {
  title: string;
  image: string | null;
  excerpt: string;
  author: string;
  category: string;
  tags: string;
  date: string;
  slug: string;
}

export function BlogCard({ title, image, excerpt, author, date, category, tags, slug }: BlogCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden p-0 flex flex-col h-full">
      <div className="relative w-full h-40 sm:h-48 md:h-52">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No image</span>
          </div>
        )}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
          {category}
        </div>
      </div>
      
      <div className="flex flex-col flex-grow">
        <CardHeader className="pt-4 pb-2 px-4 sm:px-6">
          <h3 className="text-lg sm:text-xl font-semibold line-clamp-2">{title}</h3>
          <div className="text-xs sm:text-sm text-muted-foreground flex flex-wrap gap-x-2">
            <span>By {author}</span>
            <span>•</span>
            <span>{new Date(date).toLocaleDateString()}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            <span className="text-blue-500">{tags}</span>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6 py-2 flex-grow">
          <div
            className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300 line-clamp-3 sm:line-clamp-4 [&_p]:mb-0 [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800 [&_ol]:list-decimal [&_ul]:list-disc [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
          
        </CardContent>
        
        <CardFooter className="px-4 sm:px-6 pb-6 border-t">
          <Link href={`/blog/${slug}`} className="text-blue-500 hover:underline text-sm font-medium">
            Read More
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
}