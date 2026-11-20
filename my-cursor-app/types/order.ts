/**
 * 주문 상태
 * - pending: 주문 접수
 * - confirmed: 주문 확인
 * - shipped: 배송 중
 * - delivered: 배송 완료
 * - cancelled: 취소
 */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

/** 주문자 연락처 */
export interface OrderContact {
  name: string;
  phone: string;
  email: string;
}

/** 배송지 정보 */
export interface OrderShipping {
  recipientName: string;
  phone: string;
  address: string;
  /** 상세 주소 — 없으면 빈 문자열이 아닌 null */
  addressDetail: string | null;
  /** 배송 메모 — 요청 시 생략 가능 */
  memo?: string;
}

/** 주문 상품 라인 */
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  /** 상품 썸네일 URL — 없으면 null */
  imageUrl: string | null;
}

/**
 * 주문 생성 API 요청 바디
 * 클라이언트가 서버로 보내는 입력 데이터
 */
export interface CreateOrderRequest {
  contact: OrderContact;
  shipping: OrderShipping;
  item: OrderItem;
  /** 클라이언트에서 전달하는 추가 메모 — 생략 가능 */
  note?: string;
}

/**
 * 서버에서 생성·관리하는 주문 도메인 모델
 * 목록/상세 및 서버 도메인에서 재사용.
 * 브라우저 임시 저장은 lib/storage/orders의 OrderLocalSnapshot을 사용한다.
 */
export interface OrderData {
  id: string;
  status: OrderStatus;
  contact: OrderContact;
  shipping: OrderShipping;
  item: OrderItem;
  /** 주문 생성 시각 (ISO 8601) */
  createdAt: string;
  /** 마지막 수정 시각 — 수정 전이면 null */
  updatedAt: string | null;
  /** 취소 시각 — 취소되지 않았으면 null */
  cancelledAt: string | null;
  /** 요청 시 전달된 메모 — 없으면 null */
  note: string | null;
}

/** 주문 생성 성공 응답 */
export interface CreateOrderResponse {
  order: OrderData;
}

/** 주문 생성 실패 응답 */
export interface CreateOrderErrorResponse {
  error: string;
  /** 에러 코드 — 클라이언트 분기용, 없으면 생략 */
  code?: "VALIDATION_ERROR" | "INTERNAL_ERROR" | "INVALID_PAYLOAD";
}

/** @deprecated OrderData를 사용하세요 */
export type Order = OrderData;
