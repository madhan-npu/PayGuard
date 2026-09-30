const fs = require('fs');

const pageCode = `'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  History,
  Send,
  Flag,
  Database,
  PlayCircle,
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';

export default function PayGuardApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [receiverUpi, setReceiverUpi] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(null);
  const [paymentError, setPaymentError] = useState('');

  const [metrics, setMetrics] = useState({
    totalTransactions: 0,
    blockedPayments: 0,
    warnings: 0,
    scamReports: 0,
    moneyProtected: 0,
    recentTransactions: [],
  });

  const [historyList, setHistoryList] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('ALL');
  const [reportsList, setReportsList] = useState([]);
  const [reportForm, setReportForm] = useState({ upiId: '', scamType: 'Fake KYC', description: '' });
  const [reportSuccess, setReportSuccess] = useState('');

  const fetchDashboardMetrics = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      setMetrics(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistory = async (filter = historyFilter) => {
    try {
      const res = await fetch('/api/transactions?filter=' + filter);
      const data = await res.json();
      setHistoryList(data.transactions || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchScamDatabase = async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      setReportsList(data.reports || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') fetchDashboardMetrics();
    if (activeTab === 'history') fetchHistory(historyFilter);
    if (activeTab === 'database') fetchScamDatabase();
  }, [activeTab, historyFilter]);

  const handleAnalyzePayment = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setPaymentError('');
    setAnalysisResult(null);
    setPaymentCompleted(null);

    try {
      const res = await fetch('/api/analyze-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverUpi, amount: Number(amount), description }),
      });
      const data = await res.json();
      if (!res.ok) setPaymentError(data.error || 'Validation failed');
      else setAnalysisResult(data);
    } catch {
      setPaymentError('Network error connecting to verification engine.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExecutePayment = async (overrideStatus) => {
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
        setPaymentCompleted(data);
        setAnalysisResult(null);
        fetchDashboardMetrics();
      } else {
        setPaymentError(data.error || 'Payment execution failed');
      }
    } catch {
      setPaymentError('Error executing transaction');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setPaymentError('');
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportForm),
      });
      if (res.ok) {
        setReportSuccess('Report registered against ' + reportForm.upiId);
        setReportForm({ upiId: '', scamType: 'Fake KYC', description: '' });
        fetchScamDatabase();
      } else {
        const d = await res.json();
        setPaymentError(d.error || 'Failed to submit report');
      }
    } catch {
      setPaymentError('Error submitting report.');
    }
  };

  const loadDemo = (upi, amt, desc) => {
    setReceiverUpi(upi);
    setAmount(amt);
    setDescription(desc);
    setAnalysisResult(null);
    setPaymentCompleted(null);
    setActiveTab('pay');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wide text-white">PayGuard</h1>
              <p className="text-xs text-cyan-400">Stop scams before you pay.</p>
            </div>
          </div>
          <nav className="flex gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'pay', label: 'Check Payment', icon: Send },
              { id: 'history', label: 'Transactions', icon: History },
              { id: 'report', label: 'Report UPI', icon: Flag },
              { id: 'database', label: 'Scam DB', icon: Database },
              { id: 'demo', label: 'Demo Mode', icon: PlayCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ' +
                    (activeTab === tab.id
                      ? 'bg-cyan-500 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800')
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400">Total Transactions</span>
                <p className="text-2xl font-bold mt-1 text-white">{metrics.totalTransactions}</p>
              </div>
              <div className="bg-slate-900 border border-red-950 p-4 rounded-xl">
                <span className="text-xs text-red-400">Blocked Payments</span>
                <p className="text-2xl font-bold mt-1 text-red-400">{metrics.blockedPayments}</p>
              </div>
              <div className="bg-slate-900 border border-amber-950 p-4 rounded-xl">
                <span className="text-xs text-amber-400">Warnings Given</span>
                <p className="text-2xl font-bold mt-1 text-amber-400">{metrics.warnings}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400">Scam Reports DB</span>
                <p className="text-2xl font-bold mt-1 text-cyan-400">{metrics.scamReports}</p>
              </div>
              <div className="col-span-2 md:col-span-1 bg-slate-900 border border-emerald-950 p-4 rounded-xl">
                <span className="text-xs text-emerald-400">Money Protected</span>
                <p className="text-2xl font-bold mt-1 text-emerald-400">
                  ₹{Number(metrics.moneyProtected || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-white">Recent Real-Time Evaluations</h3>
                <button
                  onClick={fetchDashboardMetrics}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Refresh
                </button>
              </div>
              <div className="divide-y divide-slate-800">
                {!metrics.recentTransactions || metrics.recentTransactions.length === 0 ? (
                  <p className="text-sm text-slate-500 py-3">No transactions recorded yet.</p>
                ) : (
                  metrics.recentTransactions.map((tx) => (
                    <div key={tx.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-200">{tx.receiver_upi}</p>
                        <p className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">₹{tx.amount}</p>
                        <span
                          className={
                            'text-xs px-2 py-0.5 rounded font-mono ' +
                            (tx.status === 'blocked'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : tx.risk_level === 'MEDIUM'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800')
                          }
                        >
                          {String(tx.status).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pay' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-2">Simulated UPI Transfer Verification</h2>
              <p className="text-xs text-slate-400 mb-6">
                Risk scoring executes strictly on the backend before processing.
              </p>

              {paymentError && (
                <div className="mb-4 p-3 bg-red-950/80 border border-red-800 text-red-200 text-sm rounded-lg">
                  {paymentError}
                </div>
              )}

              {paymentCompleted && (
                <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-5 w-5" /> Simulated Payment Successful
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p>Recipient: {paymentCompleted.receiver}</p>
                    <p>Amount: ₹{paymentCompleted.amount}</p>
                    <p>Risk Score: {paymentCompleted.riskScore}/100</p>
                    <p>Status: {paymentCompleted.status}</p>
                  </div>
                  <button
                    onClick={() => {
                      setPaymentCompleted(null);
                      setReceiverUpi('');
                      setAmount('');
                      setDescription('');
                    }}
                    className="mt-3 w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs"
                  >
                    Start Another Transfer
                  </button>
                </div>
              )}

              {!paymentCompleted && !analysisResult && (
                <form onSubmit={handleAnalyzePayment} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Receiver UPI ID</label>
                    <input
                      type="text"
                      placeholder="e.g. winner999@upi"
                      value={receiverUpi}
                      onChange={(e) => setReceiverUpi(e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Payment Description</label>
                    <input
                      type="text"
                      placeholder="e.g. KYC verification, Prize fee"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition"
                  >
                    {isAnalyzing ? 'Analyzing Risks on Server...' : 'Analyze Payment'}
                  </button>
                </form>
              )}

              {analysisResult && (
                <div className="space-y-5">
                  <div
                    className={
                      'p-4 rounded-xl border flex items-center justify-between ' +
                      (analysisResult.riskLevel === 'HIGH'
                        ? 'bg-red-950/40 border-red-800 text-red-200'
                        : analysisResult.riskLevel === 'MEDIUM'
                        ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                        : 'bg-emerald-950/40 border-emerald-800 text-emerald-200')
                    }
                  >
                    <div className="flex items-center gap-3">
                      {analysisResult.riskLevel === 'HIGH' && <XCircle className="h-8 w-8 text-red-400" />}
                      {analysisResult.riskLevel === 'MEDIUM' && <AlertTriangle className="h-8 w-8 text-amber-400" />}
                      {analysisResult.riskLevel === 'LOW' && <ShieldCheck className="h-8 w-8 text-emerald-400" />}
                      <div>
                        <h4 className="font-bold">Risk Level: {analysisResult.riskLevel}</h4>
                        <p className="text-xs opacity-90">
                          {analysisResult.riskLevel === 'HIGH' && 'Payment blocked for your protection.'}
                          {analysisResult.riskLevel === 'MEDIUM' && 'Please verify the receiver before continuing.'}
                          {analysisResult.riskLevel === 'LOW' && 'Payment appears safe.'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black">{analysisResult.riskScore}</span>
                      <span className="text-xs block opacity-70">/ 100</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Detected Risk Factors
                    </h5>
                    <div className="space-y-2">
                      {!analysisResult.reasons || analysisResult.reasons.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No adverse risk patterns detected.</p>
                      ) : (
                        analysisResult.reasons.map((r, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center text-xs bg-slate-950 p-2.5 rounded border border-slate-800"
                          >
                            <span className="text-slate-300">{r.reason}</span>
                            <span className="text-amber-400 font-semibold">+{r.points} pts</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    {analysisResult.riskLevel === 'LOW' && (
                      <button
                        onClick={() => handleExecutePayment('allowed')}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm"
                      >
                        Proceed with Simulated Payment
                      </button>
                    )}

                    {analysisResult.riskLevel === 'MEDIUM' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAnalysisResult(null)}
                          className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleExecutePayment('warned')}
                          className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg text-sm"
                        >
                          Continue Anyway
                        </button>
                      </div>
                    )}

                    {analysisResult.riskLevel === 'HIGH' && (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleExecutePayment('blocked')}
                          className="w-full py-2.5 bg-red-600/30 border border-red-700 hover:bg-red-600/50 text-red-200 font-medium rounded-lg text-sm"
                        >
                          Record as Blocked Transaction
                        </button>
                        <button
                          onClick={() => setAnalysisResult(null)}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                        >
                          Go Back
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-white">Simulated Transactions Ledger</h2>
              <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'BLOCKED'].map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setHistoryFilter(f);
                      fetchHistory(f);
                    }}
                    className={
                      'px-3 py-1 text-xs rounded-md transition ' +
                      (historyFilter === f
                        ? 'bg-cyan-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white')
                    }
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-xs uppercase font-medium">
                  <tr>
                    <th className="p-3">Receiver</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Risk Score</th>
                    <th className="p-3">Risk Level</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {historyList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-500">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    historyList.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-slate-300">{tx.receiver_upi}</td>
                        <td className="p-3 font-semibold">₹{Number(tx.amount).toLocaleString()}</td>
                        <td className="p-3 font-mono">{tx.risk_score}/100</td>
                        <td className="p-3">
                          <span
                            className={
                              'px-2 py-0.5 text-xs rounded ' +
                              (tx.risk_level === 'HIGH'
                                ? 'bg-red-950 text-red-400 border border-red-800'
                                : tx.risk_level === 'MEDIUM'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-800')
                            }
                          >
                            {tx.risk_level}
                          </span>
                        </td>
                        <td className="p-3 capitalize">{tx.status}</td>
                        <td className="p-3 text-slate-400 text-xs">{new Date(tx.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-2">Report Fraudulent UPI Handle</h2>
            <p className="text-xs text-slate-400 mb-4">
              Adding a report directly updates our active server risk scoring engine.
            </p>
            {reportSuccess && (
              <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs rounded">
                {reportSuccess}
              </div>
            )}
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300">UPI ID to Report</label>
                <input
                  type="text"
                  placeholder="scammer@bank"
                  value={reportForm.upiId}
                  onChange={(e) => setReportForm({ ...reportForm, upiId: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Scam Type</label>
                <select
                  value={reportForm.scamType}
                  onChange={(e) => setReportForm({ ...reportForm, scamType: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white"
                >
                  {['Fake KYC', 'Lottery Scam', 'Refund Scam', 'Investment Scam', 'Impersonation', 'Other'].map(
                    (t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Description of Scam</label>
                <textarea
                  rows={3}
                  placeholder="Describe the scam communication..."
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-red-600 hover:bg-red-500 font-semibold text-white rounded text-sm transition"
              >
                Submit Scam Report to Database
              </button>
            </form>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Live Scam Registry</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-xs uppercase font-medium">
                  <tr>
                    <th className="p-3">UPI Handle</th>
                    <th className="p-3">Total Reports</th>
                    <th className="p-3">Primary Scam Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {reportsList.map((r) => (
                    <tr key={r.id}>
                      <td className="p-3 font-mono text-cyan-400">{r.upi_id}</td>
                      <td className="p-3 font-semibold text-white">{r.report_count} reports</td>
                      <td className="p-3">
                        <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded border border-slate-700">
                          {r.scam_type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">One-Click Demonstration Presets</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  TEST 1: SAFE
                </span>
                <div className="text-xs text-slate-300 space-y-1">
                  <p><strong className="text-slate-400">Receiver:</strong> friend123@upi</p>
                  <p><strong className="text-slate-400">Amount:</strong> ₹500</p>
                  <p><strong className="text-slate-400">Description:</strong> Dinner</p>
                </div>
                <button
                  onClick={() => loadDemo('friend123@upi', '500', 'Dinner')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded"
                >
                  Load into Transfer Form
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                  TEST 2: WARNING
                </span>
                <div className="text-xs text-slate-300 space-y-1">
                  <p><strong className="text-slate-400">Receiver:</strong> randomshop@upi</p>
                  <p><strong className="text-slate-400">Amount:</strong> ₹8,000</p>
                  <p><strong className="text-slate-400">Description:</strong> Urgent refund verification</p>
                </div>
                <button
                  onClick={() => loadDemo('randomshop@upi', '8000', 'Urgent refund verification')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded"
                >
                  Load into Transfer Form
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                  TEST 3: HIGH RISK
                </span>
                <div className="text-xs text-slate-300 space-y-1">
                  <p><strong className="text-slate-400">Receiver:</strong> winner999@upi</p>
                  <p><strong className="text-slate-400">Amount:</strong> ₹25,000</p>
                  <p><strong className="text-slate-400">Description:</strong> Lottery prize KYC verification</p>
                </div>
                <button
                  onClick={() => loadDemo('winner999@upi', '25000', 'Lottery prize KYC verification')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded"
                >
                  Load into Transfer Form
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
`;

fs.writeFileSync('app/page.tsx', pageCode, 'utf8');
console.log('--- Page created successfully ---');
