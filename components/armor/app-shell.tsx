'use client'

import { useState } from 'react'
import { analyzeIntent, emptyIntent, type PaymentIntent, type RiskResult } from '@/lib/risk'
import { HomeScreen } from './home-screen'
import { PayScreen } from './pay-screen'
import { AnalysisScreen } from './analysis-screen'
import { VerifyScreen } from './verify-screen'
import { ResultScreen, type Outcome } from './result-screen'
import { BottomNav } from './bottom-nav'

type Screen = 'home' | 'pay' | 'analysis' | 'verify' | 'result'

export function AppShell() {
  const [screen, setScreen] = useState<Screen>('home')
  const [intent, setIntent] = useState<PaymentIntent>(emptyIntent)
  const [risk, setRisk] = useState<RiskResult | null>(null)
  const [outcome, setOutcome] = useState<Outcome>('protected')

  function startPayment(prefill?: Partial<PaymentIntent>) {
    setIntent({ ...emptyIntent, ...prefill })
    setScreen('pay')
  }

  function runCheck(next: PaymentIntent) {
    setIntent(next)
    setRisk(analyzeIntent(next))
    setScreen('analysis')
  }

  function finish(result: Outcome) {
    setOutcome(result)
    setScreen('result')
  }

  function goHome() {
    setIntent(emptyIntent)
    setRisk(null)
    setScreen('home')
  }

  return (
    <div className="min-h-dvh bg-[#060d33] sm:flex sm:items-center sm:justify-center sm:py-8">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[420px] flex-col overflow-hidden bg-background sm:min-h-[860px] sm:rounded-[2.75rem] sm:border sm:border-white/15 sm:shadow-[0_40px_120px_-30px_rgb(126_166_245/0.45),inset_0_1px_0_rgb(255_255_255/0.2)]">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="orb -top-24 -left-20 size-80 bg-[#7ea6f5]/45" />
          <div className="orb top-40 -right-24 size-72 bg-[#9a8cff]/40 [animation-delay:-6s]" />
          <div className="orb top-[55%] -left-16 size-64 bg-[#3ee0d0]/20 [animation-delay:-12s]" />
          <div className="orb bottom-10 right-0 size-56 bg-[#f7c548]/20 [animation-delay:-3s]" />
          <div className="grid-backdrop absolute inset-0" />
        </div>
        <main className="relative flex flex-1 flex-col">
          {screen === 'home' && <HomeScreen onPay={startPayment} />}
          {screen === 'pay' && <PayScreen initial={intent} onBack={goHome} onSubmit={runCheck} />}
          {screen === 'analysis' && risk && (
            <AnalysisScreen
              intent={intent}
              risk={risk}
              onBack={() => setScreen('pay')}
              onVerify={() => setScreen('verify')}
              onPay={() => finish('paid')}
              onCancel={() => finish('protected')}
            />
          )}
          {screen === 'verify' && risk && (
            <VerifyScreen
              intent={intent}
              risk={risk}
              onBack={() => setScreen('analysis')}
              onCancel={() => finish('protected')}
              onPayAnyway={() => finish('paid')}
            />
          )}
          {screen === 'result' && <ResultScreen outcome={outcome} intent={intent} onDone={goHome} />}
        </main>
        {screen === 'home' && <BottomNav onScan={() => startPayment({ fromQr: true })} />}
      </div>
    </div>
  )
}
