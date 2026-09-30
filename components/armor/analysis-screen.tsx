import { Check, ShieldAlert, ShieldCheck } from 'lucide-react'
import type { PaymentIntent, RiskLevel, RiskResult } from '@/lib/risk'
import { Eyebrow, ScreenHeader, formatINR } from './shared'

const levelStyle: Record<RiskLevel, { text: string; stroke: string; badge: string }> = {
  Low: { text: 'text-success', stroke: 'var(--success)', badge: 'bg-success text-success-foreground' },
  Medium: { text: 'text-primary', stroke: 'var(--primary)', badge: 'bg-primary text-primary-foreground' },
  High: { text: 'text-accent', stroke: 'var(--accent)', badge: 'bg-accent text-accent-foreground' },
  Critical: { text: 'text-destructive', stroke: 'var(--destructive)', badge: 'bg-destructive text-destructive-foreground' },
}

const pipeline = ['Payment intent', 'Signal analysis', 'Context enrichment', 'Risk decision']

export function AnalysisScreen({
  intent,
  risk,
  onBack,
  onVerify,
  onPay,
  onCancel,
}: {
  intent: PaymentIntent
  risk: RiskResult
  onBack: () => void
  onVerify: () => void
  onPay: () => void
  onCancel: () => void
}) {
  const style = levelStyle[risk.level]
  const safe = risk.level === 'Low'
  const radius = 70
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader step="Step 2 · Decide" title="Risk analysis" onBack={onBack} />

      <div className="flex flex-1 flex-col gap-5 px-5 pb-6">
        <section
          aria-labelledby="score-heading"
          className="flex flex-col items-center gap-3 rounded-[2rem] glass px-5 py-6"
        >
          <h2 id="score-heading" className="sr-only">
            Risk score
          </h2>
          <div className="relative size-44">
            <svg viewBox="0 0 160 160" className="size-full -rotate-90" aria-hidden>
              <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--secondary)" strokeWidth="12" />
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={style.stroke}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - Math.max(risk.score, 3) / 100)}
                className="transition-[stroke-dashoffset] duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-heading text-5xl font-bold ${style.text}`}>{risk.score}</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${style.badge}`}>
            {risk.level} risk
          </span>
          <p className="text-center text-sm text-muted-foreground text-pretty">
            {safe ? (
              <>No warning signs found for this payment.</>
            ) : (
              <>
                <span className="font-semibold text-foreground">{risk.signals.length} signals combined.</span> Alone
                they look harmless — together they signal an attack.
              </>
            )}
          </p>
          <div className="flex w-full items-center justify-between rounded-xl glass-pill px-4 py-3 text-sm">
            <span className="truncate text-muted-foreground">{intent.upiId}</span>
            <span className="font-heading font-bold">{formatINR(intent.amount)}</span>
          </div>
        </section>

        <section aria-labelledby="engine-heading" className="flex flex-col gap-3">
          <Eyebrow>
            <span id="engine-heading">One engine</span>
          </Eyebrow>
          <ol className="flex items-center gap-1.5">
            {pipeline.map((step) => (
              <li key={step} className="flex flex-1 flex-col items-center gap-1.5 text-center">
                <span className="flex h-1.5 w-full rounded-full bg-primary" />
                <span className="text-[10px] leading-tight text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {!safe && (
          <section aria-labelledby="why-heading" className="flex flex-col gap-3">
            <Eyebrow>
              <span id="why-heading">Why we paused this</span>
            </Eyebrow>
            <ul className="flex flex-col divide-y divide-border rounded-2xl glass">
              {risk.signals.map((s) => (
                <li key={s.id} className="flex items-start gap-3 p-3.5">
                  <span className="mt-0.5 rounded-md glass-pill px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {s.source}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{s.label}</p>
                    <p className="text-xs text-muted-foreground text-pretty">{s.detail}</p>
                  </div>
                  <span className="font-heading text-sm font-bold text-accent">+{s.points}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {safe && (
          <ul className="flex flex-col gap-2 rounded-2xl glass p-4 text-sm">
            {['Recipient is a known contact', 'Amount matches your usual pattern', 'No suspicious message or link'].map(
              (t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-4 text-success" aria-hidden />
                  {t}
                </li>
              ),
            )}
          </ul>
        )}

        <div className="mt-auto flex flex-col gap-2">
          {safe ? (
            <button
              type="button"
              onClick={onPay}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl glass-primary text-base font-bold text-primary-foreground"
            >
              <ShieldCheck className="size-5" aria-hidden />
              Pay {formatINR(intent.amount)}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onVerify}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-accent text-base font-bold text-accent-foreground"
              >
                <ShieldAlert className="size-5" aria-hidden />
                Verify recipient
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex h-12 items-center justify-center rounded-2xl glass text-sm font-semibold"
              >
                Cancel payment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
