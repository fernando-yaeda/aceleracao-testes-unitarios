import voucherRepository from "repositories/voucherRepository";
import voucherService from "services/voucherService";
import { faker } from "@faker-js/faker";

const MIN_VALUE_FOR_DISCOUNT = 100

describe("applyVoucher test suite", () => {
  it("should throw conflict error if voucher code does not exist", async () => {
    const voucherApplyData = {
      code: faker.random.alphaNumeric(8),
      amount: MIN_VALUE_FOR_DISCOUNT + 1,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return null;
      });

    expect(
      voucherService.applyVoucher(
        voucherApplyData.code,
        voucherApplyData.amount
      )
    ).rejects.toMatchObject({
      type: "conflict",
      message: "Voucher does not exist.",
    });
  });

  it("should not apply discount if amount is below min value for discount", async () => {
    const applyData = {
      code: faker.random.alphaNumeric(8),
      amount: MIN_VALUE_FOR_DISCOUNT - 1,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: applyData.code,
          discount: faker.datatype.number({ min: 1, max: 100 }),
          used: false,
        };
      });

    const applyResult = await voucherService.applyVoucher(
      applyData.code,
      applyData.amount
    );

    expect(applyResult.amount).toStrictEqual(applyData.amount);
    expect(applyResult.finalAmount).toStrictEqual(applyData.amount);
    expect(applyResult.applied).toStrictEqual(false);
  });

  it("should not apply discount if voucher was already used", async () => {
    const applyData = {
      code: faker.random.alphaNumeric(8),
      amount: MIN_VALUE_FOR_DISCOUNT + 1,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: applyData.code,
          discount: faker.datatype.number({ min: 1, max: 100 }),
          used: true,
        };
      });

    const applyResult = await voucherService.applyVoucher(
      applyData.code,
      applyData.amount
    );

    expect(applyResult.amount).toStrictEqual(applyData.amount);
    expect(applyResult.finalAmount).toStrictEqual(applyData.amount);
    expect(applyResult.applied).toStrictEqual(false);
  });

  it("should apply discount given an unused voucher and amount eligible for discount", async () => {
    const applyData = {
      code: faker.random.alphaNumeric(8),
      amount: MIN_VALUE_FOR_DISCOUNT + 1,
    };
    const discount = faker.datatype.number({ min: 1, max: 100 });
    const expectedFinalAmount = applyData.amount - applyData.amount * (discount / 100);

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: applyData.code,
          discount: discount,
          used: false,
        };
      });

    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: applyData.code,
          discount: discount,
          used: true,
        };
      });

    const applyResult = await voucherService.applyVoucher(
      applyData.code,
      applyData.amount
    );

    expect(applyResult.amount).toStrictEqual(applyData.amount);
    expect(applyResult.discount).toStrictEqual(discount);
    expect(applyResult.finalAmount).toStrictEqual(expectedFinalAmount);
    expect(applyResult.applied).toStrictEqual(true);
  });
});
