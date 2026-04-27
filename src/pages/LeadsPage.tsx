// src/pages/LeadsPage.tsx
//
// Sprint 2 — Gap #3 (cont.): módulo admin de leads.
//
// - Tabla paginada con filtros (status, source, q, rango fechas).
// - Drawer de detalle con cambio de status y notas internas.
// - RLS suave en backend: superadmin/staff ven todos; publisher solo los suyos.

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Input,
  Select,
  DatePicker,
  Button,
  Drawer,
  Descriptions,
  Space,
  Typography,
  message,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { fetchLeads, fetchLead, updateLead } from "../api/leads";
import {
  type LeadDTO,
  type LeadStatus,
  type LeadSource,
  type LeadsListResponse,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
} from "../types/lead";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface Filters {
  status?: LeadStatus;
  source?: LeadSource;
  q?: string;
  from?: string;
  to?: string;
  page: number;
  perPage: number;
}

const DEFAULT_FILTERS: Filters = { page: 1, perPage: 20 };

export default function LeadsPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [response, setResponse] = useState<LeadsListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [drawerLead, setDrawerLead] = useState<LeadDTO | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [editingNotes, setEditingNotes] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await fetchLeads({
        status: filters.status,
        source: filters.source,
        q: filters.q,
        from: filters.from,
        to: filters.to,
        page: filters.page,
        per_page: filters.perPage,
      });
      setResponse(data);
    } catch (e) {
      console.error(e);
      message.error("No pudimos cargar los leads. Revisa tu sesión.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
  }, [
    filters.status,
    filters.source,
    filters.q,
    filters.from,
    filters.to,
    filters.page,
    filters.perPage,
  ]);

  const columns = useMemo(
    () => [
      {
        title: "Fecha",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 150,
        render: (v: string | null) =>
          v ? dayjs(v).format("DD MMM YYYY HH:mm") : "—",
      },
      {
        title: "Nombre",
        dataIndex: "name",
        key: "name",
        render: (_: unknown, lead: LeadDTO) => (
          <div>
            <div className="font-medium">{lead.name}</div>
            <Text type="secondary" className="text-xs">
              {lead.email} · {lead.phone}
            </Text>
          </div>
        ),
      },
      {
        title: "Propiedad",
        key: "listing",
        render: (_: unknown, lead: LeadDTO) =>
          lead.listing ? (
            <a
              href={`/listings/${lead.listing.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              {lead.listing.title}
            </a>
          ) : (
            <Tag>Página de contacto</Tag>
          ),
      },
      {
        title: "Agente",
        key: "agent",
        render: (_: unknown, lead: LeadDTO) =>
          lead.agent ? (
            <div>
              <div>{lead.agent.fullName}</div>
              <Text type="secondary" className="text-xs">
                {lead.agent.email}
              </Text>
            </div>
          ) : (
            <Text type="secondary">Sin agente</Text>
          ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 130,
        render: (status: LeadStatus) => (
          <Tag color={LEAD_STATUS_COLORS[status]}>
            {LEAD_STATUS_LABELS[status]}
          </Tag>
        ),
      },
      {
        title: "",
        key: "actions",
        width: 80,
        render: (_: unknown, lead: LeadDTO) => (
          <Button size="small" onClick={() => openDrawer(lead.id)}>
            Detalle
          </Button>
        ),
      },
    ],
    []
  );

  async function openDrawer(id: number) {
    setDrawerLoading(true);
    try {
      const lead = await fetchLead(id);
      setDrawerLead(lead);
      setEditingNotes(lead.notes ?? "");
    } catch {
      message.error("No pudimos cargar el detalle del lead.");
    } finally {
      setDrawerLoading(false);
    }
  }

  async function handleStatusChange(status: LeadStatus) {
    if (!drawerLead) return;
    try {
      const updated = await updateLead(drawerLead.id, { status });
      setDrawerLead(updated);
      message.success(`Status cambiado a "${LEAD_STATUS_LABELS[status]}".`);
      load();
    } catch {
      message.error("No pudimos actualizar el status.");
    }
  }

  async function handleNotesSave() {
    if (!drawerLead) return;
    try {
      const updated = await updateLead(drawerLead.id, { notes: editingNotes });
      setDrawerLead(updated);
      message.success("Notas actualizadas.");
    } catch {
      message.error("No pudimos guardar las notas.");
    }
  }

  function handleRangeChange(dates: [Dayjs | null, Dayjs | null] | null) {
    setFilters((f) => ({
      ...f,
      from: dates?.[0]?.format("YYYY-MM-DD") || undefined,
      to: dates?.[1]?.format("YYYY-MM-DD") || undefined,
      page: 1,
    }));
  }

  return (
    <div className="p-6">
      <Card
        title="Leads"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={load}
            loading={loading}
          >
            Actualizar
          </Button>
        }
      >
        <Space wrap className="mb-4">
          <Input.Search
            placeholder="Buscar por nombre, email o teléfono"
            allowClear
            style={{ width: 280 }}
            onSearch={(q) =>
              setFilters((f) => ({ ...f, q: q || undefined, page: 1 }))
            }
          />
          <Select
            placeholder="Status"
            allowClear
            style={{ width: 160 }}
            value={filters.status}
            onChange={(v) =>
              setFilters((f) => ({ ...f, status: v as LeadStatus, page: 1 }))
            }
            options={LEAD_STATUSES.map((s) => ({
              value: s,
              label: LEAD_STATUS_LABELS[s],
            }))}
          />
          <Select
            placeholder="Origen"
            allowClear
            style={{ width: 180 }}
            value={filters.source}
            onChange={(v) =>
              setFilters((f) => ({ ...f, source: v as LeadSource, page: 1 }))
            }
            options={[
              { value: "listing", label: "Ficha de propiedad" },
              { value: "contact_page", label: "Página de contacto" },
            ]}
          />
          <RangePicker
            allowEmpty={[true, true]}
            onChange={(dates) =>
              handleRangeChange(dates as [Dayjs | null, Dayjs | null] | null)
            }
          />
        </Space>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={response?.data ?? []}
          columns={columns}
          pagination={{
            current: response?.meta.page ?? 1,
            pageSize: response?.meta.perPage ?? 20,
            total: response?.meta.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: (page, perPage) =>
              setFilters((f) => ({ ...f, page, perPage })),
          }}
        />
      </Card>

      <Drawer
        title={drawerLead ? `Lead #${drawerLead.id} — ${drawerLead.name}` : ""}
        open={drawerLead !== null}
        onClose={() => setDrawerLead(null)}
        width={520}
        loading={drawerLoading}
      >
        {drawerLead && (
          <div className="space-y-4">
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Nombre">
                {drawerLead.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <a href={`mailto:${drawerLead.email}`}>{drawerLead.email}</a>
              </Descriptions.Item>
              <Descriptions.Item label="Teléfono">
                <a href={`tel:${drawerLead.phone}`}>{drawerLead.phone}</a>
              </Descriptions.Item>
              <Descriptions.Item label="Origen">
                {drawerLead.source === "listing"
                  ? "Ficha de propiedad"
                  : "Página de contacto"}
              </Descriptions.Item>
              {drawerLead.listing && (
                <Descriptions.Item label="Propiedad">
                  {drawerLead.listing.title}
                </Descriptions.Item>
              )}
              {drawerLead.agent && (
                <Descriptions.Item label="Agente">
                  {drawerLead.agent.fullName} ({drawerLead.agent.email})
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Recibido">
                {drawerLead.createdAt
                  ? dayjs(drawerLead.createdAt).format("DD MMM YYYY HH:mm")
                  : "—"}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <Text strong>Mensaje:</Text>
              <pre className="mt-1 whitespace-pre-wrap rounded border border-slate-200 bg-slate-50 p-3 text-sm">
                {drawerLead.message}
              </pre>
            </div>

            <div>
              <Text strong>Status:</Text>
              <div className="mt-1">
                <Select
                  style={{ width: 200 }}
                  value={drawerLead.status}
                  onChange={(v) => handleStatusChange(v as LeadStatus)}
                  options={LEAD_STATUSES.map((s) => ({
                    value: s,
                    label: LEAD_STATUS_LABELS[s],
                  }))}
                />
              </div>
            </div>

            <div>
              <Text strong>Notas internas:</Text>
              <Input.TextArea
                rows={4}
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="Apuntes del seguimiento, próxima visita, etc."
                maxLength={4000}
              />
              <Button
                type="primary"
                className="mt-2"
                onClick={handleNotesSave}
              >
                Guardar notas
              </Button>
            </div>

            {(drawerLead.ip || drawerLead.userAgent) && (
              <Card size="small" title="Antifraude">
                <p className="m-0 text-xs text-slate-500">
                  IP: {drawerLead.ip ?? "—"}
                </p>
                <p className="m-0 mt-1 text-xs text-slate-500">
                  UA: {drawerLead.userAgent ?? "—"}
                </p>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
