import { test, expect } from "@playwright/test";
import type { ListingDTO } from "../src/types/listing";

const FRONT_URL = process.env.FRONT_URL || "http://127.0.0.1:4173";

test("crea un nuevo listing desde el modal", async ({ page }) => {
  let createdListing: ListingDTO | null = null;

  // Mock API de listings para no depender del backend.
  await page.route("**/listings", async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(createdListing ? [createdListing] : []),
      });
      return;
    }

    if (method === "POST") {
      const payload = JSON.parse(route.request().postData() || "{}");
      createdListing = {
        id: "listing-9999",
        slug: payload.slug || "test-slug",
        title: payload.title || "Sin título",
        priceLabel: payload.price ? `$${payload.price}` : "N/D",
        address: payload.address || "Sin dirección",
        formattedAddress: payload.formattedAddress ?? payload.address ?? null,
        placeId: payload.placeId ?? null,
        zone: payload.zone || "Sin zona",
        badges: [],
        highlights: [],
        mediaCount: 0,
        image: "https://placehold.co/600x400",
        beds: payload.bedsLabel || "",
        size: payload.sizeLabel || "",
        isPremier: !!payload.isPremier,
        isFavorite: false,
        coords:
          payload.lat && payload.lng
            ? { lat: payload.lat, lng: payload.lng }
            : null,
        summary: payload.summary || "",
      };

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(createdListing),
      });
      return;
    }

    // Otras llamadas a /listings (PUT/DELETE) no se usan en esta prueba.
    await route.continue();
  });

  // Inyecta usuario logueado antes de cargar la app.
  await page.addInitScript((user) => {
    localStorage.setItem("gabana_token", "test-token");
    localStorage.setItem("gabana_user", JSON.stringify(user));
  }, {
    id: "user-test",
    fullName: "Playwright Tester",
    role: "superadmin",
    email: "tester@gabana.test",
  });

  await page.goto(`${FRONT_URL}/`);

  await page.getByRole("button", { name: "Nuevo listing" }).click();

  await page.getByLabel("Título").fill("Departamento de prueba");
  await page.getByLabel("Resumen").fill("Resumen automatizado de prueba.");
  await page.getByPlaceholder("Busca en Google Maps").fill("Polanco CDMX");

  const firstSuggestion = page.locator(".pac-item").first();
  await expect(firstSuggestion).toBeVisible();
  await firstSuggestion.click();

  await page.getByLabel("Zona").fill("Polanco");
  await page.getByLabel("Precio").fill("12000000");
  await page.getByLabel("Recámaras").fill("3 recámaras");
  await page.getByLabel("Tamaño").fill("250 m²");

  await page.getByRole("button", { name: "Crear" }).click();

  await expect(page.getByText("Listing creado", { exact: false })).toBeVisible();
  await expect(
    page.locator("td").filter({ hasText: "Departamento de prueba" }).first()
  ).toBeVisible();
});
