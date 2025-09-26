"use client";

import { useRouter } from "next/navigation";
import { Button } from "@radix-ui/themes";
import React from "react";

export default function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter();

  return (
    <Button
      variant="soft"
      onClick={() => {
        // prefer history back; fall back to root
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
    >
      ← Back
    </Button>
  );
}