import clsx from "clsx";

const sizeClasses = {
  default: "container",
  sm: "container-sm",
  md: "container-md",
  lg: "container-lg",
  xl: "container-xl",
  xxl: "container-xxl",
};

export function Container({
  children,
  as: Component = "div",
  fluid = false,
  size = "default",
  className,
  ...props
}) {
  return (
    <Component
      className={clsx(fluid ? "container-fluid" : sizeClasses[size], className)}
      {...props}
    >
      {children}
    </Component>
  );
}
