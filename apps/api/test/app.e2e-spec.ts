import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/common/prisma/prisma.service";

describe("Admin auth (e2e)", () => {
  let app: INestApplication;
  const createLeadMock = jest.fn();
  const findLeadsMock = jest.fn();
  const findLeadMock = jest.fn();
  const updateLeadMock = jest.fn();
  const createCustomerMock = jest.fn();
  const findCustomersMock = jest.fn();
  const findCustomerMock = jest.fn();
  const createEmployeeMock = jest.fn();
  const findEmployeesMock = jest.fn();
  const findEmployeeMock = jest.fn();
  const updateEmployeeMock = jest.fn();
  const createOrderMock = jest.fn();
  const findOrdersMock = jest.fn();
  const findOrderMock = jest.fn();
  const updateOrderMock = jest.fn();

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
        lead: {
          create: createLeadMock,
          findMany: findLeadsMock,
          findUnique: findLeadMock,
          update: updateLeadMock,
        },
        customer: {
          create: createCustomerMock,
          findMany: findCustomersMock,
          findUnique: findCustomerMock,
        },
        employee: {
          create: createEmployeeMock,
          findMany: findEmployeesMock,
          findUnique: findEmployeeMock,
          update: updateEmployeeMock,
        },
        order: {
          create: createOrderMock,
          findMany: findOrdersMock,
          findUnique: findOrderMock,
          update: updateOrderMock,
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    createLeadMock.mockReset();
    findLeadsMock.mockReset();
    findLeadMock.mockReset();
    updateLeadMock.mockReset();
    createCustomerMock.mockReset();
    findCustomersMock.mockReset();
    findCustomerMock.mockReset();
    createEmployeeMock.mockReset();
    findEmployeesMock.mockReset();
    findEmployeeMock.mockReset();
    updateEmployeeMock.mockReset();
    createOrderMock.mockReset();
    findOrdersMock.mockReset();
    findOrderMock.mockReset();
    updateOrderMock.mockReset();
  });

  async function loginAsAdmin() {
    const response = await request(app.getHttpServer())
      .post("/api/admin/auth/login")
      .send({
        username: "admin",
        password: "admin123",
      })
      .expect(200);

    return response.body.accessToken as string;
  }

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

  it("returns public home page content", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/public/pages/home")
      .expect(200);

    expect(response.body).toMatchObject({
      pageKey: "home",
      title: expect.any(String),
      lead: expect.any(String),
      hero: {
        title: expect.any(String),
        subtitle: expect.any(String),
        ctaLabel: expect.any(String),
        ctaHref: "/contact",
      },
    });
    expect(response.body.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: expect.any(String),
          body: expect.any(String),
        }),
      ]),
    );
  });

  it("returns 404 for an unknown public page", async () => {
    await request(app.getHttpServer()).get("/api/public/pages/missing").expect(404);
  });

  it("returns the authenticated leads list", async () => {
    findLeadsMock.mockResolvedValue([
      {
        id: 21,
        source: "website",
        contactName: "王阿姨",
        phone: "13700000000",
        serviceType: "cleaning",
        expectedTime: null,
        address: "徐汇区示例路 1 号",
        remark: "周末可联系",
        status: "new",
        ownerId: null,
        createdAt: new Date("2026-04-18T09:00:00.000Z"),
        updatedAt: new Date("2026-04-18T09:00:00.000Z"),
      },
    ]);

    const accessToken = await loginAsAdmin();

    const response = await request(app.getHttpServer())
      .get("/api/admin/leads")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(findLeadsMock).toHaveBeenCalledWith({
      orderBy: {
        createdAt: "desc",
      },
    });
    expect(response.body).toEqual([
      expect.objectContaining({
        id: 21,
        contactName: "王阿姨",
        serviceType: "cleaning",
        status: "new",
      }),
    ]);
  });

  it("converts an authenticated lead into a customer", async () => {
    findLeadMock.mockResolvedValue({
      id: 22,
      source: "website",
      contactName: "赵女士",
      phone: "13600000000",
      serviceType: "yuesao",
      expectedTime: null,
      address: "杨浦区示例路 18 号",
      remark: "孕晚期预约",
      status: "following",
      ownerId: null,
      createdAt: new Date("2026-04-18T09:30:00.000Z"),
      updatedAt: new Date("2026-04-18T09:30:00.000Z"),
    });
    createCustomerMock.mockResolvedValue({
      id: 9,
      name: "赵女士",
      phone: "13600000000",
      level: "normal",
      source: "website",
      tags: "",
      remark: "孕晚期预约",
      createdAt: new Date("2026-04-18T09:40:00.000Z"),
      updatedAt: new Date("2026-04-18T09:40:00.000Z"),
    });

    const accessToken = await loginAsAdmin();

    const response = await request(app.getHttpServer())
      .post("/api/admin/leads/22/convert-customer")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(201);

    expect(findLeadMock).toHaveBeenCalledWith({
      where: {
        id: 22,
      },
    });
    expect(createCustomerMock).toHaveBeenCalledWith({
      data: {
        name: "赵女士",
        phone: "13600000000",
        source: "website",
        remark: "孕晚期预约",
      },
    });
    expect(response.body).toMatchObject({
      id: 9,
      name: "赵女士",
      phone: "13600000000",
      source: "website",
    });
  });

  it("returns the authenticated customers list", async () => {
    findCustomersMock.mockResolvedValue([
      {
        id: 9,
        name: "赵女士",
        phone: "13600000000",
        level: "normal",
        source: "website",
        tags: "",
        remark: "孕晚期预约",
        createdAt: new Date("2026-04-18T09:40:00.000Z"),
        updatedAt: new Date("2026-04-18T09:40:00.000Z"),
      },
    ]);

    const accessToken = await loginAsAdmin();

    const response = await request(app.getHttpServer())
      .get("/api/admin/customers")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(findCustomersMock).toHaveBeenCalledWith({
      orderBy: {
        createdAt: "desc",
      },
    });
    expect(response.body).toEqual([
      expect.objectContaining({
        id: 9,
        name: "赵女士",
        phone: "13600000000",
      }),
    ]);
  });

  it("returns the authenticated employees list", async () => {
    findEmployeesMock.mockResolvedValue([
      {
        id: 7,
        name: "李师傅",
        phone: "13500000000",
        roleType: "cleaner",
        skillTags: "cleaning,deep-clean",
        certificateNo: "CERT-001",
        healthCertExpireAt: new Date("2026-12-31T00:00:00.000Z"),
        status: "available",
        createdAt: new Date("2026-04-18T11:00:00.000Z"),
        updatedAt: new Date("2026-04-18T11:00:00.000Z"),
      },
    ]);

    const accessToken = await loginAsAdmin();

    const response = await request(app.getHttpServer())
      .get("/api/admin/employees")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(findEmployeesMock).toHaveBeenCalledWith({
      orderBy: {
        createdAt: "desc",
      },
    });
    expect(response.body).toEqual([
      expect.objectContaining({
        id: 7,
        name: "李师傅",
        roleType: "cleaner",
        status: "available",
      }),
    ]);
  });

  it("creates an authenticated employee", async () => {
    createEmployeeMock.mockImplementation(async ({ data }) => ({
      id: 7,
      name: data.name,
      phone: data.phone,
      roleType: data.roleType,
      skillTags: data.skillTags ?? null,
      certificateNo: data.certificateNo ?? null,
      healthCertExpireAt: data.healthCertExpireAt ?? null,
      status: data.status ?? "available",
      createdAt: new Date("2026-04-18T11:05:00.000Z"),
      updatedAt: new Date("2026-04-18T11:05:00.000Z"),
    }));

    const accessToken = await loginAsAdmin();

    const response = await request(app.getHttpServer())
      .post("/api/admin/employees")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "李师傅",
        phone: "13500000000",
        roleType: "cleaner",
        skillTags: "cleaning,deep-clean",
        certificateNo: "CERT-001",
        healthCertExpireAt: "2026-12-31T00:00:00.000Z",
      })
      .expect(201);

    expect(createEmployeeMock).toHaveBeenCalledWith({
      data: {
        name: "李师傅",
        phone: "13500000000",
        roleType: "cleaner",
        skillTags: "cleaning,deep-clean",
        certificateNo: "CERT-001",
        healthCertExpireAt: new Date("2026-12-31T00:00:00.000Z"),
      },
    });
    expect(response.body).toMatchObject({
      id: 7,
      name: "李师傅",
      phone: "13500000000",
      roleType: "cleaner",
      status: "available",
    });
  });

  it("updates an authenticated employee", async () => {
    updateEmployeeMock.mockImplementation(async ({ where, data }) => ({
      id: where.id,
      name: "李师傅",
      phone: "13500000000",
      roleType: "cleaner",
      skillTags: data.skillTags ?? "cleaning,deep-clean",
      certificateNo: "CERT-001",
      healthCertExpireAt: data.healthCertExpireAt ?? new Date("2026-12-31T00:00:00.000Z"),
      status: data.status ?? "available",
      createdAt: new Date("2026-04-18T11:05:00.000Z"),
      updatedAt: new Date("2026-04-18T11:10:00.000Z"),
    }));

    const accessToken = await loginAsAdmin();

    const response = await request(app.getHttpServer())
      .patch("/api/admin/employees/7")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        skillTags: "cleaning,babycare",
        status: "busy",
      })
      .expect(200);

    expect(updateEmployeeMock).toHaveBeenCalledWith({
      where: {
        id: 7,
      },
      data: {
        skillTags: "cleaning,babycare",
        status: "busy",
      },
    });
    expect(response.body).toMatchObject({
      id: 7,
      skillTags: "cleaning,babycare",
      status: "busy",
    });
  });

  it("creates an authenticated order for a customer", async () => {
    createOrderMock.mockImplementation(async ({ data }) => ({
      id: 31,
      orderNo: data.orderNo,
      customerId: data.customerId,
      leadId: data.leadId,
      serviceItemName: data.serviceItemName,
      serviceType: data.serviceType,
      serviceDate: data.serviceDate,
      amount: data.amount,
      status: "pending_confirm",
      paymentStatus: "unpaid",
      assignedEmployeeId: data.assignedEmployeeId ?? null,
      createdAt: new Date("2026-04-18T10:00:00.000Z"),
      updatedAt: new Date("2026-04-18T10:00:00.000Z"),
    }));
    updateLeadMock.mockResolvedValue({
      id: 22,
      status: "converted",
    });

    const accessToken = await loginAsAdmin();

    const response = await request(app.getHttpServer())
      .post("/api/admin/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        customerId: 9,
        leadId: 22,
        serviceType: "cleaning",
        serviceItemName: "日常保洁",
        serviceDate: "2026-04-20T09:00:00.000Z",
        amount: 298,
      })
      .expect(201);

    expect(createOrderMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderNo: expect.any(String),
        customerId: 9,
        leadId: 22,
        serviceType: "cleaning",
        serviceItemName: "日常保洁",
        serviceDate: new Date("2026-04-20T09:00:00.000Z"),
        amount: 298,
      }),
    });
    expect(updateLeadMock).toHaveBeenCalledWith({
      where: {
        id: 22,
      },
      data: {
        status: "converted",
      },
    });
    expect(response.body).toMatchObject({
      id: 31,
      customerId: 9,
      leadId: 22,
      serviceType: "cleaning",
      serviceItemName: "日常保洁",
      status: "pending_confirm",
      paymentStatus: "unpaid",
    });
    expect(response.body.orderNo).toEqual(expect.any(String));
  });

  it("returns the authenticated orders list", async () => {
    findOrdersMock.mockResolvedValue([
      {
        id: 31,
        orderNo: "HK202604180001",
        customerId: 9,
        leadId: 22,
        serviceItemName: "日常保洁",
        serviceType: "cleaning",
        serviceDate: new Date("2026-04-20T09:00:00.000Z"),
        amount: 298,
        status: "pending_confirm",
        paymentStatus: "unpaid",
        assignedEmployeeId: null,
        createdAt: new Date("2026-04-18T10:00:00.000Z"),
        updatedAt: new Date("2026-04-18T10:00:00.000Z"),
      },
    ]);
    findCustomersMock.mockResolvedValue([
      {
        id: 9,
        name: "赵女士",
        phone: "13600000000",
        level: "normal",
        source: "website",
        tags: "",
        remark: "孕晚期预约",
        createdAt: new Date("2026-04-18T09:40:00.000Z"),
        updatedAt: new Date("2026-04-18T09:40:00.000Z"),
      },
    ]);

    const accessToken = await loginAsAdmin();

    const response = await request(app.getHttpServer())
      .get("/api/admin/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(findOrdersMock).toHaveBeenCalledWith({
      orderBy: {
        createdAt: "desc",
      },
    });
    expect(findCustomersMock).toHaveBeenCalledWith({
      where: {
        id: {
          in: [9],
        },
      },
    });
    expect(response.body).toEqual([
      expect.objectContaining({
        id: 31,
        orderNo: "HK202604180001",
        customerName: "赵女士",
        serviceType: "cleaning",
      }),
    ]);
  });

  it("returns the authenticated order detail with customer fields", async () => {
    findOrderMock.mockResolvedValue({
      id: 31,
      orderNo: "HK202604180001",
      customerId: 9,
      leadId: 22,
      serviceItemName: "日常保洁",
      serviceType: "cleaning",
      serviceDate: new Date("2026-04-20T09:00:00.000Z"),
      amount: 298,
      status: "pending_confirm",
      paymentStatus: "unpaid",
      assignedEmployeeId: null,
      createdAt: new Date("2026-04-18T10:00:00.000Z"),
      updatedAt: new Date("2026-04-18T10:00:00.000Z"),
    });
    findCustomerMock.mockResolvedValue({
      id: 9,
      name: "赵女士",
      phone: "13600000000",
      level: "normal",
      source: "website",
      tags: "",
      remark: "孕晚期预约",
      createdAt: new Date("2026-04-18T09:40:00.000Z"),
      updatedAt: new Date("2026-04-18T09:40:00.000Z"),
    });

    const accessToken = await loginAsAdmin();

    const response = await request(app.getHttpServer())
      .get("/api/admin/orders/31")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(findOrderMock).toHaveBeenCalledWith({
      where: {
        id: 31,
      },
    });
    expect(findCustomerMock).toHaveBeenCalledWith({
      where: {
        id: 9,
      },
    });
    expect(response.body).toMatchObject({
      id: 31,
      orderNo: "HK202604180001",
      customerName: "赵女士",
      customerPhone: "13600000000",
      serviceType: "cleaning",
      serviceItemName: "日常保洁",
      status: "pending_confirm",
    });
  });

  it("assigns an authenticated employee to an order", async () => {
    updateOrderMock.mockImplementation(async ({ where, data }) => ({
      id: where.id,
      orderNo: "HK202604180001",
      customerId: 9,
      leadId: 22,
      serviceItemName: "日常保洁",
      serviceType: "cleaning",
      serviceDate: new Date("2026-04-20T09:00:00.000Z"),
      amount: 298,
      status: data.status,
      paymentStatus: "unpaid",
      assignedEmployeeId: data.assignedEmployeeId,
      createdAt: new Date("2026-04-18T10:00:00.000Z"),
      updatedAt: new Date("2026-04-18T11:20:00.000Z"),
    }));

    const accessToken = await loginAsAdmin();

    const response = await request(app.getHttpServer())
      .post("/api/admin/orders/31/assign")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        employeeId: 7,
      })
      .expect(201);

    expect(updateOrderMock).toHaveBeenCalledWith({
      where: {
        id: 31,
      },
      data: {
        assignedEmployeeId: 7,
        status: "assigned",
      },
    });
    expect(response.body).toMatchObject({
      id: 31,
      assignedEmployeeId: 7,
      status: "assigned",
    });
  });

  it("creates a public lead from a website submission", async () => {
    createLeadMock.mockResolvedValue({
      id: 11,
      source: "website",
      contactName: "张三",
      phone: "13800000000",
      serviceType: "yuesao",
      expectedTime: new Date("2026-05-01T09:00:00.000Z"),
      address: "浦东新区示例路 88 号",
      remark: "请尽快联系",
      status: "new",
      ownerId: null,
      createdAt: new Date("2026-04-18T08:00:00.000Z"),
      updatedAt: new Date("2026-04-18T08:00:00.000Z"),
    });

    const response = await request(app.getHttpServer())
      .post("/api/public/leads")
      .send({
        contactName: "张三",
        phone: "13800000000",
        serviceType: "yuesao",
        expectedTime: "2026-05-01T09:00:00.000Z",
        address: "浦东新区示例路 88 号",
        remark: "请尽快联系",
        source: "manual",
      })
      .expect(201);

    expect(createLeadMock).toHaveBeenCalledWith({
      data: {
        source: "website",
        contactName: "张三",
        phone: "13800000000",
        serviceType: "yuesao",
        expectedTime: new Date("2026-05-01T09:00:00.000Z"),
        address: "浦东新区示例路 88 号",
        remark: "请尽快联系",
      },
    });
    expect(response.body).toMatchObject({
      id: 11,
      source: "website",
      contactName: "张三",
      phone: "13800000000",
      serviceType: "yuesao",
      expectedTime: "2026-05-01T09:00:00.000Z",
      status: "new",
    });
  });

  it("stores a null expected time when the website submission leaves it blank", async () => {
    createLeadMock.mockResolvedValue({
      id: 12,
      source: "website",
      contactName: "李四",
      phone: "13900000000",
      serviceType: "cleaning",
      expectedTime: null,
      address: "",
      remark: "",
      status: "new",
      ownerId: null,
      createdAt: new Date("2026-04-18T08:30:00.000Z"),
      updatedAt: new Date("2026-04-18T08:30:00.000Z"),
    });

    const response = await request(app.getHttpServer())
      .post("/api/public/leads")
      .send({
        contactName: "李四",
        phone: "13900000000",
        serviceType: "cleaning",
        expectedTime: "",
        address: "",
        remark: "",
        source: "website",
      })
      .expect(201);

    expect(createLeadMock).toHaveBeenCalledWith({
      data: {
        source: "website",
        contactName: "李四",
        phone: "13900000000",
        serviceType: "cleaning",
        expectedTime: null,
        address: "",
        remark: "",
      },
    });
    expect(response.body).toMatchObject({
      id: 12,
      source: "website",
      expectedTime: null,
      status: "new",
    });
  });
});
