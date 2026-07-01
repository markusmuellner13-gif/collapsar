"use client";
import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export default function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition active:scale-95",
        variant === "primary" && "bg-gradient-to-r from-nebula-500 to-ember-500 text-white shadow-glow hover:brightness-110",
        variant === "secondary" && "border border-white/15 bg-white/5 text-white backdrop-blur-md hover:bg-white/10",
        variant === "ghost" && "text-white/60 hover:text-white",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
