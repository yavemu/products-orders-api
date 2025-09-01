import { Types } from 'mongoose';
import { User } from '../../../users/schemas/user.schema';
import { UserRole } from '../../../users/enums/user-role.enum';

export class UserFactory {
  static create(overrides?: Partial<User>): User {
    const randomId = Math.random().toString(36).substr(2, 9);
    const user = {
      _id: new Types.ObjectId(),
      email: `user${randomId}@example.com`,
      password: 'password123',
      firstName: `FirstName${randomId}`,
      lastName: `LastName${randomId}`,
      role: [UserRole.ADMIN, UserRole.CLIENT][Math.floor(Math.random() * 2)],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as User;

    return user;
  }

  static createMany(count: number, overrides?: Partial<User>): User[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createAdmin(overrides?: Partial<User>): User {
    return this.create({
      role: UserRole.ADMIN,
      ...overrides,
    });
  }

  static createClient(overrides?: Partial<User>): User {
    return this.create({
      role: UserRole.CLIENT,
      ...overrides,
    });
  }

  static createDto(overrides?: any) {
    const randomId = Math.random().toString(36).substr(2, 9);
    return {
      email: `user${randomId}@example.com`,
      password: 'password123',
      firstName: `FirstName${randomId}`,
      lastName: `LastName${randomId}`,
      ...overrides,
    };
  }

  static createResponseDto(overrides?: any) {
    const baseUser = this.create(overrides);
    return {
      _id: baseUser._id.toString(),
      email: baseUser.email,
      firstName: baseUser.firstName,
      lastName: baseUser.lastName,
      role: baseUser.role,
      fullName: `${baseUser.firstName} ${baseUser.lastName}`,
      createdAt: baseUser.createdAt,
      updatedAt: baseUser.updatedAt,
    };
  }

  static createResponseDtoList(count: number, overrides?: any) {
    return Array.from({ length: count }, () => this.createResponseDto(overrides));
  }

  static createList(count: number, overrides?: Partial<User>): User[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}