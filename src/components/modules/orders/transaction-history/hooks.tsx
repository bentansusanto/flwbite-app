import { useFormik } from "formik";
import { transactionFilterSchema, TransactionFilterValues } from "./schema";
import { validateWithZod } from "@/utils/formik-zod";
import { useGetMeTenantQuery } from "@/store/api/tenantApi";

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
  const { data: tenantRes } = useGetMeTenantQuery(undefined);
  const tenantName = tenantRes?.data?.name || "Toko Demo";

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handlePrintReceipt = (trx: any) => {
    if (!trx) return;

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
    doc.write(`
      <html>
        <head>
          <title>Receipt - ${trx.order_number}</title>
          <style>
            @page { 
              margin: 0; 
              size: 80mm auto; 
            }
            body { 
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
              margin: 0; 
              padding: 10px; 
              font-size: 12px;
              color: #000;
              background: #fff;
              line-height: 1.4;
            }
            .receipt-wrapper { 
              width: 100%; 
              max-width: 300px;
              margin: 0 auto; 
            }
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
          </style>
        </head>
        <body>
          <div class="receipt-wrapper">
            <div class="text-center mb-4">
              <h1 class="text-xl font-bold uppercase mb-1">${tenantName}</h1>
              <p class="text-[10px]">${trx.branch || 'Cabang Utama'}</p>
            </div>

            <div class="divider-dashed"></div>

            <div class="mb-3 space-y-1 text-[10px]">
              <div class="flex justify-between">
                <span>Date:</span>
                <span>${new Date(trx.created_at).toLocaleString('id-ID')}</span>
              </div>
              <div class="flex justify-between">
                <span>Receipt:</span>
                <span>#${trx.order_number}</span>
              </div>
              <div class="flex justify-between">
                <span>Cashier:</span>
                <span>Admin</span>
              </div>
              ${trx.customer_name ? `
              <div class="flex justify-between">
                <span>Customer:</span>
                <span class="truncate max-w-[120px] text-right">${trx.customer_name}</span>
              </div>` : ''}
            </div>

            <div class="divider-dashed"></div>

            <div class="space-y-3 mb-3">
              ${trx.items.map((item: any) => `
                <div>
                  <div class="flex justify-between font-bold mb-0.5">
                    <span class="truncate pr-2">${item.variant_name || 'Item'}</span>
                  </div>
                  <div class="flex justify-between text-[10px]">
                    <span>${item.qty} x ${formatCurrency(item.price).replace("Rp", "").trim()}</span>
                    <span>${formatCurrency(item.total).replace("Rp", "").trim()}</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="divider-dashed"></div>

            <div class="space-y-1.5 mb-3">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span>${formatCurrency(trx.total_amount).replace("Rp", "").trim()}</span>
              </div>
              ${trx.tax_amount > 0 ? `
              <div class="flex justify-between">
                <span>Tax</span>
                <span>${formatCurrency(trx.tax_amount).replace("Rp", "").trim()}</span>
              </div>` : ''}
              ${trx.discount_amount > 0 ? `
              <div class="flex justify-between">
                <span>Discount</span>
                <span>-${formatCurrency(trx.discount_amount).replace("Rp", "").trim()}</span>
              </div>` : ''}
              <div class="flex justify-between font-bold text-sm mt-2 pt-2 border-top-dashed">
                <span>TOTAL</span>
                <span>${formatCurrency(trx.final_amount)}</span>
              </div>
            </div>

            <div class="divider-dashed"></div>
            
            <div class="space-y-1.5 mb-5">
              <div class="flex justify-between">
                <span>Payment</span>
                <span>${(trx.payment_method || 'CASH').toUpperCase()}</span>
              </div>
              <div class="flex justify-between">
                <span>Status</span>
                <span>${trx.status}</span>
              </div>
              ${trx.status === 'REFUNDED' && trx.refund_reason ? `
              <div class="flex justify-between text-red-600 mt-1">
                <span>Reason</span>
                <span class="truncate max-w-[120px] text-right">${trx.refund_reason}</span>
              </div>` : ''}
            </div>

            <div class="text-center mt-6 space-y-4">
              <p class="font-bold uppercase text-[10px]">Thank You For Coming!</p>
              
              <div class="flex justify-center">
                <svg width="180" height="40" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="180" height="40" fill="white"/>
                  ${Array.from({ length: 40 }).map((_, i) => `
                    <rect 
                      x="${i * 4 + (Math.random() > 0.5 ? 2 : 0)}" 
                      y="0" 
                      width="${Math.random() > 0.5 ? 2 : 1}" 
                      height="40" 
                      fill="black"
                    />
                  `).join('')}
                </svg>
              </div>
              <p class="text-[8px] tracking-[0.2em]">${trx.id.substring(0, 12).toUpperCase()}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }
  };

  return { handlePrintReceipt };
};
