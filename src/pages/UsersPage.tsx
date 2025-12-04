// /Users/hectoremilio/Proyectos/vite/gabana-admin/src/pages/UsersPage.tsx
import { useEffect, useState } from "react";
import { Button, Space, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UserDTO } from "../types/auth";
import { fetchUsers } from "../api/users";
import { UserModal } from "../components/users/UserModal";

const { Title, Text } = Typography;

export default function UsersPage() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const rows = await fetchUsers();
      setUsers(rows);
    } catch (err) {
      console.error(err);
      message.error("Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalSuccess = () => {
    setModalOpen(false);
    load();
  };

  const columns: ColumnsType<UserDTO> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (val) => (
        <span className="font-mono text-xs text-slate-500">{val}</span>
      ),
    },
    {
      title: "Nombre",
      dataIndex: "fullName",
      key: "fullName",
      render: (val) => (
        <span className="font-medium text-slate-800">{val}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (val) => (
        <span className="font-mono text-xs text-slate-600">{val}</span>
      ),
    },
    {
      title: "Rol",
      dataIndex: "role",
      key: "role",
      render: (val: UserDTO["role"]) => {
        const colorMap: Record<UserDTO["role"], string> = {
          superadmin: "magenta",
          staff: "geekblue",
          publisher: "green",
        };
        return (
          <Tag color={colorMap[val] || "default"} className="px-3">
            {val}
          </Tag>
        );
      },
    },
    {
      title: "Acciones",
      key: "actions",
      render: () => (
        <Space size="small">
          {/* Futuras: editar rol, reset password, desactivar */}
          <Button size="small" disabled>
            Próximamente
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Usuarios
          </Title>
          <Text type="secondary">
            Gestión de superadmin, staff y publishers que pueden entrar al
            panel.
          </Text>
        </div>
        <Button
          type="primary"
          className="!rounded-full"
          onClick={handleOpenModal}
        >
          Nuevo usuario
        </Button>
      </div>

      {/* Pequeño resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Total usuarios
          </p>
          <p className="text-2xl font-semibold text-slate-900">
            {users.length}
          </p>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-violet-50/80 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-violet-600 mb-1">
            Superadmins
          </p>
          <p className="text-2xl font-semibold text-violet-700">
            {users.filter((u) => u.role === "superadmin").length}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-emerald-600 mb-1">
            Staff / publishers
          </p>
          <p className="text-2xl font-semibold text-emerald-700">
            {
              users.filter((u) => u.role === "staff" || u.role === "publisher")
                .length
            }
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-slate-100 overflow-hidden">
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={users}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <UserModal
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
