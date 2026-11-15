import { type ReactNode } from "react";

export function Shell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1760px] px-6 sm:px-10 lg:px-16 2xl:px-20 ${className}`}>{children}</div>;
}
