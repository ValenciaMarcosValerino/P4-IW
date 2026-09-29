import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

/*import {
  getConnection
} from './config/sqlserver.js';
*/

import {
  getConnection
} from './config/postgresql.js';

import authRoutes
  from './routes/authRoutes.js';

import usersRoutes
  from './routes/usersRoutesPostgre.js';


// ========================================
// VARIABLES DE ENTORNO
// ========================================

dotenv.config();


// ========================================
// CREAR APLICACIÓN EXPRESS
// ========================================

const app = express();

const PORT =
  process.env.PORT || 5000;


// ========================================
// MIDDLEWARES GENERALES
// ========================================

// Permitir conexión desde React
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://practica4-neon.vercel.app'
    ],

    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'OPTIONS'
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ],

    credentials: true
  })
);

// Permitir recibir JSON
app.use(
  express.json()
);


// ========================================
// RUTA DE PRUEBA
// ========================================

app.get(
  '/',
  (req, res) => {

    res.status(200).json({
      mensaje:
        'Backend funcionando correctamente'
    });

  }
);


// ========================================
// RUTAS DE AUTENTICACIÓN
//
// Rutas finales:
//
// POST /api/sqlserver/login
// POST /api/sqlserver/users
// ========================================

/**
 * app.use(
  '/api/sqlserver',
  authRoutes
);
 */

app.use(
  '/api/postgresql',
  authRoutes
);


// ========================================
// RUTAS DE USUARIOS
//
// Rutas finales:
//
// GET    /api/sqlserver/users
// GET    /api/sqlserver/users/:id
// PUT    /api/sqlserver/users/:id
// PUT    /api/sqlserver/users/:id/estado
// DELETE /api/sqlserver/users/:id
// ========================================

/**
 * app.use(
  '/api/sqlserver/users',
  usersRoutes
);
 */

app.use(
  '/api/postgresql/users',
  usersRoutes
);


// ========================================
// RUTA NO ENCONTRADA
// ========================================

app.use(
  (req, res) => {

    return res.status(404).json({
      mensaje:
        'Ruta no encontrada'
    });

  }
);


// ========================================
// INICIAR SERVIDOR
// ========================================

const iniciarServidor = async () => {
  try {
    await getConnection.query('SELECT 1');

    console.log(
      'Conexión con PostgreSQL exitosa'
    );

    app.listen(
      PORT,
      () => {
        console.log(
          `Servidor backend corriendo en http://localhost:${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      'No se pudo iniciar el servidor:',
      error
    );
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'production') {
  iniciarServidor();
}

export default app;