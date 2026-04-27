// src/pages/BillingPage.tsx
//
// Sprint 5 — panel de suscripción del agente.

import { useEffect, useState } from "react";
import { Card, Button, Tag, Space, message, Alert } from "antd";
import dayjs from "dayjs";
import {
  fetchBillingMe,
  startCheckout,
  openPortal,
  type BillingMe,
} from "../api/billing";

export default function BillingPage() {
  const [data, setData] = useState<BillingMe | null>(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setData(await fetchBillingMe());
    } catch {
      message.error("No pudimos cargar tu suscripción.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCheckout(planSlug: "pro" | "premium") {
    setWorking(true);
    try {
      const r = await startCheckout(planSlug);
      if (r.mock) {
        message.warning(
          "Stripe en modo stub (sin secret). Esta URL es simulada — configura STRIPE_SECRET_KEY en producción."
        );
      }
      window.location.href = r.url;
    } catch (e) {
      message.error("No pudimos iniciar el checkout.");
      console.error(e);
    } finally {
      setWorking(false);
    }
  }

  async function handlePortal() {
    setWorking(true);
    try {
      const r = await openPortal();
      if (r.mock) {
        message.warning("Stripe en modo stub — portal simulado.");
      }
      window.location.href = r.url;
    } catch {
      message.error("No pudimos abrir el portal.");
    } finally {
      setWorking(false);
    }
  }

  if (loading || !data) return <div className="p-6">Cargando…</div>;

  const isFree = data.plan?.slug === "free" || !data.plan;
  const status = data.stripe.status;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {data.stripe.mode === "stub" && (
        <Alert
          type="info"
          showIcon
          className="mb-4"
          message="Stripe en modo stub"
          description="No hay STRIPE_SECRET_KEY configurada. Los botones de checkout y portal devuelven URLs simuladas. Configura el secret y los productos en Stripe Dashboard para activar pagos reales."
        />
      )}

      <Card title="Mi suscripción">
        <p className="text-sm text-slate-600">Plan actual</p>
        <p className="text-2xl font-semibold mt-1">
          {data.plan?.name ?? "Sin plan"}{" "}
          {data.plan?.priceMxn ? `· $${data.plan.priceMxn} MXN/mes` : ""}
        </p>
        {status && (
          <div className="mt-2">
            <Tag color={statusColor(status)}>{statusLabel(status)}</Tag>
          </div>
        )}
        {data.trialEndsAt && (
          <p className="mt-2 text-sm text-blue-700">
            Trial Pro hasta {dayjs(data.trialEndsAt).format("DD MMM YYYY")}
          </p>
        )}

        {data.plan && (
          <p className="mt-3 text-sm text-slate-700">
            Listings máximos: <strong>{data.plan.listingsLimit}</strong> ·
            Destacados: <strong>{data.plan.featuredLimit}</strong>
          </p>
        )}

        <Space className="mt-5" wrap>
          {isFree && (
            <>
              <Button
                type="primary"
                onClick={() => handleCheckout("pro")}
                loading={working}
              >
                Subir a Pro ($499 MXN/mes)
              </Button>
              <Button onClick={() => handleCheckout("premium")} loading={working}>
                Subir a Premium ($1,499 MXN/mes)
              </Button>
            </>
          )}
          {data.plan?.slug === "pro" && (
            <Button
              type="primary"
              onClick={() => handleCheckout("premium")}
              loading={working}
            >
              Subir a Premium
            </Button>
          )}
          {!isFree && (
            <Button onClick={handlePortal} loading={working}>
              Gestionar facturación
            </Button>
          )}
        </Space>
      </Card>
    </div>
  );
}

function statusColor(s: string) {
  switch (s) {
    case "active":
      return "green";
    case "trialing":
      return "blue";
    case "past_due":
      return "orange";
    case "canceled":
      return "default";
    default:
      return "default";
  }
}

function statusLabel(s: string) {
  switch (s) {
    case "active":
      return "Activa";
    case "trialing":
      return "En trial";
    case "past_due":
      return "Pago pendiente (gracia 7d)";
    case "canceled":
      return "Cancelada";
    default:
      return s;
  }
}
