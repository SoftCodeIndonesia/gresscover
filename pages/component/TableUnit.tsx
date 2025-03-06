import { ItemUnit } from "@/type/item";
import { Form, GetRef, Input, InputRef, Popconfirm, Table, TableProps } from "antd";
import React, { useContext, useEffect, useRef, useState } from "react";

interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    dataIndex: keyof ItemUnit;
    record: ItemUnit;
    handleSave: (record: ItemUnit) => void;
}

interface TableUnitProps {
    units: ItemUnit[],
    onSave: (arg: ItemUnit[]) => void,
}

type ColumnTypes = Exclude<TableProps<ItemUnit>['columns'], undefined>;


const TableUnit: React.FC<TableUnitProps> = ({units, onSave}) => {
    const [dataSource, setDataSource] = useState<ItemUnit[]>(units);
    interface EditableRowProps {
        index: number;
    }

    type FormInstance<T> = GetRef<typeof Form<T>>;

    const EditableContext = React.createContext<FormInstance<any> | null>(null);

    const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
        const [form] = Form.useForm();
        return (
            <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
            </Form>
        );
    };

    const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
        title,
        editable,
        children,
        dataIndex,
        record,
        handleSave,
        ...restProps
      }) => {
        const [editing, setEditing] = useState(false);
        const inputRef = useRef<InputRef>(null);
        const form = useContext(EditableContext)!;
      
        useEffect(() => {
          if (editing) {
            inputRef.current?.focus();
          }
        }, [editing]);
      
        const toggleEdit = () => {
          setEditing(!editing);
          form.setFieldsValue({ [dataIndex]: record[dataIndex] });
        };
      
        const save = async () => {
          try {
            const values = await form.validateFields();
      
            toggleEdit();
            handleSave({ ...record, ...values });
          } catch (errInfo) {
            console.log('Save failed:', errInfo);
          }
        };
      
        let childNode = children;
      
        if (editable) {
          childNode = editing ? (
            <Form.Item
              style={{ margin: 0 }}
              name={dataIndex}
              rules={[{ required: true, message: `${title} is required.` }]}
            >
              <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
          ) : (
            <div
              className="editable-cell-value-wrap"
              style={{ paddingInlineEnd: 24 }}
              onClick={toggleEdit}
            >
              {children}
            </div>
          );
        }
      
        return <td {...restProps}>{childNode}</td>;
    };

    const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
        {
            title: 'Nama Satuan',
            dataIndex: 'name',
            render: (_:any, record: ItemUnit, index: number) => <p>{`1 ${record.name}`}</p>
        },
        {
            title: 'Nilai Satuan',
            dataIndex: 'max_value',
            width: '30%',
            editable: true,
        },
    ];

    const handleSave = (row: ItemUnit) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.type_id === item.type_id);
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });

        onSave(newData);

        setDataSource(newData);
      };
    
      const components = {
        body: {
          row: EditableRow,
          cell: EditableCell,
        },
      };
    
      const columns = defaultColumns.map((col) => {
        if (!col.editable) {
          return col;
        }
        return {
          ...col,
          onCell: (record: ItemUnit) => ({
            record,
            editable: col.editable,
            dataIndex: col.dataIndex,
            title: col.title,
            handleSave,
          }),
        };
      });
    
    return (
        <div>
            <Table<ItemUnit>
                components={components}
                rowClassName={() => 'editable-row'}
                bordered
                dataSource={dataSource}
                rowKey={(record) => record.type_id}
                columns={columns as ColumnTypes}
            />
        </div>
    );
}

export default TableUnit;