// src/pages/VerificationPage.tsx
//
// Sprint 4 — Gap #7: cola de agentes pendientes.

import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Drawer,
  Space,
  Modal,
  Input,
  Image,
  message,
  Typography,
} from "antd";
import { CheckOutlined, CloseOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  fetchPendingAgents,
  approveAgent,
  rejectAgent,
} from "../api/agents";
import { type PendingAgentDTO, AGENT_DOC_LABELS } from "../types/agent";

const { Text } = Typography;

export default function VerificationPage() {
  const [agents, setAgents] = useState<PendingAgentDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerAgent, setDrawerAgent] = useState<PendingAgentDTO | null>(null);
  const [rejectModal, setRejectModal] = useState<PendingAgentDTO | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchPendingAgents();
      setAgents(data);
    } catch {
      message.error("No pudimos cargar los agentes pendientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(agent: PendingAgentDTO) {
    setSubmitting(true);
    try {
      await approveAgent(agent.id);
      message.success(`${agent.fullName} aprobado.`);
      setDrawerAgent(null);
      load();
    } catch {
      message.error("No pudimos aprobar al agente.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!rejectModal) return;
    if (rejectReason.trim().length < 5) {
      message.warning("El motivo debe tener al menos 5 caracteres.");
      return;
    }
    setSubmitting(true);
    try {
      await rejectAgent(rejectModal.id, rejectReason.trim());
      message.success(`${rejectModal.fullName} rechazado.`);
      setRejectModal(null);
      setRejectReason("");
      setDrawerAgent(null);
      load();
    } catch {
      message.error("No pudimos rechazar al agente.");
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    {
      title: "Recibido",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (v: string | null) => (v ? dayjs(v).format("DD MMM YYYY") : "—"),
    },
    {
      title: "Nombre",
      key: "name",
      render: (_: unknown, a: PendingAgentDTO) => (
        <div>
          <div className="font-medium">{a.fullName}</div>
          <Text type="secondary" className="text-xs">
            {a.email}
          </Text>
        </div>
      ),
    },
    {
      title: "Plan",
      key: "plan",
      width: 100,
      render: (_: unknown, a: PendingAgentDTO) =>
        a.plan ? <Tag>{a.plan.name}</Tag> : "—",
    },
    {
      title: "Docs",
      key: "docs",
      width: 80,
      render: (_: unknown, a: PendingAgentDTO) => a.documents.length,
    },
    {
      title: "",
      key: "actions",
      render: (_: unknown, a: PendingAgentDTO) => (
        <Button size="small" onClick={() => setDrawerAgent(a)}>
          Revisar
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title="Agentes pendientes de verificación"
        extra={
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
            Actualizar
          </Button>
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          dataSource={agents}
          columns={columns}
          pagination={false}
          locale={{ emptyText: "No hay agentes pendientes." }}
        />
      </Card>

      <Drawer
        open={drawerAgent !== null}
        onClose={() => setDrawerAgent(null)}
        title={drawerAgent?.fullName}
        width={680}
        extra={
          drawerAgent && (
            <Space>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => setRejectModal(drawerAgent)}
                loading={submitting}
              >
                Rechazar
              </Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(drawerAgent)}
                loading={submitting}
              >
                Aprobar
              </Button>
            </Space>
          )
        }
      >
        {drawerAgent && (
          <div className="space-y-4">
            <div>
              <Text strong>Email:</Text> {drawerAgent.email}
              <br />
              <Text strong>Slug:</Text> {drawerAgent.slug || "—"}
              <br />
              <Text strong>WhatsApp:</Text> {drawerAgent.whatsapp || "—"}
              <br />
              <Text strong>Bio:</Text>{" "}
              {drawerAgent.bio ? (
                <span>{drawerAgent.bio}</span>
              ) : (
                <Text type="secondary">— sin bio —</Text>
              )}
            </div>

            <div>
              <Text strong>Documentos:</Text>
              {drawerAgent.documents.length === 0 ? (
                <p className="text-sm text-slate-500 mt-1">
                  Aún no subió documentos. Considera rechazar y pedir que vuelva
                  con RFC e INE.
                </p>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {drawerAgent.documents.map((d) => (
                    <Card key={d.id} size="small" title={AGENT_DOC_LABELS[d.type]}>
                      {/* Preview directo. Sprint 4 deja URL pública del bucket; Sprint 7 puede agregar token. */}
                      <Image
                        src={d.fileUrl}
                        alt={AGENT_DOC_LABELS[d.type]}
                        width="100%"
                        style={{ maxHeight: 220, objectFit: "contain" }}
                      />
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        open={rejectModal !== null}
        title={`Rechazar ${rejectModal?.fullName ?? ""}`}
        onCancel={() => {
          setRejectModal(null);
          setRejectReason("");
        }}
        onOk={handleReject}
        okText="Enviar rechazo"
        okButtonProps={{ danger: true, loading: submitting }}
      >
        <p className="text-sm text-slate-600 mb-2">
          El motivo se incluye en el email al agente.
        </p>
        <Input.TextArea
          rows={5}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Ej: La foto del INE está borrosa. Vuelve a subirla."
          maxLength={2000}
        />
      </Modal>
    </div>
  );
}
