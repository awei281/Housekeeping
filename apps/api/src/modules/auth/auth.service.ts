import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";

export interface AuthenticatedAdmin {
  id: number;
  username: string;
  roleCode: string;
}

interface JwtPayload {
  sub: number;
  username: string;
  roleCode: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto) {
    const user = this.validateUser(dto.username, dto.password);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      roleCode: user.roleCode,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user,
    };
  }

  getProfile(user: AuthenticatedAdmin) {
    return user;
  }

  private validateUser(
    username: string,
    password: string,
  ): AuthenticatedAdmin | null {
    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (username !== expectedUsername || password !== expectedPassword) {
      return null;
    }

    return {
      id: 1,
      username: expectedUsername,
      roleCode: "super_admin",
    };
  }
}
