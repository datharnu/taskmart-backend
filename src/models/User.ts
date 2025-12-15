import prisma from '../lib/prisma';
import { UserResponse, GetUserResponse } from '../types/auth';

export class UserModel {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        image: true,
        password: true,
        createdAt: true,
      },
    });
  }

  static async findById(id: string): Promise<GetUserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        image: true,
      },
    });
    return user;
  }

  static async updateProfile(
    userId: string,
    data: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      image?: string;
    }
  ): Promise<GetUserResponse> {
    const updateData: any = {};
    
    if (data.name !== undefined) {
      updateData.name = data.name.trim() || null;
    }
    if (data.email !== undefined) {
      updateData.email = data.email.trim();
    }
    if (data.phoneNumber !== undefined) {
      updateData.phoneNumber = data.phoneNumber.trim();
    }
    if (data.image !== undefined) {
      updateData.image = data.image.trim() || null;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        image: true,
      },
    });
    return user;
  }

  static async create(data: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
  }): Promise<UserResponse> {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        image: true,
        createdAt: true,
      },
    });
    return user;
  }

  static async emailExistsExcludingUser(email: string, excludeUserId: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        email,
        id: { not: excludeUserId },
      },
      select: { id: true },
    });
    return !!user;
  }

  static async emailExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }

  static async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}


