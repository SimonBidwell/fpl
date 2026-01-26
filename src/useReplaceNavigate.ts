"use client";

import { usePathname, useRouter } from "next/navigation";

export const useReplaceNavigate = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (str: string, replacement: string) => {
    router.push(pathname.replace(str, replacement));
  };
};