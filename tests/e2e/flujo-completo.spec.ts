import { test, expect, type Page } from "@playwright/test";

test.describe("Flujo Completo E2E: Ciclo de Producción 11 Estaciones", () => {
  test.beforeEach(async ({ context }) => {
    // Configurar cookie de sesión admin para acceso total
    await context.addCookies([
      {
        name: "nodo26_session",
        value: JSON.stringify({
          id: "99999999-9999-9999-9999-999999999999",
          nombre_completo: "Administrador General",
          usuario: "admin",
          rol: "admin",
          activo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  const getCard = (page: Page, codigo: string) =>
    page.locator(`[data-testid="ot-card"][data-codigo="${codigo}"]`).first();

  test("Recorre una orden completa por las 11 estaciones con secado, proveedor, omisión, rechazo QC y despacho", async ({
    page,
  }) => {
    test.setTimeout(120000);

    // 1. CREAR ORDEN (Wizard multi-paso)
    await page.goto("/ordenes/nueva");
    await expect(page).toHaveURL(/.*\/ordenes\/nueva/);

    // Paso 1: Seleccionar Cliente
    const primerCliente = page.locator("div.grid button").first();
    await expect(primerCliente).toBeVisible({ timeout: 10000 });
    await primerCliente.click();

    const btnContinuarPaso1 = page.locator('button:has-text("Continuar a Especificaciones")');
    await expect(btnContinuarPaso1).toBeEnabled();
    await btnContinuarPaso1.click();

    // Paso 2: Especificaciones del Trabajo
    const tituloTest = `Catalogo Premium ${Date.now()}`;
    await page.locator('input[placeholder*="Jarabe"]').fill(tituloTest);
    await page.locator('input[type="number"]').fill("1500");
    await page.locator('input[placeholder*="140 mm"]').fill("21 x 29.7 cm");
    await page.locator('input[placeholder*="Sulfatada"]').fill("Glasé 150g");
    await page.locator('input[placeholder*="Full Color"]').fill("4/4 CMYK");

    // Seleccionar acabado si está disponible
    const finishBadge = page.locator('button:has-text("Barniz")').first();
    if (await finishBadge.isVisible()) {
      await finishBadge.click();
    }

    const btnContinuarPaso2 = page.locator('button:has-text("Continuar a Ruta y Plazos")');
    await expect(btnContinuarPaso2).toBeEnabled();
    await btnContinuarPaso2.click();

    // Paso 3: Ruta y Entrega
    // Toggle switch "Usa planchas existentes" para excluir planchas de la ruta
    const switchPlanchas = page.locator('button[role="switch"]').first();
    if (await switchPlanchas.isVisible()) {
      await switchPlanchas.click();
    }

    // Guardar orden
    const btnGuardar = page.locator('button:has-text("Crear Orden en Puerta")');
    await expect(btnGuardar).toBeEnabled();
    await btnGuardar.click();

    // 2. VERIFICAR QUE ARRANCA EN 'EN PUERTA'
    await page.waitForURL(/.*\/ordenes\/OT-.*/);
    const orderUrl = page.url();
    const codigoMatch = orderUrl.match(/OT-[A-Z0-9-]+/);
    const codigoOT = codigoMatch ? codigoMatch[0] : "";
    expect(codigoOT).toBeTruthy();

    // Verificar indicador 'En Puerta'
    await expect(page.locator("body")).toContainText(/En Puerta/i);

    // 3. LIBERAR A PLANTA
    const btnLiberar = page.locator('button:has-text("Liberar a Planta")').first();
    await expect(btnLiberar).toBeVisible({ timeout: 10000 });
    await btnLiberar.click();

    // Verificar que pasa a En producción / En cola
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).toContainText(/En producción|En proceso|En cola/i);

    // 4. PRE-PRENSA (Diseño gráfico / Arte final)
    await page.goto("/area/diseno-arte-final");
    const cardDiseno = getCard(page, codigoOT);
    await expect(cardDiseno).toBeVisible({ timeout: 10000 });
    await cardDiseno.locator('button:has-text("Iniciar")').click();
    await expect(cardDiseno.locator('button:has-text("Completar")')).toBeVisible({ timeout: 5000 });
    await cardDiseno.locator('button:has-text("Completar")').click();
    await page.waitForTimeout(1000);

    // 5. PREPARACIÓN DE MATERIALES
    await page.goto("/area/preparacion-materiales");
    const cardPrep = getCard(page, codigoOT);
    await expect(cardPrep).toBeVisible({ timeout: 10000 });
    await cardPrep.locator('button:has-text("Iniciar")').click();
    await expect(cardPrep.locator('button:has-text("Completar")')).toBeVisible({ timeout: 5000 });
    await cardPrep.locator('button:has-text("Completar")').click();
    await page.waitForTimeout(1000);

    // 6. IMPRESIÓN / SECADO (Planchas se saltó porque usa existentes)
    await page.goto("/area/impresion-secado");
    const cardImp = getCard(page, codigoOT);
    await expect(cardImp).toBeVisible({ timeout: 10000 });
    await cardImp.locator('button:has-text("Iniciar")').click();

    // Iniciar Secado
    const btnSecar = cardImp.locator('button:has-text("Secar")');
    await expect(btnSecar).toBeVisible({ timeout: 5000 });
    await btnSecar.click();

    const modalSecadoConfirmar = page.locator('button:has-text("Comenzar Secado")');
    await expect(modalSecadoConfirmar).toBeVisible({ timeout: 5000 });
    await modalSecadoConfirmar.click();
    await page.waitForTimeout(1000);

    // Forzar avance de secado (Admin/Supervisor)
    const btnForzarSecado = cardImp.locator('button:has-text("Forzar Secado")');
    await expect(btnForzarSecado).toBeVisible({ timeout: 5000 });
    await btnForzarSecado.click();
    await page.waitForTimeout(1000);

    // 7. ACABADO (Proveedor externo)
    await page.goto("/area/acabado");
    const cardAcabados = getCard(page, codigoOT);
    await expect(cardAcabados).toBeVisible({ timeout: 10000 });
    await cardAcabados.locator('button:has-text("Iniciar")').click();

    // Salida a proveedor
    const btnProveedor = cardAcabados.locator('button:has-text("Proveedor")');
    await expect(btnProveedor).toBeVisible({ timeout: 5000 });
    await btnProveedor.click();

    const btnConfirmarSalida = page.locator('button:has-text("Registrar Envío")');
    await expect(btnConfirmarSalida).toBeVisible({ timeout: 5000 });
    await btnConfirmarSalida.click();
    await page.waitForTimeout(1000);

    // Retorno de proveedor
    const btnRetorno = cardAcabados.locator('button:has-text("Recibir de Proveedor")');
    await expect(btnRetorno).toBeVisible({ timeout: 5000 });
    await btnRetorno.click();
    await page.waitForTimeout(1000);

    // Completar acabado
    const btnCompletarAcab = cardAcabados.locator('button:has-text("Completar")');
    await expect(btnCompletarAcab).toBeVisible({ timeout: 5000 });
    await btnCompletarAcab.click();
    await page.waitForTimeout(1000);

    // 8. TROQUELADO
    await page.goto("/area/troquelado");
    const cardTroquelado = getCard(page, codigoOT);
    await expect(cardTroquelado).toBeVisible({ timeout: 10000 });
    await cardTroquelado.locator('button:has-text("Iniciar")').click();
    await expect(cardTroquelado.locator('button:has-text("Completar")')).toBeVisible({ timeout: 5000 });
    await cardTroquelado.locator('button:has-text("Completar")').click();
    await page.waitForTimeout(1000);

    // 9. CORTE Y REFILE
    await page.goto("/area/corte-refile");
    const cardCorte = getCard(page, codigoOT);
    await expect(cardCorte).toBeVisible({ timeout: 10000 });
    await cardCorte.locator('button:has-text("Iniciar")').click();
    await expect(cardCorte.locator('button:has-text("Completar")')).toBeVisible({ timeout: 5000 });
    await cardCorte.locator('button:has-text("Completar")').click();
    await page.waitForTimeout(1000);

    // 10. CONTROL DE CALIDAD - INTENTO 1 (RECHAZO Y REPROCESO)
    await page.goto("/area/control-calidad");
    const cardQC = getCard(page, codigoOT);
    await expect(cardQC).toBeVisible({ timeout: 10000 });
    await cardQC.locator('button:has-text("Iniciar")').click();

    // Rechazar con reproceso a Corte y refile
    const btnRechazar = cardQC.locator('button:has-text("Rechazar / Reproceso")');
    await expect(btnRechazar).toBeVisible({ timeout: 5000 });
    await btnRechazar.click();

    // Modal de Rechazo: seleccionar Corte y refile
    const btnAreaCorte = page.locator('button:has-text("Corte y refile")').first();
    await expect(btnAreaCorte).toBeVisible({ timeout: 5000 });
    await btnAreaCorte.click();

    const inputMotivoRechazo = page.locator('input[placeholder*="Mancha de tinta"]').first();
    await expect(inputMotivoRechazo).toBeVisible({ timeout: 5000 });
    await inputMotivoRechazo.fill("Desfase de corte 2mm");

    const btnConfirmarRechazo = page.locator('button:has-text("Confirmar Rechazo y Reproceso")');
    await btnConfirmarRechazo.click();
    await page.waitForTimeout(1500);

    // 11. VERIFICAR QUE VUELVE A CORTE CON BADGE DE REPROCESO
    await page.goto("/area/corte-refile");
    const cardReproceso = getCard(page, codigoOT);
    await expect(cardReproceso).toBeVisible({ timeout: 10000 });
    await expect(cardReproceso).toContainText(/Reproceso/i);

    // Completar reproceso
    await cardReproceso.locator('button:has-text("Iniciar")').click();
    await expect(cardReproceso.locator('button:has-text("Completar")')).toBeVisible({ timeout: 5000 });
    await cardReproceso.locator('button:has-text("Completar")').click();
    await page.waitForTimeout(1000);

    // 12. CONTROL DE CALIDAD - INTENTO 2 (APROBAR)
    await page.goto("/area/control-calidad");
    const cardQC2 = getCard(page, codigoOT);
    await expect(cardQC2).toBeVisible({ timeout: 10000 });
    await cardQC2.locator('button:has-text("Iniciar")').click();

    const btnAprobarQC = cardQC2.locator('button:has-text("Aprobar QC")');
    await expect(btnAprobarQC).toBeVisible({ timeout: 5000 });
    await btnAprobarQC.click();
    await page.waitForTimeout(1000);

    // 13. EMBALAJE
    await page.goto("/area/embalaje");
    const cardEmbalaje = getCard(page, codigoOT);
    await expect(cardEmbalaje).toBeVisible({ timeout: 10000 });
    await cardEmbalaje.locator('button:has-text("Iniciar")').click();
    await expect(cardEmbalaje.locator('button:has-text("Completar")')).toBeVisible({ timeout: 5000 });
    await cardEmbalaje.locator('button:has-text("Completar")').click();
    await page.waitForTimeout(1000);

    // 14. DESPACHO
    await page.goto("/despachos");
    await expect(page).toHaveURL(/.*\/despachos/);
    const filaDespacho = page.locator(`[data-testid="despacho-card"][data-codigo="${codigoOT}"]`).first();
    await expect(filaDespacho).toBeVisible({ timeout: 10000 });

    const btnDespachar = filaDespacho.locator('button:has-text("Registrar Despacho"), button:has-text("Despachar")');
    await expect(btnDespachar).toBeVisible({ timeout: 5000 });
    await btnDespachar.click();

    // Completar modal de despacho
    const inputRecibe = page.locator('input[placeholder*="Juan Pérez"]').first();
    await expect(inputRecibe).toBeVisible({ timeout: 5000 });
    await inputRecibe.fill("Juan Pérez - Almacén");

    const btnConfirmarDespacho = page.locator('button:has-text("Confirmar Despacho")');
    await btnConfirmarDespacho.click();
    await page.waitForTimeout(1000);

    // 15. VERIFICAR DETALLE FINAL E HISTORIAL
    await page.goto(`/ordenes/${codigoOT}`);
    await expect(page.locator("body")).toContainText(/Despachada|Entregada/i);

    // Timeline / eventos clave
    const bodyContent = page.locator("body");
    await expect(bodyContent).toContainText(/liberada|creada/i);
    await expect(bodyContent).toContainText(/Desfase de corte 2mm/i);
  });
});
