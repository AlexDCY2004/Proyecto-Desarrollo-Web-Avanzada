const API_URL = "http://localhost:3000/api/clientes";

function validarNombre(nombre) {
    const out = { ok: false, message: "", normalized: "" };
    if (!nombre || typeof nombre !== "string") {
        out.message = "El nombre es obligatorio.";
        return out;
    }
    const trimmed = nombre.trim();
    if (trimmed.length < 2) {
        out.message = "El nombre debe tener al menos 2 caracteres.";
        return out;
    }
    if (trimmed.length > 100) {
        out.message = "El nombre no puede superar 100 caracteres.";
        return out;
    }
    // No permitir dígitos u otros símbolos; permitir letras Unicode, espacios, guion, apóstrofe y punto
    const validRe = /^[A-Za-zÀ-ÖØ-öø-ÿÑñ'´`.\- ]+$/;
    if (!validRe.test(trimmed)) {
        out.message = "El nombre solo puede contener letras, espacios, guiones, apóstrofes o puntos.";
        return out;
    }
    if (/\s{2,}/.test(trimmed)) {
        out.message = "Evita dobles espacios en el nombre.";
        return out;
    }
    // Normalizar: colapsar espacios y aplicar capitalización simple
    const collapsed = trimmed.replace(/\s+/g, " ");
    const normalized = collapsed
        .toLowerCase()
        .replace(/\b(\p{L})/gu, (m) => m.toUpperCase()); // usa Unicode-aware capitalización
    out.ok = true;
    out.normalized = normalized;
    return out;
}

// ==============================
//calculo de un cliente
// ==============================
async function calcularCliente() {
    // Agregado: leer nombre del cliente
    const nombreRaw = document.getElementById("nombreCliente").value;
    const saldoAnterior = Number(document.getElementById("saldoAnterior").value);
    const montoCompras = Number(document.getElementById("montoCompras").value);
    const pagoRealizado = Number(document.getElementById("pagoRealizado").value);

    const nombreErrorEl = document.getElementById("nombreError");
    // validar nombre con la nueva función
    const v = validarNombre(nombreRaw);
    if (!v.ok) {
        nombreErrorEl.textContent = v.message;
        document.getElementById("nombreCliente").focus();
        return;
    } else {
        nombreErrorEl.textContent = "";
    }

    //validar campos numericos vacios
    if(!saldoAnterior || !montoCompras || !pagoRealizado) {
        alert("LLenar todos los campos");
        return;
    }

    //manejo de axios
    try{
        const response = await axios.post(`${API_URL}/calcular`, {
            // Enviamos el nombre normalizado al backend junto con los montos
            nombreCliente: v.normalized,
            saldoAnterior,
            montoCompras,
            pagoRealizado
        });

        const r = response.data.data; //el primer data del axios, el segundo data del backend
         //resultados en una tabla
         const tabla = document.querySelector("#resultadoTabla tbody"); //selecciono el cuerpo de la tabla

         //si la tabla no esta vacia, limpiarla
         tabla.innerHTML = "";
          
        //crear una nueva fila (Nombre como primera celda)
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${v.normalized}</td>
            <td>${Number(saldoAnterior).toFixed(2)}</td>
            <td>${Number(montoCompras).toFixed(2)}</td>
            <td>${Number(pagoRealizado).toFixed(2)}</td>

            <td>${r.saldoBase.toFixed(2)}</td>
            <td>${r.pagoMinimoBase.toFixed(2)}</td>
            <td>${r.esMoroso ? "Si" : "No"}</td>
            <td>${r.interes.toFixed(2)}</td>
            <td>${r.multa.toFixed(2)}</td>
            <td>${r.saldoActual.toFixed(2)}</td>
            <td>${r.pagoMinimo.toFixed(2)}</td>
            <td>${r.pagoNoIntereses.toFixed(2)}</td>
        `;
        tabla.appendChild(fila);
        
    }catch(error){
        console.error(error);
        alert("Error al calcular el cliente, revisa tu backend");
    }

}

// ------------------------------
// Cargar resultados guardados al inicio
// ------------------------------
async function cargarResultados() {
    try {
        const res = await axios.get(API_URL);
        const tabla = document.querySelector("#resultadoTabla tbody");

        // limpiar cualquier fila previa
        tabla.innerHTML = "";

        if (!res.data || !res.data.data || res.data.data.length === 0) {
            tabla.innerHTML = `<tr><td colspan="12" class="center muted">Sin datos aún...</td></tr>`;
            return;
        }

        const datos = res.data.data;
        datos.forEach(r => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${r.nombre ?? ''}</td>
                <td>${Number(r.saldoAnterior).toFixed(2)}</td>
                <td>${Number(r.montoCompras).toFixed(2)}</td>
                <td>${Number(r.pagoRealizado).toFixed(2)}</td>

                <td>${Number(r.saldoBase).toFixed(2)}</td>
                <td>${Number(r.pagoMinimoBase).toFixed(2)}</td>
                <td>${r.esMoroso ? "Si" : "No"}</td>
                <td>${Number(r.interes).toFixed(2)}</td>
                <td>${Number(r.multa).toFixed(2)}</td>
                <td>${Number(r.saldoActual).toFixed(2)}</td>
                <td>${Number(r.pagoMinimo).toFixed(2)}</td>
                <td>${Number(r.pagoNoIntereses).toFixed(2)}</td>
            `;
            tabla.appendChild(fila);
        });
    } catch (error) {
        // Mostrar detalle del error para depuración
        console.error("Error cargando resultados:", error);
        if (error.response) {
            console.error("Backend response:", error.response.status, error.response.data);
        }

        // mostrar mensaje útil en la tabla (si backend devolvió msg o error o stack)
        const tabla = document.querySelector("#resultadoTabla tbody");
        const serverData = error.response && error.response.data;
        const serverMsg = serverData?.msg || serverData?.error || null;
        const serverNote = serverData?.note ? ` (${serverData.note})` : '';
        const serverStack = serverData?.stack ? `\nStack: ${serverData.stack}` : '';
        tabla.innerHTML = `<tr><td colspan="12" class="center muted">Error al cargar datos${serverMsg ? ': ' + serverMsg : ''}${serverNote}</td></tr>`;

        // además mostrar un alert opcional para depuración rápida (puedes quitarlo después)
        console.warn('Detalles del error del servidor:', serverData);
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarResultados();
});
