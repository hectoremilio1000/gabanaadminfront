import { test, expect } from "@playwright/test";

const FRONT_URL = process.env.FRONT_URL || "http://127.0.0.1:4173";

test("autocomplete de Google Maps muestra sugerencias en Nuevo listing", async ({ page }) => {
  // Bypass login by sembrando el usuario en localStorage antes de cargar la app.
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

  await page.click('button:has-text("Nuevo listing")');

  const inputSelector = 'input[placeholder="Busca en Google Maps"]';
  await page.fill(inputSelector, "polanco");

  // Espera un poco para que lleguen las sugerencias de Places
  const firstSuggestion = page.locator(".pac-item").first();
  await expect(firstSuggestion).toBeVisible({ timeout: 5000 });
});
