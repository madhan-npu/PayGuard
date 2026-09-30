'use client'

import { useState } from 'react'
import { Link2, MessageSquareText, QrCode, ShieldCheck, Sparkles } from 'lucide-react'
import { lookupName, scamExample, type PaymentIntent } from '@/lib/risk'
import { ScreenHeader } from './shared'

const inputClass =
  'w-full rounded-xl glass-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30'

export function PayScreen({
  initial,
  onBack,
  onSubmit,
}: {
  initial: PaymentIntent
  onBack: () => void
  onSubmit: (intent: PaymentIntent) => void
}) {
  const [form, setForm] = useState(initial)
  const [amountText, setAmountText] = useState(initial.amount ? String(initial.amount) : '')

  const update = <K extends keyof PaymentIntent>(key: K, value: PaymentIntent[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const amount = Number(amountText) || 0
  const canSubmit = form.upiId.includes('@') && amount > 0
  const resolvedName = form.upiId.includes('@') ? lookupName(form.upiId) : null

  function loadExample() {
    setForm(scamExample)
    setAmountText(String(scamExample.amount))
  }

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader step="Step 1 · Capture" title="Send money" onBack={onBack} />

      <form
        className="flex flex-1 flex-col gap-5 px-5 pb-6"
        onSubmit={(e) => {
          e.preventDefault()
          if (canSubmit) onSubmit({ ...form, amount })
        }}
      >
        <div className="flex flex-col items-center gap-1 rounded-[2rem] glass py-6">
          <label htmlFor="amount" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Amount
          </label>
          <div className="flex items-center font-heading text-5xl font-bold">
            <span className="text-muted-foreground">₹</span>
            <input
              id="amount"
              inputMode="numeric"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value.replace(/[^\d]/g, '').slice(0, 7))}
              placeholder="0"
              className="w-[6ch] bg-transparent text-center placeholder:text-muted-foreground/40 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="upi" className="text-sm font-semibold">
            Recipient UPI ID
          </label>
          <input
            id="upi"
            value={form.upiId}
            onChange={(e) => update('upiId', e.target.value)}
            placeholder="name@bank"
            autoComplete="off"
            className={inputClass}
          />
          {resolvedName && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden />
              Registered name: <span className="font-semibold text-foreground">{resolvedName}</span>
            </p>
          )}
        </div>

        <fieldset className="flex flex-col gap-3 rounded-2xl glass p-4">
          <legend className="px-1 text-sm font-semibold">
            Payment context <span className="font-normal text-muted-foreground">(optional)</span>
          </legend>

          <div className="flex flex-col gap-2">
            <label htmlFor="msg" className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <MessageSquareText className="size-4" aria-hidden />
              Paste message
            </label>
            <textarea
              id="msg"
              rows={3}
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              placeholder="SMS, WhatsApp or email asking you to pay"
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="url" className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Link2 className="size-4" aria-hidden />
              Link you received
            </label>
            <input
              id="url"
              value={form.url}
              onChange={(e) => update('url', e.target.value)}
              placeholder="https://"
              className={inputClass}
            />
          </div>

          <label className="flex items-center justify-between gap-3 rounded-xl glass-pill px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-medium">
              <QrCode className="size-4 text-primary" aria-hidden />
              Paying via scanned QR
            </span>
            <input
              type="checkbox"
              checked={form.fromQr}
              onChange={(e) => update('fromQr', e.target.checked)}
              className="size-5 accent-[var(--primary)]"
            />
          </label>

          {form.fromQr && (
            <div className="flex flex-col gap-2">
              <label htmlFor="qrName" className="text-xs font-medium text-muted-foreground">
                Name shown on QR
              </label>
              <input
                id="qrName"
                value={form.qrName}
                onChange={(e) => update('qrName', e.target.value)}
                placeholder="e.g. FreshMart Grocery"
                className={inputClass}
              />
            </div>
          )}
        </fieldset>

        <button
          type="button"
          onClick={loadExample}
          className="flex items-center justify-center gap-2 text-sm font-semibold text-accent"
        >
          <Sparkles className="size-4" aria-hidden />
          Load a real scam example
        </button>

        <div className="mt-auto flex flex-col gap-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl glass-primary text-base font-bold text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <ShieldCheck className="size-5" aria-hidden />
            Check &amp; continue
          </button>
          <p className="text-center text-xs text-muted-foreground">
            ArmorPay checks every payment before it leaves your account.
          </p>
        </div>
      </form>
    </div>
  )
}
