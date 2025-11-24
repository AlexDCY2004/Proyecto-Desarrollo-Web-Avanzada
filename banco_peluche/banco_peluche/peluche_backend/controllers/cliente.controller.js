import Cliente from '../models/Cliente.js';
import ResultadoCliente from '../models/ResultadoCliente.js';
import clienteService from '../services/cliente.service.js';
import { sequelize } from '../config/database.js';

class ClienteController {
  // Crear cliente en la base de datos
  static async crearCliente(req, res) {
    try {
      const { nombre, saldoAnterior, montoCompras, pagoRealizado } = req.body;

      if (!nombre || saldoAnterior == null || montoCompras == null || pagoRealizado == null) {
        return res.status(400).json({
          ok: false,
          msg: 'Todos los campos son obligatorios.'
        });
      }
      const cliente = await Cliente.create({
        nombre,
        saldoAnterior,
        montoCompras,
        pagoRealizado,
      });
      res.status(201).json({
        success: true,
        cliente
      });
    } catch (err) {
      console.error("Error al crear cliente:", err);
      res.status(500).json({
        ok: false,
        msg: "Error al crear el cliente"
      });
    }
  }

  static async calcular(req, res) {
    const t = await sequelize.transaction();
    try {
      const { nombreCliente, saldoAnterior, montoCompras, pagoRealizado } = req.body;

      if (!nombreCliente || saldoAnterior == null || montoCompras == null || pagoRealizado == null) {
        await t.rollback();
        return res.status(400).json({ ok: false, msg: 'Todos los campos son obligatorios.' });
      }

      // Crear registro Cliente
      const cliente = await Cliente.create({
        nombre: nombreCliente,
        saldoAnterior: Number(saldoAnterior),
        montoCompras: Number(montoCompras),
        pagoRealizado: Number(pagoRealizado)
      }, { transaction: t });

      // Calcular resultado
      const resultado = clienteService.calcularCliente({
        saldoAnterior: Number(saldoAnterior),
        montoCompras: Number(montoCompras),
        pagoRealizado: Number(pagoRealizado)
      });

      // Guardar ResultadoCliente y asociarlo al cliente creado
      const resultadoDb = await ResultadoCliente.create({
        saldoAnterior: resultado.saldoAnterior,
        montoCompras: resultado.montoCompras,
        pagoRealizado: resultado.pagoRealizado,
        saldoBase: resultado.saldoBase,
        pagoMinimoBase: resultado.pagoMinimoBase,
        esMoroso: resultado.esMoroso,
        interes: resultado.interes,
        multa: resultado.multa,
        saldoActual: resultado.saldoActual,
        pagoMinimo: resultado.pagoMinimo,
        pagoNoIntereses: resultado.pagoNoIntereses,
        clienteId: cliente.id
      }, { transaction: t });

      await t.commit();

      // Logs para depuración: confirma que se insertaron registros
      console.log('Cliente creado:', { id: cliente.id, nombre: cliente.nombre });
      console.log('ResultadoCliente creado:', { id: resultadoDb.id, clienteId: resultadoDb.clienteId });

      // Devolver el resultado y también IDs creados para verificar en frontend
      return res.json({
        ok: true,
        data: resultado,
        saved: {
          clienteId: cliente.id,
          resultadoId: resultadoDb.id
        }
      });

    } catch (err) {
      await t.rollback();
      console.error("Error calcular y guardar:", err);
      return res.status(500).json({
        ok: false,
        msg: "Error interno al calcular y guardar datos del cliente"
      });
    }
  }

  // Nuevo: listar resultados guardados
  static async listar(req, res) {
    try {
      console.log('GET /api/clientes - listar called from', req.ip);

      // Intento normal (con include para traer el nombre del cliente)
      let resultados = await ResultadoCliente.findAll({
        include: [
          {
            model: Cliente,
            attributes: ['id', 'nombre']
          }
        ],
        order: [['id', 'DESC']]
      });

      // Si por alguna razón include no funciona, resultados será [] o lanzará excepción.
      // Mapear a un formato simple (convertir DECIMAL strings a Number)
      const mapped = resultados.map(r => ({
        id: r.id,
        clienteId: r.clienteId,
        nombre: r.Cliente ? r.Cliente.nombre : null,
        saldoAnterior: Number(r.saldoAnterior),
        montoCompras: Number(r.montoCompras),
        pagoRealizado: Number(r.pagoRealizado),
        saldoBase: Number(r.saldoBase),
        pagoMinimoBase: Number(r.pagoMinimoBase),
        esMoroso: Boolean(r.esMoroso),
        interes: Number(r.interes),
        multa: Number(r.multa),
        saldoActual: Number(r.saldoActual),
        pagoMinimo: Number(r.pagoMinimo),
        pagoNoIntereses: Number(r.pagoNoIntereses),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      }));

      console.log(`Listado de resultados: ${mapped.length} registros`);
      return res.json({ ok: true, data: mapped });

    } catch (err) {
      // Loguear stack para depuración
      console.error("Error listar resultados (primera ruta):", err);
      console.error(err.stack);

      // Intentar fallback: obtener resultados sin include (para evitar fallo por associations)
      try {
        console.log("Intentando fallback: findAll sin include...");
        const resultadosFallback = await ResultadoCliente.findAll({
          order: [['id', 'DESC']]
        });

        const mappedFallback = resultadosFallback.map(r => ({
          id: r.id,
          clienteId: r.clienteId,
          nombre: null, // no tenemos el join
          saldoAnterior: Number(r.saldoAnterior),
          montoCompras: Number(r.montoCompras),
          pagoRealizado: Number(r.pagoRealizado),
          saldoBase: Number(r.saldoBase),
          pagoMinimoBase: Number(r.pagoMinimoBase),
          esMoroso: Boolean(r.esMoroso),
          interes: Number(r.interes),
          multa: Number(r.multa),
          saldoActual: Number(r.saldoActual),
          pagoMinimo: Number(r.pagoMinimo),
          pagoNoIntereses: Number(r.pagoNoIntereses),
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        }));

        console.log(`Fallback listado: ${mappedFallback.length} registros`);
        return res.json({ ok: true, data: mappedFallback, note: 'fallback sin include' });
      } catch (err2) {
        console.error("Error listar resultados (fallback):", err2);
        console.error(err2.stack);
        // Devolver mensaje de error para depuración en local
        return res.status(500).json({
          ok: false,
          msg: "Error interno al listar resultados",
          error: err2.message,
          stack: err2.stack
        });
      }
    }
  }
}

export default ClienteController;

//agregar validaciones de datos de entrada en el futuro
