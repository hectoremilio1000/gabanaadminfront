import { Layout, Menu, Avatar, Dropdown, Space } from "antd";
import {
  LogoutOutlined,
  ApartmentOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../api/auth";

const { Header, Content } = Layout;

type PrivateLayoutProps = {
  children: React.ReactNode;
};

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  const navigate = useNavigate();
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const initials = user.fullName
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const menuItems = [
    {
      key: "listings",
      label: "Listings",
      onClick: () => navigate("/"),
      icon: <ApartmentOutlined />,
    },
    {
      key: "users",
      label: "Usuarios",
      onClick: () => navigate("/users"),
    },
  ];

  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Cerrar sesión",
      onClick: () => {
        logout();
        navigate("/login", { replace: true });
      },
    },
  ];

  return (
    <Layout className="min-h-screen bg-slate-100">
      <Header className="flex items-center justify-between px-6 bg-slate-900">
        <div className="flex items-center gap-3 text-slate-50">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-sky-500 flex items-center justify-center text-xs font-semibold shadow-sm">
              GA
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">
                Gabana Admin
              </div>
              <div className="text-[11px] text-slate-300">
                Super Admin tool for listings
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Menu
            theme="dark"
            mode="horizontal"
            selectable={false}
            items={menuItems}
            className="bg-transparent border-none"
          />

          <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
            <button className="flex items-center gap-2 text-slate-100 hover:text-white">
              <Space size="small">
                <Avatar
                  size={32}
                  style={{ backgroundColor: "#0ea5e9", fontSize: 14 }}
                >
                  {initials}
                </Avatar>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-xs font-medium">{user.fullName}</span>
                  <span className="text-[11px] text-slate-300">
                    {user.role}
                  </span>
                </div>
                <DownOutlined style={{ fontSize: 10 }} />
              </Space>
            </button>
          </Dropdown>
        </div>
      </Header>

      <Content className="p-6">
        {/* Fondo blur + “card” central */}
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-[0_20px_70px_rgba(15,23,42,0.18)] border border-slate-100 p-6 sm:p-8">
            {children}
          </div>
        </div>
      </Content>
    </Layout>
  );
}
