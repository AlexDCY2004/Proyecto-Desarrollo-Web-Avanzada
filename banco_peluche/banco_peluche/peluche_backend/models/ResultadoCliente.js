// models/ResultadoCliente.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ResultadoCliente = sequelize.define('ResultadoCliente', {
  saldoAnterior: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  montoCompras: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  pagoRealizado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  saldoBase: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  pagoMinimoBase: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  esMoroso: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  interes: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  multa: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  saldoActual: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  pagoMinimo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  pagoNoIntereses: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// Asociaciones definidas aquí, pero aplicadas desde app.js llamando ResultadoCliente.associate(models)
ResultadoCliente.associate = function(models) {
  ResultadoCliente.belongsTo(models.Cliente, {
    foreignKey: 'clienteId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

export default ResultadoCliente;
