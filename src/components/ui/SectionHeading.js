import clsx from "clsx";

const alignmentClasses = {
  left: "text-start",
  center: "text-center",
  right: "text-end",
};

export function SectionHeading({
  title,
  subtitle,
  alignment = "left",
  className,
  titleTag: TitleTag = "h2",
  subtitleTag: SubtitleTag = "p",
  content,
  children,
}) {
  return (
    <div className={clsx("mb-4", alignmentClasses[alignment], className)}>
      {title ? (
        <TitleTag
          className={clsx(
            "mb-2",
            alignment === "center" && "mx-auto",
            alignment === "right" && "ms-auto"
          )}
        >
          {title}
        </TitleTag>
      ) : null}
      {subtitle ? (
        <SubtitleTag
          className={clsx(
            "mb-0",
            alignment === "center" && "mx-auto",
            alignment === "right" && "ms-auto"
          )}
        >
          {subtitle}
        </SubtitleTag>
      ) : null}
      {content || children}
    </div>
  );
}
