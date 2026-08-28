"use client";

import { useEffect, useRef, useState } from "react";

type SepayDetails = {
  orderCode: string;
  amountVnd: number;
  qrUrl: string;
  bankAccount: string;
  bankName: string;
  accountName: string;
};

type ModalView = "choice" | "loading" | "qr" | "success" | "expired" | "error";

export default function CheckoutModal({
  open,
  onClose,
  url,
  category,
  bid,
  onPaid,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  category: string;
  bid: number;
  onPaid: () => void;
}) {
  const [view, setView] = useState<ModalView>("choice");
  const [errMsg, setErrMsg] = useState("");
  const [sepay, setSepay] = useState<SepayDetails | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const polarReady = true; // will be checked server-side; UI always offers Polar

  useEffect(() => {
    if (!open) {
      stopPolling();
      return;
    }
    setView("choice");
    setErrMsg("");
    setSepay(null);
    setOrderCode(null);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleClose() {
    stopPolling();
    onClose();
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function startPolling(code: string) {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/slot-order/${encodeURIComponent(code)}`, { cache: "no-store" });
        const data = await res.json();
        if (data.status === "paid") {
          stopPolling();
          setView("success");
          setTimeout(() => {
            handleClose();
            onPaid();
          }, 2500);
        } else if (data.status === "expired") {
          stopPolling();
          setView("expired");
        }
      } catch {
        // keep polling
      }
    }, 3000);
  }

  async function chooseVN() {
    setView("loading");
    setErrMsg("");
    try {
      const res = await fetch("/api/slot-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, category, bid, method: "sepay" }),
      });
      const data = await res.json();
      if (!res.ok || !data.orderCode) {
        setErrMsg(data.error || "Không tạo được đơn hàng. Vui lòng thử lại.");
        setView("error");
        return;
      }
      const details: SepayDetails = {
        orderCode: data.orderCode,
        amountVnd: data.amountVnd,
        qrUrl: data.qrUrl,
        bankAccount: data.bankAccount,
        bankName: data.bankName,
        accountName: data.accountName,
      };
      setSepay(details);
      setOrderCode(data.orderCode);
      setView("qr");
      startPolling(data.orderCode);
    } catch {
      setErrMsg("Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.");
      setView("error");
    }
  }

  async function chooseGlobal() {
    setView("loading");
    setErrMsg("");
    try {
      const res = await fetch("/api/slot-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, category, bid, method: "polar" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrMsg(data.error || "Không tạo được phiên thanh toán.");
        setView("error");
        return;
      }
      if (data.polarNotReady) {
        setErrMsg("Polar chưa được kết nối — Ben sẽ bật sau khi gửi access token. Tạm thời hãy dùng chuyển khoản Việt Nam.");
        setView("error");
        return;
      }
      if (data.checkoutUrl) {
        // Order is pending; keep polling while user is on Polar
        if (data.orderCode) {
          setOrderCode(data.orderCode);
          startPolling(data.orderCode);
        }
        window.open(data.checkoutUrl, "_blank");
        // Keep modal open on pending so polling can still succeed when they return
        setView("qr");
        // Reuse QR view as "waiting for Polar payment" — swap content
        setSepay(null);
        return;
      }
      setErrMsg("Không nhận được link thanh toán.");
      setView("error");
    } catch {
      setErrMsg("Lỗi kết nối Polar.");
      setView("error");
    }
  }

  function copyCode() {
    const code = sepay?.orderCode || orderCode;
    if (!code) return;
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function retry() {
    stopPolling();
    setView("choice");
  }

  if (!open) return null;

  const amountLabel = sepay
    ? new Intl.NumberFormat("vi-VN").format(sepay.amountVnd) + " VND"
    : bid
      ? new Intl.NumberFormat("vi-VN").format(Math.round(bid * 26000)) + " VND"
      : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          ×
        </button>

        {view === "choice" && (
          <div>
            <h3 className="text-center text-lg font-bold">Chọn phương thức thanh toán</h3>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Slot <span className="font-semibold text-foreground">${bid.toLocaleString()}</span> cho{" "}
              <span className="font-medium">{url.slice(0, 32)}</span>
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={chooseGlobal}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/50 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="text-2xl">🌍</span>
                <span className="text-sm font-semibold">Global</span>
                <span className="text-xs text-muted-foreground">Card, PayPal</span>
              </button>
              <button
                onClick={chooseVN}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/50 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="text-2xl">🏦</span>
                <span className="text-sm font-semibold">Việt Nam</span>
                <span className="text-xs text-muted-foreground">Chuyển khoản</span>
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Sau khi thanh toán, logo + tên website sẽ tự động được lấy từ URL bạn đã nhập.
            </p>
          </div>
        )}

        {view === "loading" && (
          <div className="flex flex-col items-center gap-3 py-10">
            <span className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Đang tạo đơn hàng...</p>
          </div>
        )}

        {view === "qr" && sepay && (
          <div>
            <h3 className="text-center text-lg font-bold">Chuyển khoản ngân hàng</h3>
            <div className="mt-4 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sepay.qrUrl} alt="VietQR" className="h-56 w-56 rounded-xl border border-border bg-white object-contain p-2" />
            </div>
            <div className="mt-4 space-y-2 rounded-xl border border-border bg-muted/40 p-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Ngân hàng</span>
                <span className="font-medium">{sepay.bankName}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Số TK</span>
                <span className="font-mono font-medium">{sepay.bankAccount}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Chủ TK</span>
                <span className="font-medium">{sepay.accountName}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Số tiền</span>
                <span className="font-semibold text-primary">{amountLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Nội dung CK</span>
                <span className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-sm font-bold text-primary">
                    {sepay.orderCode}
                  </span>
                  <button
                    onClick={copyCode}
                    className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted"
                  >
                    {copied ? "Đã copy!" : "Copy"}
                  </button>
                </span>
              </div>
            </div>
            <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
              Quét QR hoặc chuyển khoản thủ công với đúng nội dung trên. Hệ thống tự động kích hoạt sau khi nhận tiền.
              Đang kiểm tra mỗi 3 giây...
            </p>
          </div>
        )}

        {view === "qr" && !sepay && orderCode && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="text-3xl">⏳</span>
            <h3 className="text-base font-semibold">Đang chờ thanh toán Polar...</h3>
            <p className="text-sm text-muted-foreground">
              Cửa sổ Polar đã mở ở tab mới. Hoàn tất thanh toán rồi quay lại — hệ thống sẽ tự kích hoạt.
            </p>
            <p className="rounded bg-muted px-3 py-1 font-mono text-xs">
              {orderCode} · ${bid.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Đang kiểm tra mỗi 3 giây...</p>
          </div>
        )}

        {view === "success" && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-green-500 text-2xl text-white">✓</span>
            <h3 className="text-lg font-bold">Thanh toán thành công!</h3>
            <p className="text-sm text-muted-foreground">Slot của bạn đã được kích hoạt. Đang làm mới...</p>
          </div>
        )}

        {view === "expired" && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="text-3xl">⏱</span>
            <h3 className="font-semibold">Đơn hàng đã hết hạn</h3>
            <p className="text-sm text-muted-foreground">Đơn hàng quá 30 phút. Vui lòng tạo đơn mới.</p>
            <button onClick={retry} className="mt-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Tạo đơn mới
            </button>
          </div>
        )}

        {view === "error" && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="text-3xl">⚠️</span>
            <h3 className="font-semibold">Không thể tiếp tục</h3>
            <p className="max-w-sm text-sm text-muted-foreground">{errMsg}</p>
            <button onClick={retry} className="mt-2 rounded-full border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-muted">
              Thử lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
