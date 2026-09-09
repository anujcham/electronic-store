import clsx from "clsx";

const variantClasses = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
  success: "bg-success text-white",
  warning: "bg-warning text-dark",
  danger: "bg-danger text-white",
  light: "bg-light text-dark",
  outline: "border border-primary text-primary bg-transparent",
};

export function Badge({
  children,
  variant = "primary",
  className,
  pill = true,
  ...props
}) {
  return (
    <span
      className={clsx(
        "badge",
        pill && "rounded-pill",
        variantClasses[variant] || variantClasses.primary,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
