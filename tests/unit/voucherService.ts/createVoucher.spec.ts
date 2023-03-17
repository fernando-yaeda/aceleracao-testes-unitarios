import voucherRepository from "repositories/voucherRepository";
import voucherService from "services/voucherService";
import { faker } from "@faker-js/faker";

describe("createVoucher test suite", () => {
  it("should throw conflict error if voucher code is already in use", async () => {
    const voucher = {
      code: faker.random.alphaNumeric(8),
      discount: faker.datatype.number({ min: 1, max: 100 }),
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: voucher.code,
          dicount: 5,
          used: false,
        };
      });

    expect(
      voucherService.createVoucher(voucher.code, voucher.discount)
    ).rejects.toMatchObject({
      type: "conflict",
      message: "Voucher already exist.",
    });
  });

  it("should not throw error if voucher code was not used", async () => {
    const voucher = {
      code: faker.random.alphaNumeric(8),
      discount: faker.datatype.number({ min: 1, max: 100 }),
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return null;
      });

    jest
      .spyOn(voucherRepository, "createVoucher")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: voucher.code,
          discount: voucher.discount,
          used: false,
        };
      });

    expect(
      voucherService.createVoucher(voucher.code, voucher.discount)
    ).resolves.not.toThrow();
  });

  const voucherCodeDataSet = [faker.random.alpha(8), faker.random.numeric(8)];
  it.each(voucherCodeDataSet)(
    "should throw an error if voucher code is not an alphanumeric string",
    async (voucherCode) => {
      const voucher = {
        code: voucherCode,
        discount: faker.datatype.number({ min: 1, max: 100 }),
      };

      expect(
        voucherService.createVoucher(voucher.code, voucher.discount)
      ).rejects.toThrow();
    }
  );

  const voucherDiscountDataSet = [0, 101];
  it.each(voucherDiscountDataSet)(
    "should throw an error if 1 > voucher discount value > 100",
    async (voucherDiscount) => {
      const voucher = {
        code: faker.random.alphaNumeric(8),
        discount: voucherDiscount,
      };

      expect(
        voucherService.createVoucher(voucher.code, voucher.discount)
      ).rejects.toThrow();
    }
  );
});
