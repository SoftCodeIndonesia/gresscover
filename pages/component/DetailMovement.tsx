import { InventoryMovement } from "@/type/inventory_movement";
import { formatDate } from "@/utils/date_utils";
import { formatRupiah } from "@/utils/format_rupiah";
import { Card } from "antd";
interface PropsMovementDetail {
    movement: InventoryMovement,
    title: string,
}
const gridStyle: React.CSSProperties = {
    width: '50%',
    textAlign: 'left',
    paddingTop: '10px',
    paddingBottom: '10px'
};
const DetailMovement: React.FC<PropsMovementDetail> = ({movement, title}) => {
    const checkSource = (source: InventoryMovement) => {
        
        switch (source.reference) {
            case 'inventory':
                return <p>Mutasi</p>
            case 'retur':
                return <p>Retur</p>
            case 'exchange':
                return <p>Penukaran barang</p>
            case 'sales':
                return <p>Penjualan</p>
            default:
                return <p>-</p>
        }
        
    }
    return (
        <Card title={`Detail `}>
                
                <Card.Grid hoverable={false} style={gridStyle}>Transaksi</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{ movement != undefined ? checkSource(movement) : '-'}</Card.Grid>
                
                <Card.Grid hoverable={false} style={gridStyle}>Nama Produk</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{movement?.product_name}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>SKU</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{movement?.item?.sku ?? ''}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Barcode</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{movement?.item?.barcode ?? ''}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Gudang</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{movement?.inventory?.location?.name ?? ''}</Card.Grid>
               
               <Card.Grid hoverable={false} style={gridStyle}>Quantity</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{movement?.quantity} {movement?.unit_name}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Stok Saat Ini</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{movement?.inventory?.quantity} {movement?.inventory?.unit_name}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Minimum Stok</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{movement?.inventory?.minimum_stock}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Harga Beli</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}><p className="text-red-500">{formatRupiah(movement?.inventory?.cost ?? 0)}</p></Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Harga Jual</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}><p className="text-green-500">{formatRupiah(movement?.inventory?.price ?? 0)}</p></Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Dibuat Oleh</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}><p>{movement?.user?.name ?? ''}</p></Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Dibuat Tgl</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}><p>{movement != undefined ? formatDate(movement.created_at) : '-'}</p></Card.Grid>
        </Card>
    );
}

export default DetailMovement;