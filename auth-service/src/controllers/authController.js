const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { dynamodb, tableName } = require('../config/dynamodb');
const { generateToken } = require('../utils/jwtUtils');

/**
 * Registrar nuevo usuario
 */
async function register(req, res) {
  try {
    const { email, password, name } = req.body;

    // Validar campos requeridos
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Email, password y name son requeridos'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email inválido',
        message: 'Por favor proporciona un email válido'
      });
    }

    // Validar longitud de password
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password muy corta',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await dynamodb.get({
      TableName: tableName,
      Key: {
        PK: `USER#${email.toLowerCase()}`,
        SK: `USER#${email.toLowerCase()}`
      }
    }).promise();

    if (existingUser.Item) {
      return res.status(409).json({
        error: 'Usuario ya existe',
        message: 'Ya existe un usuario con este email'
      });
    }

    // Hash del password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar userId único
    const userId = uuidv4();

    // Crear usuario en DynamoDB
    const user = {
      PK: `USER#${email.toLowerCase()}`,
      SK: `USER#${email.toLowerCase()}`,
      userId,
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      role: 'user', // Por defecto es 'user', puede ser 'admin'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dynamodb.put({
      TableName: tableName,
      Item: user
    }).promise();

    // Generar JWT token
    const token = generateToken({
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role
    });

    console.log(`✅ Usuario registrado exitosamente: ${email}`);

    // Responder sin el password
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Error al registrar usuario:', error);
    res.status(500).json({
      error: 'Error al registrar usuario',
      message: error.message
    });
  }
}

/**
 * Login de usuario
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Email y password son requeridos'
      });
    }

    // Buscar usuario en DynamoDB
    const result = await dynamodb.get({
      TableName: tableName,
      Key: {
        PK: `USER#${email.toLowerCase()}`,
        SK: `USER#${email.toLowerCase()}`
      }
    }).promise();

    const user = result.Item;

    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Generar JWT token
    const token = generateToken({
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role
    });

    console.log(`✅ Login exitoso: ${email}`);

    // Responder sin el password
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Error al hacer login:', error);
    res.status(500).json({
      error: 'Error al hacer login',
      message: error.message
    });
  }
}

/**
 * Obtener perfil del usuario autenticado
 */
async function getProfile(req, res) {
  try {
    // req.user viene del middleware authenticateToken
    const { email } = req.user;

    // Buscar usuario en DynamoDB
    const result = await dynamodb.get({
      TableName: tableName,
      Key: {
        PK: `USER#${email.toLowerCase()}`,
        SK: `USER#${email.toLowerCase()}`
      }
    }).promise();

    const user = result.Item;

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'No se encontró el usuario'
      });
    }

    // Responder sin el password
    res.json({
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    res.status(500).json({
      error: 'Error al obtener perfil',
      message: error.message
    });
  }
}

/**
 * Verificar si el token es válido
 */
function verifyTokenEndpoint(req, res) {
  // Si llegamos aquí, el middleware authenticateToken ya validó el token
  res.json({
    valid: true,
    user: req.user
  });
}

module.exports = {
  register,
  login,
  getProfile,
  verifyTokenEndpoint
};