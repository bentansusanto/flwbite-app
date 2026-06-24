import { EscPosEncoder } from "./escposEncoder";
import { ReceiptData } from "@/components/modules/orders/new-orders/ReceiptModal";
import { format } from "date-fns";

export async function printReceiptSerial(receiptData: ReceiptData): Promise<void> {
  const nav = navigator as any;

  if (!nav.serial) {
    throw new Error("Fitur Web Serial API tidak didukung di browser ini. Silakan gunakan Chrome/Edge di PC.");
  }

  try {
    // Request a port and open a connection
    const port = await nav.serial.requestPort();
    await port.open({ baudRate: 9600 }); // 9600 is standard for many thermal printers

    const encoder = new EscPosEncoder(false);
    
    encoder.init()
      .alignCenter()
      .boldOn()
      .textLine(receiptData.tenantName || "FLWBite POS")
      .boldOff()
      .textLine(receiptData.branchName)
      .dashedLine()
      .alignLeft()
      .row("Tanggal:", format(receiptData.date, "dd MMM yyyy HH:mm"))
      .row("Order ID:", receiptData.orderId)
      .row("Kasir:", receiptData.cashierName)
      .row("Pelanggan:", receiptData.customerName || "Walk-in")
      .dashedLine();
      
    // Items
    receiptData.items.forEach(item => {
      encoder.textLine(`${item.name} x${item.quantity}`);
      const priceFmt = "Rp " + (item.price * item.quantity).toLocaleString("id-ID");
      encoder.row("", priceFmt);
    });
    
    const fmtCurrency = (amount: number) => "Rp " + amount.toLocaleString("id-ID");

    encoder.dashedLine()
      .row("Subtotal:", fmtCurrency(receiptData.subtotal))
      .row("Tax:", fmtCurrency(receiptData.tax))
      .row("Discount:", fmtCurrency(receiptData.discount))
      .boldOn()
      .row("Total:", fmtCurrency(receiptData.total))
      .boldOff()
      .dashedLine()
      .row("Pembayaran:", receiptData.paymentMethod)
      .row("Dibayar:", fmtCurrency(receiptData.amountPaid))
      .row("Kembalian:", fmtCurrency(receiptData.change))
      .dashedLine()
      .alignCenter()
      .textLine("Terima Kasih")
      .textLine("Atas Kunjungan Anda")
      .newline()
      .newline()
      .newline()
      .newline();

    const data = encoder.encode();
    
    const writer = port.writable.getWriter();
    
    // Write data in chunks if needed, but usually serial handles arrays well
    await writer.write(data);
    
    // Allow printer to process
    await new Promise(resolve => setTimeout(resolve, 500));
    
    writer.releaseLock();
    await port.close();

  } catch (error: any) {
    console.error("Serial printing failed:", error);
    if (error.name === 'NotFoundError') {
        throw new Error("Dibatalkan oleh pengguna.");
    }
    if (error.message && error.message.includes("Failed to open serial port")) {
        throw new Error("Port sedang digunakan oleh aplikasi lain atau akses ditolak.");
    }
    throw error;
  }
}
