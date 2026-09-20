import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import bcrypt from "bcryptjs";
import {
  createPrismaMock,
  prismaMockProvider,
  type PrismaMock,
} from "../test-utils/prisma-mock";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: PrismaMock;
  const jwt = { signAsync: jest.fn().mockResolvedValue("signed-token") };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma = createPrismaMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        prismaMockProvider(prisma),
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  const user = async () => ({
    id: "u-1",
    email: "admin@dynamox.com",
    passwordHash: await bcrypt.hash("secret", 4),
    createdAt: new Date(),
  });

  describe("login", () => {
    it("returns a token for valid credentials", async () => {
      prisma.user.findUnique.mockResolvedValue(await user());

      await expect(
        service.login("ADMIN@dynamox.com", "secret"),
      ).resolves.toEqual({
        accessToken: "signed-token",
        user: { id: "u-1", email: "admin@dynamox.com" },
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "admin@dynamox.com" },
      });
      expect(jwt.signAsync).toHaveBeenCalledWith({
        sub: "u-1",
        email: "admin@dynamox.com",
      });
    });

    it("rejects a wrong password", async () => {
      prisma.user.findUnique.mockResolvedValue(await user());

      await expect(
        service.login("admin@dynamox.com", "wrong"),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwt.signAsync).not.toHaveBeenCalled();
    });

    it("rejects an unknown email with the same error", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login("nobody@dynamox.com", "secret"),
      ).rejects.toThrow("Invalid email or password");
    });
  });

  describe("me", () => {
    it("returns the authenticated user", async () => {
      prisma.user.findUnique.mockResolvedValue(await user());

      await expect(service.me("u-1")).resolves.toEqual({
        id: "u-1",
        email: "admin@dynamox.com",
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "u-1" },
      });
    });

    it("rejects a user that no longer exists", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.me("gone")).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
