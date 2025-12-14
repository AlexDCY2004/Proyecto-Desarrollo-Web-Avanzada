import React, { useState } from 'react';

function ProductForm({ onCrear }) {
	const [title, setTitle] = useState('');
	const [price, setPrice] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function manejarSubmit(e) {
		e.preventDefault();
		if (title.trim() === '' || price.toString().trim() === '') {
			alert("Título y precio son obligatorios");
			return;
		}
		const priceNum = Number(price);
		if (Number.isNaN(priceNum) || priceNum < 0) {
			alert("El precio no puede ser negativo o caracteres no numéricos");
			return;
		}

		//validar el titulo solo strings
		if (!/^[a-zA-Z\s]*$/.test(title.trim())) {
			alert("El título solo debe contener letras y espacios");
			return;
		}

		const nuevoProducto = {
			title: title.trim(),
			price: priceNum
		};

		if (typeof onCrear === 'function') {
			try {
				setIsSubmitting(true);
				// esperar a que el handler termine y propagar errores si ocurren
				await onCrear(nuevoProducto);
			} catch (err) {
				console.error("Falló creación:", err);
				alert("No se pudo crear el producto. Ver consola.");
			} finally {
				setIsSubmitting(false);
			}
		}

		setTitle('');
		setPrice('');
	}

	return (
		<form onSubmit={manejarSubmit} className="form-card" style={{ borderColor: "black" }}>
			<div className="form-row">
				<label>Título</label>
				<input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
			</div>
			<div className="form-row">
				<label>Precio</label>
				<input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
			</div>
			<button type="submit" className="btn" disabled={isSubmitting}>
				{isSubmitting ? "Creando..." : "Crear"}
			</button>
		</form>
	);
}

export default ProductForm;

