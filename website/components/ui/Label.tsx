import { type ReactNode } from "react";

export function Label({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className={`mb-7 text-[0.95rem] font-semibold uppercase tracking-[0.32em] md:text-[1.05rem] ${dark ? "text-brand-cyan/90" : "text-brand-blue/90"}`}>
      {children}
    </p>
  );
}
