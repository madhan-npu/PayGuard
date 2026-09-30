const fs = require('fs');

const mobileCode = `'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, Send, 
  History, Flag, PlayCircle, Home, CheckCircle2, 
  XCircle, ChevronRight, ArrowLeft, RefreshCw 
} from 'lucide-react';

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [screen, setScreen] = useState('main'); // 'main' | 'analyzing' | 'result' | 'success'
  
  // Payment state
  const [receiverUpi, setReceiverUpi] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [riskData, setRiskData] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Dashboard & History
  const [metrics, setMetrics] = useState({
    totalTransactions: 0,
    blockedPayments: 0,
    moneyProtected: 0,
    scamReports: 0,
    recentTransactions: []
  });
  const [history, setHistory] = useState([]);
  
  // Report state
  const [reportUpi, setReportUpi] = useState('');
  const [scamType, setScamType] = useState('Fake KYC');
  const [reportNote, setReportNote] = useState('');
  const [reportMessage, setReportMessage] = useState('');

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const d = await res.json();
      setMetrics(d);
    } catch (e) { console.error(e); }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/transactions');
      const d = await res.json();
      setHistory(d.transactions || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchMetrics();
    fetchHistory();
  }, [activeTab]);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setScreen('analyzing');

    try {
      const res = await fetch('/api/analyze-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverUpi, amount: Number(amount), description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Validation error');
        setScreen('main');
        return;
      }
      setTimeout(() => {
        setRiskData(data);
        setScreen('result');
      }, 900);
    } catch {
      setErrorMessage('Server connection error');
      setScreen('main');
    }
  };

  const handlePay = async (overrideStatus) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverUpi,
          amount: Number(amount),
          description,
          statusOverride: overrideStatus,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPaymentResult(data);
        setScreen('success');
        fetchMetrics();
      } else {
        setErrorMessage(data.error || 'Failed to complete transaction');
        setScreen('main');
      }
    } catch {
      setErrorMessage('Transaction error');
      setScreen('main');
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiId: reportUpi, scamType, description: reportNote }),
      });
      if (res.ok) {
        setReportMessage('Scam handle reported to central security registry.');
        setReportUpi('');
        setReportNote('');
        fetchMetrics();
      }
    } catch {
      setReportMessage('Failed to register report.');
    }
  };

  const loadDemo = (upi, amt, desc) => {
    setReceiverUpi(upi);
    setAmount(amt);
    setDescription(desc);
    setActiveTab('pay');
    setScreen('main');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center p-0 sm:p-4">
      {/* Mobile Shell Frame */}
      <div className="w-full sm:max-w-[420px] h-[100dvh] sm:h-[840px] bg-slate-950 text-slate-100 flex flex-col sm:rounded-[40px] border border-slate-800 shadow-2xl overflow-hidden relative">
        
        {/* Mobile Status Bar */}
        <div className="pt-3 px-6 pb-2 flex justify-between items-center text-xs text-slate-400 select-none">
          <span className="font-semibold text-white">9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-5 h-2.5 border border-slate-500 rounded-sm p-0.5 flex items-center">
              <div className="h-full w-full bg-emerald-400 rounded-[1px]"></div>
            </div>
          </div>
        </div>

        {/* Top Header */}
        <header className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-cyan-600 flex items-center justify-center shadow-md shadow-cyan-600/30">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white leading-none">PayGuard</h1>
              <span className="text-[10px] text-cyan-400">UPI Fraud Shield</span>
            </div>
          </div>
          <button onClick={fetchMetrics} className="p-2 rounded-full hover:bg-slate-800 text-slate-400">
            <RefreshCw className="h-4 w-4" />
          </button>
        </header>

        {/* Mobile View Content */}
        <main className="flex-1 overflow-y-auto px-5 py-4 pb-24">
          
          {/* TAB: HOME SCREEN */}
          {activeTab === 'home' && (
            <div className="space-y-4">
              {/* Security Status Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-slate-900 border border-cyan-800/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-cyan-400">Real-Time Protection</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">Active Defense</h3>
                <p className="text-xs text-slate-400 mt-1">Simulated scanner evaluates recipient history and risk patterns.</p>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400">Scams Blocked</span>
                  <p className="text-xl font-bold text-red-400 mt-0.5">{metrics.blockedPayments || 0}</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400">Money Saved</span>
                  <p className="text-xl font-bold text-emerald-400 mt-0.5">₹{(metrics.moneyProtected || 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Primary Action Button */}
              <button 
                onClick={() => { setActiveTab('pay'); setScreen('main'); }}
                className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 rounded-2xl font-semibold text-white text-sm shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" /> Transfer & Verify Payment
              </button>

              {/* Recent Activity */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recent Transfers</h4>
                <div className="space-y-2">
                  {(!metrics.recentTransactions || metrics.recentTransactions.length === 0) ? (
                    <p className="text-xs text-slate-500 text-center py-4">No recent transactions recorded</p>
                  ) : (
                    metrics.recentTransactions.slice(0, 3).map((tx) => (
                      <div key={tx.id} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-slate-200">{tx.receiver_upi}</p>
                          <p className="text-[10px] text-slate-500">{new Date(tx.created_at).toLocaleTimeString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{tx.amount}</p>
                          <span className={"text-[10px] px-1.5 py-0.5 rounded font-mono " + (tx.status === 'blocked' ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400')}>
                            {tx.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PAY & VERIFY SCREEN */}
          {activeTab === 'pay' && (
            <div>
              {screen === 'main' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white">Simulated Payment</h3>
                  {errorMessage && <p className="p-2.5 text-xs bg-red-950/80 border border-red-800 text-red-200 rounded-lg">{errorMessage}</p>}
                  
                  <form onSubmit={handleAnalyze} className="space-y-3.5">
                    <div>
                      <label className="text-xs text-slate-300 font-medium">Receiver UPI ID</label>
                      <input 
                        type="text" 
                        placeholder="e.g. winner999@upi" 
                        value={receiverUpi}
                        onChange={(e) => setReceiverUpi(e.target.value)}
                        className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 font-medium">Amount (₹)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 5000" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 font-medium">Note / Purpose</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Prize processing, Dinner" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full py-3.5 mt-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold text-sm shadow-md"
                    >
                      Scan & Analyze Safety
                    </button>
                  </form>
                </div>
              )}

              {screen === 'analyzing' && (
                <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="relative flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin"></div>
                    <ShieldAlert className="h-8 w-8 text-cyan-400 absolute" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Analyzing Payment Risk</h3>
                    <p className="text-xs text-slate-400 mt-1">Cross-referencing database & scam signatures...</p>
                  </div>
                </div>
              )}

              {screen === 'result' && riskData && (
                <div className="space-y-4">
                  <button onClick={() => setScreen('main')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white">
                    <ArrowLeft className="h-3 w-3" /> Back
                  </button>
                  
                  <div className={"p-4 rounded-2xl border text-center " + (riskData.riskLevel === 'HIGH' ? 'bg-red-950/40 border-red-800' : riskData.riskLevel === 'MEDIUM' ? 'bg-amber-950/40 border-amber-800' : 'bg-emerald-950/40 border-emerald-800')}>
                    <div className="text-3xl font-black">{riskData.riskScore}<span className="text-sm font-normal text-slate-400">/100</span></div>
                    <p className="text-sm font-bold mt-1 tracking-wide">RISK LEVEL: {riskData.riskLevel}</p>
                    <p className="text-xs opacity-80 mt-1">
                      {riskData.riskLevel === 'HIGH' && 'Transaction flagged as dangerous.'}
                      {riskData.riskLevel === 'MEDIUM' && 'Caution: Potential risk detected.'}
                      {riskData.riskLevel === 'LOW' && 'Transaction verified as safe.'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400">Risk Assessment Breakdown:</span>
                    {riskData.reasons.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No threat signals found.</p>
                    ) : (
                      riskData.reasons.map((r, i) => (
                        <div key={i} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                          <span className="text-slate-300">{r.reason}</span>
                          <span className="text-amber-400 font-bold">+{r.points}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2">
                    {riskData.riskLevel === 'LOW' && (
                      <button onClick={() => handlePay('allowed')} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-sm text-white">
                        Proceed with Simulated Payment
                      </button>
                    )}
                    {riskData.riskLevel === 'MEDIUM' && (
                      <div className="flex gap-2">
                        <button onClick={() => setScreen('main')} className="flex-1 py-3 bg-slate-800 text-xs rounded-xl font-semibold">Cancel</button>
                        <button onClick={() => handlePay('warned')} className="flex-1 py-3 bg-amber-600 text-xs text-white rounded-xl font-semibold">Continue Anyway</button>
                      </div>
                    )}
                    {riskData.riskLevel === 'HIGH' && (
                      <div className="space-y-2">
                        <button onClick={() => handlePay('blocked')} className="w-full py-3 bg-red-600/40 border border-red-700 text-red-200 text-xs font-bold rounded-xl">
                          Record as Blocked Transaction
                        </button>
                        <button onClick={() => setScreen('main')} className="w-full py-2 bg-slate-800 text-slate-400 text-xs rounded-xl">
                          Cancel & Return
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {screen === 'success' && paymentResult && (
                <div className="py-8 space-y-4 text-center">
                  <div className="h-16 w-16 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Transfer Recorded</h3>
                    <p className="text-xs text-slate-400 mt-1">Status: {paymentResult.status.toUpperCase()}</p>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-left text-xs space-y-2">
                    <p><span className="text-slate-400">Receiver:</span> {paymentResult.receiver}</p>
                    <p><span className="text-slate-400">Amount:</span> ₹{paymentResult.amount}</p>
                    <p><span className="text-slate-400">Risk Score:</span> {paymentResult.riskScore}/100</p>
                  </div>
                  <button onClick={() => { setScreen('main'); setReceiverUpi(''); setAmount(''); setDescription(''); }} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold">
                    New Transfer
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: TRANSACTIONS HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">Transfer Ledger</h3>
              <div className="space-y-2">
                {history.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">No recorded transactions.</p>
                ) : (
                  history.map((tx) => (
                    <div key={tx.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-slate-200">{tx.receiver_upi}</p>
                        <p className="text-[10px] text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{tx.amount}</p>
                        <span className={"text-[10px] px-1.5 py-0.5 rounded font-mono " + (tx.status === 'blocked' ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400')}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: REPORT FRAUD */}
          {activeTab === 'report' && (
            <div className="space-y-3.5">
              <h3 className="text-base font-bold text-white">Report Scam UPI</h3>
              {reportMessage && <p className="p-2.5 text-xs bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl">{reportMessage}</p>}
              <form onSubmit={handleReport} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 font-medium">Suspect UPI ID</label>
                  <input 
                    type="text" 
                    placeholder="fraudster@bank"
                    value={reportUpi}
                    onChange={(e) => setReportUpi(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium">Scam Category</label>
                  <select 
                    value={scamType}
                    onChange={(e) => setScamType(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {['Fake KYC', 'Lottery Scam', 'Refund Scam', 'Investment Scam'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-medium">Notes</label>
                  <textarea 
                    rows={2}
                    placeholder="Provide details..."
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold text-white">
                  Add to Scam Registry
                </button>
              </form>
            </div>
          )}

          {/* TAB: DEMO PRESETS */}
          {activeTab === 'demo' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">One-Tap Test Presets</h3>
              <div className="space-y-2.5">
                <button 
                  onClick={() => loadDemo('friend123@upi', '500', 'Dinner')}
                  className="w-full p-3 bg-slate-900 border border-emerald-900/50 hover:border-emerald-500 rounded-xl text-left flex justify-between items-center"
                >
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Preset 1: Safe Transfer</span>
                    <p className="text-xs font-semibold text-slate-200">friend123@upi • ₹500</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>

                <button 
                  onClick={() => loadDemo('randomshop@upi', '8000', 'Urgent refund verification')}
                  className="w-full p-3 bg-slate-900 border border-amber-900/50 hover:border-amber-500 rounded-xl text-left flex justify-between items-center"
                >
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase">Preset 2: Medium Warning</span>
                    <p className="text-xs font-semibold text-slate-200">randomshop@upi • ₹8,000</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>

                <button 
                  onClick={() => loadDemo('winner999@upi', '25000', 'Lottery prize KYC verification')}
                  className="w-full p-3 bg-slate-900 border border-red-900/50 hover:border-red-500 rounded-xl text-left flex justify-between items-center"
                >
                  <div>
                    <span className="text-[10px] font-bold text-red-400 uppercase">Preset 3: High Risk / Block</span>
                    <p className="text-xs font-semibold text-slate-200">winner999@upi • ₹25,000</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            </div>
          )}

        </main>

        {/* Bottom Mobile Tab Bar */}
        <nav className="absolute bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur border-t border-slate-800 flex justify-around items-center px-2">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'pay', label: 'Pay', icon: Send },
            { id: 'history', label: 'History', icon: History },
            { id: 'report', label: 'Report', icon: Flag },
            { id: 'demo', label: 'Demo', icon: PlayCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (tab.id === 'pay') setScreen('main'); }}
                className={"flex flex-col items-center justify-center w-14 py-1 " + (isSelected ? 'text-cyan-400 font-semibold' : 'text-slate-500 hover:text-slate-300')}
              >
                <Icon className="h-5 w-5 mb-0.5" />
                <span className="text-[10px] leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
`;

fs.writeFileSync('app/page.tsx', mobileCode, 'utf8');
console.log('Mobile App UI written successfully.');
