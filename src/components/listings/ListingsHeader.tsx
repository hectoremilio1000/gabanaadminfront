// /Users/hectoremilio/Proyectos/vite/gabana-admin/src/components/listings/ListingsHeader.tsx
import { Button, Space, Tooltip, Typography } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

type Props = {
  loading: boolean;
  onRefresh: () => void;
  onCreateListing: () => void;
};

export const ListingsHeader: React.FC<Props> = ({
  loading,
  onRefresh,
  onCreateListing,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <Title level={3} style={{ margin: 0 }}>
          Listings
        </Title>
        <Text type="secondary">
          Vista general de propiedades publicadas en el sitio Gabana Real
          Estate.
        </Text>
      </div>

      <Space>
        <Tooltip title="Gestionar usuarios (solo superadmin)">
          {/* <Button
            icon={<UserAddOutlined />}
            onClick={() => navigate("/users")}
            className="hidden sm:inline-flex"
          >
            Usuarios
          </Button> */}
        </Tooltip>

        <Tooltip title="Refrescar">
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
          />
        </Tooltip>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="!rounded-full"
          onClick={onCreateListing}
        >
          Nuevo listing
        </Button>
      </Space>
    </div>
  );
};
