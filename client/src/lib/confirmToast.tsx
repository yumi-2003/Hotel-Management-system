import toast, { type ToastPosition } from "react-hot-toast";

interface ConfirmToastOptions {
  message: string;
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  cancelLabel?: string;
  duration?: number;
  position?: ToastPosition;
}

export const showConfirmToast = ({
  message,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  duration = 5000,
  position = "top-center",
}: ConfirmToastOptions) =>
  toast(
    (t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="text-sm font-bold text-foreground">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await onConfirm();
            }}
            className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-600 transition-colors"
          >
            {confirmLabel}
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-muted/80 transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    ),
    {
      duration,
      position,
      style: {
        background: "var(--card)",
        color: "var(--foreground)",
        border: "1px solid var(--border)",
        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      },
    },
  );
