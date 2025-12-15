import { QualityReport } from '@/type/reportIssue'
import jsPDF from 'jspdf'
import { formatDateWithoutTime } from './date_utils'

export function printQualityReportPdf(data: QualityReport) {
  const doc = new jsPDF('p', 'mm', 'a4')

  let y = 20

  // ===== HELPER =====
  const labelX = 20
  const colonX = 65
  const valueX = 70
  const tableX = 20

  function infoRow(label: string, value: string, yPos: number) {
    doc.text(label, labelX, yPos)
    doc.text(':', colonX, yPos)
    doc.text(value || '-', valueX, yPos)
  }

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

  // ===== TITLE =====
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('QUALITY ISSUE REPORT (REKAP BARANG CACAT)', 105, y, { align: 'center' })

  y += 15
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // ===== HEADER INFO =====
  infoRow('Tanggal Pemeriksaan', formatDateWithoutTime(data.inspection_date), y); y += 6
  infoRow('No. Invoice', data.purchase_order?.invoice_number || '-', y); y += 6
  infoRow('Nama Vendor', data.purchase_order?.vendor?.name || '-', y); y += 6
  infoRow('Penerima Barang', data.receiver_name, y)

  y += 12

  // ===== DETAIL BARANG CACAT =====
  doc.setFont('helvetica', 'bold')
  doc.text('Detail Barang Cacat', 20, y)
  y += 6

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  // ===== TABLE SETUP =====
  const headers = [
    { label: 'No', w: 10, align: 'center' },
    { label: 'SKU / Produk', w: 50, align: 'left' },
    { label: 'Jenis Cacat', w: 40, align: 'left' },
    { label: 'Qty', w: 20, align: 'center' },
    { label: 'Keterangan', w: 50, align: 'left' },
  ]

  // ===== TABLE HEADER =====
  let x = tableX
  headers.forEach(h => {
    doc.rect(x, y, h.w, 8)
    drawCell(h.label, x, y, h.w, 'center')
    x += h.w
  })

  y += 8

  // ===== TABLE ROWS =====
  data.items.forEach((item, index) => {
    x = tableX

    const row = [
      String(index + 1),
      `${item.sku} - ${item.product_name}`,
      item.defect_type,
      String(item.qty_defect),
      item.note || '-',
    ]

    row.forEach((cell, i) => {
      doc.rect(x, y, headers[i].w, 8)
      drawCell(cell, x, y, headers[i].w, headers[i].align as any)
      x += headers[i].w
    })

    y += 8
  })

  y += 10

  // ===== SUMMARY =====
  doc.setFontSize(10)
  infoRow('Total Barang Diterima', `${data.total_received} pcs`, y); y += 6
  infoRow('Total Barang Cacat', `${data.total_defect} pcs`, y); y += 6
  infoRow('Persentase Cacat', `${data.defect_percentage} %`, y)

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
    doc.text(`Keterangan : ${data.action_note}`, 22, y)
    y += 6
  }

  y += 12

  // ===== SIGNATURE =====
  doc.setFont('helvetica', 'bold')
  doc.text('Tanda Tangan', 20, y)
  y += 10

  doc.setFont('helvetica', 'normal')
  doc.text('Pemeriksa Barang : _________________________________', 20, y)
  y += 10
  doc.text('Vendor (Jika diperlukan) : _________________________', 20, y)

  // ===== OUTPUT =====
  doc.save(`quality-report-${data.unique_id}.pdf`)
}
