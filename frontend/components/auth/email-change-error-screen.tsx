"use client";

import { useRouter } from "next/navigation";
import {
  BusFront,
  ArrowLeft,
  MailX,
  MailWarning,
  Clock,
  ShieldAlert,
  RefreshCw,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { cn } from "@/lib/utils";

export type EmailErrorType =
  | "email_in_use"
  | "invalid_email"
  | "expired"
  | "error";

type ErrorConfig = {
  icon: React.ElementType;
  title: string;
  badge: string;
  defaultMessage: string;
  helpText: string;
  iconColor: string;
  gradientFrom: string;
  gradientTo: string;
  shadowColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  stripFrom: string;
  stripTo: string;
};

const ERROR_CONFIGS: Record<EmailErrorType, ErrorConfig> = {
  email_in_use: {
    icon: MailX,
    title: "E-mail já em uso",
    badge: "Conflito de e-mail",
    defaultMessage:
      "O endereço de e-mail que você tentou cadastrar já está associado a outra conta no sistema.",
    helpText:
      "Tente usar um e-mail diferente ou entre em contato com o suporte se acreditar que isso é um erro.",
    iconColor: "text-white",
    gradientFrom: "from-orange-400",
    gradientTo: "to-orange-600",
    shadowColor: "shadow-orange-500/30",
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-700",
    badgeBorder: "border-orange-200",
    stripFrom: "from-orange-400",
    stripTo: "to-amber-500",
  },
  invalid_email: {
    icon: MailWarning,
    title: "E-mail inválido",
    badge: "Formato inválido",
    defaultMessage:
      "O endereço de e-mail informado não é válido ou não foi reconhecido pelo sistema.",
    helpText:
      "Verifique se o e-mail está correto e tente novamente pelo seu perfil.",
    iconColor: "text-white",
    gradientFrom: "from-amber-400",
    gradientTo: "to-yellow-600",
    shadowColor: "shadow-amber-500/30",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200",
    stripFrom: "from-amber-400",
    stripTo: "to-yellow-500",
  },
  expired: {
    icon: Clock,
    title: "Link expirado",
    badge: "Link inválido",
    defaultMessage:
      "O link de confirmação que você usou já expirou ou já foi utilizado anteriormente.",
    helpText:
      "Links de confirmação são válidos por 24 horas. Solicite um novo link pelo seu perfil.",
    iconColor: "text-white",
    gradientFrom: "from-slate-400",
    gradientTo: "to-slate-600",
    shadowColor: "shadow-slate-500/30",
    badgeBg: "bg-slate-50",
    badgeText: "text-slate-600",
    badgeBorder: "border-slate-200",
    stripFrom: "from-slate-400",
    stripTo: "to-slate-600",
  },
  error: {
    icon: ShieldAlert,
    title: "Não foi possível trocar o e-mail",
    badge: "Erro no processo",
    defaultMessage:
      "Ocorreu um erro inesperado ao processar a alteração do seu e-mail. Por favor, tente novamente.",
    helpText:
      "Se o problema persistir, entre em contato com a administração do sistema.",
    iconColor: "text-white",
    gradientFrom: "from-red-400",
    gradientTo: "to-red-600",
    shadowColor: "shadow-red-500/30",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
    badgeBorder: "border-red-200",
    stripFrom: "from-red-400",
    stripTo: "to-red-600",
  },
};

type EmailChangeErrorScreenProps = {
  errorType: EmailErrorType;
  message?: string;
};

function ErrorIconBadge({ config }: { config: ErrorConfig }) {
  const Icon = config.icon;
  return (
    <div className="relative flex items-center justify-center">
      <span
        className={cn(
          "absolute inline-flex h-24 w-24 animate-ping rounded-full opacity-15",
          `bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo}`
        )}
        style={{ animationDuration: "2s" }}
      />
      <div
        className={cn(
          "relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br shadow-xl",
          config.gradientFrom,
          config.gradientTo,
          config.shadowColor
        )}
      >
        <Icon className={cn("h-10 w-10 drop-shadow", config.iconColor)} />
      </div>
    </div>
  );
}

function StatusBadge({ config }: { config: ErrorConfig }) {
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest border",
        config.badgeBg,
        config.badgeText,
        config.badgeBorder
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.badge}
    </span>
  );
}

function DecorativeStripe({ config }: { config: ErrorConfig }) {
  return (
    <div
      className={cn(
        "h-1.5 w-full rounded-t-2xl bg-gradient-to-r",
        config.stripFrom,
        config.stripTo
      )}
    />
  );
}

function HelpCard({ text }: { text: string }) {
  return (
    <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-left">
      <p className="text-xs font-medium text-slate-500 leading-relaxed">{text}</p>
    </div>
  );
}

export function EmailChangeErrorScreen({
  errorType,
  message,
}: EmailChangeErrorScreenProps) {
  const router = useRouter();
  const config = ERROR_CONFIGS[errorType] ?? ERROR_CONFIGS.error;
  const displayMessage = message || config.defaultMessage;

  return (
    <AuthPageShell>
      {/* Blob decorativo temático */}
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-10 bg-gradient-to-br",
          config.gradientFrom,
          config.gradientTo
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute right-[-10%] bottom-[-10%] h-80 w-80 rounded-full blur-3xl opacity-8 bg-gradient-to-br",
          config.gradientFrom,
          config.gradientTo
        )}
      />

      <div
        className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out"
        style={{ animationFillMode: "both" }}
      >
        <div className="overflow-hidden rounded-2xl bg-white/85 shadow-2xl backdrop-blur-md border border-white/60">
          <DecorativeStripe config={config} />

          <div className="flex flex-col items-center gap-5 px-8 py-10 text-center">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#103173] shadow-md">
                <BusFront className="h-5 w-5 text-[#F2D022]" />
              </div>
              <span className="text-xl font-black tracking-tight text-[#103173]">
                Rota UEFS
              </span>
            </div>

            {/* Ícone animado */}
            <div
              className="animate-in zoom-in-50 duration-500 delay-200"
              style={{ animationFillMode: "both" }}
            >
              <ErrorIconBadge config={config} />
            </div>

            {/* Badge de status */}
            <div
              className="animate-in fade-in duration-500 delay-300"
              style={{ animationFillMode: "both" }}
            >
              <StatusBadge config={config} />
            </div>

            {/* Título e mensagem */}
            <div
              className="space-y-2 animate-in fade-in duration-500 delay-400"
              style={{ animationFillMode: "both" }}
            >
              <h1 className="text-2xl font-black text-[#103173] leading-tight">
                {config.title}
              </h1>
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                {displayMessage}
              </p>
            </div>

            {/* Card de ajuda */}
            <div
              className="w-full animate-in fade-in duration-500 delay-[450ms]"
              style={{ animationFillMode: "both" }}
            >
              <HelpCard text={config.helpText} />
            </div>

            {/* Separador */}
            <div className="w-full h-px bg-slate-100" />

            {/* CTAs */}
            <div
              className="w-full flex flex-col gap-3 animate-in fade-in duration-500 delay-500"
              style={{ animationFillMode: "both" }}
            >
              <Button
                onClick={() => router.push("/perfil")}
                className="w-full h-12 bg-[#103173] hover:bg-[#0d2860] text-white font-black rounded-xl shadow-lg shadow-[#103173]/20 transition-all active:scale-95 group"
              >
                <RefreshCw className="mr-2 h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
                Tentar novamente no Perfil
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="w-full h-11 border-2 border-[#103173]/10 hover:border-[#103173]/30 hover:bg-[#103173]/5 text-[#103173] font-bold rounded-xl transition-all group"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Ir para o Login
              </Button>
            </div>

            {/* Footer */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
              Rota UEFS — Transporte Universitário
            </p>
          </div>
        </div>
      </div>
    </AuthPageShell>
  );
}
