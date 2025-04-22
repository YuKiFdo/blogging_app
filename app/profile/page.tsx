'use client';
import React from 'react';

import { ConstructionIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const UnderDevelopment: React.FC = () => {
  const navigate = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-100 p-4 rounded-full">
            <ConstructionIcon className="text-yellow-600 w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Under Development</h1>
        <p className="text-gray-600 mb-6">
          This page is currently under development. Stay tuned for updates!
        </p>
        <Button onClick={() => navigate.push('/')} className="w-full bg-blue-600 text-white hover:bg-blue-700 transition duration-200">
          Go Back Home
        </Button>
      </div>
    </div>
  );
};

export default UnderDevelopment;
