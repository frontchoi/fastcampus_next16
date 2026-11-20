import { NextResponse } from "next/server";
import type {
  CreateOrderErrorResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  OrderData,
  OrderItem,
  OrderShipping,
} from "@/types/order";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string): boolean {
  return /^[0-9+\-\s()]{8,20}$/.test(value);
}

function parseOptionalString(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function validateCreateOrderRequest(
  body: unknown,
):
  | { ok: true; data: CreateOrderRequest }
  | { ok: false; message: string; code: CreateOrderErrorResponse["code"] } {
  if (typeof body !== "object" || body === null) {
    return {
      ok: false,
      message: "요청 본문이 올바르지 않습니다.",
      code: "INVALID_PAYLOAD",
    };
  }

  const payload = body as Record<string, unknown>;
  const contact = payload.contact as Record<string, unknown> | undefined;
  const shipping = payload.shipping as Record<string, unknown> | undefined;
  const item = payload.item as Record<string, unknown> | undefined;

  if (!contact || !shipping || !item) {
    return {
      ok: false,
      message: "연락처, 배송지, 주문 상품 정보가 필요합니다.",
      code: "VALIDATION_ERROR",
    };
  }

  if (
    !isNonEmptyString(contact.name) ||
    !isNonEmptyString(contact.phone) ||
    !isNonEmptyString(contact.email)
  ) {
    return {
      ok: false,
      message: "연락처 정보를 모두 입력해 주세요.",
      code: "VALIDATION_ERROR",
    };
  }

  if (!isValidEmail(contact.email)) {
    return {
      ok: false,
      message: "이메일 형식이 올바르지 않습니다.",
      code: "VALIDATION_ERROR",
    };
  }

  if (!isValidPhone(contact.phone)) {
    return {
      ok: false,
      message: "연락처 전화번호 형식이 올바르지 않습니다.",
      code: "VALIDATION_ERROR",
    };
  }

  if (
    !isNonEmptyString(shipping.recipientName) ||
    !isNonEmptyString(shipping.phone) ||
    !isNonEmptyString(shipping.address)
  ) {
    return {
      ok: false,
      message: "배송지 정보를 모두 입력해 주세요.",
      code: "VALIDATION_ERROR",
    };
  }

  if (!isValidPhone(shipping.phone)) {
    return {
      ok: false,
      message: "배송지 전화번호 형식이 올바르지 않습니다.",
      code: "VALIDATION_ERROR",
    };
  }

  if (
    !isNonEmptyString(item.productId) ||
    !isNonEmptyString(item.productName) ||
    typeof item.quantity !== "number" ||
    typeof item.unitPrice !== "number" ||
    typeof item.totalPrice !== "number"
  ) {
    return {
      ok: false,
      message: "주문 상품 정보가 올바르지 않습니다.",
      code: "VALIDATION_ERROR",
    };
  }

  if (!Number.isInteger(item.quantity) || item.quantity < 1) {
    return {
      ok: false,
      message: "수량은 1 이상의 정수여야 합니다.",
      code: "VALIDATION_ERROR",
    };
  }

  if (item.unitPrice <= 0 || item.totalPrice <= 0) {
    return {
      ok: false,
      message: "가격 정보가 올바르지 않습니다.",
      code: "VALIDATION_ERROR",
    };
  }

  const expectedTotal = Number((item.unitPrice * item.quantity).toFixed(2));
  if (Math.abs(expectedTotal - item.totalPrice) > 0.01) {
    return {
      ok: false,
      message: "총 금액이 올바르지 않습니다.",
      code: "VALIDATION_ERROR",
    };
  }

  const shippingData: OrderShipping = {
    recipientName: shipping.recipientName.trim(),
    phone: shipping.phone.trim(),
    address: shipping.address.trim(),
    addressDetail: parseNullableString(shipping.addressDetail),
  };

  const shippingMemo = parseOptionalString(shipping.memo);
  if (shippingMemo !== undefined) {
    shippingData.memo = shippingMemo;
  }

  const orderItem: OrderItem = {
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
    imageUrl: parseNullableString(item.imageUrl),
  };

  const requestData: CreateOrderRequest = {
    contact: {
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      email: contact.email.trim(),
    },
    shipping: shippingData,
    item: orderItem,
  };

  const note = parseOptionalString(payload.note);
  if (note !== undefined) {
    requestData.note = note;
  }

  return {
    ok: true,
    data: requestData,
  };
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const validated = validateCreateOrderRequest(body);

    if (!validated.ok) {
      console.error("[orders/create] 실패", {
        code: validated.code,
        error: validated.message,
      });

      const errorBody: CreateOrderErrorResponse = {
        error: validated.message,
        code: validated.code,
      };
      return NextResponse.json(errorBody, { status: 400 });
    }

    const now = new Date().toISOString();
    const order: OrderData = {
      id: crypto.randomUUID(),
      status: "pending",
      contact: validated.data.contact,
      shipping: validated.data.shipping,
      item: validated.data.item,
      createdAt: now,
      updatedAt: null,
      cancelledAt: null,
      note: validated.data.note ?? null,
    };

    console.info("[orders/create] 생성", {
      orderId: order.id,
      productId: order.item.productId,
      quantity: order.item.quantity,
      totalPrice: order.item.totalPrice,
      status: order.status,
    });

    const responseBody: CreateOrderResponse = { order };
    return NextResponse.json(responseBody, { status: 201 });
  } catch (error) {
    console.error("[orders/create] 실패", {
      code: "INTERNAL_ERROR",
      error: error instanceof Error ? error.message : "unknown",
    });

    const errorBody: CreateOrderErrorResponse = {
      error: "주문 처리 중 오류가 발생했습니다.",
      code: "INTERNAL_ERROR",
    };
    return NextResponse.json(errorBody, { status: 500 });
  }
}
