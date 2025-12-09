import "./App.css";
import { useEffect, useState } from "react";
import ProductForm from "./components/ProductForm";
import ProductList from "./components/ProductList";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from "./services/productService";

function App() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // useEffect: se ejecuta una sola vez al montar el componente
  useEffect(() => {
    async function cargarDatos() {
      try {
        const data = await obtenerProductos();
        setProductos(data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, []); // [] → solo una vez (como componentDidMount)

  //  Evento que viene del hijo ProductForm
  async function handleCrear(productoNuevo) {
    try {
      const creado = await crearProducto(productoNuevo);

      let creadoConId;
      setProductos((prev) => {
        const maxId = prev.reduce((m, it) => {
          const n = Number(it?.id);
          return Number.isFinite(n) && !Number.isNaN(n) ? Math.max(m, n) : m;
        }, 0);

        const assignedId = maxId + 1; // siempre siguiente secuencial
        creadoConId = { ...creado, id: assignedId };
        return [...prev, creadoConId];
      });

      return creadoConId;
    } catch (error) {
      console.error("Error al crear producto:", error);
      throw error;
    }
  }

  // NUEVO: actualizar producto (usa actualizarProducto del service) con fallback local
  async function handleActualizar(id, cambios) {
    try {
      const actualizado = await actualizarProducto(id, cambios);
      // usar id devuelto por la API si existe, sino el id solicitado
      const idToMatch = actualizado?.id ?? id;
      setProductos((prev) => prev.map((p) => (p.id === idToMatch ? actualizado : p)));
      return actualizado;
    } catch (error) {
      // fallback: actualizar localmente si existe (producto creado localmente)
      console.warn("Fallo actualización remota, aplicando cambios localmente:", error);
      const idNum = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
      const local = productos.find((p) => p.id === idNum || String(p.id) === String(id));
      if (local) {
        const merged = { ...local, ...cambios, id: local.id };
        setProductos((prev) => prev.map((p) => (p.id === local.id ? merged : p)));
        return merged;
      }
      console.error("Producto no encontrado localmente para id:", id);
      throw error;
    }
  }

  // NUEVO: eliminar producto (usa eliminarProducto del service) con fallback local
  async function handleEliminar(id) {
    try {
      const resp = await eliminarProducto(id);
      setProductos((prev) => prev.filter((p) => !(p.id === id || String(p.id) === String(id))));
      return resp;
    } catch (error) {
      // fallback: eliminar localmente si existe
      console.warn("Fallo eliminación remota, eliminando localmente:", error);
      const idNum = typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
      const exists = productos.some((p) => p.id === idNum || String(p.id) === String(id));
      if (exists) {
        setProductos((prev) => prev.filter((p) => !(p.id === idNum || String(p.id) === String(id))));
        return { id };
      }
      console.error("Producto no encontrado localmente para id:", id);
      throw error;
    }
  }

  return (
    <div className="App">
      <div className="app-card">
        <header className="app-header">
          <h1 className="app-title">
            Consumo de Api
            <span className="app-sub">DummyJSON</span>
          </h1>
        </header>

        {/* HIJO que genera evento */}
        <ProductForm onCrear={handleCrear} />

        {cargando ? (
          <p className="note">Cargando productos...</p>
        ) : (
          <ProductList
            productos={productos}
            onActualizar={handleActualizar}
            onEliminar={handleEliminar}
          />
        )}
      </div>
    </div>
  );
}

export default App;