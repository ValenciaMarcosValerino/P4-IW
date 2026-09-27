import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sql from 'mssql';

import { getConnection } from './config/sqlserver.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// ========================================
// MIDDLEWARES
// ========================================

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());


// ========================================
// RUTA PRINCIPAL
// ========================================

app.get('/', (req, res) => {
  res.json({
    mensaje: 'Backend funcionando correctamente'
  });
});


// ========================================
// GET - OBTENER TODOS LOS USUARIOS
// ========================================

app.get('/api/sqlserver/users', async (req, res) => {

  try {

    const pool = await getConnection();

    const resultado = await pool
      .request()
      .query(`
        SELECT
          id,
          nombre,
          correo,
          contrasena,
          preguntarc,
          respuestarc
        FROM users
      `);

    res.status(200).json(resultado.recordset);

  } catch (error) {

    console.error('Error GET usuarios:', error);

    res.status(500).json({
      mensaje: 'Error al obtener los usuarios',
      error: error.message
    });

  }

});


// ========================================
// POST - CREAR NUEVO USUARIO
// ========================================

app.post('/api/sqlserver/users', async (req, res) => {

  try {

    const {
      nombre,
      correo,
      contrasena,
      preguntarc,
      respuestarc
    } = req.body;


    // Validación sencilla
    if (
      !nombre ||
      !correo ||
      !contrasena ||
      !preguntarc ||
      !respuestarc
    ) {

      return res.status(400).json({
        mensaje: 'Todos los campos son obligatorios'
      });

    }


    const pool = await getConnection();


    await pool
      .request()

      .input(
        'nombre',
        sql.VarChar,
        nombre
      )

      .input(
        'correo',
        sql.VarChar,
        correo
      )

      .input(
        'contrasena',
        sql.VarChar,
        contrasena
      )

      .input(
        'preguntarc',
        sql.VarChar,
        preguntarc
      )

      .input(
        'respuestarc',
        sql.VarChar,
        respuestarc
      )

      .query(`
        INSERT INTO users
        (
          nombre,
          correo,
          contrasena,
          preguntarc,
          respuestarc
        )

        VALUES
        (
          @nombre,
          @correo,
          @contrasena,
          @preguntarc,
          @respuestarc
        )
      `);


    res.status(201).json({
      mensaje: 'Usuario registrado correctamente'
    });

  } catch (error) {

    console.error('Error POST usuario:', error);

    res.status(500).json({
      mensaje: 'Error al registrar el usuario',
      error: error.message
    });

  }

});


// ========================================
// INICIAR SERVIDOR
// ========================================

app.listen(PORT, () => {
  console.log(
    `Servidor backend corriendo en http://localhost:${PORT}`
  );
});