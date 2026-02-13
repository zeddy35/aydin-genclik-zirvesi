import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useNextParam() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");

  const redirectToNext = useCallback(
    (defaultPath: string = "/dashboard") => {
      const destination = nextParam || defaultPath;
      router.push(destination);
    },
    [nextParam, router]
  );

  return { nextParam, redirectToNext };
}
