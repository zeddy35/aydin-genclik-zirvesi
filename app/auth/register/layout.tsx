"use client";

import { Suspense } from "react";
import RegisterPageContent from "./content";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center"><p className="text-white">Yükleniyor...</p></div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
