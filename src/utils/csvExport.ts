export async function downloadCSV(type: 'guests' | 'reservations' | 'rooms') {
  try {
    const result = await window.electronAPI.exportCSV(type);
    
    if (!result.success || !result.data) {
      alert('Dışa aktarma başarısız: ' + (result.message || 'Bilinmeyen hata'));
      return;
    }

    // Convert data to CSV
    const csvContent = convertToCSV(result.data);
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', result.filename || `export_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error: any) {
    console.error('CSV export error:', error);
    alert('Dışa aktarma başarısız: ' + error.message);
    return false;
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const headerRow = headers.map(h => `"${h}"`).join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      
      // Handle null/undefined
      if (value === null || value === undefined) return '""';
      
      // Handle dates
      if (value instanceof Date) {
        return `"${value.toISOString()}"`;
      }
      
      // Handle strings with special characters
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      
      // Handle numbers
      return `"${value}"`;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

export function printInvoice(reservation: any, guest: any, room: any) {
  // Calculate totals
  const checkIn = new Date(reservation.CheckInDate);
  const checkOut = new Date(reservation.CheckOutDate);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const pricePerNight = Number(room.PricePerNight || 0);
  const total = nights * pricePerNight;

  // Create print window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Faturaları yazdırmak için popup\'lara izin verin');
    return;
  }

  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Fatura - Rezervasyon #${reservation.ReservationId}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          padding: 40px; 
          color: #333;
        }
        .invoice-header {
          display: flex;
          justify-between;
          align-items: start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #137fec;
        }
        .company-info h1 { 
          color: #137fec; 
          font-size: 28px; 
          margin-bottom: 10px;
        }
        .company-info p { color: #666; margin: 4px 0; }
        .invoice-info { text-align: right; }
        .invoice-info h2 { font-size: 24px; margin-bottom: 10px; }
        .invoice-info p { margin: 4px 0; }
        .section { margin-bottom: 30px; }
        .section h3 { 
          font-size: 18px; 
          margin-bottom: 15px; 
          color: #137fec;
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
        }
        .detail-row { 
          display: flex; 
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .detail-label { font-weight: 600; color: #555; }
        .detail-value { color: #333; }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 15px;
        }
        th { 
          background: #f8f9fa; 
          padding: 12px; 
          text-align: left;
          border-bottom: 2px solid #dee2e6;
          font-weight: 600;
        }
        td { 
          padding: 12px; 
          border-bottom: 1px solid #f0f0f0;
        }
        .total-section {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #137fec;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 18px;
        }
        .total-row.grand-total {
          font-size: 24px;
          font-weight: bold;
          color: #137fec;
          padding-top: 15px;
          border-top: 1px solid #dee2e6;
          margin-top: 10px;
        }
        .footer {
          margin-top: 60px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div class="company-info">
          <h1>Hotel Admin</h1>
          <p>Your Hotel Name</p>
          <p>123 Hotel Street</p>
          <p>City, State 12345</p>
          <p>Phone: (123) 456-7890</p>
        </div>
        <div class="invoice-info">
          <h2>FATURA</h2>
          <p><strong>Fatura No:</strong> ${reservation.ReservationId}</p>
          <p><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
        </div>
      </div>

      <div class="section">
        <h3>Misafir Bilgileri</h3>
        <div class="detail-row">
          <span class="detail-label">Misafir Adı:</span>
          <span class="detail-value">${guest.FullName || 'Belirtilmemiş'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Telefon:</span>
          <span class="detail-value">${guest.PhoneNumber || 'Belirtilmemiş'}</span>
        </div>
        ${guest.Email ? `
        <div class="detail-row">
          <span class="detail-label">E-posta:</span>
          <span class="detail-value">${guest.Email}</span>
        </div>
        ` : ''}
      </div>

      <div class="section">
        <h3>Rezervasyon Detayları</h3>
        <div class="detail-row">
          <span class="detail-label">Oda Numarası:</span>
          <span class="detail-value">${room.RoomNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Oda Tipi:</span>
          <span class="detail-value">${room.Type === 'Standard' ? 'Standart' : room.Type === 'Deluxe' ? 'Deluxe' : 'Suit'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Giriş:</span>
          <span class="detail-value">${checkIn.toLocaleDateString('tr-TR', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Çıkış:</span>
          <span class="detail-value">${checkOut.toLocaleDateString('tr-TR', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Misafir Sayısı:</span>
          <span class="detail-value">${reservation.NumberOfGuests || 1}</span>
        </div>
      </div>

      <div class="section">
        <h3>Ücretler</h3>
        <table>
          <thead>
            <tr>
              <th>Açıklama</th>
              <th style="text-align: center;">Gece</th>
              <th style="text-align: right;">Gecelik Ücret</th>
              <th style="text-align: right;">Tutar</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Oda ${room.RoomNumber} - ${room.Type === 'Standard' ? 'Standart' : room.Type === 'Deluxe' ? 'Deluxe' : 'Suit'}</td>
              <td style="text-align: center;">${nights}</td>
              <td style="text-align: right;">₺${pricePerNight.toFixed(2)}</td>
              <td style="text-align: right;">₺${total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="total-section">
        <div class="total-row">
          <span>Ara Toplam:</span>
          <span>₺${total.toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>Vergi (0%):</span>
          <span>₺0.00</span>
        </div>
        <div class="total-row grand-total">
          <span>TOPLAM:</span>
          <span>₺${total.toFixed(2)}</span>
        </div>
      </div>

      ${reservation.StaffNotes ? `
      <div class="section">
        <h3>Notlar</h3>
        <p>${reservation.StaffNotes}</p>
      </div>
      ` : ''}

      <div class="footer">
        <p>Otelimizi seçtiğiniz için teşekkür ederiz!</p>
        <p>Bu bilgisayar tarafından oluşturulmuş bir faturadır.</p>
      </div>

      <div class="no-print" style="margin-top: 40px; text-align: center;">
        <button onclick="window.print()" style="padding: 12px 30px; background: #137fec; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">
          Faturayı Yazdır
        </button>
        <button onclick="window.close()" style="padding: 12px 30px; background: #666; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; margin-left: 10px;">
          Kapat
        </button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
}

