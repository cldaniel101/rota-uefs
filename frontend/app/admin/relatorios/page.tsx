"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import {
  AdminRelatoriosTabs,
  type DadosGestaoRelatorio,
  type ViagemSeguroRelatorio,
} from "@/features/gerenciar-relatorios/ui/admin-relatorios-tabs";
import {
  adminService,
  type BusAdmin,
  type ListaPassageirosRelatorio,
  type ViagemAdmin,
} from "@/services/adminService";

const STATUS_LABELS: Record<string, string> = {
  Pending: "Pendente",
  Confirmed: "Confirmada",
  Cancelled: "Cancelada",
  Completed: "Viagem Finalizada",
};

function getMesAtual() {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  return `${hoje.getFullYear()}-${mes}`;
}

function numeroOuZero(valor: number | undefined) {
  return typeof valor === "number" && Number.isFinite(valor) ? valor : 0;
}

function formatarData(dataISO: string) {
  const [ano, mes, dia] = dataISO.split("-");
  if (!ano || !mes || !dia) return dataISO;
  return `${dia}/${mes}/${ano}`;
}

function formatarHorario(horario: string) {
  return horario ? horario.slice(0, 5) : "--:--";
}

function formatarMes(mesSelecionado: string) {
  const [ano, mes] = mesSelecionado.split("-");
  if (!ano || !mes) return mesSelecionado;
  return `${mes}/${ano}`;
}

function traduzirStatus(status: string) {
  return STATUS_LABELS[status] ?? status;
}

function csvRow(valores: Array<string | number>) {
  return valores.map((valor) => `"${String(valor).replace(/"/g, '""')}"`).join(";");
}

function baixarArquivo(nome: string, conteudo: string, tipo: string) {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escaparHtml(valor: string | number | null | undefined) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function abrirDocumentoImpressao(titulo: string, conteudo: string) {
  const janela = window.open("", "_blank");

  if (!janela) {
    window.alert("Nao foi possivel abrir a janela de impressao.");
    return;
  }

  janela.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escaparHtml(titulo)}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; margin: 32px; }
          h1 { color: #103173; font-size: 22px; margin: 0 0 8px; }
          h2 { color: #103173; font-size: 16px; margin: 28px 0 10px; }
          p { margin: 4px 0; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #e2e8f0; color: #103173; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
          .metric { border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; }
          .metric strong { display: block; color: #103173; font-size: 20px; margin-top: 4px; }
          @media print { button { display: none; } body { margin: 20px; } }
        </style>
      </head>
      <body>
        ${conteudo}
        <script>
          window.addEventListener("load", () => window.print());
        </script>
      </body>
    </html>
  `);
  janela.document.close();
}

function montarRelatorioGestaoHtml(
  dadosGestao: DadosGestaoRelatorio,
  viagens: ViagemAdmin[],
  capacidadePorPlaca: Record<string, number>,
) {
  const linhasViagens = viagens
    .map((viagem) => {
      const capacidade = capacidadePorPlaca[viagem.bus_license_plate] ?? 0;
      const reservas = numeroOuZero(viagem.total_reservations);
      const checkins = numeroOuZero(viagem.total_checkins);

      return `
        <tr>
          <td>${escaparHtml(viagem.trip_id)}</td>
          <td>${escaparHtml(formatarData(viagem.trip_date))}</td>
          <td>${escaparHtml(formatarHorario(viagem.departure_time))}</td>
          <td>${escaparHtml(viagem.boarding_point)} -> ${escaparHtml(viagem.drop_off_point)}</td>
          <td>${escaparHtml(viagem.bus_license_plate)}</td>
          <td>${capacidade}</td>
          <td>${reservas}</td>
          <td>${checkins}</td>
          <td>${escaparHtml(traduzirStatus(viagem.status))}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <h1>Relatorio de Gestao Logistica</h1>
    <p>Periodo: ${escaparHtml(dadosGestao.mes)}</p>
    <div class="summary">
      <div class="metric">Taxa de ocupacao<strong>${escaparHtml(dadosGestao.ocupacao.taxa)}</strong></div>
      <div class="metric">Viagens consideradas<strong>${dadosGestao.ocupacao.realizadas}</strong></div>
      <div class="metric">Viagens canceladas<strong>${dadosGestao.quorum.canceladas}</strong></div>
    </div>
    <p>Assentos ocupados: ${dadosGestao.ocupacao.assentosOcupados}</p>
    <p>Assentos ofertados: ${dadosGestao.ocupacao.assentosOfertados}</p>
    <h2>Viagens do periodo</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Data</th>
          <th>Horario</th>
          <th>Rota</th>
          <th>Onibus</th>
          <th>Capacidade</th>
          <th>Reservas</th>
          <th>Check-ins</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${linhasViagens || '<tr><td colspan="9">Sem viagens no periodo.</td></tr>'}
      </tbody>
    </table>
  `;
}

function montarListaNominalHtml(
  viagem: ViagemSeguroRelatorio,
  lista: ListaPassageirosRelatorio,
) {
  const passageiros = [
    ...lista.valid_reservations.map((passageiro) => ({ ...passageiro, grupo: "Lista principal" })),
    ...lista.waitlist_reservations.map((passageiro) => ({ ...passageiro, grupo: "Fila de espera" })),
  ];

  const linhas = passageiros
    .map((passageiro, indice) => {
      const tipo = passageiro.is_invited ? "Convidado" : passageiro.profile;

      return `
        <tr>
          <td>${indice + 1}</td>
          <td>${escaparHtml(passageiro.name)}</td>
          <td>${escaparHtml(tipo)}</td>
          <td>${passageiro.onboard ? "Sim" : "Nao"}</td>
          <td>${escaparHtml(passageiro.grupo)}</td>
          <td>${escaparHtml(passageiro.reservation_id)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <h1>Lista Nominal de Passageiros</h1>
    <p>Viagem: ${escaparHtml(viagem.id)}</p>
    <p>Rota: ${escaparHtml(viagem.origem)} -> ${escaparHtml(viagem.destino)}</p>
    <p>Data e horario: ${escaparHtml(viagem.data)} as ${escaparHtml(viagem.horario)}</p>
    <p>Onibus: ${escaparHtml(viagem.onibus)}</p>
    <p>Motorista: ${escaparHtml(viagem.motorista)}</p>
    <div class="summary">
      <div class="metric">Capacidade<strong>${lista.stats.capacity}</strong></div>
      <div class="metric">Reservas<strong>${lista.stats.total_reservations}</strong></div>
      <div class="metric">Embarcados<strong>${lista.stats.total_onboarded ?? viagem.passageiros}</strong></div>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Nome</th>
          <th>Tipo</th>
          <th>Embarcou</th>
          <th>Grupo</th>
          <th>Reserva</th>
        </tr>
      </thead>
      <tbody>
        ${linhas || '<tr><td colspan="6">Nenhum passageiro encontrado.</td></tr>'}
      </tbody>
    </table>
  `;
}

function montarCsvGestao(
  dadosGestao: DadosGestaoRelatorio,
  viagens: ViagemAdmin[],
  capacidadePorPlaca: Record<string, number>,
) {
  const linhas = [
    csvRow(["Periodo", dadosGestao.mes]),
    csvRow(["Taxa de ocupacao", dadosGestao.ocupacao.taxa]),
    csvRow(["Assentos ocupados", dadosGestao.ocupacao.assentosOcupados]),
    csvRow(["Assentos ofertados", dadosGestao.ocupacao.assentosOfertados]),
    csvRow(["Viagens consideradas", dadosGestao.ocupacao.realizadas]),
    csvRow(["Viagens canceladas", dadosGestao.quorum.canceladas]),
    "",
    csvRow([
      "ID",
      "Data",
      "Horario",
      "Origem",
      "Destino",
      "Onibus",
      "Capacidade",
      "Reservas",
      "Check-ins",
      "Servidores",
      "Alunos",
      "Status",
    ]),
    ...viagens.map((viagem) =>
      csvRow([
        viagem.trip_id,
        formatarData(viagem.trip_date),
        formatarHorario(viagem.departure_time),
        viagem.boarding_point,
        viagem.drop_off_point,
        viagem.bus_license_plate,
        capacidadePorPlaca[viagem.bus_license_plate] ?? 0,
        numeroOuZero(viagem.total_reservations),
        numeroOuZero(viagem.total_checkins),
        numeroOuZero(viagem.teachers_count),
        numeroOuZero(viagem.students_count),
        traduzirStatus(viagem.status),
      ]),
    ),
  ];

  return `\ufeff${linhas.join("\n")}`;
}

export default function AdminRelatoriosPage() {
  const router = useRouter();
  const [abaAtiva, setAbaAtiva] = useState<"gestao" | "seguro">("gestao");
  const [mesSelecionado, setMesSelecionado] = useState(getMesAtual);
  const [viagens, setViagens] = useState<ViagemAdmin[]>([]);
  const [onibus, setOnibus] = useState<BusAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [buscaSeguro, setBuscaSeguro] = useState("");
  const [viagemSeguroDownloadId, setViagemSeguroDownloadId] = useState<string | null>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        setErro("");
        const [viagensData, onibusData] = await Promise.all([
          adminService.listarViagens(),
          adminService.listarOnibus(),
        ]);

        setViagens(viagensData ?? []);
        setOnibus(onibusData ?? []);
      } catch (err) {
        console.error("Erro ao carregar relatorios:", err);
        setErro("Nao foi possivel carregar os dados de relatorios. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  const capacidadePorPlaca = useMemo(() => {
    return onibus.reduce<Record<string, number>>((mapa, item) => {
      mapa[item.bus_plate] = item.capacity;
      return mapa;
    }, {});
  }, [onibus]);

  const viagensDoPeriodo = useMemo(() => {
    return viagens.filter((viagem) => viagem.trip_date?.startsWith(mesSelecionado));
  }, [viagens, mesSelecionado]);

  const dadosGestao = useMemo<DadosGestaoRelatorio>(() => {
    const viagensOperacionais = viagensDoPeriodo.filter((viagem) => viagem.status !== "Cancelled");
    const assentosOfertados = viagensOperacionais.reduce((total, viagem) => {
      return total + (capacidadePorPlaca[viagem.bus_license_plate] ?? 0);
    }, 0);
    const assentosOcupados = viagensOperacionais.reduce((total, viagem) => {
      const checkins = numeroOuZero(viagem.total_checkins);
      const reservas = numeroOuZero(viagem.total_reservations);
      return total + (checkins > 0 ? checkins : reservas);
    }, 0);
    const canceladas = viagensDoPeriodo.filter((viagem) => viagem.status === "Cancelled").length;
    const taxa =
      assentosOfertados > 0 ? `${Math.round((assentosOcupados / assentosOfertados) * 100)}%` : "0%";

    return {
      mes: formatarMes(mesSelecionado),
      ocupacao: {
        realizadas: viagensOperacionais.length,
        assentosOfertados,
        assentosOcupados,
        taxa,
      },
      quorum: {
        canceladas,
        motivo: "falta de servidor a bordo",
      },
      segundoOnibus: {
        acionamentos: 0,
        ocupacaoMedia: "N/D",
      },
      departamentos: [],
    };
  }, [capacidadePorPlaca, mesSelecionado, viagensDoPeriodo]);

  const viagensSeguro = useMemo<ViagemSeguroRelatorio[]>(() => {
    const termo = buscaSeguro.trim().toLowerCase();

    return viagensDoPeriodo
      .filter((viagem) => viagem.status === "Completed")
      .map((viagem) => ({
        id: viagem.trip_id,
        origem: viagem.boarding_point,
        destino: viagem.drop_off_point,
        data: formatarData(viagem.trip_date),
        horario: formatarHorario(viagem.departure_time),
        onibus: viagem.bus_license_plate,
        motorista: viagem.driver_name ?? "Motorista nao informado",
        passageiros: numeroOuZero(viagem.total_checkins),
        status: traduzirStatus(viagem.status),
      }))
      .filter((viagem) => {
        if (!termo) return true;

        return (
          viagem.id.toLowerCase().includes(termo) ||
          viagem.data.toLowerCase().includes(termo) ||
          viagem.motorista.toLowerCase().includes(termo) ||
          viagem.origem.toLowerCase().includes(termo) ||
          viagem.destino.toLowerCase().includes(termo) ||
          viagem.onibus.toLowerCase().includes(termo)
        );
      });
  }, [buscaSeguro, viagensDoPeriodo]);

  const handleDownloadGestao = (formato: "pdf" | "excel") => {
    if (formato === "excel") {
      baixarArquivo(
        `relatorio-gestao-${mesSelecionado}.csv`,
        montarCsvGestao(dadosGestao, viagensDoPeriodo, capacidadePorPlaca),
        "text/csv;charset=utf-8",
      );
      return;
    }

    abrirDocumentoImpressao(
      `Relatorio de Gestao - ${formatarMes(mesSelecionado)}`,
      montarRelatorioGestaoHtml(dadosGestao, viagensDoPeriodo, capacidadePorPlaca),
    );
  };

  const handleDownloadSeguro = async (idViagem: string) => {
    const viagem = viagensSeguro.find((item) => item.id === idViagem);

    if (!viagem) {
      window.alert("Viagem nao encontrada na listagem atual.");
      return;
    }

    try {
      setViagemSeguroDownloadId(idViagem);
      const lista = await adminService.listarPassageirosViagem(idViagem);
      abrirDocumentoImpressao(
        `Lista Nominal - ${idViagem}`,
        montarListaNominalHtml(viagem, lista),
      );
    } catch (err) {
      console.error("Erro ao gerar lista nominal:", err);
      window.alert("Nao foi possivel gerar a lista nominal da viagem.");
    } finally {
      setViagemSeguroDownloadId(null);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 selection:bg-cyan-100 selection:text-cyan-900">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar
          title="Central de Relatorios"
          subtitle="Acesse metricas operacionais e emita listas para auditoria de seguro."
          buttonText="Voltar"
          buttonIcon={ArrowLeft}
          buttonVariant="outline"
          onAction={() => router.push("/admin")}
        />

        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50/50">
          <div className="max-w-5xl mx-auto pb-10">
            <AdminRelatoriosTabs
              abaAtiva={abaAtiva}
              setAbaAtiva={setAbaAtiva}
              mesSelecionado={mesSelecionado}
              setMesSelecionado={setMesSelecionado}
              buscaSeguro={buscaSeguro}
              setBuscaSeguro={setBuscaSeguro}
              loading={loading}
              erro={erro}
              handleDownloadGestao={handleDownloadGestao}
              handleDownloadSeguro={handleDownloadSeguro}
              dadosGestao={dadosGestao}
              viagensSeguro={viagensSeguro}
              viagemSeguroDownloadId={viagemSeguroDownloadId}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
