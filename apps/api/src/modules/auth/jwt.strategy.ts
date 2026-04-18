import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthenticatedAdmin } from "./auth.service";

interface JwtPayload {
  sub: number;
  username: string;
  roleCode: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "replace-me",
    });
  }

  validate(payload: JwtPayload): AuthenticatedAdmin {
    return {
      id: payload.sub,
      username: payload.username,
      roleCode: payload.roleCode,
    };
  }
}
