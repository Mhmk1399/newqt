"use client";

import { useEffect } from "react";
import { cleanCorruptedTokens } from "@/utilities/jwtUtils";

/**
 * TokenCleanup Component
 * Automatically cleans corrupted tokens on app initialization
 * This prevents atob() errors from malformed tokens
 */
export default function TokenCleanup() {
  useEffect(() => {
    // Run token cleanup on component mount (app initialization)
    cleanCorruptedTokens();
  }, []);

  return null; // This component doesn't render anything
}
