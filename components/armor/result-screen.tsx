import { CheckCircle2, ShieldCheck } from 'lucide-react'
import type { PaymentIntent } from '@/lib/risk'
import { formatINR } from './shared'

export type Outcome = 'protected' | 'paid'

export function ResultScreen({
  outcome,
  intent,
  onDone,
}: {
  outcome: Outcome
  intent: PaymentIntent
  onDone: () => void
}) {
  const protectedMoney = outcome === 'protected'

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <span
        className={`flex size-28 items-center justify-center rounded-full ${
          protectedMoney ? 'bg-accent/15 text-accent' : 'bg-success/15 text-success'
        }`}
      >
        {protectedMoney ? (
          <ShieldCheck className="size-14" aria-hidden />
        ) : (
          <CheckCircle2 className="size-14" aria-hidden />
        )}
      </span>

      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {protectedMoney ? 'Payment cancelled' : 'Payment sent'}
        </p>
        <h1 className="text-3xl font-bold text-balance">
          {protectedMoney ? (
            <>
              <span className="text-accent">{formatINR(intent.amount)}</span> protected
            </>
          ) : (
            <>{formatINR(intent.amount)} paid</>
          )}
        </h1>
        <p className="text-sm text-muted-foreground text-pretty">
          {protectedMoney
            ? 'Nothing left your account. We have flagged this UPI ID to help protect others.'
            : `Sent to ${intent.upiId || 'recipient'}. Reference UPI${Date.now().toString().slice(-9)}.`}
        </p>
      </div>

      <div className="w-full rounded-2xl glass p-4 text-left text-sm">
        <p className="font-heading font-bold">Detect → Explain → Verify → Prevent</p>
        <p className="mt-1 text-muted-foreground">Intervene before the money moves.</p>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="h-14 w-full rounded-2xl glass-primary text-base font-bold text-primary-foreground"
      >
        Back to home
      </button>
    </div>
  )
}
