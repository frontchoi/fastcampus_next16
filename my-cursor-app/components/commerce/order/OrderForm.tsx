"use client";

import {
  useCallback,
  useEffect,
  useId,
  useState,
  type FormEvent,
} from "react";
import { ordersStore } from "@/lib/storage/orders";
import type {
  CreateOrderErrorResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  OrderContact,
  OrderShipping,
} from "@/types/order";
import type { Product } from "@/types/product";

export interface OrderFormProps {
  product: Product;
  quantity: number;
  unitPrice: number;
  isOpen: boolean;
  onClose: () => void;
}

interface OrderFormValues {
  contact: OrderContact;
  shipping: Omit<OrderShipping, "addressDetail"> & {
    addressDetail: string;
  };
}

const initialValues: OrderFormValues = {
  contact: {
    name: "",
    phone: "",
    email: "",
  },
  shipping: {
    recipientName: "",
    phone: "",
    address: "",
    addressDetail: "",
  },
};

function isCreateOrderErrorResponse(
  value: unknown,
): value is CreateOrderErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  );
}

function isCreateOrderResponse(value: unknown): value is CreateOrderResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "order" in value &&
    typeof value.order === "object" &&
    value.order !== null
  );
}

function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

/**
 * 주문 폼 모달 컴포넌트.
 *
 * @example
 * ```tsx
 * <OrderForm
 *   product={product}
 *   quantity={1}
 *   unitPrice={199}
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 * />
 * ```
 */
export default function OrderForm({
  product,
  quantity,
  unitPrice,
  isOpen,
  onClose,
}: OrderFormProps) {
  const titleId = useId();
  const totalPrice = Number((unitPrice * quantity).toFixed(2));
  const [values, setValues] = useState<OrderFormValues>(initialValues);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setValues(initialValues);
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(false);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const updateContact = useCallback(
    (field: keyof OrderContact, value: string) => {
      setValues((current) => ({
        ...current,
        contact: { ...current.contact, [field]: value },
      }));
    },
    [],
  );

  const updateShipping = useCallback(
    (field: keyof OrderFormValues["shipping"], value: string) => {
      setValues((current) => ({
        ...current,
        shipping: { ...current.shipping, [field]: value },
      }));
    },
    [],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const requestBody: CreateOrderRequest = {
        contact: values.contact,
        shipping: {
          ...values.shipping,
          addressDetail: values.shipping.addressDetail.trim() || null,
        },
        item: {
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice,
          totalPrice,
          imageUrl: product.image_url,
        },
      };

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result: unknown = await response.json();

      if (!response.ok) {
        setErrorMessage(
          isCreateOrderErrorResponse(result)
            ? result.error
            : "주문에 실패했습니다.",
        );
        return;
      }

      if (!isCreateOrderResponse(result)) {
        setErrorMessage("주문 응답 형식이 올바르지 않습니다.");
        return;
      }

      const stored = ordersStore.add(result.order);

      if (!stored.ok) {
        setSuccessMessage(
          stored.reason === "quota_exceeded"
            ? "주문은 완료되었지만 기기 저장 공간이 부족해 로컬 기록에 실패했습니다."
            : "주문은 완료되었지만 로컬 임시 저장에 실패했습니다.",
        );
        return;
      }

      setSuccessMessage("주문이 완료되었습니다.");
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div
      data-testid="order-form-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-black">
            바로 주문하기
          </h2>
          <button
            type="button"
            data-testid="order-form-close-button"
            onClick={onClose}
            aria-label="주문 모달 닫기"
            className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-black"
          >
            닫기
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5"
        >
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-black">연락처 정보</h3>
            <label className="flex flex-col gap-1 text-sm">
              <span>이름</span>
              <input
                required
                data-testid="order-form-contact-name"
                value={values.contact.name}
                onChange={(event) => updateContact("name", event.target.value)}
                className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:border-zinc-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>전화번호</span>
              <input
                required
                type="tel"
                data-testid="order-form-contact-phone"
                value={values.contact.phone}
                onChange={(event) => updateContact("phone", event.target.value)}
                placeholder="010-1234-5678"
                className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:border-zinc-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>이메일</span>
              <input
                required
                type="email"
                data-testid="order-form-contact-email"
                value={values.contact.email}
                onChange={(event) => updateContact("email", event.target.value)}
                className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:border-zinc-400"
              />
            </label>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-black">배송지 정보</h3>
            <label className="flex flex-col gap-1 text-sm">
              <span>수령인 이름</span>
              <input
                required
                data-testid="order-form-shipping-receiver-name"
                value={values.shipping.recipientName}
                onChange={(event) =>
                  updateShipping("recipientName", event.target.value)
                }
                className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:border-zinc-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>전화번호</span>
              <input
                required
                type="tel"
                data-testid="order-form-shipping-receiver-phone"
                value={values.shipping.phone}
                onChange={(event) =>
                  updateShipping("phone", event.target.value)
                }
                placeholder="010-1234-5678"
                className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:border-zinc-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>주소</span>
              <input
                required
                data-testid="order-form-shipping-address1"
                value={values.shipping.address}
                onChange={(event) =>
                  updateShipping("address", event.target.value)
                }
                className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:border-zinc-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>상세 주소</span>
              <input
                required
                data-testid="order-form-shipping-address2"
                value={values.shipping.addressDetail}
                onChange={(event) =>
                  updateShipping("addressDetail", event.target.value)
                }
                className="h-10 rounded-md border border-zinc-200 px-3 outline-none focus:border-zinc-400"
              />
            </label>
          </section>

          <section
            data-testid="order-form-summary"
            className="rounded-lg bg-zinc-50 p-4 text-sm"
          >
            <h3 className="mb-3 font-semibold text-black">주문 요약</h3>
            <dl className="flex flex-col gap-2">
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">상품명</dt>
                <dd
                  data-testid="order-form-summary-product-name"
                  className="text-right font-medium"
                >
                  {product.name}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">수량</dt>
                <dd
                  data-testid="order-form-summary-quantity"
                  className="font-medium"
                >
                  {quantity}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">단가</dt>
                <dd
                  data-testid="order-form-summary-unit-price"
                  className="font-medium"
                >
                  {formatPrice(unitPrice)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-zinc-200 pt-2">
                <dt className="font-semibold">총 금액</dt>
                <dd
                  data-testid="order-form-summary-total-price"
                  className="font-semibold"
                >
                  {formatPrice(totalPrice)}
                </dd>
              </div>
            </dl>
          </section>

          {errorMessage && (
            <p
              data-testid="order-form-error"
              role="alert"
              className="text-sm text-red-600"
            >
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p
              data-testid="order-form-success"
              role="status"
              className="text-sm text-emerald-600"
            >
              {successMessage}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              data-testid="order-form-cancel-button"
              onClick={onClose}
              className="h-11 flex-1 rounded-lg border border-zinc-200 text-sm font-medium text-black transition-colors hover:bg-zinc-50"
            >
              취소
            </button>
            <button
              type="submit"
              data-testid="order-form-submit-button"
              disabled={isSubmitting || Boolean(successMessage)}
              className="h-11 flex-1 rounded-lg bg-black text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {isSubmitting ? "주문 처리 중..." : "주문 제출"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
