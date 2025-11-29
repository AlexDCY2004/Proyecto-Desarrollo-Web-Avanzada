import React, { useState } from "react";

function ProductList({ productos, onActualizar, onEliminar }) {
	//const [pendingDelete, setPendingDelete] = useState(null);  ya no se usa por item, se mantiene por compatibilidad
	// nuevos estados para formularios globales
	const [updateId, setUpdateId] = useState("");
	const [updateTitle, setUpdateTitle] = useState("");
	const [updatePrice, setUpdatePrice] = useState("");
	const [deleteId, setDeleteId] = useState("");
	const [updateLoading, setUpdateLoading] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);

	// helper para normalizar id: si es entero usar Number, sino string
	function normalizarId(raw) {
		const s = String(raw).trim();
		if (/^\d+$/.test(s)) return Number(s);
		return s;
	}

	if (!productos || productos.length === 0) {
		return (
			<div>
				<h2>Lista de Productos</h2>
				<p>No hay productos disponibles.</p>
			</div>
		);
	}

	// handler actualizar por id desde el formulario global
	async function handleUpdateById(e) {
		
		e.preventDefault();
		if (updateId.trim() === "") {
			alert("Ingrese el ID a actualizar");
			return;
		}
		const id = normalizarId(updateId);
		const cambios = {};
		if (updateTitle.trim() !== "") cambios.title = updateTitle.trim();
		//validar el titulo solo strings
		if (!/^[a-zA-Z\s]*$/.test(updateTitle.trim())) {
			alert("El título solo debe contener letras y espacios");
			return;
		}
		if (updatePrice.toString().trim() !== "") {
			const p = Number(updatePrice);
			if (Number.isNaN(p) || p < 0) {
				alert("Precio inválido");
				return;
			}
			cambios.price = p;
		}
		if (Object.keys(cambios).length === 0) {
			alert("Ingrese todos los campos para actualizar");
			return;
		}else {
			const existe = productos.some(p => p.id === id);
			if (!existe) {
				alert(`Producto con el ID "${id}" no encontrado.`);
			}else {
				if (typeof onActualizar !== "function") return;
				try {
					setUpdateLoading(true);
					await onActualizar(id, cambios);
					alert("Actualización realizada correctamente");
					// limpiar formulario
					setUpdateId("");
					setUpdateTitle("");
					setUpdatePrice("");
				} catch (err) {
					console.error("Error al actualizar por id:", err);
				} finally {
					setUpdateLoading(false);
				}
			}
		}
		
	}

	// handler eliminar por id desde el formulario global
	async function handleDeleteById(e) {
		e.preventDefault();
		if (deleteId.trim() === "") {
			alert("Ingrese el ID a eliminar");
			return;
		}
		
		const id = normalizarId(deleteId);
		if (id < 0) {
			alert("El id no puede ser negativo o caracteres no numéricos");
			return;
		}

		if (!window.confirm(`Confirmar eliminación del producto con ID "${deleteId}"?`)) return;

		const existe = productos.some(p => p.id === id);
		
		if (!existe) {
			alert(`Producto con el ID "${id}" no encontrado.`);
			return;
		}
		
		if (typeof onEliminar !== "function") return;
		try {
			setDeleteLoading(true);
			await onEliminar(id);
			alert("Eliminación realizada correctamente");
			setDeleteId("");
		} catch (err) {
			console.error("Error al eliminar por id:", err);
			alert("No se pudo eliminar. Ver consola.");
		} finally {
			setDeleteLoading(false);
		}
	}

	return (
		<div>
			{/* Formulario global para actualizar por ID */}
			<form onSubmit={handleUpdateById} className="form-card" style={{ borderColor: "black" }}>
				<div className="form-row">
					<label>ID a actualizar:</label>
					<input type="number" value={updateId} onChange={(e) => setUpdateId(e.target.value)} />
				</div>
				<div className="form-row">
					<label>Nuevo título:</label>
					<input type="text" value={updateTitle} onChange={(e) => setUpdateTitle(e.target.value)} />
				</div>
				<div className="form-row">
					<label>Nuevo precio:</label>
					<input type="number" step="0.01" value={updatePrice} onChange={(e) => setUpdatePrice(e.target.value)} />
				</div>
				<button type="submit" className="btn" disabled={updateLoading}>{updateLoading ? "Actualizando..." : "Actualizar por ID"}</button>
			</form>

			{/* Formulario global para eliminar por ID */}
			<form onSubmit={handleDeleteById} className="form-card" style={{ borderColor: "black" }}>
				<div className="form-row">
					<label>ID a eliminar:</label>
					<input type="number" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} />
				</div>
				<button type="submit" className="btn danger" disabled={deleteLoading}>{deleteLoading ? "Eliminando..." : "Eliminar por ID"}</button>
			</form>

			<h2>Lista de Productos</h2>

			{/* Lista informativa (sin bullets, estilo de tarjeta) */}
			<ul className="products">
				{productos.map((p) => (
					<li key={p.id} className="product-item">
						<span className="product-id">{p.id}</span>
						<div className="product-meta">
							<span className="product-title">{p.title}</span>
							<span className="product-price">${p.price}</span>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

export default ProductList;