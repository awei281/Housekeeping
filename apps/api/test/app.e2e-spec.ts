import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/common/prisma/prisma.service";

describe("Admin auth (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET ??= "replace-me";
    process.env.ADMIN_USERNAME ??= "admin";
    process.env.ADMIN_PASSWORD ??= "admin123";

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns a token for the default admin credentials", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/admin/auth/login")
      .send({
        username: "admin",
        password: "admin123",
      })
      .expect(200);

    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.user).toEqual({
      id: 1,
      username: "admin",
      roleCode: "super_admin",
    });
  });

  it("rejects invalid credentials", async () => {
    await request(app.getHttpServer())
      .post("/api/admin/auth/login")
      .send({
        username: "admin",
        password: "wrong-password",
      })
      .expect(401);
  });

  it("returns the authenticated profile for a valid token", async () => {
    const loginResponse = await request(app.getHttpServer())
      .post("/api/admin/auth/login")
      .send({
        username: "admin",
        password: "admin123",
      })
      .expect(200);

    await request(app.getHttpServer())
      .get("/api/admin/auth/profile")
      .set("Authorization", `Bearer ${loginResponse.body.accessToken}`)
      .expect(200)
      .expect({
        id: 1,
        username: "admin",
        roleCode: "super_admin",
      });
  });
});
