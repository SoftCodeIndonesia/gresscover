import jsPDF from 'jspdf'
import { PurchaseOrder } from '@/type/purchase'

export function printPurchaseOrder(data: PurchaseOrder) {
  const doc = new jsPDF('p', 'mm', 'a4')
  let y = 20

  // ===== TITLE =====
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('INVOICE VENDOR BULANAN – PESANAN RETAIL', 105, y, { align: 'center' })

  y += 14
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // ===== VENDOR INFO =====
  const labelX = 20
  const colonX = 65
  const valueX = 70

  function infoRow(label: string, value: string, yPos: number) {
    doc.text(label, labelX, yPos)
    doc.text(':', colonX, yPos)
    doc.text(value || '-', valueX, yPos)
  }

  infoRow('Nama Vendor', data.vendor.name, y); y += 5
  infoRow('Alamat Vendor', data.vendor.address, y); y += 5
  infoRow('Telepon / WA', data.vendor.phone, y); y += 5
  infoRow('Email', data.vendor.email, y)

  y += 8

  infoRow('Nama Toko / Retail Buyer', 'Gresscover', y); y += 5
  infoRow('Alamat Toko', '', y); y += 5
  infoRow('Kontak', '', y)

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

  y += 8

  // ===== TABLE ROWS =====

  const tableX = 20
  const tableWidth = 170 // 210 - 40

  const headers = [
    { label: 'Item / Produk', w: 60, align: 'left' },
    { label: 'Varian / Size', w: 35, align: 'left' },
    { label: 'Qty', w: 15, align: 'center' },
    { label: 'Harga', w: 30, align: 'right' },
    { label: 'Total', w: 30, align: 'right' },
  ]


  let x = tableX

  headers.forEach(h => {
    doc.rect(x, y, h.w, 8)
    doc.text(h.label, x + 2, y + 5)
    x += h.w
  })

  y += 8

  function drawCell(
    text: string,
    x: number,
    y: number,
    w: number,
    align: 'left' | 'center' | 'right' = 'left'
  ) {
    const padding = 2
    const textY = y + 5

    if (align === 'right') {
      doc.text(text, x + w - padding, textY, { align: 'right' })
    } else if (align === 'center') {
      doc.text(text, x + w / 2, textY, { align: 'center' })
    } else {
      doc.text(text, x + padding, textY)
    }
  }




  
  data.items.forEach(item => {
  if (item.children.length > 0) {
    item.children.forEach(child => {
      x = tableX

      const row = [
        item.product_name,
        child.product_name,
        String(child.quantity),
        `Rp ${child.price.toLocaleString()}`,
        `Rp ${child.total.toLocaleString()}`,
      ]

      row.forEach((cell, i) => {
        doc.rect(x, y, headers[i].w, 8)
        drawCell(cell, x, y, headers[i].w, headers[i].align as "left" | "center" | "right")
        x += headers[i].w
      })

      y += 8
    })
  } else {
    x = tableX

    const row = [
      item.product_name,
      '',
      String(item.quantity),
      `Rp ${item.price.toLocaleString()}`,
      `Rp ${item.total.toLocaleString()}`,
    ]

    row.forEach((cell, i) => {
      doc.rect(x, y, headers[i].w, 8)
      drawCell(cell, x, y, headers[i].w, headers[i].align as "left" | "center" | "right")
      x += headers[i].w
    })

    y += 8
  }
})


  y += 8

  infoRow('Subtotal Penjualan', `Rp ${data.subtotal.toLocaleString()}`, y); y += 5
  infoRow('Biaya Tambahan', `Rp ${data.additional_cost.toLocaleString()}`, y); y += 5
  infoRow('Diskon', `Rp ${data.discount_amount.toLocaleString()}`, y); y += 5
  infoRow('PPN 11%', `Rp ${data.ppn_amount.toLocaleString()}`, y); y += 5

  doc.setFont('helvetica', 'bold')
  infoRow('Total Tagihan Akhir', `Rp ${data.total_amount.toLocaleString()}`, y)
  doc.setFont('helvetica', 'normal')

  y += 12

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
  doc.text(`Vendor  : __________________`, 20, y); y += 8
  doc.text(`Pembeli : __________________`, 20, y)

  // ===== SAVE =====
  doc.save(`invoice-bulanan-${data.invoice_number}.pdf`)
}
