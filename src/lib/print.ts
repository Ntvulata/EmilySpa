import { spaSettings } from "./spa-data";

export interface PrintItem {
  name: string;
  price: string;
  note?: string;
}

export interface PrintData {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  items: PrintItem[];
  total: string;
}

export const printReceipt = (data: PrintData) => {
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  
  if (!printWindow) {
    alert("Trình duyệt đã chặn popup! Vui lòng cho phép mở cửa sổ mới (pop-up) để in phiếu.");
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>In phiếu thu - ${data.id}</title>
      <style>
        @page { margin: 0; }
        body { 
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
          padding: 20px; 
          font-size: 14px; 
          width: 80mm;
          margin: 0 auto; 
          color: #000;
        }
        h1 { text-align: center; font-size: 22px; margin-bottom: 5px; text-transform: uppercase; font-weight: bold; }
        .subtitle { text-align: center; font-size: 12px; margin-bottom: 5px; font-weight: normal; }
        .divider { border-bottom: 1px dashed #000; margin: 12px 0; }
        .row { display: flex; justify-content: space-between; margin: 6px 0; }
        .col-left { flex: 1; padding-right: 10px; }
        .col-right { white-space: nowrap; font-weight: bold; }
        .bold { font-weight: bold; }
        .text-center { text-align: center; }
        .text-sm { font-size: 12px; }
        .mb-2 { margin-bottom: 8px; }
      </style>
    </head>
    <body>
      <h1>${spaSettings.spaName}</h1>
      ${spaSettings.spaAddress ? `<div class="subtitle">${spaSettings.spaAddress}</div>` : ''}
      ${spaSettings.spaPhone ? `<div class="subtitle">SĐT: ${spaSettings.spaPhone}</div>` : ''}
      <div class="subtitle" style="margin-top: 15px; font-weight: bold; border-top: 1px dashed #000; padding-top: 10px;">PHIẾU THU TÀI CHÍNH</div>
      <div class="text-sm mb-2"><strong>Mã phiếu:</strong> ${data.id}</div>
      <div class="text-sm mb-2"><strong>Ngày:</strong> ${data.date}</div>
      <div class="divider"></div>
      <div class="text-sm mb-2"><strong>Khách hàng:</strong> ${data.customerName}</div>
      <div class="text-sm mb-2"><strong>SĐT:</strong> ${data.customerPhone}</div>
      <div class="divider"></div>
      
      ${data.items.map(item => `
        <div class="row">
          <div class="col-left">${item.name}${item.note ? `<br><span style="font-size: 11px; font-weight: normal;">${item.note}</span>` : ''}</div>
          <div class="col-right">${item.price}</div>
        </div>
      `).join('')}
      
      <div class="divider"></div>
      <div class="row bold" style="font-size: 16px;">
        <span>TỔNG CỘNG:</span>
        <span>${data.total}</span>
      </div>
      <div class="divider"></div>
      
      <div class="text-center" style="font-size: 12px; margin-top: 30px; font-style: italic;">
        Xin cảm ơn và hẹn gặp lại quý khách!
      </div>
      
      <script>
        window.onload = function() {
          window.focus();
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
