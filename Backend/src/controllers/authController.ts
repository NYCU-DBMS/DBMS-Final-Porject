import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// 定義請求體的接口
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest extends LoginRequest {
  username: string;
}

interface ChangePasswordRequest {
  password: string;
  new_password: string;
}

export const authController = {
  login: async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({ message: '帳號或密碼不存在' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: '帳號或密碼不存在' });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  register: async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    try {
      const { email, password, username } = req.body;
      const existingEmail = await prisma.user.findFirst({
        where: { email }
      });

      const existingUser = await prisma.user.findFirst({
        where: { username }
      });

      if (existingEmail) {
        return res.status(400).json({
          message: 'Email已被註冊'
        });
      }

      if (existingUser) {
        return res.status(400).json({
          message: '用戶名已存在'
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
        }
      });

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'User created successfully',
        user,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getProfile: async (req: Request & { user?: { userId: string } }, res: Response) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  changePassword: async (req: Request & { user?: { userId: string } }, res: Response) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const { password, new_password } = req.body as ChangePasswordRequest;
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId }
      });

      if (!user) {
        return res.status(404).json({ message: '用戶不存在！' });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(400).json({ message: '當前密碼不正確！' });
      }

      if (password==new_password) {
        return res.status(400).json({ message: '新舊密碼一致！' });
      }
      const hashedNewPassword = await bcrypt.hash(new_password, 10);

      await prisma.user.update({
        where: { id: req.user.userId },
        data: { password: hashedNewPassword }
      });

      res.json({ message: '密碼修改成功' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};