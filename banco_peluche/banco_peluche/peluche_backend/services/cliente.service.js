class ClienteService {

  // Validar datos de entrada
  validarDatos(cliente) {
    const errors = [];
    
    const saldoAnterior = Number(cliente.saldoAnterior);
    const montoCompras = Number(cliente.montoCompras);
    const pagoRealizado = Number(cliente.pagoRealizado);
    
    // Validaciones básicas
    if (isNaN(saldoAnterior) || saldoAnterior < 0) {
      errors.push('Saldo anterior debe ser un número mayor o igual a 0');
    }
    if (isNaN(montoCompras) || montoCompras < 0) {
      errors.push('Monto de compras debe ser un número mayor o igual a 0');
    }
    if (isNaN(pagoRealizado) || pagoRealizado < 0) {
      errors.push('Pago realizado debe ser un número mayor o igual a 0');
    }
    
    // Validar que el pago no sea mayor que saldoAnterior + montoCompras
    const deudaTotalSinPago = saldoAnterior + montoCompras;
    if (pagoRealizado > deudaTotalSinPago) {
      errors.push(`Pago realizado (${pagoRealizado.toFixed(2)}) no puede exceder la deuda total (${deudaTotalSinPago.toFixed(2)})`);
    }
    
    return { valid: errors.length === 0, errors };
  }

  calcularCliente(cliente) {

    const saldoAnterior = Number(cliente.saldoAnterior);
    const montoCompras  = Number(cliente.montoCompras);
    const pagoRealizado = Number(cliente.pagoRealizado);

    // Paso 2 — Saldo Base
    let saldoBase = saldoAnterior + montoCompras - pagoRealizado;
    
    // Asegurar que saldo base no sea negativo
    saldoBase = Math.max(0, saldoBase);

    // Paso 3 — Pago mínimo base (15%)
    const pagoMinimoBase = 0.15 * saldoBase;

    // Paso 4 — Verificar morosidad
    let esMoroso = pagoRealizado < pagoMinimoBase;

    let interes = 0;
    let multa = 0;

    if (esMoroso) {
      // Paso 5A — Interés
      interes = 0.12 * saldoBase;

      // Paso 6A — Multa
      multa = 200;
    }

    // Paso 7A / 6B — Saldo actual
    const saldoActual = saldoBase + interes + multa;

    // Paso 9 — Pago mínimo
    const pagoMinimo = 0.15 * saldoActual;

    // Paso 10 — Pago sin intereses
    const pagoNoIntereses = 0.85 * saldoActual;

    // Devolver objeto plano (serializable)
    return {
      saldoAnterior,
      montoCompras,
      pagoRealizado,
      saldoBase,
      pagoMinimoBase,
      esMoroso,
      interes,
      multa,
      saldoActual,
      pagoMinimo,
      pagoNoIntereses
    };
  }

  // Validar y actualizar cliente
  actualizarCliente(clienteActual, datosNuevos) {
    // Usar valores existentes si no se proporcionan nuevos
    const saldoAnterior = datosNuevos.saldoAnterior !== undefined ? Number(datosNuevos.saldoAnterior) : Number(clienteActual.saldoAnterior);
    const montoCompras = datosNuevos.montoCompras !== undefined ? Number(datosNuevos.montoCompras) : Number(clienteActual.montoCompras);
    const pagoRealizado = datosNuevos.pagoRealizado !== undefined ? Number(datosNuevos.pagoRealizado) : Number(clienteActual.pagoRealizado);

    // Recalcular usando la lógica existente
    return this.calcularCliente({
      saldoAnterior,
      montoCompras,
      pagoRealizado
    });
  }

  // Validar eliminación (podría tener lógica de negocio)
  puedeEliminarCliente(cliente) {
    // Por ahora permitir eliminación siempre (cascade en BD)
    return true;
  }
}

// Export ESM
export default new ClienteService();
