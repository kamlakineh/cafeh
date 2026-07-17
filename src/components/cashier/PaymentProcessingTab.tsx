import React from "react";
import { 
  Calculator, CreditCard, DollarSign, Smartphone, Wallet, Split, 
  Printer, Mail, CheckCircle2, RefreshCw, X, ShieldCheck
} from "lucide-react";

interface PaymentProcessingTabProps {
  onTriggerToast: (msg: string) => void;
}

export default function PaymentProcessingTab({
  onTriggerToast
}: PaymentProcessingTabProps) {
  
  // States
  const [billAmount, setBillAmount] = React.useState<number>(84.20);
  const [paymentMethod, setPaymentMethod] = React.useState<'Cash' | 'Card' | 'Mobile Money' | 'Wallet' | 'Split'>("Cash");
  
  // MetaMask & Web3 States
  const [walletSubTab, setWalletSubTab] = React.useState<'In-App' | 'MetaMask'>("In-App");
  const [metaMaskAddress, setMetaMaskAddress] = React.useState<string | null>(null);
  const [metaMaskConnecting, setMetaMaskConnecting] = React.useState(false);
  const [metaMaskError, setMetaMaskError] = React.useState<string | null>(null);

  const connectMetaMask = async () => {
    setMetaMaskConnecting(true);
    setMetaMaskError(null);
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts.length > 0) {
          setMetaMaskAddress(accounts[0]);
          onTriggerToast("MetaMask wallet connected successfully!");
        } else {
          throw new Error("No accounts found. Please unlock MetaMask.");
        }
      } else {
        // Fallback simulation mode
        await new Promise((resolve) => setTimeout(resolve, 800));
        const mockAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
        setMetaMaskAddress(mockAddr);
        onTriggerToast("Simulating secure connection with sandbox Web3 provider...");
      }
    } catch (err: any) {
      console.error(err);
      setMetaMaskError(err.message || "Failed to connect to MetaMask");
      onTriggerToast(`MetaMask connection error: ${err.message || "Unknown error"}`);
    } finally {
      setMetaMaskConnecting(false);
    }
  };
  
  // Cash Keypad Calculator states
  const [cashInput, setCashInput] = React.useState<string>("");
  
  // Card Reader simulation
  const [cardTxState, setCardTxState] = React.useState<"idle" | "connecting" | "waiting" | "success">("idle");
  
  // Mobile money
  const [phoneNo, setPhoneNo] = React.useState<string>("");
  const [momoPin, setMomoPin] = React.useState<string>("");

  // Split payment
  const [splitCash, setSplitCash] = React.useState<number>(40.00);
  const [splitCard, setSplitCard] = React.useState<number>(44.20);

  // Email invoice
  const [emailInput, setEmailInput] = React.useState<string>("");

  const handleKeypadPress = (val: string) => {
    if (val === "C") {
      setCashInput("");
    } else if (val === "←") {
      setCashInput(prev => prev.slice(0, -1));
    } else {
      setCashInput(prev => prev + val);
    }
  };

  const handleSimulateCardPayment = () => {
    setCardTxState("connecting");
    onTriggerToast("Broadcasting settlement payload to retail card terminal...");
    setTimeout(() => {
      setCardTxState("waiting");
      onTriggerToast("Waiting for customer card insert/tap...");
      setTimeout(() => {
        setCardTxState("success");
        onTriggerToast("Transaction approved! POS auth token: #TXN-9021");
      }, 1500);
    }, 1200);
  };

  const handleCompletePayment = () => {
    onTriggerToast(`Settled transaction of $${billAmount.toFixed(2)} via ${paymentMethod}!`);
    // reset
    setCashInput("");
    setCardTxState("idle");
    setPhoneNo("");
    setMomoPin("");
    setEmailInput("");
  };

  const cashReceivedNum = Number(cashInput);
  const changeDue = cashReceivedNum >= billAmount ? cashReceivedNum - billAmount : 0;

  return (
    <div className="space-y-6" id="tactile-payment-processing">
      
      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-serif font-black text-sm text-slate-800">Operational POS terminal settlement</h3>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">Integrate card readers & mobile money API</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Tactile Settlement Selector (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <h4 className="font-serif font-black text-slate-800 text-sm">Select Settlement Instrument</h4>

          {/* Large touch icons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { id: "Cash", icon: DollarSign, color: "hover:border-emerald-500 hover:text-emerald-600" },
              { id: "Card", icon: CreditCard, color: "hover:border-blue-500 hover:text-blue-600" },
              { id: "Mobile Money", icon: Smartphone, color: "hover:border-purple-500 hover:text-purple-600" },
              { id: "Wallet", icon: Wallet, color: "hover:border-amber-500 hover:text-amber-600" },
              { id: "Split", icon: Split, color: "hover:border-slate-500 hover:text-slate-900" }
            ].map(method => {
              const IconComp = method.icon;
              const isSelected = paymentMethod === method.id;

              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    isSelected 
                      ? "bg-slate-900 border-slate-900 text-[#D4AF37] font-black shadow-lg scale-102" 
                      : `bg-slate-50/50 border-slate-200 text-slate-500 ${method.color}`
                  }`}
                >
                  <IconComp className="w-5 h-5 shrink-0" />
                  <span className="text-[10px] font-mono leading-none">{method.id}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic details form depending on method */}
          <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl min-h-[220px] flex flex-col justify-between">
            
            {/* CASH CALCULATOR KEYPAD */}
            {paymentMethod === "Cash" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">Cash settlement input</span>
                  <div className="bg-white border-2 border-slate-200 rounded-xl p-3 text-right font-mono text-lg font-black text-slate-800">
                    ${cashInput || "0.00"}
                  </div>
                  
                  {cashReceivedNum >= billAmount && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex justify-between items-center text-xs font-mono font-bold">
                      <span>Change Due:</span>
                      <span className="text-sm font-black">${changeDue.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Tactical keypad layout */}
                <div className="grid grid-cols-3 gap-1.5 text-xs font-mono font-bold">
                  {["7", "8", "9", "4", "5", "6", "1", "2", "3", "C", "0", "←"].map(k => (
                    <button
                      key={k}
                      onClick={() => handleKeypadPress(k)}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        k === "C" 
                          ? "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100" 
                          : k === "←" 
                            ? "bg-slate-100 border-slate-200 text-slate-500" 
                            : "bg-white border-slate-200 hover:border-slate-400 text-slate-700"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CARD TERMINAL SIMULATION */}
            {paymentMethod === "Card" && (
              <div className="text-center py-6 space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-blue-50 text-[#2B6CB0] rounded-full border border-blue-200">
                    <CreditCard className="w-8 h-8 animate-pulse" />
                  </div>
                </div>

                <div className="max-w-xs mx-auto space-y-2">
                  <h5 className="font-serif font-black text-slate-800 text-xs">Simulate card swipe / tap</h5>
                  
                  {cardTxState === "idle" && (
                    <button 
                      onClick={handleSimulateCardPayment}
                      className="px-4 py-2 bg-[#2B6CB0] hover:bg-blue-700 text-white font-mono font-bold text-[10px] uppercase rounded-xl transition-all"
                    >
                      Initialize Card Terminal
                    </button>
                  )}

                  {cardTxState === "connecting" && (
                    <div className="flex items-center justify-center space-x-2 text-[10px] font-mono text-slate-500">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                      <span>CONNECTING TO HARDWARE READER...</span>
                    </div>
                  )}

                  {cardTxState === "waiting" && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-amber-600 animate-pulse font-black uppercase">
                        ▲ WAITING FOR CUSTOMER PIN ENTRY...
                      </p>
                      <button 
                        onClick={() => setCardTxState("success")}
                        className="text-[9px] text-blue-500 hover:underline font-mono"
                      >
                        [ Simulate PIN Auth Success ]
                      </button>
                    </div>
                  )}

                  {cardTxState === "success" && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl font-mono text-[10px] flex items-center justify-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>TERMINAL RESPONSE: APPROVED OK (TX-890)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MOBILE MONEY API COMPONENT */}
            {paymentMethod === "Mobile Money" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-3 text-xs">
                  <h5 className="font-serif font-black text-slate-800 text-xs">Direct push notification payment</h5>
                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                    Triggers a payment consent push directly to customer phone.
                  </p>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 uppercase">Phone Number</label>
                    <input 
                      type="text" 
                      placeholder="+1 555-0199"
                      value={phoneNo}
                      onChange={(e) => setPhoneNo(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 uppercase">Push Auth PIN</label>
                    <input 
                      type="password" 
                      placeholder="••••"
                      value={momoPin}
                      onChange={(e) => setMomoPin(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DIGITAL WALLET METHOD */}
            {paymentMethod === "Wallet" && (
              <div className="space-y-4">
                {/* Internal sub-tabs */}
                <div className="flex border-b border-slate-200 text-[10px] font-mono uppercase">
                  <button
                    onClick={() => setWalletSubTab("In-App")}
                    className={`flex-1 pb-2 text-center border-b-2 font-bold transition-all ${
                      walletSubTab === "In-App" 
                        ? "border-slate-900 text-slate-800" 
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    In-App QR Wallet
                  </button>
                  <button
                    onClick={() => setWalletSubTab("MetaMask")}
                    className={`flex-1 pb-2 text-center border-b-2 font-bold transition-all ${
                      walletSubTab === "MetaMask" 
                        ? "border-slate-900 text-slate-800" 
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    MetaMask (Web3)
                  </button>
                </div>

                {walletSubTab === "In-App" ? (
                  <div className="text-center py-4 space-y-3">
                    <div className="flex justify-center">
                      <div className="p-3 bg-amber-50 text-[#D4AF37] rounded-full border border-amber-200">
                        <Wallet className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="max-w-xs mx-auto text-xs">
                      <h5 className="font-serif font-black text-slate-800">Scan customer in-app barcode</h5>
                      <p className="text-[10px] text-slate-400 font-mono mt-1 leading-relaxed">
                        Instantly charge guest's virtual wallet balance by scanning customer app barcode with counter scanning gun.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 space-y-4">
                    <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${metaMaskAddress ? "bg-green-500 animate-pulse" : "bg-amber-500 animate-pulse"}`} />
                        <span className="font-mono text-[10px] uppercase font-bold text-slate-600">
                          {metaMaskAddress ? "MetaMask: Connected" : "MetaMask: Not Connected"}
                        </span>
                      </div>
                      {metaMaskAddress && (
                        <button 
                          onClick={() => setMetaMaskAddress(null)}
                          className="text-[9px] font-mono text-rose-500 hover:underline uppercase font-bold"
                        >
                          Disconnect
                        </button>
                      )}
                    </div>

                    {metaMaskAddress ? (
                      <div className="space-y-3 text-xs bg-emerald-50/50 border border-emerald-150 p-4 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-slate-500 text-[10px]">WALLET ADDRESS:</span>
                          <span className="font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                            {metaMaskAddress.slice(0, 8)}...{metaMaskAddress.slice(-6)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                          <span>NETWORK STATUS:</span>
                          <span className="text-emerald-700 font-bold uppercase">Mainnet Synchronized</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans leading-relaxed pt-1 border-t border-slate-200">
                          Click below to confirm secure, touchless cryptographic ledger payment processing.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-4 space-y-3">
                        <p className="text-[10px] text-slate-400 font-mono leading-relaxed max-w-xs mx-auto">
                          Connect MetaMask to instantly settle bill totals via crypto gasless transfer payloads.
                        </p>
                        {metaMaskError && (
                          <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-mono rounded-lg">
                            {metaMaskError}
                          </div>
                        )}
                        <button
                          onClick={connectMetaMask}
                          disabled={metaMaskConnecting}
                          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-mono font-bold text-[10px] uppercase rounded-xl transition-all shadow-sm tracking-wider flex items-center justify-center space-x-1.5 mx-auto"
                        >
                          {metaMaskConnecting ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Requesting Accounts...</span>
                            </>
                          ) : (
                            <span>🦊 Connect MetaMask Wallet</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SPLIT BILL PAYMENT COMPONENT */}
            {paymentMethod === "Split" && (
              <div className="space-y-4 text-xs font-mono text-slate-500">
                <div className="border-b border-slate-150 pb-2">
                  <h5 className="font-serif font-black text-slate-800 text-xs">Distribute bill across instruments</h5>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400 block">Instrument 1: Cash</label>
                    <input 
                      type="number"
                      value={splitCash}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSplitCash(val);
                        setSplitCard(billAmount - val);
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400 block">Instrument 2: Card</label>
                    <input 
                      type="number"
                      value={splitCard}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSplitCard(val);
                        setSplitCash(billAmount - val);
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Complete billing footer button */}
            <button
              onClick={handleCompletePayment}
              className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 text-[#D4AF37] font-mono font-bold text-xs uppercase rounded-xl shadow-md transition-all tracking-wider"
            >
              Complete Sale Transaction
            </button>

          </div>
        </div>

        {/* Right Column: Thermal Billing Receipt Preview (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <h4 className="font-serif font-black text-slate-800 text-sm border-b border-slate-50 pb-3">Digital & thermal receipts</h4>

          {/* Receipt template container */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 p-5 rounded-2xl font-mono text-slate-600 text-[11px] space-y-4">
            
            {/* Header thermal */}
            <div className="text-center space-y-0.5 border-b border-slate-300 pb-3">
              <h5 className="font-black text-xs text-slate-800 uppercase">GourmetBite Manhattan</h5>
              <p>Branch #1 Salon Counter</p>
              <p>TEL: (555) 101-9021</p>
              <p className="text-[10px] text-slate-400">July 15, 2026 - 02:08 AM</p>
            </div>

            {/* Items table list */}
            <div className="space-y-2 border-b border-slate-300 pb-3">
              <div className="flex justify-between font-bold text-slate-800">
                <span>ITEM</span>
                <span>QTY/PRICE</span>
              </div>
              <div className="flex justify-between">
                <span>Truffle Wagyu Burger</span>
                <span>1 x $24.99</span>
              </div>
              <div className="flex justify-between">
                <span>Double Cheese Golden</span>
                <span>1 x $18.99</span>
              </div>
              <div className="flex justify-between">
                <span>Large Golden Fries</span>
                <span>2 x $10.00</span>
              </div>
            </div>

            {/* Calculation thermal */}
            <div className="space-y-1.5 border-b border-slate-300 pb-3 text-right">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>$73.98</span>
              </div>
              <div className="flex justify-between">
                <span>SALES TAX (8.0%):</span>
                <span>$10.22</span>
              </div>
              <div className="flex justify-between font-black text-slate-800 text-xs pt-1">
                <span>BILL TOTAL:</span>
                <span>${billAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="text-center text-[10px] text-slate-400 space-y-1">
              <p>Thank you for dining with us!</p>
              <p>WiFi code: GourmetBiteVIP</p>
              <p className="font-bold">*** CUSTOMER COPY ***</p>
            </div>

          </div>

          {/* Quick settlement actions */}
          <div className="space-y-3 pt-2 text-xs">
            <button 
              onClick={() => onTriggerToast("Thermal printer spooled copy successfully.")}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold rounded-xl flex items-center justify-center space-x-2 transition-all border border-slate-250"
            >
              <Printer className="w-4 h-4" />
              <span>Print Thermal Receipt</span>
            </button>

            {/* Email send input */}
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Send PDF copy to email..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-grow p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <button 
                onClick={() => {
                  if (!emailInput) return;
                  onTriggerToast(`Receipt dispatched securely to ${emailInput}!`);
                  setEmailInput("");
                }}
                className="p-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl"
              >
                <Mail className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
