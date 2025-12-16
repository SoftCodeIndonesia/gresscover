import { useEffect, useState } from "react";
import DashboardLayout from "../component/DashboardLayout";
import axiosInstance from "@/utils/axiosInstance";
import { 
  Button, 
  Form, 
  Input, 
  message, 
  Select, 
  Table, 
  Modal, 
  DatePicker, 
  Breadcrumb,
  InputNumber,
  Divider,
  Space,
  Card,
  AutoCompleteProps,
  AutoComplete,
  TableColumnsType
} from "antd";
import { 
  DeleteOutlined, 
  PlusOutlined, 
  MinusCircleOutlined,
  PlusCircleOutlined,
  SearchOutlined, 
  CaretDownOutlined,
  CaretRightOutlined
} from '@ant-design/icons';
import { formatRupiah } from "@/utils/format_rupiah";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import { getCookie } from "cookies-next";
import { Pagination } from "@/type/pagination";
import { handlePriceChange } from "@/utils/validate_price_change";
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderItemForm, PurchaseOrderItemFormAction } from "@/type/purchase";
import { Vendor } from "@/type/vendor";
import { NewRequestParam } from "@/type/request_param";
import { SearchInventoryResult } from "@/type/search_inventory_result";
import { Item, ItemUnit } from "@/type/item";






const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

const AddEditInvoice: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [items, setItems] = useState<PurchaseOrderItem[]>([{
    key: `parent-${0}`,
    product_id: '',
    sku: '',
    product_name: '',
    variant_id: '',
    quantity: 1,
    price: 0,
    total: 0,
    children: [],
    unit_id: '',
    unit_name: '',
    is_parent: false,
    action: PurchaseOrderItemFormAction.CREATE,
  }]);

  const [optionItem, setOptionsItem] = useState<AutoCompleteProps['options']>([]);
  const [optionUnit, setOptionUnit] = useState<AutoCompleteProps['options']>([]);
  
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [purchaseOrderEdit, setPurchaseOrderEdit] = useState<PurchaseOrder|null>(null);
  
  const router = useRouter();
  const [form] = Form.useForm();

  const [requestParamVendor, setRequestParamVendor] = useState<NewRequestParam>({
        table: "",
        orderBy: {
            created_at: "DESC",
        },
        limit: 10,
        page: 1,
    });

  // Status options
  const statusOptions = [
    { label: 'Draft', value: 'draft' },
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  // Bank options
  const bankOptions = [
    { label: 'BCA', value: 'BCA' },
    { label: 'BRI', value: 'BRI' },
    { label: 'BNI', value: 'BNI' },
    { label: 'Mandiri', value: 'Mandiri' },
    { label: 'Bank Lainnya', value: 'other' }
  ];
  const paymentMethod = [
    { label: 'Bank Transfer', value: 'bank' },
    { label: 'Cash', value: 'cash' },
    { label: 'COD', value: 'cod' },
  ];

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      const response = await axiosInstance.post('/vendors/search', {
        requestParamVendor
      });
      if (response.status === 200) {
        const vendorOptions = response.data.data.data.map((vendor: Vendor) => ({
          label: vendor.name,
          value: vendor.id,
          data: vendor
        }));
        setVendors(vendorOptions);
      }
    } catch (error) {
      message.error('Gagal mengambil data vendor');
    }
  };

  // Fetch products for search
  const searchProducts = async (query: string) => {
    try {
      const response = await axiosInstance.post('/products/search', {
        keyword: query,
        limit: 10,
        page: 1
      });
      
      if (response.status === 200) {
        const productsData = response.data.data.data.map((product: any) => ({
          value: product.product_name,
          label: `${product.product_name} - ${product.sku}`,
          data: product
        }));
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Calculate totals
  const calculateTotals = (itemsData: PurchaseOrderItem[], additionalCost: number = 0, discount: number = 0, ppn: number = 0) => {
    const newSubtotal = itemsData.filter((value) => value.action != PurchaseOrderItemFormAction.DELETE).reduce((sum, item) => sum + item.total, 0);
    const newTotal = newSubtotal + additionalCost - discount + ppn;
    
    setSubtotal(newSubtotal);
    setTotalAmount(newTotal);
    
    form.setFieldsValue({
      subtotal: newSubtotal,
      total_amount: newTotal
    });
  };

  // Handle item selection
  const handleItemSelect = (value: string, option: any, index: number) => {
    if (option.data) {
      const newItems = [...items];
      const product = option.data;
      
      newItems[index] = {
        ...newItems[index],
        product_id: product.id,
        sku: product.sku,
        product_name: product.product_name,
        price: product.price || 0,
        total: (product.price || 0) * newItems[index].quantity
      };
      
      setItems(newItems);
      calculateTotals(newItems, 
        form.getFieldValue('additional_cost') || 0, 
        form.getFieldValue('discount_amount') || 0,
        form.getFieldValue('ppn_amount') || 0
      );
    }
  };

  // Handle quantity change
  const handleQuantityChange = (value: number | null, index: number) => {
    if (value !== null && value > 0) {
      const newItems = [...items];
      newItems[index].quantity = value;
      newItems[index].total = newItems[index].price * value;
      
      setItems(newItems);
      calculateTotals(newItems, 
        form.getFieldValue('additional_cost') || 0, 
        form.getFieldValue('discount_amount') || 0,
        form.getFieldValue('ppn_amount') || 0
      );
    }
  };

  // Handle price change
  const handlePriceChange = (value: string, index: number) => {
    const newItems = [...items];
    const price = parseInt(value) || 0;
    newItems[index].price = price;
    newItems[index].total = price * newItems[index].quantity;
    
    setItems(newItems);
    calculateTotals(newItems, 
      form.getFieldValue('additional_cost') || 0, 
      form.getFieldValue('discount_amount') || 0,
      form.getFieldValue('ppn_amount') || 0
    );
  };

  // Add new item row
  const addItemRow = () => {
    const newKey = items.length;
    setItems([
      ...items,
      {
        key: `parent-${newKey}`,
        product_id: '',
        sku: '',
        product_name: '',
        variant_id: '',
        quantity: 1,
        price: 0,
        total: 0,
        children: [],
        unit_id: '',
        unit_name: '',
        is_parent: false,
        action: PurchaseOrderItemFormAction.CREATE,
      }
    ]);
  };

  // Remove item row
  const removeItemRow = (key: string, is_parent: boolean) => {
    const id = router.query.id as string;
    if(is_parent){

      const newItem = [...items];

      const findIndex = newItem.findIndex((value) => value.key == key);
      if(id){
        newItem[findIndex].action = PurchaseOrderItemFormAction.DELETE;
        newItem[findIndex].children = newItem[findIndex].children.map((child) => ({...child, action: PurchaseOrderItemFormAction.DELETE}));
        setItems(newItem);
        calculateTotals(newItem);
        form.setFieldValue('items', newItem);
      }else{
        const filter = newItem.filter((value) => value.key != key);
        setItems(filter);
        calculateTotals(filter);
        form.setFieldValue('items', filter);
      }
    }else{
      const newItem = [...items];
      const [parentKey, childIndex] = key.split('-child-');
      const findIndex = newItem.findIndex((value) => value.key == parentKey);

      newItem[findIndex].children.forEach(element => {
        if(element.key == key){
          element.action = PurchaseOrderItemFormAction.DELETE;
        }
      });
      setItems(newItem);
      // items[findIndex].children = items[findIndex].children.map((child) => ({...child, action: PurchaseOrderItemFormAction.DELETE}));
      calculateTotals(newItem);
      form.setFieldValue('items', newItem);
    }

    // if (items.length > 1) {
    //   const newItems = items.filter((_, i) => i !== index);
    //   setItems(newItems);
    //   calculateTotals(newItems, 
    //     form.getFieldValue('additional_cost') || 0, 
    //     form.getFieldValue('discount_amount') || 0,
    //     form.getFieldValue('ppn_amount') || 0
    //   );
    // }
  };

  // Handle vendor selection
  const handleVendorSelect = (value: number, option: any) => {
    if (option.data) {
      const vendor: Vendor = option.data;
      form.setFieldsValue({
        vendor_name: vendor.name,
        vendor_address: vendor.address,
        vendor_phone: vendor.phone,
        vendor_email: vendor.email,
        payment: {
          account_name: vendor.name
        }
      });
    }
  };

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `INV-${year}${month}${day}-${random}`;
  };

  // Fetch invoice data for editing
  const fetchPurchaseOrderData = async (id: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/purchase-orders/${id}`);
      if (response.status === 200) {
        const invoice: PurchaseOrder = response.data.data;
        setPurchaseOrderEdit(invoice);
        
        
        // Set form values
        form.setFieldsValue({
          ...invoice,
          vendor_id: invoice.vendor?.id,
          order_date: dayjs(invoice.order_date),
          invoice_date: invoice.invoice_date ? dayjs(invoice.invoice_date) : null,
          due_date: dayjs(invoice.due_date),
          vendor_name: invoice.vendor.name,
          vendor_address: invoice.vendor.address,
          vendor_phone: invoice.vendor.phone,
          vendor_email: invoice.vendor.email,
          
        });

        
        // Set totals
        setSubtotal(invoice.subtotal);
        setTotalAmount(invoice.total_amount);
        
        setIsEditing(true);
        setInvoiceId(id);

        // Set items for table
        const tableItems = invoice.items.map((item, index) => ({
          ...item,
          key: `parent-${index}`,
          id: item.id,
          children: item.children.map((child, indexChild) => ({
              key: `parent-${index}-child-${indexChild}`, // Pastikan key unik
              ...child,
              is_parent: false,
              action: PurchaseOrderItemFormAction.UPDATE,
            })),
          action: PurchaseOrderItemFormAction.UPDATE,
        }));

        tableItems.forEach(element => {
          if(element.children.length > 0){
            setExpandedRows(prev => new Set(prev).add(element.key));
            // setExpandedRows([...expandedRows, element.key]);
          }
        });

        setItems(tableItems);

        
      }
    } catch (error) {
      message.error('Gagal mengambil data invoice');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    try {
      // Prepare items data
      const itemsData = items.map(item => ({
        product_id: item.product_id,
        sku: item.sku,
        product_name: item.product_name,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        unit_id: item.unit_id,
        unit_name: item.unit_name,
        children: item.children,
      }));

      const itemsToAdd: any[] = [];
      items.forEach((item) => {
        if(item.product_id){
          if(item.id){
            itemsToAdd.push({
              "id": item.id,
              "action": item.action,
              "product_id": item.product_id,
              "variant_id": item.variant_id,
              "quantity": item.quantity,
              "price": item.price,
              "unit_id": item.unit_id,
              "unit_name": item.unit_name,
              
            });
        }else{
          itemsToAdd.push({
            "action": item.action,
            "product_id": item.product_id,
            "variant_id": item.variant_id,
            "quantity": item.quantity,
            "price": item.price,
            "unit_id": item.unit_id,
            "unit_name": item.unit_name,
          });
        }
        if(item.children.length > 0){
          item.children.forEach((child) => {
            if(child.id){
              itemsToAdd.push({
                "id": child.id,
                "action": child.action,
                "product_id": child.product_id,
                "variant_id": child.variant_id,
                "quantity": child.quantity,
                "price": child.price,
                "unit_id": child.unit_id,
                "unit_name": child.unit_name,
              });
            }else{
              itemsToAdd.push({
                "action": child.action,
                "product_id": child.product_id,
                "variant_id": child.variant_id,
                "quantity": child.quantity,
                "price": child.price,
                "unit_id": child.unit_id,
                "unit_name": child.unit_name,
              });
            }
          })
        }
        }
        
      })
      

      // Prepare invoice data
      const invoiceData = {
        vendor_id: values.vendor_id,
        invoice_number: values.invoice_number,
        order_date: values.order_date.format('YYYY-MM-DD'),
        invoice_date: values.invoice_date ? values.invoice_date.format('YYYY-MM-DD') : null,
        subtotal: values.subtotal,
        additional_cost: values.additional_cost || 0,
        discount_amount: values.discount_amount || 0,
        ppn_amount: values.ppn_amount || 0,
        total_amount: values.total_amount,
        due_date: values.due_date.format('YYYY-MM-DD'),
        payment_method: values.payment_method,
        bank_name: values.payment.bank,
        bank_account_number: values.payment.account_number,
        bank_account_holder: values.payment.account_name,
        status: values.status,
        notes: values.notes || '',
        items: itemsToAdd,
        vendor: {
          id: 0,
          name: "",
          address: "",
          phone: "",
          email: ""
        }
      };

      console.log('data', invoiceData)
      
      let response;
      if (isEditing && invoiceId) {
        response = await axiosInstance.put(`/purchase-orders/${invoiceId}`, invoiceData);
      } else {
        response = await axiosInstance.post<{data: PurchaseOrder}>('/purchase-orders', {...invoiceData, status: 'draft'});
      }
      
      if (response.status === 200 || response.status === 201) {
        message.success(`Invoice berhasil ${isEditing ? 'diperbarui' : 'dibuat'}`);
        console.log(response.data);
        if(response.data.data){
          if(!isEditing){
            router.push(`/purchase/${response.data.data.purchase_order_id}`);
          }
        }
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  // Initialize form
  const initializeForm = () => {
    if (!isEditing) {
      form.setFieldsValue({
        invoice_number: '',
        order_date: dayjs(),
        due_date: dayjs().add(15, 'days'),
        status: 'draft',
        additional_cost: 0,
        discount_amount: 0,
        ppn_amount: 0,
        subtotal: 0,
        total_amount: 0,
        payment: {
          bank: '',
          account_number: '',
          account_name: '',
        }
      });
    }
  };

  useEffect(() => {
    fetchVendors();
    
    
    const id = router.query.id as string;
    if (id) {
      fetchPurchaseOrderData(id);
    }else{
      initializeForm();
    }
  }, [router.query.id]);

  const fetchItems = async (query: string) => {
      
      try {
          const querySearch: NewRequestParam = {
              limit: 100,
              page: 1,
              table: 'product',
              keyword: query,
              type: "search",
          }
          const response = await axiosInstance.post(`/items_search`, querySearch);
          if(response.status == 200){
              const items: Item[] = response.data.data.data;
              
              if(items.length > 0){
                  const result = items?.map((data: Item) => {
                      return {
                          value: `${data.name}-${data.barcode}`,
                          label: `${data.name}-${data.barcode}`,
                          object: data,
                      }
                  })
                  setOptionsItem(result);
              }else{
                  setOptionsItem([]);
              }
          }else{
              message.error(response.data.message);
          }
      } catch (error) {
          message.error(`${error}`);
      }
  }
  const fetchUnit = async (query: string, is_parent: boolean) => {
      console.log('is parent', is_parent);
      try {
          const querySearch: NewRequestParam = {
              limit: 100,
              page: 1,
              table: 'unit',
              keyword: query,
              type: "search",
              where: [
                {
                  max_value: is_parent == false ? ['=', 1] : ['>=', 1] 
                }
              ]
          }
          const response = await axiosInstance.post(`/search`, querySearch);
          if(response.status == 200){
              const items: ItemUnit[] = response.data.data.data;
              
              if(items.length > 0){
                  const result = items?.map((data: ItemUnit) => {
                      return {
                          value: `${data.name}`,
                          label: `${data.name}`,
                          object: data,
                      }
                  })
                  setOptionUnit(result);
              }else{
                  setOptionUnit([]);
              }
          }else{
              message.error(response.data.message);
          }
      } catch (error) {
          message.error(`${error}`);
      }
  }

  const onSelectUnit = (value: string, option: any, index: number, is_parent: boolean, recordKey: string) => {
    console.log('index', index);
    if(option.object != undefined){

      if(is_parent){
        const findIndex = items.findIndex((value) => value.key == recordKey);
        const item: ItemUnit = option.object;
        const newData = [...items];
        
        newData[findIndex].unit_id = item.type_id;
        newData[findIndex].unit_name = item.name;
        newData[findIndex].unit = item;
        newData[findIndex].is_parent = (item.max_value || 1) > 1 ? true : false;
        
        if((item.max_value || 1) > 1){
          // Auto-expand ketika unit dengan max_value > 1 dipilih
          setExpandedRows(prev => new Set(prev).add(newData[findIndex].key!));
          
          newData[findIndex].children = [
            {
              key: `${newData[findIndex].key}-child-${0}`, // Pastikan key unik
              product_id: '',
              sku: '',
              product_name: '',
              variant_id: '',
              quantity: 1,
              price: 0,
              total: 0,
              children: [],
              unit_id: '',
              unit_name: 'pcs',
              is_parent: false,
              action: PurchaseOrderItemFormAction.CREATE,
            }
          ]
        }else{
          newData[findIndex].children = [];
          // Collapse jika bukan parent
          setExpandedRows(prev => {
            const newSet = new Set(prev);
            newSet.delete(newData[findIndex].key!);
            return newSet;
          });
        }
        
        setItems(newData);
      }else{
        const [parentKey, childIndex] = recordKey.split('-child-');
        const parentIndex = items.findIndex(item => item.key === parentKey);

        if (parentIndex >= 0 && childIndex !== undefined) {
          const childIdx = parseInt(childIndex);

          const item: ItemUnit = option.object;
          const newData = [...items];
          
          newData[parentIndex].children[childIdx].unit_id = item.type_id;
          newData[parentIndex].children[childIdx].unit_name = item.name;
          newData[parentIndex].children[childIdx].is_parent = (item.max_value || 1) > 1 ? true : false;
          newData[parentIndex].children[childIdx].unit = item;
          
          
          
          setItems(newData);
        }

        
      }

      
    }
  }
  const onSelectItem = (value: string, option: any, recordKey: string, is_parent: boolean) => {
    console.log('recordKey', recordKey);
    
    if (option.object != undefined) {
      const item: Item = option.object;
      const newData = [...items];
      
      if (is_parent) {
        // Untuk parent item
        const findIndex = items.findIndex((value) => value.key == recordKey);
        console.log('index', recordKey);
        if (findIndex >= 0) {
          newData[findIndex].product_name = value;
          newData[findIndex].sku = item.sku;
          newData[findIndex].quantity = 1;
          newData[findIndex].price = parseInt(item.cost || '0');
          newData[findIndex].product_id = item.product_id;
          newData[findIndex].total = parseInt(item.cost || '0');
        }
      } else {
        // Untuk child item - cari parent dan child index
        const [parentKey, childIndex] = recordKey.split('-child-');
        const parentIndex = items.findIndex(item => item.key === parentKey);
        
        if (parentIndex >= 0 && childIndex !== undefined) {
          const childIdx = parseInt(childIndex);
          if (newData[parentIndex].children && newData[parentIndex].children[childIdx]) {
            newData[parentIndex].children[childIdx].product_id = items[parentIndex].product_id;
            newData[parentIndex].children[childIdx].variant_id = item.product_id;
            newData[parentIndex].children[childIdx].product_name = value;
            newData[parentIndex].children[childIdx].sku = item.sku;
            newData[parentIndex].children[childIdx].price = parseInt(item.cost || '0');
            newData[parentIndex].children[childIdx].total = parseInt(item.cost || '0') * 
              newData[parentIndex].children[childIdx].quantity;
          }
        }
      }
      console.log('new data', newData);
      setItems(newData);
      calculateTotals(newData, 
        form.getFieldValue('additional_cost') || 0, 
        form.getFieldValue('discount_amount') || 0,
        form.getFieldValue('ppn_amount') || 0
      );
    }
  }

  const toggleExpand = (key: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  const getFlattenedItems = () => {
    const flattened: PurchaseOrderItemForm[] = [];
    
    items.filter((filter) => filter.action != PurchaseOrderItemFormAction.DELETE).forEach((item, index) => {
      // Add parent item

      // const newItem: PurchaseOrderItemForm = {...item};
      const { children, ...newItem } = item;
      

      if(newItem.action != PurchaseOrderItemFormAction.DELETE){
        flattened.push({
          ...newItem,
          key: `parent-${index}`,
          originalIndex: index,
          isExpanded: false,
          action: newItem.action || PurchaseOrderItemFormAction.CREATE,
        });
      }
      
      // Add children only if expanded
      if (expandedRows.has(item.key!) && item.children && item.children.length > 0) {
        item.children.forEach((child, childIndex) => {
          const { children, ...newItemChild } = child;
          if(child.action != PurchaseOrderItemFormAction.DELETE){
            flattened.push({
              ...newItemChild,
              key: child.key,
              parentIndex: index,
              childIndex: childIndex,
              isChild: true,
              action: child.action || PurchaseOrderItemFormAction.CREATE,
            });
          }
        });
      }
    });

    console.log('flatten', flattened);
    
    return flattened;
  };

  const addNewChild = async (key: string) => {
    const findIndex = items.findIndex((value) => value.key == key);

    const newData = [...items];

    if(findIndex >= 0){
      const currentQty = newData[findIndex].children.reduce((sum, item) => sum + (item.quantity || 0), 0);
      if(newData[findIndex].unit?.max_value == currentQty){
        message.error(`Quantity Sudah Melibihi Batas!`);
      }else{
        newData[findIndex].children = [
            ...newData[findIndex].children,
            {
              key: `${newData[findIndex].key}-child-${newData[findIndex].children.length}`, // Pastikan key unik
              product_id: '',
              sku: '',
              product_name: '',
              variant_id: '',
              quantity: 1,
              price: 0,
              total: 0,
              children: [],
              unit_id: '',
              unit_name: 'pcs',
              is_parent: false,
              action: PurchaseOrderItemFormAction.CREATE,
            }
        ]
      }
    }

    console.log('new data', newData);

    setItems(newData);
  }

  // Table columns
  const columns: TableColumnsType<PurchaseOrderItemForm> = [
    {
      title: 'Produk',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 400,
      fixed: 'left',
      render: (_: any, record: PurchaseOrderItemForm, index: number) => {
        const isChild = record.isChild;
        
        if (isChild) {
          // Render untuk child item
          const parentIndex = record.parentIndex;
          const childIndex = record.childIndex;
          
          return (
            <div style={{ paddingLeft: '32px', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '8px' }}>↳</span>
              <Form.Item
                name={['items', parentIndex!, 'children', childIndex!, 'product_name']}
                
                className="m-0 flex-1"
              >
                <AutoComplete
                  options={optionItem}
                  filterOption={false}
                  style={{ width: 400 }}

                  onSelect={(value, option) => onSelectItem(value, option, record.key!, false)}
                  onSearch={(value) => fetchItems(value)}
                  placeholder="Pilih produk untuk varian"
                />
              </Form.Item>
            </div>
          );
        } else {
          // Render untuk parent item
          const itemIndex = items.findIndex(item => item.key === record.key);
          const isExpandable = record.is_parent;
          console.log('record', record);
          console.log('items', items);
          return (
            <div className="flex items-center gap-2">
              <Button 
                size="small" 
                icon={<PlusCircleOutlined />} 
                onClick={() => addNewChild(record.key!)}
                type="link"
              />
              <Form.Item
                name={['items', itemIndex, 'product_name']}
                
                className="m-0 flex-1"
              >
                <AutoComplete
                
                  options={optionItem}
                  filterOption={false}
                  style={{ width: 400 }}
                  onSelect={(value, option) => onSelectItem(value, option, record.key!, true)}
                  onSearch={(value) => fetchItems(value)}
                  placeholder="Cari/Pilih Product"
                />
              </Form.Item>
            </div>
          );
        }
      },
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 150,
      // render: (_: any, record: any) => {record.sku
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 150,
      render: (_: any, record: PurchaseOrderItemForm, index: number) => {
        const isChild = record.isChild;
        
        if (isChild) {
          const parentIndex = record.parentIndex;
          const childIndex = record.childIndex;
          
          const handleChildQuantityChange = (value: number | null) => {
            if (value !== null && value > 0) {
              const newItems = [...items];
              if (newItems[parentIndex!].children && newItems[parentIndex!].children[childIndex!]) {

                

                newItems[parentIndex!].children[childIndex!].quantity = value > (newItems[parentIndex!].unit?.max_value ?? 1) ? (newItems[parentIndex!].unit?.max_value ?? 1) : value;
                newItems[parentIndex!].children[childIndex!].total = 
                newItems[parentIndex!].children[childIndex!].price * value;
                
                setItems(newItems);
                calculateTotals(newItems,
                  form.getFieldValue('additional_cost') || 0,
                  form.getFieldValue('discount_amount') || 0,
                  form.getFieldValue('ppn_amount') || 0
                );
              }
            }
          };
          
          return (
            <div className="flex items-center gap-2">
              <Button 
                size="small" 
                icon={<MinusCircleOutlined />} 
                onClick={() => handleChildQuantityChange((record.quantity || 1) - 1)}
                disabled={record.quantity <= 1}
              />
              <InputNumber
                min={1}
                value={record.quantity}
                onChange={handleChildQuantityChange}
                style={{ width: '60px' }}
              />
              <Button 
                size="small" 
                icon={<PlusCircleOutlined />} 
                onClick={() => handleChildQuantityChange((record.quantity || 1) + 1)}
              />
            </div>
          );
        } else {
          return (
            <div className="flex items-center gap-2">
              <Button 
                size="small" 
                icon={<MinusCircleOutlined />} 
                onClick={() => handleQuantityChange((record.quantity || 1) - 1, index)}
                disabled={record.quantity <= 1}
              />
              <InputNumber
                min={1}
                value={record.quantity}
                onChange={(value) => handleQuantityChange(value, index)}
                style={{ width: '60px' }}
              />
              <Button 
                size="small" 
                icon={<PlusCircleOutlined />} 
                onClick={() => handleQuantityChange((record.quantity || 1) + 1, index)}
              />
            </div>
          );
        }
      },
    },
    {
      title: 'Satuan',
      dataIndex: 'unit_name',
      key: 'unit_name',
      width: 250,
      render: (_: any, record: any, index: number) => {
        const isChild = record.isChild;
        
        if (isChild) {
          const parentIndex = record.parentIndex;
          const childIndex = record.childIndex;
          return (
            <Form.Item
              name={['items', parentIndex, 'children', childIndex, 'unit_name']}
              
              className="m-0"
            >
              <AutoComplete
                options={optionUnit}
                filterOption={false}
                style={{ width: '100%' }}
                onSelect={(value, option) => onSelectUnit(value, option, index, false, record.key)}
                onSearch={(value) => fetchUnit(value, record.isChild ? false : true)}
                placeholder="Pilih Satuan"
              />
            </Form.Item>
          );
        } else {
          const itemIndex = items.findIndex(item => item.key === record.key);
          return (
            <Form.Item
              name={['items', itemIndex, 'unit_name']}
              
              className="m-0"
            >
              <AutoComplete
                options={optionUnit}
                filterOption={false}
                style={{ width: '100%' }}
                onSelect={(value, option) => onSelectUnit(value, option, index, true, record.key)}
                onSearch={(value) => fetchUnit(value, !record.isChild)}
                placeholder="Pilih Satuan"
              />
            </Form.Item>
          );
        }
      },
    },
    {
      title: 'Harga',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'right' as const,
      render: (_: any, record: PurchaseOrderItemForm, index: number) => (
        record.isChild ? <></> : <Input
          value={formatRupiah(record.price)}
          disabled={!record.is_parent}
          onChange={(e) => handlePriceChange(e.target.value, index)}
          style={{ textAlign: 'right', width: 100 }}
        />
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 150,
      align: 'right' as const,
      render: (_: any, record: PurchaseOrderItemForm, index: number) => record.isChild ? <></> : formatRupiah(record.total)
    },
    {
      title: '',
      key: 'action',
      width: 150,
      render: (_: any, record: PurchaseOrderItemForm, index: number) => {
        if(record.is_parent){
          return <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => removeItemRow(record.key!, record.isChild ? false : true)}
            disabled={items.length === 1}
          />
        }else{
          return <></>
        }
      },
    },
  ];

    return (
      <DashboardLayout>
        <Breadcrumb
          separator=">"
          className="mb-6"
          items={[
            { title: 'Home', href: '/' },
            { title: 'Pembelian Ke Vendor', href: '/purchase' },
            { title: isEditing ? 'Edit Pembelian' : 'Tambah Pembelian' }
          ]}
        />

        <Card title={isEditing ? 'Edit Pembelian' : 'Tambah Pembelian Baru'}>
          <Form
            {...formItemLayout}
            form={form}
            onFinish={handleSubmit}
            disabled={loading}
            initialValues={{
              ...form.getFieldsValue(),
              items: items,
            }}
          >
            {/* Header Section */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Left Column */}
              <div>
                <Form.Item
                  label="Vendor"
                  name="vendor_id"
                  rules={[{ required: true, message: 'Vendor harus dipilih' }]}
                >
                  <Select
                    showSearch
                    placeholder="Pilih vendor"
                    options={vendors}
                    onSelect={handleVendorSelect}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Form.Item label="Nama Vendor" name="vendor_name" className="m-0">
                  <Input disabled />
                </Form.Item>

                <Form.Item label="Alamat Vendor" name="vendor_address" className="m-0">
                  <Input disabled />
                </Form.Item>

                <Form.Item label="Telepon" name="vendor_phone" className="m-0">
                  <Input disabled />
                </Form.Item>

                <Form.Item label="Email" name="vendor_email" className="m-0">
                  <Input disabled />
                </Form.Item>
              </div>

              {/* Right Column */}
              <div>
                <Form.Item
                  label="Pembayaran"
                  name="payment_method"
                  rules={[{ required: true, message: 'Metode Pembayaran harus dipilih' }]}
                >
                  <Select
                    showSearch
                    placeholder="Pilih Metode Pembayaran"
                    options={paymentMethod}
                    
                  />
                </Form.Item>
                <Form.Item
                  label="Nomor Invoice"
                  name="invoice_number"
                  rules={[{ required: true, message: 'Nomor invoice diperlukan' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Tanggal Order"
                  name="order_date"
                  rules={[{ required: true, message: 'Tanggal order diperlukan' }]}
                >
                  <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                </Form.Item>


                <Form.Item
                  label="Jatuh Tempo"
                  name="due_date"
                  rules={[{ required: true, message: 'Tanggal jatuh tempo diperlukan' }]}
                >
                  <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                </Form.Item>


              </div>
            </div>

            {/* Items Section */}
            <Divider orientation="left">Items</Divider>
            <Table
              columns={columns}
              dataSource={getFlattenedItems()}
              pagination={false}
              scroll={{ x: 'max-content' }}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={1} colSpan={5} align="right">
                    <strong>Subtotal</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    {formatRupiah(subtotal)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} colSpan={2} />
                </Table.Summary.Row>
              )}
            />
            
            <Button
              type="dashed"
              onClick={addItemRow}
              icon={<PlusOutlined />}
              style={{ width: '100%', marginTop: '16px' }}
            >
              Tambah Item
            </Button>

            {/* Financial Summary */}
            <Divider orientation="left">Rincian Pembayaran</Divider>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Form.Item label="Biaya Tambahan" name="additional_cost">
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => formatRupiah(Number(value))}
                    parser={value => value!.replace(/[^\d]/g, '')}
                    onChange={(value) => {
                      calculateTotals(
                        items, 
                        Number(value) || 0, 
                        form.getFieldValue('discount_amount') || 0,
                        form.getFieldValue('ppn_amount') || 0
                      );
                    }}
                  />
                </Form.Item>

                <Form.Item label="Diskon" name="discount_amount">
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => formatRupiah(Number(value))}
                    parser={value => value!.replace(/[^\d]/g, '')}
                    onChange={(value) => {
                      calculateTotals(
                        items, 
                        form.getFieldValue('additional_cost') || 0, 
                        Number(value) || 0,
                        form.getFieldValue('ppn_amount') || 0
                      );
                    }}
                  />
                </Form.Item>

                <Form.Item label="PPN" name="ppn_amount">
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => formatRupiah(Number(value))}
                    parser={value => value!.replace(/[^\d]/g, '')}
                    onChange={(value) => {
                      calculateTotals(
                        items, 
                        form.getFieldValue('additional_cost') || 0, 
                        form.getFieldValue('discount_amount') || 0,
                        Number(value) || 0
                      );
                    }}
                  />
                </Form.Item>

                <Form.Item label="Catatan" name="notes">
                  <Input.TextArea rows={3} placeholder="Tambahkan catatan jika diperlukan" />
                </Form.Item>
              </div>

              <div>
                <Form.Item label="Bank" name={['payment', 'bank']}>
                  <Select options={bankOptions} />
                </Form.Item>

                <Form.Item label="Nomor Rekening" name={['payment', 'account_number']}>
                  <Input />
                </Form.Item>

                <Form.Item label="Nama Rekening" name={['payment', 'account_name']}>
                  <Input />
                </Form.Item>

                <div className="p-4 bg-gray-50 rounded">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Biaya Tambahan:</span>
                    <span>{formatRupiah(form.getFieldValue('additional_cost') || 0)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Diskon:</span>
                    <span className="text-red-500">-{formatRupiah(form.getFieldValue('discount_amount') || 0)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>PPN:</span>
                    <span>{formatRupiah(form.getFieldValue('ppn_amount') || 0)}</span>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatRupiah(totalAmount)}</span>
                  </div>
                  <Form.Item name="total_amount" hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item name="subtotal" hidden>
                    <Input />
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <Divider />
            <div className="flex justify-end gap-3">
              <Button onClick={() => router.back()}>Batal</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEditing ? 'Perbarui Invoice' : 'Simpan Invoice'}
              </Button>
            </div>
          </Form>
        </Card>
      </DashboardLayout>
    );
  };

export default AddEditInvoice;