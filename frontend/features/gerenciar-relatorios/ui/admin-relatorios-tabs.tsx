"use client";

import {
  AlertTriangle,
  Building2,
  Bus,
  Calendar,
  CheckCircle2,
  FileDown,
  FileSpreadsheet,
  FileText,
  Search,
  ShieldAlert,
  Users,
} from "lucide-react";

export interface DadosGestaoRelatorio {
  mes: string;
  ocupacao: {
    realizadas: number;
    assentosOfertados: number;
    assentosOcupados: number;
    taxa: string;
  };
  quorum: {
    canceladas: number;
    motivo: string;
  };
  segundoOnibus: {
    acionamentos: number;
    ocupacaoMedia: string;
  };
  departamentos: Array<{
    nome: string;
    professores: number;
  }>;
}

export interface ViagemSeguroRelatorio {
  id: string;
  origem: string;
  destino: string;
  data: string;
  horario: string;
  onibus: string;
  motorista: string;
  passageiros: number;
  status: string;
}

interface AdminRelatoriosTabsProps {
  abaAtiva: "gestao" | "seguro";
  setAbaAtiva: (aba: "gestao" | "seguro") => void;
  mesSelecionado: string;
  setMesSelecionado: (mes: string) => void;
  buscaSeguro: string;
  setBuscaSeguro: (busca: string) => void;
  loading: boolean;
  erro: string;
  handleDownloadGestao: (formato: "pdf" | "excel") => void;
  handleDownloadSeguro: (idViagem: string) => void;
  dadosGestao: DadosGestaoRelatorio;
  viagensSeguro: ViagemSeguroRelatorio[];
  viagemSeguroDownloadId: string | null;
}

export function AdminRelatoriosTabs({
  abaAtiva,
  setAbaAtiva,
  mesSelecionado,
  setMesSelecionado,
  buscaSeguro,
  setBuscaSeguro,
  loading,
  erro,
  handleDownloadGestao,
  handleDownloadSeguro,
  dadosGestao,
  viagensSeguro,
  viagemSeguroDownloadId,
}: AdminRelatoriosTabsProps) {
  const exportDisabled = loading || Boolean(erro);

  return (
    <>
      <div className="flex gap-6 mb-8 border-b border-slate-200">
        <button
          onClick={() => setAbaAtiva("gestao")}
          className={`pb-4 font-extrabold text-sm border-b-2 transition-all ${
            abaAtiva === "gestao"
              ? "border-[#103173] text-[#103173]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Gestao Logistica e Faturamento
        </button>
        <button
          onClick={() => setAbaAtiva("seguro")}
          className={`pb-4 font-extrabold text-sm border-b-2 transition-all ${
            abaAtiva === "seguro"
              ? "border-[#103173] text-[#103173]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Auditoria de Seguro (Lista Nominal)
        </button>
      </div>

      {loading && (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-500 font-bold shadow-sm">
          Carregando dados de relatorios...
        </div>
      )}

      {!loading && erro && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-red-700 font-bold shadow-sm">
          {erro}
        </div>
      )}

      {!loading && !erro && abaAtiva === "gestao" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#103173]/5 rounded-xl shrink-0">
                <Calendar className="h-6 w-6 text-[#103173]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Periodo de Analise
                </label>
                <input
                  type="month"
                  value={mesSelecionado}
                  onChange={(e) => setMesSelecionado(e.target.value)}
                  className="font-extrabold text-[#103173] bg-transparent border-none focus:outline-none text-lg p-0"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
              <button
                type="button"
                disabled={exportDisabled}
                onClick={() => handleDownloadGestao("pdf")}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-[#103173] border border-slate-200 hover:border-[#103173]/30 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="h-4 w-4" /> Exportar PDF
              </button>
              <button
                type="button"
                disabled={exportDisabled}
                onClick={() => handleDownloadGestao("excel")}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#23B99A] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all hover:bg-[#1fa889] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet className="h-4 w-4" /> Exportar Excel
              </button>
            </div>
          </div>

          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-8 mb-4">
            Previa do Periodo - {dadosGestao.mes}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-[#103173]" />
                <h3 className="font-bold text-[#103173]">Metrica de Ocupacao</h3>
              </div>
              <p className="text-3xl font-black text-[#103173] mb-1">
                {dadosGestao.ocupacao.taxa}
              </p>
              <p className="text-xs font-medium text-slate-500">
                {dadosGestao.ocupacao.assentosOcupados} ocupados de{" "}
                {dadosGestao.ocupacao.assentosOfertados} ofertados em{" "}
                {dadosGestao.ocupacao.realizadas} viagens.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="font-bold text-red-700">Viagens Canceladas</h3>
              </div>
              <p className="text-3xl font-black text-red-600 mb-1">
                {dadosGestao.quorum.canceladas}
              </p>
              <p className="text-xs font-medium text-slate-500">
                Cancelamentos por falta de quorum ou {dadosGestao.quorum.motivo.toLowerCase()}.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <Bus className="h-5 w-5 text-[#F2D022]" />
                <h3 className="font-bold text-[#103173]">Uso do 2o Onibus</h3>
              </div>
              <p className="text-3xl font-black text-[#103173] mb-1">
                {dadosGestao.segundoOnibus.acionamentos}{" "}
                <span className="text-sm font-bold text-slate-400">vezes</span>
              </p>
              <p className="text-xs font-medium text-slate-500">
                {dadosGestao.segundoOnibus.ocupacaoMedia === "N/D"
                  ? "Sem dados de acionamento no periodo."
                  : `Acionamentos no mes com media de ocupacao real de ${dadosGestao.segundoOnibus.ocupacaoMedia}.`}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 md:col-span-3">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-5 w-5 text-[#103173]" />
                <h3 className="font-bold text-[#103173]">Por Departamento</h3>
              </div>
              {dadosGestao.departamentos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {dadosGestao.departamentos.map((dep) => (
                    <div
                      key={dep.nome}
                      className="flex justify-between items-center text-sm border border-slate-100 p-3 rounded-xl bg-slate-50"
                    >
                      <span className="font-bold text-slate-600">{dep.nome}</span>
                      <span className="font-extrabold text-[#103173]">{dep.professores} profs</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500 font-medium bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4">
                  Dados por departamento indisponiveis para o periodo selecionado.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && !erro && abaAtiva === "seguro" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center">
            <Search className="h-5 w-5 text-slate-400 ml-3 mr-2" />
            <input
              type="text"
              value={buscaSeguro}
              onChange={(e) => setBuscaSeguro(e.target.value)}
              placeholder="Buscar viagem por ID, data ou motorista..."
              className="flex-1 bg-transparent border-none focus:outline-none text-[#103173] placeholder:text-slate-400 text-sm py-2"
            />
          </div>

          <div className="grid gap-4">
            {viagensSeguro.length > 0 ? (
              viagensSeguro.map((viagem) => {
                const baixando = viagemSeguroDownloadId === viagem.id;

                return (
                  <div
                    key={viagem.id}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#23B99A]/10 rounded-xl shrink-0">
                        <ShieldAlert className="h-6 w-6 text-[#23B99A]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-[#103173] bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {viagem.id}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase text-[#23B99A]">
                            <CheckCircle2 className="h-3 w-3" /> {viagem.status}
                          </span>
                        </div>
                        <p className="text-base font-extrabold text-[#103173] mb-2">
                          {viagem.origem} para {viagem.destino}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> {viagem.data} as{" "}
                            {viagem.horario}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="flex items-center gap-1">
                            <Bus className="h-3.5 w-3.5" /> {viagem.onibus}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" /> {viagem.passageiros} embarcados
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0">
                      <button
                        type="button"
                        disabled={baixando}
                        onClick={() => handleDownloadSeguro(viagem.id)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#103173] hover:bg-[#103173]/90 text-white font-bold py-3 px-5 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <FileDown className="h-5 w-5" />
                        {baixando ? "Gerando lista..." : "Baixar Lista Nominal (PDF)"}
                      </button>
                      <p className="text-[10px] text-center text-slate-400 mt-2">
                        Documento oficial para Seguradora
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                <ShieldAlert className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-[#103173] font-bold text-lg">Nenhuma viagem finalizada</p>
                <p className="text-slate-500 text-sm mt-1">
                  Nao ha viagens finalizadas no periodo ou busca selecionada.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
