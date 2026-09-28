import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import {
  buscarUsuarioPorCorreo,
  buscarUsuarioPorCredenciales,
  crearUsuario
} from '../models/usersSQLserver.js';


// ========================================
// VARIABLES DE ENTORNO
// ========================================

dotenv.config();

const JWT_SECRET =
  process.env.JWT_SECRET;


// ========================================
// REGISTRAR USUARIO
// ========================================

export const registrarUsuario =
  async (req, res) => {

    try {

      const {
        nombre,
        correo,
        contrasena,
        preguntarc,
        respuestarc
      } = req.body;


      // ========================================
      // VALIDAR CAMPOS
      // ========================================

      if (
        !nombre ||
        !correo ||
        !contrasena ||
        !preguntarc ||
        !respuestarc
      ) {

        return res.status(400).json({
          mensaje:
            'Todos los campos son obligatorios'
        });

      }


      // ========================================
      // LIMPIAR DATOS
      // ========================================

      const nombreLimpio =
        nombre.trim();

      const correoLimpio =
        correo.trim();

      const preguntaLimpia =
        preguntarc.trim();

      const respuestaLimpia =
        respuestarc.trim();


      // ========================================
      // COMPROBAR CORREO DUPLICADO
      // ========================================

      const usuarioExistente =
        await buscarUsuarioPorCorreo(
          correoLimpio
        );


      if (usuarioExistente) {

        return res.status(409).json({
          mensaje:
            'El correo ya está registrado'
        });

      }


      // ========================================
      // CREAR USUARIO
      // ========================================

      await crearUsuario({

        nombre:
          nombreLimpio,

        correo:
          correoLimpio,

        contrasena,

        preguntarc:
          preguntaLimpia,

        respuestarc:
          respuestaLimpia

      });


      // ========================================
      // RESPUESTA
      // ========================================

      return res.status(201).json({
        mensaje:
          'Usuario registrado correctamente'
      });


    } catch (error) {

      console.error(
        'Error al registrar usuario:',
        error
      );


      return res.status(500).json({
        mensaje:
          'Error al registrar usuario'
      });

    }

  };


// ========================================
// INICIAR SESIÓN
// ========================================

export const iniciarSesion =
  async (req, res) => {

    try {

      const {
        correo,
        contrasena
      } = req.body;


      // ========================================
      // VALIDAR CAMPOS
      // ========================================

      if (
        !correo ||
        !contrasena
      ) {

        return res.status(400).json({
          mensaje:
            'Correo y contraseña son obligatorios'
        });

      }


      // ========================================
      // BUSCAR USUARIO
      // ========================================

      const usuario =
        await buscarUsuarioPorCredenciales(
          correo.trim(),
          contrasena
        );


      // ========================================
      // CREDENCIALES INCORRECTAS
      // ========================================

      if (!usuario) {

        return res.status(401).json({
          mensaje:
            'Correo o contraseña incorrectos'
        });

      }


      // ========================================
      // USUARIO DESACTIVADO
      // ========================================

      if (!usuario.activo) {

        return res.status(403).json({
          mensaje:
            'Este usuario está desactivado'
        });

      }


      // ========================================
      // VALIDAR JWT_SECRET
      // ========================================

      if (!JWT_SECRET) {

        console.error(
          'JWT_SECRET no está definido'
        );


        return res.status(500).json({
          mensaje:
            'Error de configuración del servidor'
        });

      }


      // ========================================
      // GENERAR TOKEN JWT
      // ========================================

      const token =
        jwt.sign(
          {
            id:
              usuario.id,

            correo:
              usuario.correo,

            rol:
              usuario.rol,

            es_superadmin:
              Boolean(
                usuario.es_superadmin
              )
          },
          JWT_SECRET,
          {
            expiresIn: '1h'
          }
        );


      // ========================================
      // RESPUESTA
      // ========================================

      return res.status(200).json({

        mensaje:
          'Inicio de sesión correcto',

        token,

        usuario: {

          id:
            usuario.id,

          nombre:
            usuario.nombre,

          correo:
            usuario.correo,

          rol:
            usuario.rol,

          es_superadmin:
            Boolean(
              usuario.es_superadmin
            )

        }

      });


    } catch (error) {

      console.error(
        'Error al iniciar sesión:',
        error
      );


      return res.status(500).json({
        mensaje:
          'Error al iniciar sesión'
      });

    }

  };