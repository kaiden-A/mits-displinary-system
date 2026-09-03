import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { IconName } from "@/lib/navigation";
import { statusTone, STATUS_LABELS } from "@/lib/client-api";

export function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    arrowLeft: <path d="m11 19-7-7 7-7M4 12h16" />,
    archive: <path d="M3 7h18M5 7v13h14V7M7 4h10l1 3H6l1-3Zm2 8h6" />,
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />,
    book: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5v-12ZM4 17.5A2.5 2.5 0 0 1 6.5 15H20" />,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevronDown: <path d="m6 9 6 6 6-6" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
    circleCheck: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    circleInfo: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>,
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    download: <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 20h16" />,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
    file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
    filter: <path d="M4 5h16M7 12h10M10 19h4" />,
    folder: <path d="M3 6h7l2 2h9v10H3z" />,
    key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8m-2 4 2 2m-5-1 2 2" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    pen: <path d="m4 20 4.5-1 9.8-9.8a2.1 2.1 0 0 0-3-3L5.5 16 4 20ZM13.5 7.5l3 3" />,
    plus: <path d="M12 5v14M5 12h14" />,
    printer: <><path d="M6 9V3h12v6M6 17H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v7H6z" /></>,
    refresh: <path d="M20 11a8 8 0 0 0-14.7-4L3 10m0 0V4m0 6h6M4 13a8 8 0 0 0 14.7 4L21 14m0 0v6m0-6h-6" />,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    shield: <path d="M12 3 20 6v5c0 5.2-3.4 8.8-8 10-4.6-1.2-8-4.8-8-10V6l8-3Z" />,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
    warning: <><path d="m12 3 10 18H2L12 3Z" /><path d="M12 9v4M12 17h.01" /></>,
    x: <path d="m6 6 12 12M18 6 6 18" />,
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "gold" | "secondary" | "danger" | "ghost"; size?: "sm" | "md" }) {
  const variants = {
    primary: "bg-brand-700 text-white hover:bg-brand-800 focus-visible:ring-brand-700",
    gold: "bg-gold-500 text-brand-950 hover:bg-gold-600 focus-visible:ring-gold-500",
    secondary: "border border-brand-200 bg-white text-brand-800 hover:border-brand-400 hover:bg-brand-50 focus-visible:ring-brand-500",
    danger: "bg-danger-700 text-white hover:bg-danger-800 focus-visible:ring-danger-700",
    ghost: "text-brand-700 hover:bg-brand-50 focus-visible:ring-brand-500",
  };
  const sizes = { sm: "min-h-10 px-3 text-xs", md: "min-h-11 px-4 text-sm" };
  return (
    <button
      type="button"
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}

export function Card({ children, className = "", ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <section className={`rounded-xl border border-ink-100 bg-surface shadow-card ${className}`} {...props}>{children}</section>;
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="mb-7 flex flex-col gap-4 border-b border-ink-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-700">{eyebrow}</p> : null}
        <h1 className="font-display text-3xl font-semibold leading-tight text-brand-950 text-balance sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function StatusBadge({ status, compact = false }: { status: string; compact?: boolean }) {
  const tone = statusTone(status);
  const toneClasses = {
    green: "border-success-200 bg-success-50 text-success-800",
    gold: "border-gold-200 bg-gold-50 text-gold-800",
    red: "border-danger-200 bg-danger-50 text-danger-800",
    blue: "border-info-200 bg-info-50 text-info-800",
    neutral: "border-ink-200 bg-ink-50 text-ink-700",
  };
  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${toneClasses[tone]} ${compact ? "whitespace-nowrap" : ""}`}>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
      <span className="truncate">{STATUS_LABELS[status] || status}</span>
    </span>
  );
}

export function Alert({ tone = "info", children, className = "" }: { tone?: "info" | "success" | "warning" | "danger"; children: ReactNode; className?: string }) {
  const classes = {
    info: "border-info-200 bg-info-50 text-info-900",
    success: "border-success-200 bg-success-50 text-success-900",
    warning: "border-gold-200 bg-gold-50 text-gold-900",
    danger: "border-danger-200 bg-danger-50 text-danger-900",
  };
  return <div role={tone === "danger" ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm leading-6 ${classes[tone]} ${className}`}>{children}</div>;
}

export function EmptyState({ icon = "folder", title, description, action }: { icon?: IconName; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gold-200 bg-gold-50 text-gold-700"><Icon name={icon} /></div>
      <h2 className="font-display text-xl font-semibold text-brand-950">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-ink-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function StatCard({ label, value, helper, icon, tone = "green" }: { label: string; value: string | number; helper?: string; icon: IconName; tone?: "green" | "gold" | "blue" | "neutral" }) {
  const tones = {
    green: "bg-brand-50 text-brand-700",
    gold: "bg-gold-50 text-gold-700",
    blue: "bg-info-50 text-info-700",
    neutral: "bg-ink-50 text-ink-700",
  };
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">{label}</p>
          <p className="mt-3 font-display text-4xl font-semibold leading-none text-brand-950 tabular-nums">{value}</p>
          {helper ? <p className="mt-2 text-xs text-ink-500">{helper}</p> : null}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}><Icon name={icon} size={19} /></div>
      </div>
    </Card>
  );
}

export function PointsBadge({ points }: { points: number }) {
  return <span className="inline-flex items-center gap-1 rounded-full border border-gold-200 bg-gold-50 px-2.5 py-1 text-xs font-bold text-gold-900"><Icon name="star" size={13} />{points} mata</span>;
}

export function SectionTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="font-display text-xl font-semibold text-brand-950">{title}</h2>{description ? <p className="mt-1 text-sm text-ink-600">{description}</p> : null}</div>{action}</div>;
}

export function LoadingBlock({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-ink-100 ${className}`} />;
}

export function FieldError({ id, children }: { id: string; children?: ReactNode }) {
  return children ? <p id={id} className="mt-1.5 text-xs font-semibold text-danger-800">{children}</p> : null;
}
