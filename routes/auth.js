const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// POST /api/auth/registro
router.post('/registro', async (req, res) => {
    try {
        const { nombre, apellidoP, apellidoM, fechaNacimiento, nacionalidad,
                codigoPostal, alcaldiaMunicipio, genero, telefono, email, password } = req.body;

        // Verificar si el email ya existe
        const emailExiste = await Usuario.findOne({ email });
        if (emailExiste) {
            return res.status(400).json({ mensaje: 'El email ya está registrado' });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        // Crear usuario
        const usuario = new Usuario({
            nombre, apellidoP, apellidoM, fechaNacimiento,
            nacionalidad, codigoPostal, alcaldiaMunicipio,
            genero, telefono, email, password: passwordEncriptada
        });

        await usuario.save();

        res.status(201).json({ mensaje: 'Usuario registrado correctamente' });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar si el usuario existe
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ mensaje: 'Credenciales incorrectas' });
        }

        // Verificar contraseña
        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(400).json({ mensaje: 'Credenciales incorrectas' });
        }

        // Generar token
        const token = jwt.sign(
            { id: usuario._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            mensaje: 'Login correcto',
            token,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email
            }
        });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
});

module.exports = router
