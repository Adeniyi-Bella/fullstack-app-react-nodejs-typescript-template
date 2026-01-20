import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderStatus, type TestOrderDTO } from "@/types";
import { OrderDetail } from "@pages/OrderDetail/OrderDetail";

const navigateMock = vi.fn();
const cancelOrderMock = vi.fn();
const updateStatusMock = vi.fn();

let mockOrderData: TestOrderDTO | null = null;
let mockIsLoading = false;
let mockError: Error | null = null;
let mockIsCancelling = false;
let mockIsUpdating = false;

vi.mock("@tanstack/react-router", () => ({
  useParams: () => ({ orderId: "123" }),
  useNavigate: () => navigateMock,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
}));

vi.mock("@/hooks/api/useOrder", () => ({
  useOrder: () => ({
    data: mockOrderData,
    isLoading: mockIsLoading,
    error: mockError,
  }),
  useCancelOrder: () => ({
    mutate: cancelOrderMock,
    isPending: mockIsCancelling,
  }),
  useUpdateOrderStatus: () => ({
    mutate: updateStatusMock,
    isPending: mockIsUpdating,
  }),
}));

vi.mock("@lib/utils/formatters", () => ({
  Formatters: {
    date: () => "January 15, 2024",
    currency: (amount: number) => `$${amount.toFixed(2)}`,
  },
}));

beforeEach(() => {
  mockOrderData = {
    orderId: "123-456-789",
    status: OrderStatus.PENDING,
    items: [{ productId: "prod-1", quantity: 2, price: 25.99 }],
    totalAmount: 51.98,
    createdAt: new Date("2024-01-15").toISOString(),
    shippingAddress: "123 Main St, City, State 12345",
  };
  mockIsLoading = false;
  mockError = null;
  mockIsCancelling = false;
  mockIsUpdating = false;
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("OrderDetail - Integration Tests", () => {
  it("should handle complete order status workflow from PENDING to DELIVERED", async () => {
    const user = userEvent.setup();

    // Start with PENDING order
    render(<OrderDetail />);
    expect(
      screen.getByRole("button", { name: /mark as processing/i }),
    ).toBeInTheDocument();

    // Move to PROCESSING
    await user.click(
      screen.getByRole("button", { name: /mark as processing/i }),
    );
    expect(updateStatusMock).toHaveBeenCalledWith(
      { orderId: "123-456-789", data: { status: OrderStatus.PROCESSING } },
      expect.any(Object),
    );

    // 3. Simulate Data Update & FORCE RENDER
    mockOrderData = { ...mockOrderData!, status: OrderStatus.PROCESSING };
    cleanup(); // <--- Remove old component
    render(<OrderDetail />); // <--- Mount new one (forces hook to re-run)
    expect(
      screen.getByRole("button", { name: /mark as shipped/i }),
    ).toBeInTheDocument();

    // Move to SHIPPED
    await user.click(screen.getByRole("button", { name: /mark as shipped/i }));
    expect(updateStatusMock).toHaveBeenCalledWith(
      { orderId: "123-456-789", data: { status: OrderStatus.SHIPPED } },
      expect.any(Object),
    );

    // 5. Simulate Data Update & FORCE RENDER
    mockOrderData = { ...mockOrderData!, status: OrderStatus.SHIPPED };
    cleanup();
    render(<OrderDetail />);
    expect(
      screen.getByRole("button", { name: /mark as delivered/i }),
    ).toBeInTheDocument();

    // Move to DELIVERED
    await user.click(
      screen.getByRole("button", { name: /mark as delivered/i }),
    );
    expect(updateStatusMock).toHaveBeenCalledWith(
      { orderId: "123-456-789", data: { status: OrderStatus.DELIVERED } },
      expect.any(Object),
    );
  });

  it("should handle complete cancel order flow with confirmation", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    cancelOrderMock.mockImplementation((_, options) => {
      options.onSuccess();
    });

    render(<OrderDetail />);

    await user.click(screen.getByRole("button", { name: /cancel order/i }));

    expect(confirmSpy).toHaveBeenCalledWith(
      "Are you sure you want to cancel this order?",
    );
    expect(cancelOrderMock).toHaveBeenCalledWith(
      "123-456-789",
      expect.any(Object),
    );
    expect(navigateMock).toHaveBeenCalledWith({ to: "/orders" });

    confirmSpy.mockRestore();
  });

  it("should prevent concurrent operations (race condition)", async () => {
    const user = userEvent.setup();
    mockIsUpdating = true;

    render(<OrderDetail />);

    const cancelBtn = screen.getByRole("button", { name: /cancel order/i });
    const processBtn = screen.getByRole("button", { name: /loading/i });

    // Both buttons should be disabled when one operation is in progress
    expect(cancelBtn).toBeDisabled();
    expect(processBtn).toBeDisabled();

    // Clicking should not trigger any mutations
    await user.click(processBtn);
    expect(updateStatusMock).not.toHaveBeenCalled();
  });

  it("should not cancel order when user rejects confirmation", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<OrderDetail />);

    await user.click(screen.getByRole("button", { name: /cancel order/i }));

    expect(confirmSpy).toHaveBeenCalled();
    expect(cancelOrderMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});
