import "@/styles/globals.css";
import '@/styles/instructioins.css'; // adjust your css import path accordingly
import { useEffect } from "react";
import { useRouter } from "next/router";
import { initGA, logPageView } from "../lib/ga";
export default function App({ Component, pageProps }) {

    const router = useRouter();

  useEffect(() => {
    initGA();
    logPageView(window.location.pathname);

    router.events.on("routeChangeComplete", logPageView);
    return () => {
      router.events.off("routeChangeComplete", logPageView);
    };
  }, [router.events]);
  return <Component {...pageProps} />;
}