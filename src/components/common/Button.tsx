import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

interface ButtonAsButton extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  to?: undefined;
  href?: undefined;
}

interface ButtonAsLink extends BaseProps {
  to: string;
  href?: undefined;
}

interface ButtonAsAnchor extends BaseProps {
  href: string;
  to?: undefined;
  target?: string;
  rel?: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

const base =
  "inline-flex items-center justify-center gap-2 font-body font-medium rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-paper hover:bg-indigo hover:-translate-y-0.5 shadow-sm hover:shadow-md dark:bg-indigo dark:text-white dark:hover:bg-indigo/90",
  secondary: "bg-surface text-ink border border-line hover:border-indigo hover:text-indigo hover:-translate-y-0.5",
  ghost: "text-ink hover:text-indigo",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

function isLinkProps(props: ButtonProps): props is ButtonAsLink {
  return typeof (props as ButtonAsLink).to === "string";
}

function isAnchorProps(props: ButtonProps): props is ButtonAsAnchor {
  return typeof (props as ButtonAsAnchor).href === "string";
}

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", children, className, icon, iconPosition = "right" } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  const content = (
    <>
      {icon && iconPosition === "left" && icon}
      {children}
      {icon && iconPosition === "right" && icon}
    </>
  );

  if (isLinkProps(props)) {
    return (
      <Link to={props.to} className={classes}>
        {content}
      </Link>
    );
  }

  if (isAnchorProps(props)) {
    return (
      <a href={props.href} target={props.target} rel={props.rel} className={classes}>
        {content}
      </a>
    );
  }

  const {
    variant: _variant,
    size: _size,
    children: _children,
    className: _className,
    icon: _icon,
    iconPosition: _iconPosition,
    to: _to,
    href: _href,
    ...rest
  } = props;

  return (
    <button className={classes} {...rest}>
      {content}
    </button>
  );
}
