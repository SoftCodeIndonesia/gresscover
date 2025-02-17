import { InventoryMovement } from "@/type/inventory_movement";
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
    return (
        <Card title={`Detail `}>
                
                <Card.Grid hoverable={false} style={gridStyle}>Nama Barang</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{movement?.product_name}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Gudang</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{movement?.inventory?.location?.name ?? ''}</Card.Grid>
               {movement?.type == 'in' || movement?.type == 'adjustment' &&  <><Card.Grid hoverable={false} style={gridStyle}>Masuk Dari</Card.Grid><Card.Grid hoverable={false} style={gridStyle}>{movement?.reference == 'inventory' ? 'Mutasi' : `${(movement?.reference ?? '-').toUpperCase()}`}</Card.Grid></>}
               {movement?.type == 'out' || movement?.type == 'mutasi' &&  <><Card.Grid hoverable={false} style={gridStyle}>Tujuan</Card.Grid><Card.Grid hoverable={false} style={gridStyle}>{movement?.reference == null ? 'Mutasi' : `${(movement?.reference ?? '-').toUpperCase()}`}</Card.Grid></>}
                <Card.Grid hoverable={false} style={gridStyle}>Stok Saat Ini</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{movement?.quantity} {movement?.unit_name}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Harga Beli</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}><p className="text-red-500">{formatRupiah(movement?.inventory?.cost ?? 0)}</p></Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Harga Jual</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}><p className="text-green-500">{formatRupiah(movement?.inventory?.price ?? 0)}</p></Card.Grid>
            </Card>
    );
}

export default DetailMovement;