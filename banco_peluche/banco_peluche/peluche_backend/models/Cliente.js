// models/Cliente.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Cliente = sequelize.define('Cliente', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,  // Hacer que el nombre sea obligatorio
  },
  saldoAnterior: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  montoCompras: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  pagoRealizado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  }
});

// Asociaciones definidas aquí, pero aplicadas desde app.js llamando Cliente.associate(models)
Cliente.associate = function(models) {
  Cliente.hasOne(models.ResultadoCliente, {
    foreignKey: 'clienteId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

export default Cliente;
