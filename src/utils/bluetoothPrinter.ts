import { EscPosEncoder } from "./escposEncoder";
import { ReceiptData } from "@/components/modules/orders/new-orders/ReceiptModal";
import { format } from "date-fns";

export async function printReceiptBluetooth(receiptData: ReceiptData): Promise<void> {
  const nav = navigator as any;

  if (!nav.bluetooth) {
    throw new Error("Web Bluetooth API is not supported in this browser. Please use Chrome on Desktop or Android.");
  }

  try {
    const commonPrinterServices = [
      '000018f0-0000-1000-8000-00805f9b34fb', // Standard BLE Printer
      'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
      '49535343-fe7d-4ae5-8fa9-9fafd205e455',
      '0000fee7-0000-1000-8000-00805f9b34fb',
      '0000ff00-0000-1000-8000-00805f9b34fb',
      '0000ae00-0000-1000-8000-00805f9b34fb',
      '0000af30-0000-1000-8000-00805f9b34fb',
      // Add standard generic services so Chrome doesn't block connection if printer UUID is hidden
      '00001800-0000-1000-8000-00805f9b34fb', // Generic Access
      '00001801-0000-1000-8000-00805f9b34fb', // Generic Attribute
      '0000180a-0000-1000-8000-00805f9b34fb'  // Device Info
    ];

    const device = await nav.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: commonPrinterServices
    });

    if (!device.gatt) throw new Error("GATT server is not available");

    const server = await device.gatt.connect();
    
    let service;
    for (const uuid of commonPrinterServices) {
      try {
        service = await server.getPrimaryService(uuid);
        if (service) break;
      } catch (e) {
        // Service not found, continue trying others
      }
    }

    if (!service) {
      throw new Error("Device tidak didukung. Printer ini mungkin tidak mendukung Bluetooth Low Energy (BLE) atau UUID service-nya belum terdaftar.");
    }
    
    const characteristics = await service.getCharacteristics();
    const writeCharacteristic = characteristics.find((c: any) => 
      c.properties.write || c.properties.writeWithoutResponse
    );

    if (!writeCharacteristic) {
      throw new Error("No writable characteristic found for printing.");
    }

    // Prepare receipt data to ESC/POS format (58mm by default)
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
      const priceFmt = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.price * item.quantity);
      encoder.row("", priceFmt);
    });
    
    const fmtCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);

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
      .cut();

    const data = encoder.encode();
    
    // Chunking to prevent MTU overflow on BLE
    const CHUNK_SIZE = 50; 
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      if (writeCharacteristic.properties.writeWithoutResponse) {
        await writeCharacteristic.writeValueWithoutResponse(chunk);
      } else {
        await writeCharacteristic.writeValue(chunk);
      }
      // Delay prevents dropping bytes
      await new Promise(r => setTimeout(r, 20));
    }

    // Disconnect politely
    device.gatt.disconnect();
  } catch (error: any) {
    console.error("Bluetooth printing failed:", error);
    if (error.message && error.message.includes("Unsupported device")) {
        throw new Error("Unsupported device. Printer Anda terdeteksi sebagai 'Classic Bluetooth' (SPP) atau Mac/Windows Anda memblokir koneksi. Web Bluetooth HANYA mendukung printer BLE (Bluetooth Low Energy).");
    } else if (error.message && error.message.includes("User cancelled")) {
        throw new Error("Dibatalkan oleh pengguna.");
    }
    throw error;
  }
}
