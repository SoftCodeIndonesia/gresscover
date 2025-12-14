import DashboardLayout from "@/pages/component/DashboardLayout";
import {
    Button,
    Card,
    Form,
    Input,
    Select,
    DatePicker,
    InputNumber,
    Table,
    Typography,
    Space,
    message,
    Row,
    Col,
    Divider,
    Tag,
    Modal,
    Descriptions,
    Statistic,
    Alert,
    Tooltip,
    AutoComplete,
    AutoCompleteProps,
    TableColumnsType
} from "antd";
import {
    SaveOutlined,
    CloseOutlined,
    ReloadOutlined,
    PlusOutlined,
    DeleteOutlined,
    EyeOutlined,
    ShoppingOutlined,
    CalendarOutlined,
    UserOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    CaretDownOutlined,
    CaretRightOutlined
} from '@ant-design/icons';
import { useEffect, useState, useCallback } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import { formatDate } from "@/utils/date_utils";
import { formatRupiah } from "@/utils/format_rupiah";
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from "@/type/purchase";
import { NewRequestParam } from "@/type/request_param";
import { User } from "@/type/user";
import { QualityReport } from "@/type/reportIssue";

const { TextArea } = Input;
const { Option } = Select;

type QualityReportItemFormTmp = {
    id?: number,
    key: string;
    product_id: string;
    sku: string;
    product_name: string;
    ordered_quantity: number;
    received_quantity: number;
    good_quantity: number;
    qty_defect: number;
    defect_type: string;
    note: string;
    unit_price: number;
    total_value: number;
    children: QualityReportItemFormTmp[];
    is_parent: boolean;
    is_child: boolean;
    variant_name?: string;
    parent_index: number;
    child_index: number;
    order_item_id?: number;
    
};
type QualityReportItemForm = {
    id?: number,
    key: string;
    product_id: string;
    sku: string;
    product_name: string;
    ordered_quantity: number;
    received_quantity: number;
    good_quantity: number;
    qty_defect: number;
    defect_type: string;
    note: string;
    unit_price: number;
    total_value: number;
    
    is_parent: boolean;
    is_child: boolean;
    variant_name?: string;
    parent_index: number;
    child_index: number;
};

type QualityReportForm = {
    purchase_order_id?: number;
    inspection_date: string;
    inspected_by: number;
    receiver_name: string;
    received_by: number;
    action: string;
    action_note: string;
    items: QualityReportItemForm[];
};

const CheckingEdit: React.FC = () => {
    const [form] = Form.useForm();
    const router = useRouter();
    const id = router.query.slug; // For edit mode
    const { po } = router.query; // For edit mode
    
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null);
    // const [items, setItems] = useState<QualityReportItem[]>([]);
    const [defectTypes, setDefectTypes] = useState<string[]>([
        'Tidak Sesuai',
        'Rusak',
        'Salah Ukuran/Warna',
        'Lainya',
    ]);
    const [optionUser, setOptionItemUser] = useState<AutoCompleteProps['options']>([]);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [items, setItems] = useState<QualityReportItemFormTmp[]>([{
        key: `parent-${0}`,
        product_id: '',
        sku: '',
        product_name: '',
        ordered_quantity: 0,
        received_quantity: 0,
        good_quantity: 0,
        qty_defect: 0,
        defect_type: '',
        note: '',
        unit_price: 0,
        total_value: 0,
        is_parent: true,
        is_child: false,
        parent_index: -1,
        child_index: -1,
        children: [],
    }]);
    
    const [actionTypes] = useState([
        { value: 'accept', label: 'Terima', color: 'green' },
        { value: 'return', label: 'Retur', color: 'red' },
        { value: 'discount', label: 'Diskon', color: 'blue' },
        { value: 'lainya', label: 'Lainya', color: 'magenta' },
    ]);

    // Check if edit mode
    const isEditMode = !!id;

    const getFlattenedItems = () => {
        const flattened: QualityReportItemForm[] = [];
        
        items.forEach((item, index) => {
            // Add parent item
            const { children, ...parentItem } = item;
            flattened.push({
                ...parentItem,
                key: `parent-${index}`,
                is_child: item.is_child,
                is_parent: item.is_parent,
            });
            
            // Add children only if expanded
            if (item.children && item.children.length > 0) {
                item.children.forEach((child, childIndex) => {
                    const { children: childChildren, ...childItem } = child;
                    flattened.push({
                        ...childItem,
                        key: `parent-${index}-child-${childIndex}`,
                       is_child: child.is_child,
                        is_parent: child.is_parent,
                    });
                });
            }
        });

        console.log('flatten', flattened);
        
        return flattened;
    };

    // Find item by key (including nested children)
    const findItemByKey = useCallback((items: QualityReportItemFormTmp[], key: string): { item: QualityReportItemFormTmp, parentKey?: string } | null => {
        for (const item of items) {
            if (item.key === key) {
                return { item };
            }
            if (item.children && item.children.length > 0) {
                for (const child of item.children) {
                    if (child.key === key) {
                        return { item: child, parentKey: item.key };
                    }
                }
            }
        }
        return null;
    }, []);

    // Update item by key (including nested children)
    const updateItemByKey = useCallback((items: QualityReportItemFormTmp[], key: string, updates: Partial<QualityReportItemFormTmp>): QualityReportItemFormTmp[] => {
        return items.map(item => {
            // Check if this is the parent item
            if (item.key === key) {
                return { ...item, ...updates };
            }
            
            // Check if this is a child item
            if (item.children && item.children.length > 0) {
                const updatedChildren = item.children.map(child => {
                    if (child.key === key) {
                        return { ...child, ...updates };
                    }
                    return child;
                });
                
                // Update parent totals if child was updated
                const childUpdated = item.children.some((child, index) => 
                    child.key === key && JSON.stringify(child) !== JSON.stringify(updatedChildren[index])
                );
                
                if (childUpdated) {
                    // Recalculate parent totals from children
                    const newReceivedQty = updatedChildren.reduce((sum, child) => sum + (child.received_quantity || 0), 0);
                    const newDefectQty = updatedChildren.reduce((sum, child) => sum + (child.qty_defect || 0), 0);
                    const newGoodQty = updatedChildren.reduce((sum, child) => sum + (child.good_quantity || 0), 0);
                    const newTotalValue = updatedChildren.reduce((sum, child) => sum + (child.total_value || 0), 0);
                    
                    return {
                        ...item,
                        children: updatedChildren,
                        received_quantity: newReceivedQty,
                        qty_defect: newDefectQty,
                        good_quantity: newGoodQty,
                        total_value: newTotalValue
                    };
                }
            }
            
            return item;
        });
    }, []);

    // Fetch quality report data for edit mode
    const fetchQualityReport = async (reportId: string) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/quality-reports/${reportId}`);
            if (response.data.success) {
                const data: QualityReport = response.data.data;
                setSelectedPurchaseOrder(data.purchase_order);
                // Set form values
                form.setFieldsValue({
                    purchase_order_id: data.purchase_order_id,
                    inspection_date: dayjs(data.inspection_date),
                    inspected_by: data.inspected_by,
                    receiver_name: data.inspector?.name,
                    received_by: data.received_by,
                    action: data.action,
                    action_note: data.action_note,
                });

                console.log('form', form.getFieldsValue());
                const itemsData = data.items.map((item_report, index) => ({
                    id: item_report.id,
                    key: `parent-${item_report.id}`,
                    product_id: item_report.product_id,
                    sku: item_report.sku,
                    product_name: item_report.product_name,
                    ordered_quantity: item_report.order_item?.quantity,
                    received_quantity: item_report.received_quantity,
                    good_quantity: item_report.good_quantity,
                    qty_defect: item_report.qty_defect,
                    defect_type: item_report.defect_type,
                    note: item_report.note ?? '',
                    unit_price: item_report.order_item.price,
                    total_value: item_report.order_item.total,
                    order_item_id: item_report.id,
                    children: [],
                    is_parent: true,
                    is_child: false,
                    parent_index: index,
                    child_index: 0,
                }))
                console.log('item data', itemsData);
                setItems(itemsData);
                form.setFieldValue('items', itemsData);
            }
        } catch (error) {
            message.error('Gagal mengambil data quality report');
        } finally {
            setLoading(false);
        }
    };
    
    // Fetch purchase order details
    const fetchPurchaseOrderDetails = async (poId: number) => {
        try {
            const response = await axiosInstance.get(`/purchase-orders/${poId}`);
            if (response.status === 200) {
                const data_po: PurchaseOrder = response.data.data;
                setSelectedPurchaseOrder(data_po);
                form.setFieldValue('purchase_order_id', data_po.purchase_order_id);
                // Initialize items from purchase order if not in edit mode
                if (!isEditMode && response.data.data.items) {
                    // const items = transformItemsForTable([], response.data.data.items);
                    
                    const itemsData = data_po.items.map((itemPo, index) => ({
                        key: `parent-${index}`,
                        product_id: itemPo.product_id,
                        sku: itemPo.sku,
                        product_name: itemPo.product_name,
                        
                        ordered_quantity: itemPo.quantity,
                        received_quantity: itemPo.quantity,
                        good_quantity: 0,
                        qty_defect: 0,
                        defect_type: '',
                        note: '',
                        unit_price: itemPo.price,
                        total_value: itemPo.total,
                        order_item_id: itemPo.id,
                        children: itemPo.children.length > 0 ? itemPo.children.map((child, childIndex) => ({
                            order_item_id: child.id,
                            key: `parent-${index}-child-${childIndex}`,
                            product_id: child.product_id,
                            sku: child.sku,
                            product_name: child.product_name,
                            ordered_quantity: child.quantity,
                            received_quantity: child.quantity,
                            good_quantity: 0,
                            qty_defect: 0,
                            defect_type: '',
                            note: '',
                            unit_price: child.price,
                            total_value: child.total,
                            children: [],
                            is_parent: false,
                            is_child: true,
                            parent_index: index,
                            child_index: childIndex,
                        })) : [
                            {
                                order_item_id: itemPo.id,
                                key: `parent-${index}-child-${index}`,
                                product_id: itemPo.product_id,
                                sku: itemPo.sku,
                                product_name: itemPo.product_name,
                                ordered_quantity: itemPo.quantity,
                                received_quantity: itemPo.quantity,
                                good_quantity: 0,
                                qty_defect: 0,
                                defect_type: '',
                                note: '',
                                unit_price: itemPo.price,
                                total_value: itemPo.total,
                                children: [],
                                is_parent: false,
                                is_child: true,
                                parent_index: index,
                                child_index: index,
                            }
                        ],
                        is_parent: true,
                        is_child: false,
                        parent_index: index,
                        child_index: 0,
                    }))
                    console.log('item data', itemsData);
                    setItems(itemsData);
                    form.setFieldValue('items', itemsData);
                    itemsData.forEach(element => {
                        setExpandedRows(prev => new Set(prev).add(element.key));
                    });
                    
                }
            }
        } catch (error) {
            message.error(`Gagal mengambil detail purchase order ${error}`);
        }
    };

    // Handle purchase order selection
    const handlePurchaseOrderChange = (value: number) => {
        // setitems([]);
        fetchPurchaseOrderDetails(value);
    };

    // Handle item quantity changes
    const handleItemChange = (key: string, field: string, value: any) => {
        const foundItem = findItemByKey(items, key);
        if (!foundItem) return;

        const { item, parentKey } = foundItem;
        
        // Prepare updates based on field
        let updates: Partial<QualityReportItemFormTmp> = {};
        
        if (field === 'received_quantity') {
            const receivedQty = Number(value) || 0;
            const qtyDefect = item.qty_defect || 0;
            const goodQty = Math.max(0, receivedQty - qtyDefect);
            
            updates = {
                received_quantity: receivedQty,
                good_quantity: goodQty,
                total_value: item.unit_price * receivedQty
            };
        } else if (field === 'qty_defect') {
            const qtyDefect = Number(value) || 0;
            const receivedQty = item.received_quantity || 0;
            
            // Validate defect quantity doesn't exceed received
            if (qtyDefect > receivedQty) {
                message.warning('Jumlah defect tidak boleh melebihi jumlah diterima');
                return;
            }
            
            const goodQty = Math.max(0, receivedQty - qtyDefect);
            updates = {
                qty_defect: qtyDefect,
                good_quantity: goodQty
            };
        } else {
            updates = { [field]: value };
        }

        // Update the item
        const updatedItems = updateItemByKey(items, key, updates);
        setItems(updatedItems);
    };

    // Handle child item changes (when parent has children)
    const handleChildItemChange = (index: number, field: string, value: any) => {
        const updatedItems = [...items];

        let updates: Partial<QualityReportItemFormTmp> = {};

         if (field === 'received_quantity') {
            const receivedQty = Number(value) || 0;
            const qtyDefect = updatedItems[index].qty_defect || 0;
            const goodQty = Math.max(0, receivedQty - qtyDefect);
            console.log('good quantity', goodQty);
            updatedItems[index].received_quantity = Number(value);
            updatedItems[index].good_quantity = Number(goodQty);
        } else if (field === 'qty_defect') {
            const qtyDefect = Number(value) || 0;
            const receivedQty = updatedItems[index].received_quantity || 0;
            
            // Validate defect quantity doesn't exceed received
            if (qtyDefect > receivedQty) {
                message.warning('Jumlah defect tidak boleh melebihi jumlah diterima');
                return;
            }
            
            const goodQty = Math.max(0, receivedQty - qtyDefect);
            updatedItems[index].qty_defect = Number(value);
            updatedItems[index].good_quantity = Number(goodQty);
        } else{
            updates = { [field]: value };

            updatedItems[index] = {...updatedItems[index], ...updates};
        }
        
        setItems(updatedItems);
    };

    // Add custom defect type
    const handleAddDefectType = (value: string) => {
        if (value && !defectTypes.includes(value)) {
            setDefectTypes([...defectTypes, value]);
        }
    };

    // Remove item from list
    const removeItem = (key: string) => {
        const foundItem = findItemByKey(items, key);
        if (!foundItem) return;

        const { parentKey } = foundItem;
        
        if (parentKey) {
            // Remove child from parent
            const updatedItems = items.map(item => {
                if (item.key === parentKey) {
                    const filteredChildren = item.children.filter(child => child.key !== key);
                    return {
                        ...item,
                        children: filteredChildren
                    };
                }
                return item;
            });
            setItems(updatedItems);
        } else {
            // Remove parent item
            setItems(items.filter(item => item.key !== key));
        }
    };

    // Calculate summary statistics
    const calculateSummary = () => {
        let totalOrdered = 0;
        let totalReceived = 0;
        let totalGood = 0;
        let totalDefect = 0;
        let totalValue = 0;

        const calculateItemTotals = (items: QualityReportItemFormTmp[]) => {
            items.forEach(item => {
                // Add parent item totals
                totalOrdered += item.ordered_quantity || 0;
                totalReceived += item.received_quantity || 0;
                totalGood += item.good_quantity || 0;
                totalDefect += item.qty_defect || 0;
                totalValue += item.total_value || 0;

                // Add children totals (children are already included in parent totals)
                if (item.children && item.children.length > 0) {
                    // Note: Children values are already included in parent totals
                    // So we don't double-count them here
                    item.children.forEach(child => {
                        totalOrdered += child.ordered_quantity || 0;
                        totalReceived += child.received_quantity || 0;
                        totalGood += child.good_quantity || 0;
                        totalDefect += child.qty_defect || 0;
                        totalValue += child.total_value || 0;
                    });
                }
            });
        };

        calculateItemTotals(items);
        
        const defectPercentage = totalReceived > 0 
            ? ((totalDefect / totalReceived) * 100).toFixed(2)
            : '0.00';

        const quantityDifference = totalReceived - totalOrdered;
        const isQuantityMatch = quantityDifference === 0;

        return {
            totalOrdered,
            totalReceived,
            totalGood,
            totalDefect,
            totalValue,
            defectPercentage,
            quantityDifference,
            isQuantityMatch
        };
    };

    // Validate form before submit
    const validateForm = () => {
        const summary = calculateSummary();
        
        // Check if all items have defect type when defect exists
        const itemsWithDefectNoType: QualityReportItemFormTmp[] = [];
        
        const checkItems = (items: QualityReportItemFormTmp[]) => {
            items.forEach(item => {
                if (item.qty_defect > 0 && !item.defect_type.trim()) {
                    itemsWithDefectNoType.push(item);
                }
                if (item.children && item.children.length > 0) {
                    item.children.forEach(child => {
                        if (child.qty_defect > 0 && !child.defect_type.trim()) {
                            itemsWithDefectNoType.push(child);
                        }
                    });
                }
            });
        };
        
        checkItems(items);
        
        if (itemsWithDefectNoType.length > 0) {
            message.error('Harap isi tipe defect untuk item yang memiliki defect');
            return false;
        }

        // Check if received quantity is valid
        const invalidReceivedItems: QualityReportItemFormTmp[] = [];
        
        const checkReceivedQuantity = (items: QualityReportItemFormTmp[]) => {
            items.forEach(item => {
                if (item.received_quantity < 0 || item.received_quantity > item.ordered_quantity * 2) {
                    invalidReceivedItems.push(item);
                }
                if (item.children && item.children.length > 0) {
                    item.children.forEach(child => {
                        if (child.received_quantity < 0 || child.received_quantity > child.ordered_quantity * 2) {
                            invalidReceivedItems.push(child);
                        }
                    });
                }
            });
        };
        
        checkReceivedQuantity(items);
        
        if (invalidReceivedItems.length > 0) {
            message.error('Jumlah diterima tidak valid');
            return false;
        }

        return true;
    };

    // Handle form submission
    const handleSubmit = async (values: any) => {
        if (!validateForm()) return;
        
        setSubmitting(true);
        try {
            
            const payloadItem: {
                id: number,
                order_item_id: number,
                product_id: string, 
                sku: string, 
                product_name: string, 
                received_quantity: number, 
                good_quantity: number,
                qty_defect: number,
                defect_type: string,
                note: string,
            }[] = [];

            
            items.forEach(element => {
                payloadItem.push({
                    order_item_id: element.order_item_id!,
                    product_id: element.product_id,
                    sku: element.sku,
                    product_name: element.product_name,
                    received_quantity: element.received_quantity,
                    good_quantity: element.received_quantity - element.qty_defect,
                    qty_defect: element.qty_defect,
                    defect_type: element.defect_type,
                    note: element.note,
                    id: element.id!,
                })
            });

            const payload = {
                "id": id,
                "purchase_order_id": values.purchase_order_id,
                "inspection_date": values.inspection_date,
                "inspected_by": values.inspected_by,
                "receiver_name": values.receiver_name,
                "inspection_name": values.inspection_name,
                "received_by": values.received_by,
                "action": values.action,
                "action_note": values.action_note,
                "items": payloadItem,
            }

            
            // // Flatten items array (include both parent and children)
            // const flattenedItems: any[] = [];
            
            // const flattenItems = (items: QualityReportItemFormTmp[]) => {
            //     items.forEach(item => {
            //         // Add parent item
            //         flattenedItems.push({
            //             product_id: item.product_id,
            //             sku: item.sku,
            //             product_name: item.product_name,
            //             received_quantity: item.received_quantity,
            //             good_quantity: item.good_quantity,
            //             qty_defect: item.qty_defect,
            //             defect_type: item.defect_type,
            //             note: item.note,
            //         });
                    
            //         // Add children items
            //         if (item.children && item.children.length > 0) {
            //             item.children.forEach(child => {
            //                 flattenedItems.push({
            //                     product_id: child.product_id,
            //                     sku: child.sku,
            //                     product_name: child.product_name,
            //                     received_quantity: child.received_quantity,
            //                     good_quantity: child.good_quantity,
            //                     qty_defect: child.qty_defect,
            //                     defect_type: child.defect_type,
            //                     note: child.note,
            //                 });
            //             });
            //         }
            //     });
            // };
            
            // flattenItems(items);
            
            // const payload = {
            //     ...values,
            //     inspection_date: dayjs(values.inspection_date).format('YYYY-MM-DD'),
            //     items: flattenedItems
            // };

            const response = await axiosInstance.put(`/quality-reports/${id}`, payload);

            if (response.data.success) {
                message.success(`Pengecekan barang ${isEditMode ? 'diperbarui' : 'dibuat'}`);
                window.location.href = '/checking/' + id;
            } else {
                message.error(response.data.message || 'Terjadi kesalahan');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Terjadi kesalahan');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        Modal.confirm({
            title: 'Batalkan Perubahan?',
            content: 'Semua perubahan yang belum disimpan akan hilang.',
            okText: 'Ya, Batalkan',
            cancelText: 'Tidak',
            onOk: () => router.push('/quality/reports'),
        });
    };

    // Initialize data
    useEffect(() => {
        if (isEditMode && id) {
            fetchQualityReport(id as string);
        }
    }, [id, isEditMode]);

    useEffect(() => {
        if(po){
            fetchPurchaseOrderDetails(parseInt(po as string));
        }
    }, [po]);

    // Calculate summary for display
    const summary = calculateSummary();

    const toggleExpand = (key: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedRows(newExpanded);
    };

    // Table columns dengan pola yang sama seperti purchase order
const columns: TableColumnsType<QualityReportItemForm> = [
    {
        title: 'Produk',
        dataIndex: 'product_name',
        key: 'product_name',
        width: 250,
        render: (_: any, record: QualityReportItemForm, index: number) => record.product_name,
    },
    {
        title: 'SKU',
        dataIndex: 'sku',
        key: 'sku',
        width: 150,
        render: (_: any, record: QualityReportItemForm, index: number) => record.sku || '-',
    },
    {
        title: 'Dipesan',
        dataIndex: 'ordered_quantity',
        key: 'ordered_quantity',
        width: 100,
        align: 'center' as const,
        render: (_: any, record: QualityReportItemForm, index: number) => (
            <Tag color="blue">{record.ordered_quantity}</Tag>
        ),
    },
    {
        title: 'Diterima',
        key: 'received_quantity',
        width: 120,
        render: (_: any, record: QualityReportItemForm, index: number) => {
            return <Form.Item
                        name={['items', index, 'received_quantity']}
                        
                        className="m-0"
                    >
                        <InputNumber
                            min={0}
                            max={record.ordered_quantity * 2}
                            onChange={(value) => handleChildItemChange(
                                index,
                                'received_quantity',
                                value
                            )}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                
        },
    },
    {
        title: 'Tidak Sesuai',
        key: 'qty_defect',
        width: 120,
        render: (_: any, record: QualityReportItemForm, index: number) => {
            return (
                <Form.Item
                    name={['items', index, 'qty_defect']}
                    
                    className="m-0"
                >
                <InputNumber
                    min={0}
                    onChange={(value) => handleChildItemChange(
                       index,
                        'qty_defect',
                        value
                    )}
                    style={{ width: '100%' }}
                />
                </Form.Item>
            );
        },
    },
    {
        title: 'Baik',
        dataIndex: 'good_quantity',
        key: 'good_quantity',
        width: 100,
        align: 'center' as const,
        render: (_: any, record: QualityReportItemForm, index: number) => (
            <Tag color={record.good_quantity === record.received_quantity ? 'green' : 'orange'}>
                {record.good_quantity}
            </Tag>
        ),
    },
    {
        title: 'Kerusakan',
        key: 'defect_type',
        width: 150,
        render: (_: any, record: QualityReportItemForm, index: number) => {
            return (
                <Form.Item
                    name={['items', index, 'defect_type']}
                    
                    className="m-0"
                >
                    <Select
                        value={record.defect_type}
                        onChange={(value) => handleChildItemChange(
                            index,
                            'defect_type',
                            value
                        )}
                        style={{ width: '100%' }}
                        placeholder="Pilih tipe"
                        allowClear
                        disabled={record.qty_defect === 0}
                    >
                        {defectTypes.map(type => (
                            <Option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            )
        },
    },
    {
        title: 'Catatan',
        key: 'note',
        width: 200,
        render: (_: any, record: QualityReportItemForm, index: number) => {
            return (
                <Form.Item
                    name={['items', record.parent_index, 'children', record.child_index, 'note']}
                    
                    className="m-0"
                >
                <Input
                    onChange={(e) => handleChildItemChange(
                        index,
                        'note',
                        e.target.value
                    )}
                    placeholder="Catatan"
                    size="small"
                />
                </Form.Item>
                
            );
        },
    },
    // {
    //     title: 'Harga',
    //     key: 'total_value',
    //     width: 120,
    //     align: 'right' as const,
    //     render: (_: any, record: QualityReportItemForm) => (
    //         <Typography.Text strong>
    //             {formatRupiah(record.total_value)}
    //         </Typography.Text>
    //     ),
    // },
    
];

    

    const getPurchaseOrders = async () => {
        setLoading(true);
        try {
            const request_param: NewRequestParam = {
                table: "purchase_orders",
                request_column: [],
                limit: 10,
                page: 1,
                orderBy: {
                    order_date: "DESC",
                },
                where: {
                    status: ['in', [PurchaseOrderStatus.RECEIVED]]
                },
            };
            const response = await axiosInstance.post(
                "/purchase-orders/search",
                request_param
            );
            if (response.status === 200) {
                console.log('purchase order', response.data.data.data);
                setPurchaseOrders(response.data.data.data.data);
            }
        } catch (error: any) {
            message.error(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const fetchUser = async (query: string) => {
        try {
            const request_param: NewRequestParam = {
                table: "user",
                request_column: [],
                limit: 10,
                page: 1,
                orderBy: {
                    created_at: "DESC",
                },
                where: {},
            };
            const response = await axiosInstance.post(`/search`, request_param);
            if (response.status == 200) {
                const users: User[] = response.data.data.data;
                
                if (users.length > 0) {
                    const result = users?.map((data: User) => {
                        return {
                            value: `${data.name}-${data.email}`,
                            label: `${data.name}-${data.email}`,
                            object: data,
                        };
                    });
                    setOptionItemUser(result);
                } else {
                    setOptionItemUser([]);
                }
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            message.error(`${error}`);
        }
    };

    const onSelectUser = (value: string, option: any, fieldName: string, name: string) => {
        if (option.object != undefined) {
            const item: User = option.object;
            form.setFieldValue(fieldName, item.id);
            form.setFieldValue(name, item.name);

            console.log(item);
        }
    };

    const showStatus = () => {
        if (selectedPurchaseOrder?.status === "completed") return <Tag color="green">SELESAI</Tag>;
        if (selectedPurchaseOrder?.status === "pending") return <Tag color="orange">PENDING</Tag>;
        if (selectedPurchaseOrder?.status === "cancel") return <Tag color="red">BATAL</Tag>;
        if (selectedPurchaseOrder?.status === "received") return <Tag color="blue">DITERIMA</Tag>;
        return <Tag color="default">DRAFT</Tag>;
    };

    useEffect(() => {
        getPurchaseOrders();
    }, []);

    return (
        <DashboardLayout>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    inspection_date: dayjs(),
                    action: 'accept',
                }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <Typography.Title level={3}>
                            {isEditMode ? 'Edit Pengecekan Barang' : 'Buat Pengecekan Barang Baru'}
                        </Typography.Title>
                        <Typography.Text type="secondary">
                            {isEditMode 
                                ? 'Perbarui laporan inspeksi kualitas barang' 
                                : 'Buat laporan inspeksi kualitas barang yang diterima'
                            }
                        </Typography.Text>
                    </div>
                    <Space>
                        <Button
                            icon={<CloseOutlined />}
                            onClick={handleCancel}
                            disabled={submitting}
                        >
                            Batal
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            htmlType="submit"
                            loading={submitting}
                        >
                            {isEditMode ? 'Update' : 'Simpan'}
                        </Button>
                    </Space>
                </div>

                {/* Summary Alert */}
                {summary.totalDefect > 0 && (
                    <Alert
                        message="Item tidak sesuai Ditemukan"
                        description={`Terdapat ${summary.totalDefect} item yang tidak sesuai (${summary.defectPercentage}%) dalam laporan ini.`}
                        type="warning"
                        showIcon
                        icon={<ExclamationCircleOutlined />}
                        className="mb-6"
                    />
                )}

                <Row gutter={24}>
                    {/* Left Column - Form */}
                    <Col span={16}>
                        <Card 
                            title="Informasi Quality Report" 
                            className="mb-6"
                            loading={loading}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Purchase Order"
                                        name="purchase_order_id"
                                        rules={[{ required: true, message: 'Pilih purchase order' }]}
                                    >
                                        <Select
                                            placeholder="Pilih Purchase Order"
                                            onChange={handlePurchaseOrderChange}
                                            disabled={isEditMode}
                                            showSearch
                                            optionFilterProp="label"
                                            filterOption={(input, option) =>
                                                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                                            }
                                        >
                                            {purchaseOrders.map(po => (
                                                <Option key={po.purchase_order_id} value={po.purchase_order_id}>
                                                    {po.invoice_number} - {po.vendor_name} 
                                                    ({formatRupiah(po.total_amount)})
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                
                                <Col span={12}>
                                    <Form.Item
                                        label="Tanggal Inspeksi"
                                        name="inspection_date"
                                        rules={[{ required: true, message: 'Pilih tanggal inspeksi' }]}
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            format="DD/MM/YYYY"
                                            placeholder="Pilih tanggal"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                <Form.Item name="received_by" hidden>
                                    <Input type="hidden" />
                                </Form.Item>
                                <Form.Item name="inspected_by" hidden>
                                    <Input type="hidden" />
                                </Form.Item>
                                    <Form.Item
                                        label="Diperiksa Oleh"
                                        name="inspection_name"
                                        rules={[{ required: true, message: 'Isi pemeriksa' }]}
                                    >
                                        <AutoComplete
                                            options={optionUser}
                                            filterOption={false}
                                            onSelect={(value, option) => onSelectUser(value, option, 'inspected_by', 'inspection_name')}
                                            onSearch={(value) => fetchUser(value)}
                                            placeholder="Cari Pemeriksa"
                                        />
                                    </Form.Item>
                                </Col>
                                
                                <Col span={12}>
                                    <Form.Item
                                        label="Diterima Oleh"
                                        name="receiver_name"
                                        rules={[{ required: true, message: 'Isi penerima' }]}
                                    >
                                        <AutoComplete
                                            options={optionUser}
                                            filterOption={false}
                                            onSelect={(value, option) => onSelectUser(value, option, 'received_by', 'receiver_name')}
                                            onSearch={(value) => fetchUser(value)}
                                            placeholder="Cari Penerima"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Tindakan"
                                        name="action"
                                        rules={[{ required: true, message: 'Pilih tindakan' }]}
                                    >
                                        <Select placeholder="Pilih tindakan">
                                            {actionTypes.map(action => (
                                                <Option key={action.value} value={action.value}>
                                                    <Tag color={action.color}>{action.label}</Tag>
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Catatan"
                                name="action_note"
                            >
                                <TextArea
                                    rows={3}
                                    placeholder="Keterangan tindakan yang akan dilakukan..."
                                />
                            </Form.Item>
                        </Card>

                    </Col>

                    {/* Right Column - Summary & Info */}
                    <Col span={8}>
                        {/* Purchase Order Info */}
                        {selectedPurchaseOrder && (
                            <Card 
                                title="Purchase Order Info" 
                                className="mb-6"
                                extra={
                                    showStatus()
                                }
                            >
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Invoice">
                                        <Typography.Text strong>
                                            {selectedPurchaseOrder.invoice_number}
                                        </Typography.Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Vendor">
                                        {selectedPurchaseOrder.vendor?.name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Order Date">
                                        <Space>
                                            <CalendarOutlined />
                                            {formatDate(selectedPurchaseOrder.order_date)}
                                        </Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Due Date">
                                        <Space>
                                            <CalendarOutlined />
                                            {formatDate(selectedPurchaseOrder.due_date)}
                                        </Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Total">
                                        <Typography.Text strong type="success">
                                            {formatRupiah(selectedPurchaseOrder.total_amount)}
                                        </Typography.Text>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        )}


                    </Col>
                </Row>
                 <Card
                            title="Produk Di Check"
                            className="mb-6"
                            extra={
                                <Typography.Text type="secondary">
                                    {items.reduce((sum, item) => 
                                        sum + 1 + (item.children?.length || 0), 0
                                    )} Item
                                </Typography.Text>
                            }
                        >
                            {selectedPurchaseOrder ? (
                                <>
                                    
                                    <Table
                                        columns={columns}
                                        dataSource={getFlattenedItems()}
                                        pagination={false}
                                        size="middle"
                                        summary={() => (
                                            <Table.Summary fixed>
                                                <Table.Summary.Row>
                                                    <Table.Summary.Cell index={0} colSpan={2}>
                                                        <Typography.Text strong>TOTAL KESELURUHAN</Typography.Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell align="center" index={1}>
                                                        <Typography.Text strong>{summary.totalOrdered}</Typography.Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={2}>
                                                        <Typography.Text strong>{summary.totalReceived}</Typography.Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={3}>
                                                        <Typography.Text strong type={summary.totalDefect > 0 ? "danger" : "success"}>
                                                            {summary.totalDefect}
                                                        </Typography.Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell align="center" index={4}>
                                                        <Typography.Text strong>{summary.totalGood}</Typography.Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={5} colSpan={2} />
                                                    <Table.Summary.Cell index={7} />
                                                </Table.Summary.Row>
                                            </Table.Summary>
                                        )}
                                    />

                                    
                                    <Divider />
                                    
                                    <div className="flex justify-between items-center">
                                       
                                        <Space>
                                            <Typography.Text type="secondary">
                                                Defect Rate: <Typography.Text strong>{summary.defectPercentage}%</Typography.Text>
                                            </Typography.Text>
                                        </Space>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <ShoppingOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                                    <Typography.Paragraph type="secondary" className="mt-4">
                                        Pilih Purchase Order untuk menampilkan item
                                    </Typography.Paragraph>
                                </div>
                            )}
                        </Card>
            </Form>
        </DashboardLayout>
    );
};

export default CheckingEdit;