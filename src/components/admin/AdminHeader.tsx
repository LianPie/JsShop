"use client";

import { useAdmin } from "./AdminProvider";
import Link from "next/link";

interface AdminHeaderProps {
  user: {
    id: number;
    userName: string;
    phoneNumber: string;
    access: number;
    status: boolean;
  };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const { toggleSidebar } = useAdmin();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden mr-4 p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          aria-label="Toggle sidebar"
        >
          {/* Simple Hamburger SVG */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <Link 
          href="/" 
          className="text-sm text-gray-500 hover:text-gray-900 underline-offset-4 hover:underline"
        >
          View Store
        </Link>
        
        <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center overflow-hidden">
          
        </div>
      </div>
    </header>
  );
}