const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const authConfig = require('../config/auth');
const response = require('../utils/response');

/**
 * Registrar novo usuário
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return response.conflict(res, 'Usuário já existe com este email');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, authConfig.saltRounds);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'USER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true
      }
    });

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      authConfig.secret,
      { expiresIn: authConfig.expiresIn }
    );

    return response.created(res, { user, token }, 'Usuário registrado com sucesso');
  } catch (error) {
    console.error('Erro no registro:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Login do usuário
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.active) {
      return response.unauthorized(res, 'Credenciais inválidas');
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return response.unauthorized(res, 'Credenciais inválidas');
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      authConfig.secret,
      { expiresIn: authConfig.expiresIn }
    );

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user;

    return response.success(res, { user: userWithoutPassword, token }, 'Login realizado com sucesso');
  } catch (error) {
    console.error('Erro no login:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Obter perfil do usuário logado
 */
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return response.notFound(res, 'Usuário não encontrado');
    }

    return response.success(res, user, 'Perfil recuperado com sucesso');
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Atualizar perfil do usuário
 */
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Verificar se o email já está em uso por outro usuário
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: req.userId }
        }
      });

      if (existingUser) {
        return response.conflict(res, 'Email já está em uso por outro usuário');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(email && { email })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return response.success(res, updatedUser, 'Perfil atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Alterar senha do usuário
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Buscar usuário atual
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return response.notFound(res, 'Usuário não encontrado');
    }

    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return response.unauthorized(res, 'Senha atual incorreta');
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, authConfig.saltRounds);

    // Atualizar senha
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedNewPassword }
    });

    return response.success(res, null, 'Senha alterada com sucesso');
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Listar usuários (apenas admin)
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', active } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (active !== undefined) {
      where.active = active === 'true';
    }

    // Buscar usuários com paginação
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    };

    return response.successWithPagination(res, users, pagination, 'Usuários recuperados com sucesso');
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Ativar/desativar usuário (apenas admin)
 */
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se é o próprio usuário tentando se desativar
    if (id === req.userId) {
      return response.badRequest(res, 'Não é possível alterar o status do próprio usuário');
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, active: true, name: true, email: true }
    });

    if (!user) {
      return response.notFound(res, 'Usuário não encontrado');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { active: !user.active },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const action = updatedUser.active ? 'ativado' : 'desativado';
    return response.success(res, updatedUser, `Usuário ${action} com sucesso`);
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  toggleUserStatus
};