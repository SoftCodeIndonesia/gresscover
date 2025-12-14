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
  doc.text(`Nama Vendor     : ${data.vendor.name}`, 20, y); y += 5
  doc.text(`Alamat Vendor   : ${data.vendor.address}`, 20, y); y += 5
  doc.text(`Telepon/WA      : ${data.vendor.phone}`, 20, y); y += 5
  doc.text(`Email           : ${data.vendor.email}`, 20, y)

  y += 8

  // ===== BUYER INFO =====
  doc.text(`Nama Toko / Retail Buyer : Gresscover`, 20, y); y += 5
  doc.text(`Alamat Toko              : `, 20, y); y += 5
  doc.text(`Kontak                   : `, 20, y)

  y += 8

  // ===== INVOICE META =====
  doc.text(`No. Invoice         : ${data.invoice_number}`, 20, y); y += 5
  doc.text(`Tanggal Pemesanan   : ${data.order_date}`, 20, y); y += 5
 
  y += 12

  // ===== TABLE TITLE =====
  doc.setFont('helvetica', 'bold')
  doc.text('Rincian Pesanan Bulanan (Retail)', 20, y)
  y += 6

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  // ===== TABLE HEADER =====
  const headers = [
    { label: 'Item / Produk', w: 40 },
    { label: 'Varian / Size', w: 25 },
    { label: 'Qty', w: 10 },
    { label: 'Harga', w: 20 },
    { label: 'Total', w: 20 },
  ]

  let x = 20
  headers.forEach(h => {
    doc.rect(x, y, h.w, 8)
    doc.text(h.label, x + 2, y + 5)
    x += h.w
  })

  y += 8

  // ===== TABLE ROWS =====

  
  data.items.forEach(item => {
    x = 20
    
    if(item.children.length > 0){
        item.children.forEach(child => {
            const row = [
                item.product_name,
                child.product_name,
                String(child.quantity),
                `Rp ${child.price.toLocaleString()}`,
                `Rp ${child.total.toLocaleString()}`,
            ]

            row.forEach((cell, i) => {
                doc.rect(x, y, headers[i].w, 8)
                doc.text(cell, x + 2, y + 5)
                x += headers[i].w
            })
        });
    }else{
        const row = [
            item.product_name,
            '',
            String(item.quantity),
            `Rp ${item.price.toLocaleString()}`,
            `Rp ${item.total.toLocaleString()}`,
        ]

        row.forEach((cell, i) => {
            doc.rect(x, y, headers[i].w, 8)
            doc.text(cell, x + 2, y + 5)
            x += headers[i].w
        })
    }

    y += 8
  })

  y += 8

  // ===== SUMMARY =====
  doc.setFontSize(10)
  doc.text(`Subtotal Penjualan : Rp ${data.subtotal.toLocaleString()}`, 20, y); y += 5
  doc.text(`Biaya Tambahan     : Rp ${data.additional_cost.toLocaleString()}`, 20, y); y += 5
  doc.text(`Diskon             : Rp ${data.discount_amount.toLocaleString()}`, 20, y); y += 5
  doc.text(`PPN 11%            : Rp ${data.ppn_amount.toLocaleString()}`, 20, y); y += 5

  doc.setFont('helvetica', 'bold')
  doc.text(`Total Tagihan Akhir: Rp ${data.total_amount.toLocaleString()}`, 20, y)

  y += 12

  // ===== PAYMENT =====
  doc.setFont('helvetica', 'bold')
  doc.text('Detail Pembayaran', 20, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.text(`Bank        : ${data.payment.bank}`, 20, y); y += 5
  doc.text(`No Rekening : ${data.payment.account_number}`, 20, y); y += 5
  doc.text(`Atas Nama   : ${data.payment.account_name}`, 20, y); y += 5
  doc.text(`Jatuh Tempo : ${data.due_date}`, 20, y)

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
