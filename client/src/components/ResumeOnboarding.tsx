import { useEffect } from "react";
import supabase from "../config/supabaseClient";

export default function ResumeOnboarding() {
  useEffect(() => {
    const resume = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/auth"; // force login first
        return;
      }

      // Call your backend to get onboarding link
      const res = await fetch("/api/create-onboarding-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          user_id: user.id,
          refresh_url: `${window.location.origin}/resume-onboarding`,
          return_url: `${window.location.origin}/profile-completion`,
        }),
      });

      const { url } = await res.json();
      window.location.href = url;
    };

    resume();
  }, []);

  return <p className="flex justify-center items-center h-screen text-2xl font-semibold">Resuming onboarding...</p>;
}
