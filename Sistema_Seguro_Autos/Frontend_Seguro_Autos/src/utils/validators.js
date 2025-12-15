/**
 * Validadores para el Sistema de Seguro de Autos
 * Incluye todas las reglas de negocio del frontend
 */

// ==================== VALIDADORES DE USUARIO ====================
export const validarUsuario = (usuario) => {
    const errores = {};

    if (!usuario.nombre || usuario.nombre.trim() === '') {
        errores.nombre = 'El nombre de usuario es requerido';
    } else if (usuario.nombre.length < 3) {
        errores.nombre = 'El nombre debe tener mínimo 3 caracteres';
    } else if (usuario.nombre.length > 32) {
        errores.nombre = 'El nombre no puede exceder 32 caracteres';
    } else if (!/^[a-zA-Z0-9]+$/.test(usuario.nombre)) {
        errores.nombre = 'El nombre solo puede contener letras y números';
    }

    if (!usuario.contrasenia || usuario.contrasenia === '') {
        errores.contrasenia = 'La contraseña es requerida';
    } else if (usuario.contrasenia.length < 8) {
        errores.contrasenia = 'La contraseña debe tener mínimo 8 caracteres';
    } else if (usuario.contrasenia.includes(' ')) {
        errores.contrasenia = 'La contraseña no puede contener espacios';
    }

    return errores;
};

// ==================== VALIDADORES DE CONDUCTOR ====================
export const validarConductor = (conductor) => {
    const errores = {};

    // Nombre
    if (!conductor.nombre || conductor.nombre.trim() === '') {
        errores.nombre = 'El nombre del conductor es requerido';
    } else if (conductor.nombre.length < 2) {
        errores.nombre = 'El nombre debe tener mínimo 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/.test(conductor.nombre)) {
        errores.nombre = 'El nombre solo puede contener letras';
    }

    // Apellido
    if (!conductor.apellido || conductor.apellido.trim() === '') {
        errores.apellido = 'El apellido del conductor es requerido';
    } else if (conductor.apellido.length < 2) {
        errores.apellido = 'El apellido debe tener mínimo 2 caracteres';
    } else if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/.test(conductor.apellido)) {
        errores.apellido = 'El apellido solo puede contener letras';
    }

    // Edad - REGLA CRÍTICA
    if (!conductor.edad && conductor.edad !== 0) {
        errores.edad = 'La edad es requerida';
    } else if (isNaN(conductor.edad) || conductor.edad < 18) {
        errores.edad = '⚠️ Conductor menor de 18 años. No se puede generar cotización.';
    } else if (conductor.edad > 75) {
        errores.edad = '⚠️ Conductor mayor de 75 años. Rechazo automático.';
    } else if (conductor.edad >= 18 && conductor.edad <= 24) {
        errores.edadAviso = '⚠️ Conductor joven (18-24): Se aplicará recargo del 20%';
    } else if (conductor.edad > 65) {
        errores.edadAviso = '⚠️ Conductor mayor de 65 años: Se aplicará recargo del 10%';
    }

    // Tipo de licencia
    if (!conductor.tipo_licencia) {
        errores.tipo_licencia = 'El tipo de licencia es requerido';
    } else if (!['A', 'B', 'C', 'D', 'E'].includes(conductor.tipo_licencia)) {
        errores.tipo_licencia = 'Tipo de licencia inválido';
    }

    // Teléfono
    if (!conductor.telefono || conductor.telefono.trim() === '') {
        errores.telefono = 'El teléfono es requerido';
    } else if (!/^\d{10}$/.test(conductor.telefono)) {
        errores.telefono = 'El teléfono debe tener 10 dígitos';
    }

    // Accidentes
    if (!conductor.accidentes_cantidad && conductor.accidentes_cantidad !== 0) {
        errores.accidentes_cantidad = 'La cantidad de accidentes es requerida';
    } else if (isNaN(conductor.accidentes_cantidad) || conductor.accidentes_cantidad < 0) {
        errores.accidentes_cantidad = 'La cantidad debe ser un número positivo';
    } else if (conductor.accidentes_cantidad === 0) {
        errores.accidentesAviso = '✓ Sin accidentes: Se aplicará descuento del 10%';
    } else if (conductor.accidentes_cantidad > 0 && conductor.accidentes_cantidad <= 3) {
        errores.accidentesAviso = `⚠️ ${conductor.accidentes_cantidad} accidente(s): Recargo del 5% por cada uno`;
    } else if (conductor.accidentes_cantidad > 3) {
        errores.accidentes_cantidad = '⚠️ Más de 3 accidentes: Riesgo alto - Requiere revisión';
    }

    return errores;
};

// ==================== VALIDADORES DE VEHÍCULO ====================
export const validarVehiculo = (vehiculo) => {
    const errores = {};
    const anioActual = new Date().getFullYear();

    // Modelo
    if (!vehiculo.modelo || vehiculo.modelo.trim() === '') {
        errores.modelo = 'El modelo del vehículo es requerido';
    } else if (vehiculo.modelo.length < 2) {
        errores.modelo = 'El modelo debe tener mínimo 2 caracteres';
    }

    // Año - REGLA CRÍTICA
    if (!vehiculo.anio && vehiculo.anio !== 0) {
        errores.anio = 'El año del vehículo es requerido';
    } else if (isNaN(vehiculo.anio)) {
        errores.anio = 'El año debe ser un número válido';
    } else if (vehiculo.anio < 1900 || vehiculo.anio > anioActual) {
        errores.anio = `El año debe estar entre 1900 y ${anioActual}`;
    } else {
        const antiguedad = anioActual - vehiculo.anio;
        if (antiguedad > 20) {
            errores.anio = `⚠️ Vehículo con ${antiguedad} años de antigüedad. No se puede cotizar.`;
        }
    }

    // Color
    if (!vehiculo.color || vehiculo.color.trim() === '') {
        errores.color = 'El color es requerido';
    }

    // Tipo - IMPORTANTE
    if (!vehiculo.tipo) {
        errores.tipo = 'El tipo de vehículo es requerido';
    } else if (!['Sedán', 'SUV', 'Camioneta', 'Auto', 'Compacto'].includes(vehiculo.tipo)) {
        errores.tipo = 'Tipo de vehículo no válido';
    } else if (vehiculo.tipo === 'SUV' || vehiculo.tipo === 'Camioneta') {
        errores.tipoAviso = `⚠️ ${vehiculo.tipo}: Se aplicará recargo del 15%`;
    }

    // Uso - IMPORTANTE
    if (!vehiculo.uso) {
        errores.uso = 'El uso del vehículo es requerido';
    } else if (!['Personal', 'Comercial', 'Particular'].includes(vehiculo.uso)) {
        errores.uso = 'Uso de vehículo no válido';
    } else if (vehiculo.uso === 'Comercial') {
        errores.usoAviso = '⚠️ Uso comercial: Se aplicará recargo del 15%';
    }

    // Precio
    if (!vehiculo.precio && vehiculo.precio !== 0) {
        errores.precio = 'El precio del vehículo es requerido';
    } else if (isNaN(parseFloat(vehiculo.precio)) || parseFloat(vehiculo.precio) <= 0) {
        errores.precio = 'El precio debe ser un número positivo';
    }

    return errores;
};

// ==================== VALIDADORES DE MÉTODO DE PAGO ====================
export const validarMetodoPago = (pago) => {
    const errores = {};

    if (!pago.tipo) {
        errores.tipo = 'El tipo de pago es requerido';
    } else if (!['Tarjeta de Crédito', 'Tarjeta de Débito', 'Efectivo'].includes(pago.tipo)) {
        errores.tipo = 'Tipo de pago no válido';
    }

    if (!pago.numero && pago.tipo !== 'Efectivo') {
        errores.numero = 'El número de tarjeta es requerido';
    } else if (pago.numero && !/^\d{13,19}$/.test(pago.numero.replace(/\s/g, ''))) {
        errores.numero = 'El número de tarjeta no es válido';
    }

    // Avisos por tipo de pago
    if (pago.tipo === 'Tarjeta de Crédito') {
        errores.pagoAviso = '✓ Tarjeta de crédito: Se aplicará descuento del 5%';
    }

    return errores;
};

// ==================== VALIDADORES DE COTIZACIÓN ====================
export const validarCotizacion = (cotizacion, conductor, vehiculo) => {
    const errores = {};

    // Validaciones críticas
    if (conductor && conductor.edad < 18) {
        errores.general = '❌ Cotización rechazada: Conductor menor de 18 años';
        return errores;
    }

    if (conductor && conductor.edad > 75) {
        errores.general = '❌ Cotización rechazada: Conductor mayor de 75 años';
        return errores;
    }

    const anioActual = new Date().getFullYear();
    if (vehiculo && (anioActual - vehiculo.anio) > 20) {
        errores.general = '❌ Cotización rechazada: Vehículo con más de 20 años de antigüedad';
        return errores;
    }

    // Validar aceptación de términos
    if (!cotizacion.acepta_terminos) {
        errores.acepta_terminos = 'Debe aceptar los términos y condiciones';
    }

    return errores;
};

// ==================== VALIDADORES DE PÓLIZA ====================
export const validarFechasPoliza = (fechaInicio, cotizacion) => {
    const errores = {};
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (!fechaInicio) {
        errores.fechaInicio = 'La fecha de inicio es requerida';
        return errores;
    }

    const inicio = new Date(fechaInicio);
    inicio.setHours(0, 0, 0, 0);

    if (inicio < hoy) {
        errores.fechaInicio = 'La fecha de inicio no puede ser anterior a hoy';
    }

    if (cotizacion && cotizacion.fecha_caducidad) {
        const caducidad = new Date(cotizacion.fecha_caducidad);
        if (caducidad < hoy) {
            errores.cotizacion = 'La cotización ha vencido. No se puede crear póliza.';
        }
    }

    return errores;
};

// ==================== FUNCIONES DE CÁLCULO ====================
export const calcularRecargosYDescuentos = (conductor, vehiculo, metodoPago) => {
    const detalles = {
        recargos: [],
        descuentos: [],
        recargo_total: 0,
        descuento_total: 0
    };

    if (!conductor || !vehiculo) return detalles;

    const costoBase = parseFloat(vehiculo.precio) || 1000;

    // RECARGOS CONDUCTOR
    if (conductor.edad >= 18 && conductor.edad <= 24) {
        const recargo = costoBase * 0.20;
        detalles.recargos.push({ descripcion: 'Conductor joven (18-24)', monto: recargo.toFixed(2) });
        detalles.recargo_total += recargo;
    } else if (conductor.edad > 65 && conductor.edad <= 75) {
        const recargo = costoBase * 0.10;
        detalles.recargos.push({ descripcion: 'Edad avanzada (>65)', monto: recargo.toFixed(2) });
        detalles.recargo_total += recargo;
    }

    // RECARGOS/DESCUENTOS ACCIDENTES
    if (conductor.accidentes_cantidad === 0) {
        const descuento = costoBase * 0.10;
        detalles.descuentos.push({ descripcion: 'Sin accidentes', monto: descuento.toFixed(2) });
        detalles.descuento_total += descuento;
    } else if (conductor.accidentes_cantidad > 0) {
        const recargo = costoBase * 0.05 * conductor.accidentes_cantidad;
        detalles.recargos.push({ 
            descripcion: `${conductor.accidentes_cantidad} accidente(s)`, 
            monto: recargo.toFixed(2) 
        });
        detalles.recargo_total += recargo;
    }

    // RECARGOS VEHÍCULO
    if (vehiculo.tipo === 'SUV' || vehiculo.tipo === 'Camioneta') {
        const recargo = costoBase * 0.15;
        detalles.recargos.push({ descripcion: `Tipo de vehículo (${vehiculo.tipo})`, monto: recargo.toFixed(2) });
        detalles.recargo_total += recargo;
    }

    if (vehiculo.uso === 'Comercial') {
        const recargo = costoBase * 0.15;
        detalles.recargos.push({ descripcion: 'Uso comercial', monto: recargo.toFixed(2) });
        detalles.recargo_total += recargo;
    }

    // DESCUENTOS PAGO
    if (metodoPago && metodoPago.tipo === 'Tarjeta de Crédito') {
        const descuento = costoBase * 0.05;
        detalles.descuentos.push({ descripcion: 'Pago con tarjeta de crédito', monto: descuento.toFixed(2) });
        detalles.descuento_total += descuento;
    }

    // Redondear totales
    detalles.recargo_total = Math.round(detalles.recargo_total * 100) / 100;
    detalles.descuento_total = Math.round(detalles.descuento_total * 100) / 100;

    return detalles;
};

// ==================== VALIDACIÓN GENERAL ====================
export const validarFormularioCotizacion = (formData) => {
    const errores = {};

    const conductorErrs = validarConductor(formData.conductor || {});
    const vehiculoErrs = validarVehiculo(formData.vehiculo || {});
    const pagoErrs = validarMetodoPago(formData.pago || {});
    const cotizacionErrs = validarCotizacion(formData.cotizacion || {}, formData.conductor, formData.vehiculo);

    // Combinar errores críticos
    if (conductorErrs.edad) errores.conductor_edad = conductorErrs.edad;
    if (vehiculoErrs.anio) errores.vehiculo_anio = vehiculoErrs.anio;
    if (cotizacionErrs.general) errores.general = cotizacionErrs.general;

    return {
        valido: Object.keys(errores).length === 0,
        errores,
        detalle: {
            conductor: conductorErrs,
            vehiculo: vehiculoErrs,
            pago: pagoErrs,
            cotizacion: cotizacionErrs
        }
    };
};
