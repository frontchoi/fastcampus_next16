import type { OrderData, OrderStatus } from "@/types/order";

/**
 * localStorage는 ‘임시 저장소’로만 사용한다.
 * - 서버 DB 전환 시 이 모듈의 OrdersStore 구현만 교체하면
 *   호출부(OrderForm 등) 변경을 최소화할 수 있다.
 */

const STORAGE_KEY = "commerce.orders.v1";

/** 브라우저 용량·동기 I/O 부담을 줄이기 위한 최대 보관 건수 */
const MAX_ORDERS = 20;

/**
 * 자동 만료(TTL). localStorage는 서버처럼 접근 제어가 없으므로
 * 오래된 PII/주문 흔적을 오래 남기지 않기 위해 짧게 유지한다.
 */
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7일

/**
 * localStorage에 남기는 최소 스냅샷.
 * 연락처·주소 등 민감 정보는 저장하지 않는다.
 * (XSS로 localStorage가 탈취되어도 피해 범위를 줄이기 위함)
 */
export interface OrderLocalSnapshot {
  id: string;
  status: OrderStatus;
  productId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  /** TTL 판정용 epoch ms — 도메인 모델과 분리된 저장 메타데이터 */
  savedAt: number;
}

export type OrdersStoreResult =
  | { ok: true; orders: OrderLocalSnapshot[] }
  | { ok: false; reason: "quota_exceeded" | "unavailable" | "parse_error" };

/**
 * 저장소 추상 인터페이스.
 * 나중에 DB/API 기반으로 바꿔도 메서드 시그니처를 유지하기 위함.
 */
export interface OrdersStore {
  getAll(): OrderLocalSnapshot[];
  add(order: OrderData): OrdersStoreResult;
  clear(): void;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isOrderLocalSnapshot(value: unknown): value is OrderLocalSnapshot {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.status === "string" &&
    typeof item.productId === "string" &&
    typeof item.productName === "string" &&
    typeof item.quantity === "number" &&
    typeof item.totalPrice === "number" &&
    typeof item.createdAt === "string" &&
    typeof item.savedAt === "number"
  );
}

function toSnapshot(order: OrderData, savedAt: number): OrderLocalSnapshot {
  // 의도적으로 contact/shipping/note를 버린다 — 민감정보 최소 저장 원칙
  return {
    id: order.id,
    status: order.status,
    productId: order.item.productId,
    productName: order.item.productName,
    quantity: order.item.quantity,
    totalPrice: order.item.totalPrice,
    createdAt: order.createdAt,
    savedAt,
  };
}

function pruneExpired(
  orders: OrderLocalSnapshot[],
  now: number,
): OrderLocalSnapshot[] {
  // 만료분 제거: 동기 파싱 비용을 낮추고, 장기 방치된 데이터를 남기지 않기 위함
  return orders.filter((order) => now - order.savedAt <= TTL_MS);
}

function enforceMaxCount(orders: OrderLocalSnapshot[]): OrderLocalSnapshot[] {
  // 최신순 유지 후 초과분 삭제 — 용량 제한·직렬화 비용 완화
  if (orders.length <= MAX_ORDERS) {
    return orders;
  }

  return orders
    .slice()
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, MAX_ORDERS);
}

function readRawOrders(): OrderLocalSnapshot[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isOrderLocalSnapshot);
  } catch {
    // 손상된 JSON은 무시 — 파싱 실패로 앱 전체가 멈추지 않게 함
    return [];
  }
}

function writeRawOrders(orders: OrderLocalSnapshot[]): OrdersStoreResult {
  if (!isBrowser()) {
    return { ok: false, reason: "unavailable" };
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return { ok: true, orders };
  } catch (error) {
    // QuotaExceededError: 용량 초과 시 앱 크래시 대신 실패 결과 반환
    if (
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED")
    ) {
      return { ok: false, reason: "quota_exceeded" };
    }

    return { ok: false, reason: "unavailable" };
  }
}

/**
 * localStorage 기반 임시 OrdersStore 구현.
 * getItem/setItem은 동기 API라 메인 스레드를 막을 수 있으므로
 * 저장 데이터는 항상 작게 유지한다.
 */
export const localOrdersStore: OrdersStore = {
  getAll(): OrderLocalSnapshot[] {
    const now = Date.now();
    const current = readRawOrders();
    const alive = enforceMaxCount(pruneExpired(current, now));

    // 만료·초과분이 있으면 읽기 시점에 정리해 다음 읽기 비용을 줄인다
    if (alive.length !== current.length) {
      writeRawOrders(alive);
    }

    return alive;
  },

  add(order: OrderData): OrdersStoreResult {
    const now = Date.now();
    const snapshot = toSnapshot(order, now);

    // 동일 id 중복 방지 후 앞에 삽입 (최신 우선)
    const next = enforceMaxCount(
      pruneExpired(
        [snapshot, ...readRawOrders().filter((item) => item.id !== snapshot.id)],
        now,
      ),
    );

    const result = writeRawOrders(next);

    if (result.ok) {
      return result;
    }

    // 용량 초과 시 절반으로 줄여 한 번 더 시도 — UX를 완전히 막지 않기 위한 방어
    if (result.reason === "quota_exceeded") {
      const reduced = next.slice(0, Math.max(1, Math.floor(MAX_ORDERS / 2)));
      const retry = writeRawOrders(reduced);

      if (retry.ok) {
        return retry;
      }
    }

    return result;
  },

  clear(): void {
    if (!isBrowser()) {
      return;
    }

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // clear 실패는 치명적이지 않음 — 무시
    }
  },
};

/** 현재 기본 구현. DB 전환 시 이 export만 교체하면 된다. */
export const ordersStore: OrdersStore = localOrdersStore;
