import clsx from "clsx";

const variantClasses = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  success: "btn-success",
  warning: "btn-warning",
  danger: "btn-danger",
  light: "btn-light",
  outline: "btn-outline-primary",
  ghost: "btn-link",
};

const sizeClasses = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

export function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className,
  disabled,
  loading = false,
  loadingText,
  startIcon,
  endIcon,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={clsx(
        "btn",
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        loading && "disabled",
        className,
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          />
          {loadingText || children}
        </>
      ) : (
        <>
          {startIcon ? <span className="me-2">{startIcon}</span> : null}
          {children}
          {endIcon ? <span className="ms-2">{endIcon}</span> : null}
        </>
      )}
    </button>
  );
}
