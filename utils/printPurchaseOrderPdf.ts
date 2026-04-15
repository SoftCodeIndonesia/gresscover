import jsPDF from 'jspdf'
import { PurchaseOrder } from '@/type/purchase'
import { GroupSetting } from '@/type/setting';
import { StoreInformation } from '@/type/store_information';
export function printPurchaseOrder(data: PurchaseOrder) {
  const settings = localStorage.getItem('settings');
        const settingsData: GroupSetting[] = JSON.parse(settings as string);

        var storeInformation: StoreInformation = {
          name: '',
          phone: '',
          address: ''
        }

        settingsData.forEach(element => {
            element.settings.forEach(setting => {
                if(setting.slug == "informasi-toko" && setting.value != null){
                    const decodeValue = JSON.parse(setting.value as string)
                    storeInformation = decodeValue as StoreInformation;
                }
            });
        });

  const doc = new jsPDF('p', 'mm', 'a4')
  let y = 20

  // ===== TITLE =====
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('INVOICE VENDOR BULANAN – PESANAN RETAIL', 105, y, { align: 'center' })

  y += 14
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // ===== INFO HELPER =====
  const labelX = 20
  const colonX = 65
  const valueX = 70

  function infoRow(label: string, value: string, yPos: number) {
    doc.text(label, labelX, yPos)
    doc.text(':', colonX, yPos)
    doc.text(value || '-', valueX, yPos)
  }

  doc.setFontSize(9)

  // ===== VENDOR & BUYER =====
  infoRow('Nama Vendor', data.vendor.name, y); y += 5
  infoRow('Alamat Vendor', data.vendor.address, y); y += 5
  infoRow('Telepon / WA', data.vendor.phone, y); y += 5
  infoRow('Email', data.vendor.email, y)

  y += 8
  infoRow('Nama Toko / Retail Buyer', `${storeInformation.name}`, y); y += 5
  infoRow('Alamat Toko', `${storeInformation.address}`, y); y += 5
  infoRow('Kontak', `${storeInformation.phone}`, y)

  y += 8
  infoRow('No. Invoice', data.invoice_number, y); y += 5
  infoRow('Tanggal Pemesanan', data.order_date, y)

  y += 12

  // ===== TABLE TITLE =====
  doc.setFont('helvetica', 'bold')
  doc.text('Rincian Pesanan Bulanan (Retail)', 20, y)
  y += 6

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  // ===== TABLE CONFIG =====
  const tableX = 20
  const headers = [
    { label: 'Item / Produk', w: 60, align: 'left' },
    { label: 'Varian / Size', w: 35, align: 'left' },
    { label: 'Qty', w: 15, align: 'center' },
    { label: 'Harga', w: 30, align: 'right' },
    { label: 'Total', w: 30, align: 'right' },
  ]

  // ===== TABLE HEADER =====
  let x = tableX
  headers.forEach(h => {
    doc.rect(x, y, h.w, 8)

    let textX = x + 2

    if (h.align === 'center') textX = x + h.w / 2
    if (h.align === 'right') textX = x + h.w - 2

    doc.text(
      h.label,
      textX,
      y + 5,
      { align: h.align as any }
    )

    x += h.w
  })

  y += 8

  // ===== TABLE ROW HELPER (WRAP + PADDING) =====
  function drawRow(row: any[]) {
    let x = tableX
    const lineHeight = 5
    const topPadding = 1
    const bottomPadding = 3
    let maxLines = 1

    const wrapped = row.map((cell, i) => {
      const lines = doc.splitTextToSize(cell || '-', headers[i].w - 6)
      maxLines = Math.max(maxLines, lines.length)
      return lines
    })

    const rowHeight = topPadding + bottomPadding + maxLines * lineHeight

    wrapped.forEach((lines, i) => {
  doc.rect(x, y, headers[i].w, rowHeight)

  if (i === 0) {
    // 🔹 Line 1: Nama produk (bold)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)

    doc.text(
      lines[0] || '-',
      x + 3,
      y + topPadding + lineHeight
    )

    // 🔹 Line 2: Category (kecil & abu)
    if (lines[1]) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(120) // abu-abu

      doc.text(
        `kategori: ${lines[1]}`,
        x + 3,
        y + topPadding + lineHeight * 2
      )

      doc.setTextColor(0) // reset ke hitam
    }

  } else {
    // kolom lain tetap
    lines.forEach((line: any, index: number) => {
      let textX = x + 3
      if (headers[i].align === 'center') textX = x + headers[i].w / 2
      if (headers[i].align === 'right') textX = x + headers[i].w - 3

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')

      doc.text(
        line,
        textX,
        y + topPadding + lineHeight * (index + 1),
        { align: headers[i].align as any }
      )
    })
  }

  x += headers[i].w
})

    y += rowHeight
  }

  // ===== TABLE ROWS =====
  data.items.forEach(item => {
    if (item.children.length > 0) {
      item.children.forEach(child => {
        drawRow([
          // `${item.product_name} \n ${child.product?.category?.name}`,
          [item.product_name, child.product?.category?.name || ''],
          child.product_name,
          String(child.quantity),
          `Rp ${child.price.toLocaleString()}`,
          `Rp ${child.total.toLocaleString()}`,
        ])
      })
    } else {
      drawRow([
        [item.product_name, item.product?.category?.name || ''],
        '',
        String(item.quantity),
        `Rp ${item.price.toLocaleString()}`,
        `Rp ${item.total.toLocaleString()}`,
      ])
    }
  })

  y += 8

  // ===== SUMMARY =====
  infoRow('Subtotal Penjualan', `Rp ${data.subtotal.toLocaleString()}`, y); y += 5
  infoRow('Biaya Tambahan', `Rp ${data.additional_cost.toLocaleString()}`, y); y += 5
  infoRow('Diskon', `Rp ${data.discount_amount.toLocaleString()}`, y); y += 5
  infoRow('PPN 11%', `Rp ${data.ppn_amount.toLocaleString()}`, y); y += 5

  doc.setFont('helvetica', 'bold')
  infoRow('Total Tagihan Akhir', `Rp ${data.total_amount.toLocaleString()}`, y)
  doc.setFont('helvetica', 'normal')

  y += 12

  // ===== PAYMENT =====
  doc.setFont('helvetica', 'bold')
  doc.text('Detail Pembayaran', 20, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  infoRow('Bank', data.payment.bank, y); y += 5
  infoRow('No Rekening', data.payment.account_number, y); y += 5
  infoRow('Atas Nama', data.payment.account_name, y); y += 5
  infoRow('Jatuh Tempo', data.due_date, y)

  y += 12

  // ===== SIGNATURE =====
  doc.setFont('helvetica', 'bold')
  doc.text('Tanda Tangan', 20, y)
  y += 10

  doc.setFont('helvetica', 'normal')
  doc.text('Vendor  : __________________', 20, y); y += 8
  doc.text('Pembeli : __________________', 20, y)

  // ===== SAVE =====
  // doc.save(`invoice-bulanan-${data.invoice_number}.pdf`)

  const blob = doc.output("blob");
  // pdfBlob.value = blob;
  const url = URL.createObjectURL(blob);

  return { url, blob, doc };
}
