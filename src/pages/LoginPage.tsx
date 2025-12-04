import { Button, Form, Input, message, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

const { Title, Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password);
      message.success("Bienvenido de nuevo 👋");
      navigate("/");
    } catch (err: any) {
      console.error(err);
      message.error("Credenciales inválidas");
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-rose-50 via-slate-50 to-sky-50">
      {/* Columna izquierda: branding (oculta en pantallas pequeñas) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between px-16 py-12">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gabana</h1>
          <p className="text-sm text-slate-500">
            Control de listings para tu equipo.
          </p>
        </div>

        <div className="max-w-lg">
          <h2 className="text-4xl font-semibold mb-4">
            Panel de administración
          </h2>
          <p className="text-base text-slate-600">
            Gestiona propiedades, fotos y publishers desde un solo lugar,
            pensado para tu operación diaria.
          </p>
        </div>

        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Gabana · Internal Admin
        </p>
      </div>

      {/* Columna derecha: formulario */}
      <div className="flex flex-1 items-center justify-center px-6 lg:px-16">
        <div className="w-full max-w-md bg-white/80 backdrop-blur shadow-2xl rounded-2xl p-8">
          <div className="mb-6">
            <Title level={3} style={{ marginBottom: 4 }}>
              Inicia sesión
            </Title>
            <Text type="secondary">
              Usa tu cuenta de{" "}
              <span className="font-medium">superadmin, staff o publisher</span>
              .
            </Text>
          </div>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Ingresa tu email" }]}
              initialValue="super@gabana.test"
            >
              <Input
                size="large"
                placeholder="tucorreo@gabana.com"
                className="rounded-xl"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Ingresa tu password" }]}
              initialValue="super123"
            >
              <Input.Password
                size="large"
                placeholder="••••••••"
                className="rounded-xl"
              />
            </Form.Item>

            <Form.Item className="mb-2">
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                className="!rounded-full"
              >
                Entrar al panel
              </Button>
            </Form.Item>

            <p className="text-[11px] text-slate-400">
              Ambiente: <span className="font-semibold">development</span> · API
              local
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
}
