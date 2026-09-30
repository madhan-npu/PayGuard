import { History, Home, QrCode, ShieldCheck, User } from 'lucide-react'

const items = [
  { label: 'Home', icon: Home, active: true },
  { label: 'History', icon: History },
  { label: 'Shield', icon: ShieldCheck },
  { label: 'Profile', icon: User },
]

export function BottomNav({ onScan }: { onScan: () => void }) {
  return (
    <nav aria-label="Primary" className="sticky bottom-0 z-10 px-4 pt-2 pb-5">
      <ul className="glass grid grid-cols-5 items-center rounded-[1.75rem] px-2 py-2">
        {items.slice(0, 2).map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
        <li className="flex justify-center">
          <button
            type="button"
            onClick={onScan}
            className="-mt-9 flex size-16 items-center justify-center rounded-full border border-white/50 bg-[radial-gradient(120%_120%_at_30%_10%,rgb(255_255_255/0.7),transparent_45%),linear-gradient(135deg,#ffd970,#f7c548_50%,#f29f3d)] text-accent-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_12px_30px_-6px_rgb(247_197_72/0.7)] transition-transform hover:scale-105 active:scale-95"
            aria-label="Scan QR to pay"
          >
            <QrCode className="size-7" aria-hidden />
          </button>
        </li>
        {items.slice(2).map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </ul>
    </nav>
  )
}

function NavItem({ label, icon: Icon, active }: { label: string; icon: typeof Home; active?: boolean }) {
  return (
    <li className="flex justify-center">
      <button
        type="button"
        aria-current={active ? 'page' : undefined}
        className={`flex w-full flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-medium transition-colors ${
          active ? 'glass-pill text-primary glow-text' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Icon className="size-5" aria-hidden />
        {label}
      </button>
    </li>
  )
}
