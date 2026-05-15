import { useFormik } from "formik";
import { transactionFilterSchema, TransactionFilterValues } from "./schema";
import { validateWithZod } from "@/utils/formik-zod";

export const useTransactionFilters = (onFilter: (values: TransactionFilterValues) => void) => {
  const formik = useFormik<TransactionFilterValues>({
    initialValues: {
      start_date: "",
      end_date: "",
      status: "",
      payment_method: "",
      branch_id: "",
      search: "",
    },
    validate: validateWithZod(transactionFilterSchema),
    onSubmit: (values) => {
      onFilter(values);
    },
  });

  return formik;
};

export const useTransactionActions = () => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handlePrintReceipt = (trx: any) => {
    if (!trx) return;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    const receiptHtml = `
      <html>
        <head>
          <title>Receipt - ${trx.id}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 72mm; 
              padding: 4mm;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .header { margin-bottom: 15px; }
            .store-name { font-size: 18px; font-weight: bold; margin-bottom: 2px; }
            .table { width: 100%; border-collapse: collapse; }
            .footer { margin-top: 20px; font-size: 10px; }
            .item-row td { vertical-align: top; padding-bottom: 4px; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header center">
            <div class="store-name">FLWBITE POS</div>
            <div>${trx.branch}</div>
            <div>Jl. Sudirman No. 123, Jakarta</div>
            <div>Telp: (021) 555-0123</div>
          </div>

          <div class="divider"></div>
          
          <div>
            <div>TRX: ${trx.order_number}</div>
            <div>DATE: ${new Date(trx.created_at).toLocaleString('id-ID')}</div>
            <div>CASHIER: Admin</div>
            <div>CUST: ${trx.customer_name || 'Walk-in Customer'}</div>
          </div>

          <div class="divider"></div>

          <table class="table">
            <thead>
              <tr class="bold">
                <th align="left">ITEM</th>
                <th align="center">QTY</th>
                <th align="right">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${trx.items
                .map(
                  (item: any) => `
                <tr class="item-row">
                  <td colspan="3">
                    <div>${item.variant_name || 'Unknown Product'}</div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="font-size: 10px;">${item.qty} x ${formatCurrency(
                    item.price
                  )}</span>
                      <span class="bold">${formatCurrency(item.total)}</span>
                    </div>
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="divider"></div>

          <table class="table">
            <tr>
              <td align="left">SUBTOTAL</td>
              <td align="right">${formatCurrency(trx.total_amount)}</td>
            </tr>
            <tr>
              <td align="left">TAX</td>
              <td align="right">${formatCurrency(trx.tax_amount)}</td>
            </tr>
            <tr class="bold" style="font-size: 14px;">
              <td align="left">TOTAL</td>
              <td align="right">${formatCurrency(trx.final_amount)}</td>
            </tr>
          </table>

          <div class="divider"></div>

          <div class="bold">PAYMENT: ${(trx.payment_method || 'CASH').toUpperCase()}</div>
          
          <div class="divider"></div>

          <div class="footer center">
            <div class="bold underline">THANK YOU FOR YOUR BUSINESS</div>
            <div>Please come again!</div>
            <div style="margin-top: 10px; font-size: 8px;">Powered by Flwbite POS</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  return { handlePrintReceipt };
};
