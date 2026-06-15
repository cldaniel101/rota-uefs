"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  Info,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FeedbackPopupVariant =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "destructive";

type FeedbackPopupInput =
  | string
  | {
      title?: string;
      message: string;
      variant?: FeedbackPopupVariant;
      confirmLabel?: string;
      cancelLabel?: string;
    };

type PopupMode = "alert" | "confirm";

type PopupState = {
  mode: PopupMode;
  title: string;
  message: string;
  variant: FeedbackPopupVariant;
  confirmLabel: string;
  cancelLabel: string;
};

type FeedbackPopupContextValue = {
  showAlert: (input: FeedbackPopupInput) => Promise<void>;
  showConfirm: (input: FeedbackPopupInput) => Promise<boolean>;
};

type VariantConfig = {
  defaultTitle: string;
  icon: LucideIcon;
  accent: string;
  iconBox: string;
  action: string;
};

const variantConfig: Record<FeedbackPopupVariant, VariantConfig> = {
  info: {
    defaultTitle: "Aviso",
    icon: Info,
    accent: "bg-[#103173]",
    iconBox: "bg-[#103173]/10 text-[#103173]",
    action: "bg-[#103173] hover:bg-[#103B73] shadow-[#103173]/20",
  },
  success: {
    defaultTitle: "Tudo certo",
    icon: CheckCircle2,
    accent: "bg-[#23B99A]",
    iconBox: "bg-[#23B99A]/10 text-[#23B99A]",
    action: "bg-[#23B99A] hover:bg-[#1d9980] shadow-[#23B99A]/20",
  },
  warning: {
    defaultTitle: "Atenção",
    icon: AlertTriangle,
    accent: "bg-[#F2D022]",
    iconBox: "bg-[#F2D022]/20 text-[#b8960a]",
    action:
      "bg-[#F2D022] text-[#103173] hover:bg-[#ddbd1a] shadow-[#F2D022]/20",
  },
  error: {
    defaultTitle: "Não foi possível concluir",
    icon: CircleAlert,
    accent: "bg-red-600",
    iconBox: "bg-red-100 text-red-600",
    action: "bg-red-600 hover:bg-red-700 shadow-red-600/20",
  },
  destructive: {
    defaultTitle: "Confirma esta ação?",
    icon: Trash2,
    accent: "bg-red-600",
    iconBox: "bg-red-100 text-red-600",
    action: "bg-red-600 hover:bg-red-700 shadow-red-600/20",
  },
};

const FeedbackPopupContext =
  createContext<FeedbackPopupContextValue | null>(null);

function normalizeInput(input: FeedbackPopupInput, mode: PopupMode): PopupState {
  const options = typeof input === "string" ? { message: input } : input;
  const variant = options.variant ?? (mode === "confirm" ? "destructive" : "info");
  const config = variantConfig[variant];

  return {
    mode,
    variant,
    message: options.message,
    title: options.title ?? config.defaultTitle,
    confirmLabel:
      options.confirmLabel ?? (mode === "confirm" ? "CONFIRMAR" : "ENTENDI"),
    cancelLabel: options.cancelLabel ?? "CANCELAR",
  };
}

export function FeedbackPopupProvider({ children }: { children: ReactNode }) {
  const [popup, setPopup] = useState<PopupState | null>(null);
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  const settle = useCallback((confirmed: boolean) => {
    resolverRef.current?.(confirmed);
    resolverRef.current = null;
    setPopup(null);
  }, []);

  const openPopup = useCallback(
    (input: FeedbackPopupInput, mode: PopupMode) => {
      resolverRef.current?.(false);

      return new Promise<boolean>((resolve) => {
        resolverRef.current = resolve;
        setPopup(normalizeInput(input, mode));
      });
    },
    [],
  );

  const showAlert = useCallback(
    async (input: FeedbackPopupInput) => {
      await openPopup(input, "alert");
    },
    [openPopup],
  );

  const showConfirm = useCallback(
    (input: FeedbackPopupInput) => openPopup(input, "confirm"),
    [openPopup],
  );

  const value = useMemo(
    () => ({
      showAlert,
      showConfirm,
    }),
    [showAlert, showConfirm],
  );

  const config = popup ? variantConfig[popup.variant] : null;
  const Icon = config?.icon;

  return (
    <FeedbackPopupContext.Provider value={value}>
      {children}

      <AlertDialog
        open={Boolean(popup)}
        onOpenChange={(open) => {
          if (!open && popup) settle(false);
        }}
      >
        {popup && config && Icon && (
          <AlertDialogContent className="z-[120] w-full overflow-hidden rounded-[28px] border-none bg-white p-0 shadow-2xl sm:max-w-md">
            <div className={cn("h-1.5 w-full", config.accent)} />

            <div className="px-6 pb-6 pt-7 md:px-8 md:pb-8">
              <div
                className={cn(
                  "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
                  config.iconBox,
                )}
              >
                <Icon className="h-8 w-8" />
              </div>

              <AlertDialogTitle className="text-center text-2xl font-black tracking-tight text-[#103173]">
                {popup.title}
              </AlertDialogTitle>

              <AlertDialogDescription className="mt-3 text-center text-sm font-medium leading-relaxed text-slate-500">
                {popup.message}
              </AlertDialogDescription>

              <div className="mt-8 flex flex-col gap-3">
                <Button
                  onClick={() => settle(true)}
                  className={cn(
                    "h-14 w-full rounded-xl text-sm font-black text-white shadow-lg transition-all active:scale-95",
                    config.action,
                  )}
                >
                  {popup.confirmLabel}
                </Button>

                {popup.mode === "confirm" && (
                  <Button
                    onClick={() => settle(false)}
                    variant="outline"
                    className="h-14 w-full rounded-xl border-2 border-slate-200 text-sm font-black text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#103173]"
                  >
                    {popup.cancelLabel}
                  </Button>
                )}
              </div>
            </div>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </FeedbackPopupContext.Provider>
  );
}

export function useFeedbackPopup() {
  const context = useContext(FeedbackPopupContext);

  if (!context) {
    throw new Error(
      "useFeedbackPopup must be used within a FeedbackPopupProvider",
    );
  }

  return context;
}
