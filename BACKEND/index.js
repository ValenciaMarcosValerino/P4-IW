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
    origin: 'http://localhost:5173',
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

app.use(
  '/api/sqlserver',
  authRoutes
);

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

app.use(
  '/api/sqlserver/users',
  usersRoutes
);

app.use(
  '/api/postgresql/users',
  usersRoutesPostgre
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

    // Comprobamos primero la conexión
    // con SQL Server.
    // con PostgreSql
    await getConnection();


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


iniciarServidor();
//en este index ya tenemos 2 endpoints uno que es el GET y otro que es el POST