"use client";

import AdminLoginForm from "./AdminLoginForm";
import content from "@/data/site-content.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";

export default function AdminLoginCard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
        
        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900">
            {/* Imported Font Awesome Component */}
            <FontAwesomeIcon icon={faLock} className="text-white text-xl" aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Secure access for {content.siteInfo.shopName} staff
          </p>
        </div>

        {/* Form Section */}
        <div className="mt-8">
          <AdminLoginForm />
        </div>
        
        {/* Footer Link */}
        <div className="text-center">
          <a href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            &larr; Back to public store
          </a>
        </div>
        
      </div>
    </div>
  );
}