import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Variant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/**
 * 统一按钮组件，保持 UI 视觉与交互状态一致。
 */
export function Button({
  children,
  variant = "secondary",
  className = "",
  ...props
}: PropsWithChildren<ButtonProps>) {
  const variantClass = variant === "primary" ? "btn-primary" : "btn-secondary";
  return (
    <button className={`${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
