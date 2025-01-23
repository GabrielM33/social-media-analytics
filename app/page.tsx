// This is the server component (app/page.tsx)
import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeClient />
    </Suspense>
  );
}
