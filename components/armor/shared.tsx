import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="flex size-8 items-center justify-center rounded-xl glass-primary">
        <ShieldCheck className="size-4.5" aria-hidden />
      </span>
      <span className="font-heading text-lg font-bold tracking-tight">ArmorPay</span>
    </div>
  )
}

export function ScreenHeader({ title, step, onBack }: { title: string; step?: string; onBack: () => void }) {
  return (
    <header className="flex items-center gap-3 px-5 pt-6 pb-4">
      <button
        type="button"
        onClick={onBack}
        className="flex size-10 items-center justify-center rounded-full glass-pill text-foreground transition-colors hover:bg-white/15"
        aria-label="Go back"
      >
        <ArrowLeft className="size-5" aria-hidden />
      </button>
      <div className="flex flex-col">
        {step && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{step}</span>
        )}
        <h1 className="text-lg font-bold leading-tight">{title}</h1>
      </div>
    </header>
  )
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{children}</p>
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function formatINR(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}
