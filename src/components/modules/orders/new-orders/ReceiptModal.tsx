"use client";

import React, { useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { Printer, Bluetooth, X } from "lucide-react";
import { format } from "date-fns";
import { printReceiptBluetooth } from "@/utils/bluetoothPrinter";
import { printReceiptSerial } from "@/utils/serialPrinter";
import { toast } from "sonner";

export interface ReceiptData {
  orderId: string;
  cashierName: string;
  branchName: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: "CASH" | "QRIS";
  amountPaid: number;
  change: number;
  date: Date;
  tenantName: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ReceiptData | null;
}

export const ReceiptModal = ({ isOpen, onClose, receiptData }: ReceiptModalProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isPrintingBt, setIsPrintingBt] = useState(false);

  if (!receiptData) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleBluetoothPrint = async () => {
    if (!receiptData) return;
    setIsPrintingBt(true);
    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Mobile Chrome only supports Web Bluetooth (BLE only)
        await printReceiptBluetooth(receiptData);
      } else {
        // Desktop Chrome: Web Bluetooth blocks SPP (Classic BT), so we fallback to Web Serial
        // which works perfectly for both USB and Classic Bluetooth that maps to COM ports.
        const nav = navigator as any;
        if (nav.serial) {
          await printReceiptSerial(receiptData);
        } else {
          await printReceiptBluetooth(receiptData);
        }
      }
      toast.success("Berhasil mencetak");
    } catch (error: any) {
      toast.error("Gagal mencetak: " + (error.message || "Pastikan perangkat aktif"));
    } finally {
      setIsPrintingBt(false);
    }
  };

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    // Create a hidden iframe instantly
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    // Use modern sans-serif for a clean, enterprise look (like Moka/Majoo)
    doc.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            @page { 
              margin: 0; 
            }
            body { 
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
              margin: 0; 
              padding: 0; 
              font-size: 12px;
              color: #000;
              background: #fff;
              line-height: 1.4;
              width: 58mm;
            }
            * {
              box-sizing: border-box;
            }
            .receipt-wrapper { 
              width: 100%; 
              padding: 8px;
              margin: 0; 
            }
            
            /* Clean typography and spacing */
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: 600; }
            .uppercase { text-transform: uppercase; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            
            .text-\\[10px\\] { font-size: 10px; }
            .text-\\[8px\\] { font-size: 8px; }
            .text-xs { font-size: 12px; }
            .text-sm { font-size: 14px; font-weight: 700; }
            .text-xl { font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
            
            .mb-0\\.5 { margin-bottom: 2px; }
            .mb-1 { margin-bottom: 4px; }
            .mb-3 { margin-bottom: 12px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-5 { margin-bottom: 20px; }
            
            .my-3 { margin-top: 12px; margin-bottom: 12px; }
            .mt-2 { margin-top: 8px; }
            .mt-6 { margin-top: 24px; }
            .pt-2 { padding-top: 8px; }
            .pr-2 { padding-right: 8px; }
            
            .space-y-1 > * + * { margin-top: 4px; }
            .space-y-1\\.5 > * + * { margin-top: 6px; }
            .space-y-3 > * + * { margin-top: 12px; }
            .space-y-4 > * + * { margin-top: 16px; }
            
            /* Crisp borders for thermal look */
            .divider-dashed {
              border-top: 1px dashed #000;
              margin: 12px 0;
            }
            .border-top-dashed {
              border-top: 1px dashed #000;
            }
            
            .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .max-w-\\[120px\\] { max-width: 120px; }
            .tracking-\\[0\\.2em\\] { letter-spacing: 0.2em; }
            
            svg { display: block; margin: 0 auto; }
            
            /* Reset specific screen styles */
            #printable-receipt {
              box-shadow: none !important;
              clip-path: none !important;
              padding-bottom: 0 !important;
            }
          </style>
        </head>
        <body>
          <div class="receipt-wrapper">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Print immediately without arbitrary delays
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error(e);
    } finally {
      // Delay cleanup to ensure print dialog successfully hooks onto the iframe
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-[95%] mx-auto print:hidden">
      <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header - Not printed */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Payment Successful
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Container - Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-100 dark:bg-gray-950 flex justify-center">
          
          {/* Actual Receipt - This is what gets printed */}
          <div 
            id="printable-receipt"
            ref={receiptRef}
            className="w-full max-w-[320px] bg-white text-black p-6 shadow-sm font-mono text-xs relative overflow-hidden"
            style={{ 
              fontFamily: "'Courier New', Courier, monospace",
              /* Zig-zag bottom border simulation for screen */
              clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), 95% 100%, 90% calc(100% - 10px), 85% 100%, 80% calc(100% - 10px), 75% 100%, 70% calc(100% - 10px), 65% 100%, 60% calc(100% - 10px), 55% 100%, 50% calc(100% - 10px), 45% 100%, 40% calc(100% - 10px), 35% 100%, 30% calc(100% - 10px), 25% 100%, 20% calc(100% - 10px), 15% 100%, 10% calc(100% - 10px), 5% 100%, 0 calc(100% - 10px))",
              paddingBottom: "30px"
            }}
          >
            {/* Store Info */}
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold uppercase mb-1">{receiptData.tenantName}</h1>
              <p className="text-[10px]">{receiptData.branchName}</p>
            </div>

            {/* Divider */}
            <div className="divider-dashed"></div>

            {/* Meta Data */}
            <div className="mb-3 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{format(receiptData.date, "dd/MM/yyyy HH:mm")}</span>
              </div>
              <div className="flex justify-between">
                <span>Receipt:</span>
                <span>#{receiptData.orderId.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{receiptData.cashierName}</span>
              </div>
              {receiptData.customerName && receiptData.customerName !== "Customer" && (
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="truncate max-w-[120px] text-right">{receiptData.customerName}</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="divider-dashed"></div>

            {/* Items */}
            <div className="space-y-3 mb-3">
              {receiptData.items.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between font-bold mb-0.5">
                    <span className="truncate pr-2">{item.name}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>{item.quantity} x {formatCurrency(item.price).replace("Rp", "").trim()}</span>
                    <span>{formatCurrency(item.price * item.quantity).replace("Rp", "").trim()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="divider-dashed"></div>

            {/* Totals */}
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(receiptData.subtotal).replace("Rp", "").trim()}</span>
              </div>
              {receiptData.tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(receiptData.tax).replace("Rp", "").trim()}</span>
                </div>
              )}
              {receiptData.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-{formatCurrency(receiptData.discount).replace("Rp", "").trim()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-top-dashed">
                <span>TOTAL</span>
                <span>{formatCurrency(receiptData.total)}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="divider-dashed"></div>
            <div className="space-y-1.5 mb-5">
              <div className="flex justify-between">
                <span>Payment</span>
                <span>{receiptData.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid</span>
                <span>{formatCurrency(receiptData.amountPaid).replace("Rp", "").trim()}</span>
              </div>
              <div className="flex justify-between">
                <span>Change</span>
                <span>{formatCurrency(receiptData.change).replace("Rp", "").trim()}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 space-y-4">
              <p className="font-bold uppercase text-[10px]">Thank You For Coming!</p>
              
              {/* Fake Barcode */}
              <div className="flex justify-center">
                <svg width="180" height="40" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="180" height="40" fill="white"/>
                  {Array.from({ length: 40 }).map((_, i) => (
                    <rect 
                      key={i} 
                      x={i * 4 + (Math.random() > 0.5 ? 2 : 0)} 
                      y="0" 
                      width={Math.random() > 0.5 ? 2 : 1} 
                      height="40" 
                      fill="black"
                    />
                  ))}
                </svg>
              </div>
              <p className="text-[8px] tracking-[0.2em]">{receiptData.orderId.substring(0, 12).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions - Not printed */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-2 bg-white dark:bg-gray-900 flex-wrap">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 font-bold h-11 min-w-[120px]"
          >
            Selesai
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex-1 font-bold h-11 min-w-[120px] flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Browser
          </Button>
          <Button
            onClick={handleBluetoothPrint}
            disabled={isPrintingBt}
            className="w-full font-bold h-11 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-2 mt-1"
          >
            {isPrintingBt ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Menghubungkan...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Bluetooth className="w-4 h-4" />
                Print with Bluetooth
              </span>
            )}
          </Button>
        </div>
      </div>

    </Modal>
  );
};
