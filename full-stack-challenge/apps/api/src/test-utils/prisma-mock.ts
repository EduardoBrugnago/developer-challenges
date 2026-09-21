import { mockDeep } from "jest-mock-extended";
import { PrismaService } from "../prisma/prisma.service";


type MockedDelegate<T> = T extends (...args: never[]) => unknown
  ? jest.Mock
  : { [K in keyof T]: jest.Mock };

export type PrismaMock = {
  [K in keyof PrismaService]: MockedDelegate<PrismaService[K]>;
};

export const createPrismaMock = (): PrismaMock =>
  mockDeep<PrismaService>() as unknown as PrismaMock;

export const prismaMockProvider = (mock: PrismaMock) => ({
  provide: PrismaService,
  useValue: mock,
});
