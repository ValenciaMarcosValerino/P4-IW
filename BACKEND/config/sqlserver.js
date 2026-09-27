import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

export const sqlServerConfig = {
  user: process.env.SQLSERVER_USER,
  password: process.env.SQLSERVER_PASSWORD,
  server: process.env.SQLSERVER_SERVER,
  database: process.env.SQLSERVER_DB,

  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: 'SQLEXPRESS'
  }
};

export const getConnection = async () => {
  try {
    const pool = await sql.connect(sqlServerConfig);

    console.log('Conexión a SQL Server exitosa');

    return pool;
  } catch (error) {
    console.error('Error al conectar con SQL Server:', error);
    throw error;
  }
};