import supabase from "@/config/supabaseClient";
import { useCallback } from "react";

export const useSignedUrl = () => {
  const getSignedUrl = useCallback(async (path: string | null) => {
    if (!path) return null;

    const { data, error } = await supabase.storage
      .from("user-uploads")
      .createSignedUrl(path, 60 * 60 * 24); // 1 day expiration

    if (error) {
      console.error("Error generating signed URL:", error.message);
      return null;
    }

    return data?.signedUrl || null;
  }, []);

  return { getSignedUrl };
};
