"use client";

import { Suspense } from "react";
import { SongsPageContent } from "./songs-page-content";

export default function SongsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <SongsPageContent />
    </Suspense>
  );
}
