//servicio, traer la api
const BASE_URL = "https://dummyjson.com/products"

function generarId() {
	return Date.now() + Math.floor(Math.random() * 1000);
}

//get
export async function obtenerProductos(){
	try {
		const resp = await fetch(BASE_URL);
		if (!resp.ok) throw new Error(`Error al obtener productos: ${resp.status} ${resp.statusText}`);
		const data = await resp.json();
		// Asegurar que cada producto tenga un id
		return (data.products || []).map(p => (p.id ? p : { ...p, id: generarId() }));
	} catch (err) {
		// re-lanzar para que la UI lo capture
		throw err;
	}
}

//post
export async function crearProductos(producto){
	try {
		const resp = await fetch(`${BASE_URL}/add`, {
			method: "POST",
			headers: {"content-type": "application/json"},
			body: JSON.stringify(producto)
		});
		if (!resp.ok) throw new Error(`Error al crear producto: ${resp.status} ${resp.statusText}`);
		const created = await resp.json();
		// Si la API no devuelve id, asignar uno aquí
		if (!created.id) created.id = generarId();
		return created;
	} catch (err) {
		throw err;
	}
}

// Obtener un producto por su id
export async function obtenerProductoPorId(id) {
	if (!id) throw new Error("Se requiere un id para obtener el producto");
	try {
		const resp = await fetch(`${BASE_URL}/${id}`);
		if (!resp.ok) throw new Error("Error al obtener producto: " + resp.statusText);
		const prod = await resp.json();
		if (!prod.id) prod.id = id || generarId();
		return prod;
	} catch (err) {
		throw err;
	}
}

// Reemplaza/ajusta la función de actualización para permitir ediciones parciales (PATCH)
export async function actualizarProducto(id, producto) {
	if (!id) throw new Error("Se requiere un id para actualizar el producto");
	try {
		const resp = await fetch(`${BASE_URL}/${id}`, {
			method: "PATCH", // PATCH para cambios parciales; usa PUT si quieres reemplazo completo
			headers: { "content-type": "application/json" },
			body: JSON.stringify(producto),
		});
		if (!resp.ok) throw new Error("Error al actualizar producto: " + resp.statusText);
		const updated = await resp.json();
		// Asegurar id en la respuesta
		if (!updated.id) updated.id = id;
		return updated;
	} catch (err) {
		throw err;
	}
}

export async function eliminarProducto(id) {
	try {
		const resp = await fetch(`${BASE_URL}/${id}`, {
			method: "DELETE",
		});
		if (!resp.ok) throw new Error("Error al eliminar producto: " + resp.statusText);
		const result = await resp.json();
		// si la API no devuelve detalle, devolver objeto con id para que la UI lo use
		return result && (result.id || result.deleted) ? result : { id };
	} catch (err) {
		throw err;
	}
}


export const crearProducto = crearProductos;

