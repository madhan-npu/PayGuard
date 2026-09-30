import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Building2,
  Eye,
  Link2,
  QrCode,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react'
import { contacts, scamExample, type PaymentIntent } from '@/lib/risk'
import { Eyebrow, Logo, formatINR, initials } from './shared'

const transactions = [
  { name: 'FreshMart Grocery', amount: -642, time: 'Today, 10:24', status: 'safe' as const },
  { name: 'Priya Sharma', amount: 1500, time: 'Yesterday', status: 'safe' as const },
  { name: 'Unknown · refund.desk2291', amount: -24999, time: 'Mon', status: 'blocked' as const },
  { name: 'Ravi Kumar', amount: -800, time: 'Sun', status: 'safe' as const },
]

export function HomeScreen({ onPay }: { onPay: (prefill?: Partial<PaymentIntent>) => void }) {
  const actions = [
    { label: 'Scan QR', icon: QrCode, onClick: () => onPay({ fromQr: true }) },
    { label: 'Pay UPI ID', icon: Smartphone, onClick: () => onPay() },
    { label: 'Pay contact', icon: Users, onClick: () => onPay({ upiId: contacts[0].upiId }) },
    { label: 'Check link', icon: Link2, onClick: () => onPay() },
  ]

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 pt-6 pb-6">
      <header className="flex items-center justify-between">
        <Logo />
        <button
          type="button"
          className="relative flex size-10 items-center justify-center rounded-full glass-pill"
          aria-label="Notifications, 1 new"
        >
          <Bell className="size-5" aria-hidden />
          <span className="absolute top-2 right-2.5 size-2 rounded-full bg-accent" />
        </button>
      </header>

      <section aria-labelledby="balance-heading" className="glass-hero sheen rounded-[2rem] p-5">
        <div className="flex items-center justify-between">
          <p id="balance-heading" className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Total balance
          </p>
          <span className="glass-pill flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-success">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            Armor active
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <p className="glow-text font-heading text-[2.6rem] leading-none font-bold tracking-tight">₹48,260.50</p>
          <Eye className="size-5 text-muted-foreground" aria-hidden />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-muted-foreground">
          <span className="font-mono tracking-wider">HDFC •••• 4821</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden />
            jitesh@okhdfc
          </span>
        </div>
      </section>

      <section aria-label="Quick actions" className="grid grid-cols-4 gap-3">
        {actions.map(({ label, icon: Icon, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="flex flex-col items-center gap-2 text-center text-xs font-medium"
          >
            <span className="flex size-14 items-center justify-center rounded-2xl glass text-primary transition-colors hover:bg-white/10">
              <Icon className="size-6" aria-hidden />
            </span>
            {label}
          </button>
        ))}
      </section>

      <section
        aria-labelledby="demo-heading"
        className="flex items-center gap-4 rounded-2xl border border-accent/40 bg-accent/10 backdrop-blur-xl shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_10px_30px_-12px_rgb(247_197_72/0.4)] p-4"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <AlertTriangle className="size-5" aria-hidden />
        </span>
        <div className="flex-1">
          <h2 id="demo-heading" className="text-sm font-bold">
            Got a payment request by SMS?
          </h2>
          <p className="text-xs text-muted-foreground">Paste it — we check it before money moves.</p>
        </div>
        <button
          type="button"
          onClick={() => onPay(scamExample)}
          className="rounded-full bg-accent px-3.5 py-2 text-xs font-bold text-accent-foreground"
        >
          Try it
        </button>
      </section>

      <section aria-labelledby="stats-heading" className="grid grid-cols-3 divide-x divide-border rounded-2xl glass">
        <h2 id="stats-heading" className="sr-only">
          Protection this month
        </h2>
        {[
          { value: '42', label: 'Payments checked' },
          { value: '3', label: 'Scams stopped' },
          { value: '₹31.4k', label: 'Money protected', highlight: true },
        ].map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5 p-3 text-center">
            <span className={`font-heading text-xl font-bold ${s.highlight ? 'text-accent' : ''}`}>{s.value}</span>
            <span className="text-[11px] leading-tight text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </section>

      <section aria-labelledby="people-heading" className="flex flex-col gap-3">
        <Eyebrow>
          <span id="people-heading">Verified contacts</span>
        </Eyebrow>
        <ul className="flex gap-4 overflow-x-auto">
          {contacts.map((c) => (
            <li key={c.upiId}>
              <button
                type="button"
                onClick={() => onPay({ upiId: c.upiId })}
                className="flex w-16 flex-col items-center gap-1.5 text-xs"
              >
                <span className="relative flex size-14 items-center justify-center rounded-full glass-pill font-heading font-bold text-primary">
                  {initials(c.name)}
                  <ShieldCheck
                    className="absolute -right-0.5 -bottom-0.5 size-5 rounded-full bg-background/80 p-0.5 backdrop-blur text-success"
                    aria-label="Verified"
                  />
                </span>
                <span className="truncate">{c.name.split(' ')[0]}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Eyebrow>
            <span id="recent-heading">Recent activity</span>
          </Eyebrow>
          <button type="button" className="text-xs font-semibold text-primary">
            See all
          </button>
        </div>
        <ul className="flex flex-col divide-y divide-border rounded-2xl glass">
          {transactions.map((t) => (
            <li key={t.name + t.time} className="flex items-center gap-3 p-3.5">
              <span
                className={`flex size-10 items-center justify-center rounded-full ${
                  t.status === 'blocked'
                    ? 'bg-destructive/15 text-destructive'
                    : t.amount > 0
                      ? 'bg-success/15 text-success'
                      : 'glass-pill text-primary'
                }`}
              >
                {t.status === 'blocked' ? (
                  <Building2 className="size-5" aria-hidden />
                ) : t.amount > 0 ? (
                  <ArrowDownLeft className="size-5" aria-hidden />
                ) : (
                  <ArrowUpRight className="size-5" aria-hidden />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.time}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`text-sm font-bold ${
                    t.status === 'blocked' ? 'text-muted-foreground line-through' : t.amount > 0 ? 'text-success' : ''
                  }`}
                >
                  {t.amount > 0 ? '+' : '-'}
                  {formatINR(Math.abs(t.amount))}
                </span>
                {t.status === 'blocked' && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
                    Blocked by Armor
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
