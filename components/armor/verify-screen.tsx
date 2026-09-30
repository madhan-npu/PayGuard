'use client'

import { useState } from 'react'
import { AlertTriangle, Phone, ShieldX, X } from 'lucide-react'
import type { PaymentIntent, RiskResult } from '@/lib/risk'
import { Eyebrow, ScreenHeader, formatINR, initials } from './shared'

export function VerifyScreen({
  intent,
  risk,
  onBack,
  onCancel,
  onPayAnyway,
}: {
  intent: PaymentIntent
  risk: RiskResult
  onBack: () => void
  onCancel: () => void
  onPayAnyway: () => void
}) {
  const [acknowledged, setAcknowledged] = useState(false)
  const mismatch = risk.signals.some((s) => s.id === 'qr')
  const claimedName = intent.fromQr && intent.qrName ? intent.qrName : 'Unknown sender'

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader step="Step 3 · Act" title="Verify before paying" onBack={onBack} />

      <div className="flex flex-1 flex-col gap-5 px-5 pb-6">
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 backdrop-blur-xl shadow-[inset_0_1px_0_rgb(255_255_255/0.15),0_10px_30px_-12px_rgb(242_102_91/0.45)] p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
          <div>
            <p className="font-heading font-bold">{mismatch ? 'Recipient mismatch.' : 'Recipient not verified.'}</p>
            <p className="text-sm text-muted-foreground text-pretty">
              {mismatch
                ? 'The name you were shown does not match who will receive the money.'
                : 'You have never paid this account and it could not be verified.'}
            </p>
          </div>
        </div>

        <section aria-labelledby="compare-heading" className="flex flex-col gap-3">
          <Eyebrow>
            <span id="compare-heading">Who you think vs. who gets paid</span>
          </Eyebrow>
          <div className="grid grid-cols-2 gap-3">
            <PartyCard label="You were told" name={claimedName} sub={intent.fromQr ? 'From QR code' : 'From message'} />
            <PartyCard label="Money goes to" name={risk.registeredName} sub={intent.upiId} danger />
          </div>
        </section>

        <section aria-labelledby="checklist-heading" className="flex flex-col gap-3">
          <Eyebrow>
            <span id="checklist-heading">Before you continue</span>
          </Eyebrow>
          <ul className="flex flex-col gap-2 rounded-2xl glass p-4 text-sm">
            {[
              'Banks never ask you to pay to update KYC or unblock an account.',
              'Call the official number on the back of your card — not the one in the message.',
              'You never need to pay or enter a PIN to receive a refund.',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                <span className="text-pretty">{t}</span>
              </li>
            ))}
          </ul>
          <a
            href="tel:1930"
            className="flex items-center justify-center gap-2 rounded-xl glass-pill py-3 text-sm font-semibold text-primary"
          >
            <Phone className="size-4" aria-hidden />
            Report to Cyber Crime Helpline 1930
          </a>
        </section>

        <div className="mt-auto flex flex-col gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-destructive text-base font-bold uppercase tracking-[0.15em] text-destructive-foreground"
          >
            <X className="size-5" aria-hidden />
            Cancel payment
          </button>

          <label className="flex items-start gap-2.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 size-4 accent-[var(--accent)]"
            />
            I have independently verified this recipient and understand the money may not be recoverable.
          </label>
          <button
            type="button"
            disabled={!acknowledged}
            onClick={onPayAnyway}
            className="h-11 rounded-2xl glass text-sm font-semibold text-muted-foreground transition-opacity disabled:opacity-40"
          >
            Pay {formatINR(intent.amount)} anyway
          </button>
        </div>
      </div>
    </div>
  )
}

function PartyCard({ label, name, sub, danger }: { label: string; name: string; sub: string; danger?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center ${
        danger ? 'border-destructive/40 bg-destructive/10 backdrop-blur-xl shadow-[inset_0_1px_0_rgb(255_255_255/0.15),0_10px_30px_-12px_rgb(242_102_91/0.45)]' : 'glass'
      }`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
      <span
        className={`relative flex size-12 items-center justify-center rounded-full font-heading font-bold ${
          danger ? 'bg-destructive text-destructive-foreground' : 'glass-pill text-primary'
        }`}
      >
        {initials(name)}
        {danger && (
          <ShieldX className="absolute -right-1 -bottom-1 size-5 rounded-full bg-background/80 p-0.5 backdrop-blur text-destructive" aria-hidden />
        )}
      </span>
      <span className="text-sm font-bold leading-tight text-balance">{name}</span>
      <span className="w-full truncate text-[11px] text-muted-foreground">{sub}</span>
    </div>
  )
}
