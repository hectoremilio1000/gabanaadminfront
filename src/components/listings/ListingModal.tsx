import { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  message,
  Divider,
} from "antd";
import type { ListingDTO, ListingPayload } from "../../types/listing";
import { createListing, updateListing } from "../../api/listings";
import { ListingPhotosInline } from "./ListingPhotosInline";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  listing?: ListingDTO;
  onClose: () => void;
  onSuccess: (listing: ListingDTO) => void;
};

export const ListingModal: React.FC<Props> = ({
  open,
  mode,
  listing,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && listing) {
      form.setFieldsValue({
        slug: listing.slug,
        title: listing.title,
        summary: listing.summary,
        address: listing.address,
        zone: listing.zone,
        price: undefined, // no viene el price numérico en el DTO
        priceLabel: listing.priceLabel,
        bedsLabel: listing.beds,
        sizeLabel: listing.size,
        isPremier: !!listing.isPremier,
        status: "published",
      });
    } else {
      form.resetFields();
    }
  }, [open, mode, listing, form]);

  const handleSubmit = async (values: any) => {
    const payload: ListingPayload = {
      slug: values.slug,
      title: values.title,
      summary: values.summary,
      address: values.address,
      zone: values.zone,
      price: values.price ?? undefined,
      priceLabel: values.priceLabel || null,
      bedsLabel: values.bedsLabel || null,
      sizeLabel: values.sizeLabel || null,
      isPremier: values.isPremier ?? false,
      status: values.status,
    };

    try {
      if (mode === "create") {
        const created = await createListing(payload);
        message.success("Listing creado");
        onSuccess(created);
      } else if (mode === "edit" && listing) {
        const numericId = Number(listing.id.replace("listing-", ""));
        const updated = await updateListing(numericId, payload);
        message.success("Listing actualizado");
        onSuccess(updated);
      }
    } catch (err: any) {
      console.error(err);
      message.error(
        err?.response?.data?.error || "No se pudo guardar el listing"
      );
    }
  };

  const title = mode === "create" ? "Nuevo listing" : "Editar listing";

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onClose}
      okText={mode === "create" ? "Crear" : "Guardar cambios"}
      onOk={() => form.submit()}
      destroyOnClose
      width={800}
    >
      {/* 🔹 Parte de arriba: datos del listing */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isPremier: false,
          status: "published",
        }}
      >
        <Form.Item
          label="Slug"
          name="slug"
          rules={[{ required: true, message: "Ingresa el slug" }]}
        >
          <Input
            disabled={mode === "edit"}
            placeholder="departamento-polanco"
          />
        </Form.Item>

        <Form.Item
          label="Título"
          name="title"
          rules={[{ required: true, message: "Ingresa el título" }]}
        >
          <Input placeholder="Departamento en Polanco" />
        </Form.Item>

        <Form.Item
          label="Resumen"
          name="summary"
          rules={[{ required: true, message: "Ingresa un resumen" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="Dirección"
          name="address"
          rules={[{ required: true, message: "Ingresa la dirección" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Zona"
          name="zone"
          rules={[{ required: true, message: "Ingresa la zona" }]}
        >
          <Input placeholder="Polanco, Bosques, etc." />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Form.Item label="Precio" name="price">
            <InputNumber
              className="w-full"
              min={0}
              step={100000}
              placeholder="35000000"
            />
          </Form.Item>

          <Form.Item label="Label de precio" name="priceLabel">
            <Input placeholder="MN 35,000,000" />
          </Form.Item>

          <Form.Item label="Premier" name="isPremier" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Form.Item label="Recámaras (label)" name="bedsLabel">
            <Input placeholder="3 recámaras" />
          </Form.Item>
          <Form.Item label="Tamaño (label)" name="sizeLabel">
            <Input placeholder="250 m²" />
          </Form.Item>
          <Form.Item label="Estatus" name="status" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "draft", label: "Borrador" },
                { value: "published", label: "Publicado" },
                { value: "archived", label: "Archivado" },
              ]}
            />
          </Form.Item>
        </div>
      </Form>

      {/* 🔹 Parte de abajo: fotos (solo en modo edición) */}
      {mode === "edit" && listing && (
        <>
          <Divider />
          <ListingPhotosInline listing={listing} />
        </>
      )}
    </Modal>
  );
};
