import { QualityReport } from '@/type/reportIssue'
import jsPDF from 'jspdf'
import { formatDateWithoutTime } from './date_utils'

export function printQualityReportPdf(data: QualityReport) {
  const doc = new jsPDF('p', 'mm', 'a4')

  let y = 20

  // ===== TITLE =====
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('QUALITY ISSUE REPORT (REKAP BARANG CACAT)', 105, y, { align: 'center' })

  y += 15
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // ===== HEADER INFO =====
  doc.text(`Tanggal Pemeriksaan : ${formatDateWithoutTime(data.inspection_date)}`, 20, y)
  y += 6
  doc.text(`No. Invoice               : ${data.purchase_order?.invoice_number}`, 20, y)
  y += 6
  doc.text(`Nama Vendor          : ${data.purchase_order?.vendor?.name}`, 20, y)
  y += 6
  doc.text(`Penerima Barang      : ${data.receiver_name}`, 20, y)

  y += 12

  // ===== DETAIL BARANG CACAT =====
  doc.setFont('helvetica', 'bold')
  doc.text('Detail Barang Cacat', 20, y)
  y += 6

  // Table Header
  doc.setFontSize(9)
  doc.rect(20, y, 10, 8)
  doc.rect(30, y, 45, 8)
  doc.rect(75, y, 40, 8)
  doc.rect(115, y, 20, 8)
  doc.rect(135, y, 45, 8)

  doc.text('No', 22, y + 5)
  doc.text('SKU / Produk', 32, y + 5)
  doc.text('Jenis Cacat', 77, y + 5)
  doc.text('Qty', 120, y + 5)
  doc.text('Keterangan', 137, y + 5)

  y += 8

  // Table Rows
  data.items.forEach((item, index) => {
    doc.rect(20, y, 10, 8)
    doc.rect(30, y, 45, 8)
    doc.rect(75, y, 40, 8)
    doc.rect(115, y, 20, 8)
    doc.rect(135, y, 45, 8)

    doc.text(String(index + 1), 22, y + 5)
    doc.text(`${item.sku} - ${item.product_name}`, 32, y + 5)
    doc.text(item.defect_type, 77, y + 5)
    doc.text(String(item.qty_defect), 120, y + 5)
    doc.text(item.note || '-', 137, y + 5)

    y += 8
  })

  y += 8

  // ===== SUMMARY =====
  doc.setFontSize(10)
  doc.text(`Total Barang Diterima : ${data.total_received} pcs`, 20, y)
  y += 6
  doc.text(`Total Barang Cacat    : ${data.total_defect} pcs`, 20, y)
  y += 6
  doc.text(`Persentase Cacat      : ${data.defect_percentage} %`, 20, y)

  y += 12

  // ===== ACTION =====
  doc.setFont('helvetica', 'bold')
  doc.text('Tindakan yang Diminta ke Vendor', 20, y)
  y += 6
  doc.setFont('helvetica', 'normal')

  const actions = [
    { key: 'replace', label: 'Replace (ganti barang baru)' },
    { key: 'return', label: 'Return to Vendor (barang dikembalikan)' },
    { key: 'discount', label: 'Discount / Kompensasi' },
    { key: 'other', label: 'Lainnya' },
  ]

  actions.forEach(action => {
    const checked = data.action === action.key ? '[x]' : '[ ]'
    doc.text(`${checked} ${action.label}`, 22, y)
    y += 6
  })

  if (data.action === 'other' && data.action_note) {
    doc.text(`Keterangan: ${data.action_note}`, 22, y)
    y += 6
  }

  y += 12

  // ===== SIGNATURE =====
  doc.setFont('helvetica', 'bold')
  doc.text('Tanda Tangan', 20, y)
  y += 10

  doc.setFont('helvetica', 'normal')
  doc.text(`Pemeriksa Barang : _______________________________________`, 20, y)
  y += 10
  doc.text(`Vendor (Jika diperlukan) : _______________________________`, 20, y)

  // ===== OUTPUT =====
  doc.save(`quality-report-${data.unique_id}.pdf`)
}
