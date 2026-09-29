import pg, { Pool } from 'pg'
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

export const pgConfig = {
    host: process.env.PG_HOST,
    puerto: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
};

export const getConnection = new Pool(pgConfig);

/*
export const getConnection = async () =>{
    try{
        return await mssql.connect(mssqlConfig);
    }catch(error){
        console.error('Fallo en la conexion', error);        
    }
};
*/
