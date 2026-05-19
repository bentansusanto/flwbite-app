import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { Banknote, QrCode } from "lucide-react";
import { useState } from "react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  appliedPromotions?: { id: string; name: string; discount: number }[];
  cart: { variant_id: string; name: string; price: number; quantity: number }[];
  onConfirm: (paymentMethod: "CASH" | "QRIS", amountPaid: number) => Promise<void>;
  isLoading: boolean;
}

export const CheckoutModal = ({
  isOpen,
  onClose,
  total,
  subtotal,
  tax,
  discount,
  appliedPromotions = [],
  cart,
  onConfirm,
  isLoading
}: CheckoutModalProps) => {
  const [method, setMethod] = useState<"CASH" | "QRIS">("CASH");
  const [amountPaid, setAmountPaid] = useState<number>(total);

  const change = amountPaid - total;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const quickCashOptions = [
    total,
    50000,
    100000,
    200000,
    500000
  ].filter(val => val >= total || val === 50000 || val === 100000);

  // Remove duplicates and sort
  const uniqueOptions = Array.from(new Set(quickCashOptions)).sort((a, b) => a - b);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl w-[95%] sm:w-[90%] md:w-[85%] lg:w-full mx-auto"
    >
      <div className="flex flex-col md:flex-row gap-0 bg-white dark:bg-gray-900 overflow-y-auto md:overflow-hidden max-h-[90vh] md:max-h-none md:min-h-[500px]">
        {/* Left Side: Order Summary */}
        <div className="w-full md:w-5/12 bg-gray-50 dark:bg-gray-800/50 p-6 lg:p-7 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white">Receipt Summary</h3>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar mb-6 max-h-[250px] md:max-h-none">
            {cart.map((item) => (
              <div key={item.variant_id} className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <p className="text-[13px] font-bold text-gray-900 dark:text-white line-clamp-2">{item.name}</p>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {item.quantity} x {formatCurrency(item.price)}
                  </p>
                </div>
                <p className="text-[13px] font-bold text-gray-900 dark:text-white">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 pt-5 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <div className="flex justify-between text-[12px] font-medium text-gray-500">
              <span>Subtotal</span>
              <span className="text-gray-900 dark:text-white font-bold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[12px] font-medium text-gray-500">
              <span>Pajak</span>
              <span className="text-gray-900 dark:text-white font-bold">{formatCurrency(tax)}</span>
            </div>
            {appliedPromotions && appliedPromotions.map((ap) => (
              <div key={ap.id} className="flex justify-between text-[12px] font-medium text-emerald-600">
                <span>🏷️ {ap.name}</span>
                <span className="font-bold">-{formatCurrency(ap.discount)}</span>
              </div>
            ))}
            {discount > 0 && appliedPromotions.length === 0 && (
              <div className="flex justify-between text-[12px] font-medium text-emerald-600">
                <span>Diskon</span>
                <span className="font-bold">-{formatCurrency(discount)}</span>
              </div>
            )}
            {discount === 0 && (
              <div className="flex justify-between text-[12px] font-medium text-gray-500">
                <span>Diskon</span>
                <span className="font-bold">Rp 0</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-5 mt-1 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Pay</span>
              <span className="text-lg lg:text-xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Selection */}
        <div className="w-full md:w-7/12 p-6 lg:p-8 flex flex-col space-y-6">
          <div>
            <h2 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white">Payment Method</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">Select payment method and confirm transaction.</p>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMethod("CASH")}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                method === "CASH"
                  ? "border-indigo-600 bg-indigo-50/30 text-indigo-600 dark:border-indigo-400 dark:bg-indigo-900/10 dark:text-indigo-400"
                  : "border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-200"
              }`}
            >
              <Banknote className="w-5 h-5" />
              <span className="font-bold text-[12px]">Tunai (Cash)</span>
            </button>
            <button
              onClick={() => setMethod("QRIS")}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                method === "QRIS"
                  ? "border-indigo-600 bg-indigo-50/30 text-indigo-600 dark:border-indigo-400 dark:bg-indigo-900/10 dark:text-indigo-400"
                  : "border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-200"
              }`}
            >
              <QrCode className="w-5 h-5" />
              <span className="font-bold text-[12px]">QRIS (Digital)</span>
            </button>
          </div>

          {/* Payment Body */}
          <div className="flex-1 min-h-[280px] md:min-h-0">
            {method === "CASH" ? (
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Uang Diterima</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-300">Rp</span>
                    <input
                      type="number"
                      className="w-full pl-14 pr-6 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl font-bold text-lg lg:text-xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-gray-900 dark:text-white"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Quick Cash Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {uniqueOptions.map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmountPaid(val)}
                      className={`py-2 px-1 rounded-lg text-[11px] font-bold transition-all border ${
                        amountPaid === val
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                          : "bg-white dark:bg-gray-800 text-gray-600 border-gray-100 dark:border-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {val === total ? "Pas" : formatCurrency(val).replace(",00", "").replace("Rp", "").trim()}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest mb-0.5">Kembalian</p>
                    <p className="text-lg lg:text-xl font-bold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(Math.max(0, change))}
                    </p>
                  </div>
                  <div className="p-2.5 bg-emerald-100/50 dark:bg-emerald-800/30 rounded-lg">
                    <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-center space-y-4">
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700">
                  <QrCode className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Scan QRIS Static</p>
                  <p className="text-[11px] text-gray-500 mt-1 max-w-[240px]">
                    Pastikan pembayaran telah masuk ke rekening Anda sebelum mengkonfirmasi.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 font-bold h-11 text-xs lg:text-sm"
            >
              Batal
            </Button>
            <Button
              onClick={() => onConfirm(method, amountPaid)}
              disabled={isLoading || (method === "CASH" && amountPaid < total)}
              className="flex-[2] font-bold h-11 text-xs lg:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100"
            >
              {isLoading ? "Wait..." : "Confirm & Pay"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
