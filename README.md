# PayGuard 🛡️ — Real-Time UPI Scam Detection & Prevention

> *"Stop scams before you pay."*

PayGuard is a simulated mobile UPI fraud detection system built to evaluate, score, and block fraudulent transactions before money leaves the sender's account.

---

## 🚀 Key Features

- **Server-Side Risk Engine**: Evaluates payment requests across multi-vector heuristics before execution.
- **Scam Registry Cross-Check (+40 pts)**: Queries reported fraudulent UPI handles.
- **Velocity & High-Value Flagging (+20 pts)**: Detects unusual high-value transfers (>₹10,000) and velocity spikes.
- **Social Engineering Keyword Heuristics (+10 pts)**: Inspects transaction notes for phishing triggers (*OTP, KYC, Lottery, Prize, Urgent, Refund*).
- **Simulated Payment Gateway**: Safe sandbox simulation preventing real-world fund loss while testing threat scenarios.
- **Dynamic Risk Responses**:
  - **0–30 (LOW)**: Transaction approved.
  - **31–60 (MEDIUM)**: Receiver verification warning with override options.
  - **61–100 (HIGH)**: Hard block protecting user funds.
- **Crowdsourced Scam Reporting**: Real-time updates to the internal SQLite database registry.
- **Live Metrics Dashboard**: Tracks total simulated transactions, blocked payments, and total money protected.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS, Lucide Icons
- **Backend**: Next.js Server Route Handlers
- **Database**: SQLite (via \`better-sqlite3\`) with automated schema migrations & seed data
- **Mobile Container**: Responsive mobile viewport container with native-style navigation

---

## ⚡ Quick Start

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/madhan-npu/PayGuard.git
   cd PayGuard
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   npm install better-sqlite3
   \`\`\`

3. **Run the local development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open \`http://localhost:3000\` in your browser or view on mobile via ngrok/local network.

---

## 🧪 Demo Test Scenarios

| Test Case | UPI ID | Amount | Purpose | Expected Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **Safe Transfer** | \`friend123@upi\` | ₹500 | Dinner | **LOW (Allowed)** |
| **Suspicious Warning** | \`randomshop@upi\` | ₹8,000 | Urgent refund verification | **MEDIUM (Warned)** |
| **High-Risk Scam** | \`winner999@upi\` | ₹25,000 | Lottery prize KYC verification | **HIGH (Blocked)** |
