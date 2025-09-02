"use client";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Custom styles for a thin, bright cyan bar visible in both dark and light mode
const customStyle = `
#nprogress {
  pointer-events: none;
}
#nprogress .bar {
  background: #00e0ff;
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  border-radius: 0 0 2px 2px;
}
#nprogress .peg {
  box-shadow: 0 0 10px #00e0ff, 0 0 5px #00e0ff;
}
`;

export default function TopProgressBar() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      NProgress.configure({ showSpinner: false });
      NProgress.start();
      setTimeout(() => {
        NProgress.done();
      }, 200); // Simulate loading, adjust as needed
      prevPath.current = pathname;
    }
  }, [pathname]);

  return <style>{customStyle}</style>;
}
