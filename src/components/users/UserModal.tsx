// /Users/hectoremilio/Proyectos/vite/gabana-admin/src/components/users/UserModal.tsx
import { Modal, Form, Input, Select, message } from "antd";
import { createUser } from "../../api/users";
import type { UserDTO } from "../../types/auth";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export const UserModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: {
    fullName: string;
    email: string;
    password: string;
    role: UserDTO["role"];
  }) => {
    try {
      await createUser(values);
      message.success("Usuario creado");
      form.resetFields();
      onSuccess();
    } catch (err: any) {
      console.error(err);
      message.error(
        err?.response?.data?.error || "No se pudo crear el usuario"
      );
    }
  };

  return (
    <Modal
      open={open}
      title="Nuevo usuario"
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      okText="Crear usuario"
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          role: "publisher",
        }}
      >
        <Form.Item
          label="Nombre completo"
          name="fullName"
          rules={[{ required: true, message: "Ingresa el nombre" }]}
        >
          <Input placeholder="Nombre Apellido" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Ingresa el email" },
            { type: "email", message: "Email inválido" },
          ]}
        >
          <Input placeholder="usuario@gabana.com" />
        </Form.Item>

        <Form.Item
          label="Password inicial"
          name="password"
          rules={[{ required: true, message: "Ingresa un password" }]}
        >
          <Input.Password placeholder="••••••••" />
        </Form.Item>

        <Form.Item
          label="Rol"
          name="role"
          rules={[{ required: true, message: "Selecciona un rol" }]}
        >
          <Select
            options={[
              { value: "superadmin", label: "Superadmin" },
              { value: "staff", label: "Staff" },
              { value: "publisher", label: "Publisher" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
