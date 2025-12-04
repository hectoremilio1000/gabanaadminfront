// /Users/hectoremilio/Proyectos/vite/gabana-admin/src/components/listings/ListingsTable.tsx
import { Button, Space, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ListingDTO } from "../../types/listing";
import { PictureOutlined } from "@ant-design/icons";

type Props = {
  data: ListingDTO[];
  loading: boolean;
  onDelete: (id: string) => void;
  onEdit: (listing: ListingDTO) => void;
  onManagePhotos: (listing: ListingDTO) => void;
};

export const ListingsTable: React.FC<Props> = ({
  data,
  loading,
  onDelete,
  onEdit,
  onManagePhotos,
}) => {
  const columns: ColumnsType<ListingDTO> = [
    {
      title: "",
      dataIndex: "image",
      key: "image",
      width: 80,
      render: (_, record) => (
        <div className="w-14 h-10 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
          <img
            src={record.image}
            alt={record.title}
            className="w-full h-full object-cover"
          />
        </div>
      ),
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 110,
      render: (val) => (
        <span className="font-mono text-xs text-slate-500">{val}</span>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (val) => (
        <span className="font-mono text-xs text-slate-600">{val}</span>
      ),
    },
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
      render: (val) => (
        <span className="font-medium text-slate-800">{val}</span>
      ),
    },
    {
      title: "Zona",
      dataIndex: "zone",
      key: "zone",
      render: (val) => (
        <Tag color="blue" className="px-2">
          {val}
        </Tag>
      ),
    },
    {
      title: "Precio",
      dataIndex: "priceLabel",
      key: "priceLabel",
      render: (val) => <span className="text-slate-800">{val}</span>,
    },
    {
      title: "Premier",
      dataIndex: "isPremier",
      key: "isPremier",
      render: (val) =>
        val ? (
          <Tag color="gold" className="px-3">
            Premier
          </Tag>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        ),
    },
    {
      title: "Media",
      dataIndex: "mediaCount",
      key: "mediaCount",
      render: (val) => (
        <span className="text-xs text-slate-600">{val ?? 0} fotos</span>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      fixed: "right",
      width: 210,
      render: (_, record) => (
        <Space size="small">
          {/* <Tooltip title="Gestionar fotos">
            <Button
              size="small"
              icon={<PictureOutlined />}
              onClick={() => onManagePhotos(record)}
            />
          </Tooltip> */}
          <Button
            size="small"
            type="default"
            className="!border-sky-200 !text-sky-600"
            onClick={() => onEdit(record)}
          >
            Editar
          </Button>
          <Button
            danger
            size="small"
            onClick={() => onDelete(record.id)}
            className="!border-red-300 !text-red-500"
          >
            Borrar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 overflow-hidden">
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        className="!rounded-2xl"
      />
    </div>
  );
};
