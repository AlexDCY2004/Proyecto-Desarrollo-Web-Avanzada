//conexion de sequelize a la base de datos y pruebas de autentificacion
import {Sequelize} from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: false

    }

);

//probar la conexion

export const dbConnect = async () => {
    try{
        await sequelize.authenticate();
        console.log("Conexion exitosa a la base de datos MySQL");

    }catch (err){
        console.error("Error de conexion a la base de datos MySQL", err.message);

    }
};
