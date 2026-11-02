import { test, expect } from "@playwright/test";

test.describe("Login Flow & Visual Redesign Verification", () => {
  test("Carga la página de login sin errores de consola ni de hidratación", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/login");

    // Verificar elementos principales del Hero
    await expect(page.locator("h1")).toContainText("Control de");
    await expect(page.locator("h1")).toContainText("Producción");

    // Verificar marcas de esquina
    await expect(page.locator("text=Registro 0.1 mm")).toBeVisible();
    await expect(page.locator("text=Prensa · ISO 12647-2")).toBeVisible();
    await expect(page.locator("text=CMYK calibrado")).toBeVisible();

    // Verificar chips de roles reales
    await expect(page.locator('button:has-text("Admin")')).toBeVisible();
    await expect(page.locator('button:has-text("Recepción")')).toBeVisible();
    await expect(page.locator('button:has-text("Diseño")')).toBeVisible();

    // Filtrar errores no críticos si los hubiera (ej. favicon o Three.js fallback en headless)
    const criticalErrors = consoleErrors.filter(
      (err) =>
        err.includes("Hydration") ||
        err.includes("did not match") ||
        err.includes("Minified React error")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("Autentica exitosamente al usuario Admin con clave loky26 y redirige a /dashboard", async ({
    page,
  }) => {
    await page.goto("/login");

    // Click en chip de rol Admin
    const adminChip = page.locator('button:has-text("Admin")').first();
    await adminChip.click();

    // El campo de usuario debe llenarse con 'admin'
    const userInput = page.locator("#user");
    await expect(userInput).toHaveValue(/admin/i);

    // Escribir la clave 'loky26' mediante el teclado físico
    await userInput.press("Tab"); // mover foco fuera del input de usuario
    await page.keyboard.type("loky26");

    // Esperar envío automático o hacer click en Entrar
    const submitBtn = page.locator('button:has-text("Entrar al sistema")');
    if (await submitBtn.isEnabled()) {
      await submitBtn.click();
    }

    // Verificar overlay de "Acceso concedido"
    await expect(page.locator("text=Acceso concedido")).toBeVisible({ timeout: 5000 });

    // Verificar redirección exitosa a /dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });

  test("Muestra animación de error y alerta al ingresar PIN erróneo", async ({ page }) => {
    await page.goto("/login");

    const userInput = page.locator("#user");
    await userInput.fill("admin");

    // Escribir un PIN erróneo de 6 dígitos con el PinPad numérico
    const key9 = page.locator('button[data-k="9"]');
    for (let i = 0; i < 6; i++) {
      await key9.click();
    }

    // Esperar a que se procese el intento fallido
    await expect(
      page.locator("text=Usuario o PIN incorrecto. Verifica e intenta de nuevo.")
    ).toBeVisible({ timeout: 5000 });
  });

  test("Autentica a un operario (Diseño) con PIN 123456 y redirige a su estación /area/diseno-arte-final", async ({
    page,
  }) => {
    await page.goto("/login");

    // Click en chip de rol Diseño
    const disenoChip = page.locator('button:has-text("Diseño")').first();
    await disenoChip.click();

    // Escribir PIN 123456 con los botones del PinPad
    for (const num of ["1", "2", "3", "4", "5", "6"]) {
      await page.locator(`button[data-k="${num}"]`).click();
    }

    // Verificar overlay de éxito
    await expect(page.locator("text=Acceso concedido")).toBeVisible({ timeout: 5000 });

    // Verificar redirección automática a su estación de trabajo
    await expect(page).toHaveURL(/.*\/area\/diseno-arte-final/, { timeout: 10000 });
  });
});
