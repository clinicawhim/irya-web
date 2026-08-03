import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  PolarAngleAxis,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from "recharts";
import { FiLock } from "react-icons/fi";
import Container from "../../components/Container/Container";
import Loading from "../../components/Loading/Loading";
import Button from "../../components/Button/Button";
import BackButton from "../../components/BackButton/BackButton";
import { useQuestionarioStatus } from "../../hooks/useQuestionarioStatus";
import { isPacienteSubscriber } from "../../utils/session";
import iryaSaudando from "../../../assets/irya-saudando.png";

const PILAR_COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];
const IRYA_WHATSAPP_URL = `https://wa.me/5511921999504?text=${encodeURIComponent(
  "Irya, finalizei o preenchimento do MEV",
)}`;

type FaixaNarrativa = {
  badge: string;
  titulo: string;
  mensagem: string;
  proximoPasso: string;
  accentClass: string;
};

type PilarNarrativa = {
  nivel: string;
  mensagem: string;
};

const formatAltura = (altura: number | null): string => {
  if (altura === null || Number.isNaN(altura)) return "Não registrada";
  return `${altura.toFixed(2).replace(".", ",")} m`;
};

const formatImc = (imc: number | null): string => {
  if (imc === null || Number.isNaN(imc)) return "Não calculado";
  return imc.toFixed(1).replace(".", ",");
};

const formatPercentual = (valor: number | null): string => {
  if (valor === null || Number.isNaN(valor)) return "-";
  return `${valor.toFixed(1).replace(".", ",")}%`;
};

const formatNotaDez = (valor: number | null): string => {
  if (valor === null || Number.isNaN(valor)) return "-";
  return valor.toFixed(1).replace(".", ",");
};

const getImcClassificacao = (imc: number | null): string => {
  if (imc === null || Number.isNaN(imc)) return "";
  if (imc < 18.5) return "Abaixo do ideal";
  if (imc < 25) return "Faixa saudável";
  if (imc < 30) return "Acima do ideal";
  if (imc < 35) return "Obesidade I";
  if (imc < 40) return "Obesidade II";
  return "Obesidade III";
};

const getFaixaNarrativa = (percentual: number): FaixaNarrativa => {
  if (percentual <= 20) {
    return {
      badge: "Momento de Recomeço",
      titulo: "Você tem espaço real para evoluir",
      mensagem:
        "Seu resultado mostra que este é um ótimo ponto de virada. Pequenos ajustes consistentes já podem gerar mudanças importantes.",
      proximoPasso:
        "Comece com 1 hábito simples por vez e mantenha por 7 dias antes de avançar para o próximo.",
      accentClass: "border-l-[#cf5a5a]",
    };
  }

  if (percentual <= 40) {
    return {
      badge: "Base em Construção",
      titulo: "Você está perto de uma vida mais equilibrada",
      mensagem:
        "Existe progresso acontecendo. Com mais constância nas rotinas essenciais, seu bem-estar tende a crescer rápido.",
      proximoPasso:
        "Priorize sono e alimentação nesta semana. Fortalecer a base acelera todo o resto.",
      accentClass: "border-l-[#e68c3f]",
    };
  }

  if (percentual <= 60) {
    return {
      badge: "Ritmo de Equilíbrio",
      titulo: "Você está no caminho certo",
      mensagem:
        "Seu cenário já mostra estabilidade em áreas importantes. O foco agora é reduzir oscilações e manter o ritmo.",
      proximoPasso:
        "Escolha 1 pilar que está abaixo dos outros e concentre energia nele pelos próximos dias.",
      accentClass: "border-l-[#d8ad35]",
    };
  }

  if (percentual <= 80) {
    return {
      badge: "Fase de Consolidação",
      titulo: "Sua rotina já sustenta bons resultados",
      mensagem:
        "Você está em um nível muito positivo. A meta agora é transformar bons comportamentos em padrão de longo prazo.",
      proximoPasso:
        "Mantenha o que já funciona e ajuste apenas pontos específicos para evitar recaídas.",
      accentClass: "border-l-[#7fa04f]",
    };
  }

  return {
    badge: "Vitalidade em Alta",
    titulo: "Seu estilo de vida está muito bem alinhado",
    mensagem:
      "Parabéns. Você alcançou um nível forte de equilíbrio e vitalidade. Continue refinando sem perder a leveza.",
    proximoPasso:
      "Use essa fase para consolidar hábitos-chave e apoiar outras áreas com micro ajustes.",
    accentClass: "border-l-[#4caf50]",
  };
};

const getPilarNarrativa = (percentual: number): PilarNarrativa => {
  if (percentual <= 20) {
    return {
      nivel: "Atenção Prioritária",
      mensagem: "Esse pilar pede cuidado imediato. Pequenos passos diários farão diferença.",
    };
  }

  if (percentual <= 40) {
    return {
      nivel: "Em Desenvolvimento",
      mensagem: "Você já começou a evoluir aqui. Falta consistência para virar rotina.",
    };
  }

  if (percentual <= 60) {
    return {
      nivel: "Em Progresso",
      mensagem: "Há bons sinais neste pilar. Ajustes pontuais podem elevar seu resultado.",
    };
  }

  if (percentual <= 80) {
    return {
      nivel: "Bem Estruturado",
      mensagem: "Esse pilar está sólido. Mantenha constância para não perder tração.",
    };
  }

  return {
    nivel: "Ponto Forte",
    mensagem: "Excelente consistência. Use este pilar como referência para os demais.",
  };
};

const Resultado: React.FC = () => {
  const navigate = useNavigate();
  const { status, loading, error } = useQuestionarioStatus();
  const isSubscriber = isPacienteSubscriber();

  const resultadoData = status?.resultadoAnterior;
  const alturaM = status?.alturaM ?? resultadoData?.alturaM ?? null;
  const imcAtual = status?.imcAtual ?? resultadoData?.imcAtual ?? null;

  const chartData = useMemo(() => {
    if (!resultadoData) return [];

    return resultadoData.detalhesPilares.map((pilar, index) => ({
      name: pilar.nome,
      value: pilar.percentualPilar,
      pontuacaoObtida: pilar.pontuacaoObtida,
      pontuacaoMaxima: pilar.pontuacaoMaxima,
      fill: PILAR_COLORS[index % PILAR_COLORS.length],
      fullMark: 100,
      ...getPilarNarrativa(pilar.percentualPilar),
    }));
  }, [resultadoData]);

  const mediaPilaresPercentual = useMemo(() => {
    if (!chartData.length) return null;
    const total = chartData.reduce((acumulado, item) => acumulado + item.value, 0);
    return total / chartData.length;
  }, [chartData]);

  const mediaPilaresNotaDez = useMemo(() => {
    if (mediaPilaresPercentual === null) return null;
    return mediaPilaresPercentual / 10;
  }, [mediaPilaresPercentual]);

  if (loading) {
    return <Loading />;
  }

  if (error || !resultadoData) {
    return (
      <Container>
        <div className="mx-auto w-full max-w-[820px]">
          <BackButton />
          <div className="rounded-xl border border-white/70 bg-white/72 p-5 shadow-[0_14px_34px_rgba(24,28,20,0.12)] backdrop-blur-md sm:p-6">
            <h1 className="text-xl font-semibold text-[#3f4c36] sm:text-2xl">Sem resultados disponíveis</h1>
            <p className="mt-2 text-sm text-[#5a6251] sm:text-base">
              Você ainda não concluiu a avaliação ou não há resultados para exibir.
            </p>
            <Button
              onClick={() => navigate("/questionario")}
              variant="primary"
              label="Responder Avaliação"
              className="mt-5"
            />
          </div>
        </div>
      </Container>
    );
  }

  const { percentualGlobal, classificacao, dataConclusao } = resultadoData;
  const narrativaGlobal = getFaixaNarrativa(percentualGlobal);
  const percentualGlobalResumo = Math.round(percentualGlobal);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Container>
      <div className="mx-auto w-full max-w-[980px]">
        <BackButton />

        <h1 className="irya-heading text-2xl sm:text-3xl">
          Prontinho! Confira o seu resultado abaixo.
        </h1>
        <p className="mt-1 text-sm text-[#7c9d72] sm:text-base">
          Última atualização: {formatDate(dataConclusao)}
        </p>

        <div
          className={`mt-5 rounded-[32px] border border-[#f1e3b9] border-l-[6px] bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(244,238,216,0.82)_100%)] p-5 shadow-[0_8px_24px_rgba(74,93,79,0.14)] sm:p-6 ${narrativaGlobal.accentClass}`}
        >
          <div>
            <p className="inline-flex rounded-full bg-[#fffaf1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7c9d72]">
              {narrativaGlobal.badge}
            </p>

            <h2 className="mt-3 font-['Libre_Baskerville',serif] text-2xl font-bold text-[#4a5d4f] sm:text-3xl">
              {narrativaGlobal.titulo}
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-[#4a5d4f] sm:text-base">
              {narrativaGlobal.mensagem}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-[#f1e3b9] bg-[#fffaf1] p-4">
            <p className="irya-section-label text-[0.75rem]">
              Próximo passo sugerido
            </p>
            <p className="mt-1 text-sm text-[#4a5d4f] sm:text-base">{narrativaGlobal.proximoPasso}</p>
          </div>

          <p className="mt-4 text-xs text-[#7c9d72] sm:text-sm">
            Classificação técnica atual: <b>{classificacao}</b>
          </p>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#f1e3b9] bg-[#fffaf1] p-3">
              <p className="irya-section-label text-[0.75rem]">
                Altura considerada
              </p>
              <p className="mt-1 text-sm font-semibold text-[#4a5d4f] sm:text-base">
                {formatAltura(alturaM)}
              </p>
            </div>
            <div className="rounded-2xl border border-[#f1e3b9] bg-[#fffaf1] p-3">
              <p className="irya-section-label text-[0.75rem]">
                IMC atual
              </p>
              <p className="mt-1 text-sm font-semibold text-[#4a5d4f] sm:text-base">
                {formatImc(imcAtual)}
                {imcAtual !== null && (
                    <span className="ml-1 font-medium text-[#7c9d72]">
                    ({getImcClassificacao(imcAtual)})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <h3 className="mt-7 border-b border-b-[#cea952] pb-2 font-['Libre_Baskerville',serif] text-lg font-normal text-[#4a5d4f] sm:mt-8 sm:text-xl">
          Leitura por Pilar
        </h3>

        <div className="mt-3 rounded-[32px] border border-[#f1e3b9] bg-white/88 p-3 shadow-[0_8px_24px_rgba(74,93,79,0.14)] backdrop-blur-md sm:p-4">
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-[#f1e3b9] bg-[#fffaf1] px-3 py-2.5 sm:px-4">
            <p className="irya-section-label text-[0.75rem] sm:text-sm">
              Nota final (média dos pilares)
            </p>
            <div className="text-right">
              <p className="text-sm font-bold text-[#4a5d4f] sm:text-base">
                {formatPercentual(mediaPilaresPercentual)}
              </p>
              <p className="text-xs font-medium text-[#7c9d72] sm:text-sm">
                {formatNotaDez(mediaPilaresNotaDez)} / 10
              </p>
            </div>
          </div>

          <div className="h-[320px] sm:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="20%"
                outerRadius="80%"
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background dataKey="value" />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {chartData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-2xl border border-[#f1e3b9] bg-[#fffaf1] px-3 py-2 text-sm"
              >
                <span className="inline-flex items-center gap-2 text-[#4a5d4f]">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  {item.name}
                </span>
                <span className="font-semibold text-[#4a5d4f]">
                  {item.pontuacaoObtida}/{item.pontuacaoMaxima}
                </span>
              </div>
            ))}
          </div>
        </div>

        <h3 className="mt-7 border-b border-b-[#cea952] pb-2 font-['Libre_Baskerville',serif] text-lg font-normal text-[#4a5d4f] sm:mt-8 sm:text-xl">
          Insights por Pilar
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-3">
          {resultadoData.detalhesPilares.map((pilar) => {
            const narrativa = getPilarNarrativa(pilar.percentualPilar);
            return (
              <article
                key={pilar.nome}
                className="rounded-[28px] border border-[#f1e3b9] bg-white/88 p-4 shadow-[0_4px_16px_rgba(74,93,79,0.1)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-base font-semibold text-[#4a5d4f]">{pilar.nome}</h4>
                  <span className="rounded-full bg-[#fffaf1] px-2.5 py-1 text-xs font-semibold text-[#7c9d72]">
                    {narrativa.nivel}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#4a5d4f] sm:text-base">
                  {narrativa.mensagem}
                </p>
              </article>
            );
          })}
        </div>

        {!isSubscriber && (
          <section className="mt-8 rounded-[32px] border border-[#f1e3b9] bg-white/88 p-5 shadow-[0_8px_24px_rgba(74,93,79,0.14)] sm:p-6">
            <p className="irya-section-label">
              Seu potencial de evolução
            </p>
            <h4 className="mt-2 font-['Libre_Baskerville',serif] text-xl font-normal text-[#4a5d4f] sm:text-2xl">
              Você tem espaço real para avançar com consistência.
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-[#4a5d4f] sm:text-base">
              Hoje seu índice geral de consistência é <b>{percentualGlobalResumo}%</b>.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#4a5d4f] sm:text-base">
              Com ajustes simples de rotina e acompanhamento diário, mulheres no mesmo cenário
              costumam atingir <b>70% a 80%</b> em poucos meses.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#4a5d4f] sm:text-base">
              O plano Premium da IRYA foi criado exatamente para ajudar você a fazer essa evolução
              acontecer.
            </p>
          </section>
        )}

        {!isSubscriber && (
          <section className="mt-8 rounded-[32px] border border-[#f1e3b9] bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(244,238,216,0.74)_100%)] p-5 shadow-[0_8px_32px_rgba(74,93,79,0.16)] sm:p-6">
            <h4 className="font-['Libre_Baskerville',serif] text-xl font-normal text-[#4a5d4f] sm:text-2xl">
              Seu plano personalizado já está pronto
            </h4>

            <div className="mt-4 rounded-[28px] border border-[#f1e3b9] bg-white/90 p-4 shadow-[0_4px_16px_rgba(74,93,79,0.12)] sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <img
                  src={iryaSaudando}
                  alt="Irya apresentando o plano personalizado"
                  className="h-16 w-16 shrink-0 rounded-full border-2 border-[#e4c884] object-cover object-[50%_24%] shadow-[0_10px_20px_rgba(74,93,79,0.18)] sm:h-20 sm:w-20"
                />
                <div className="relative flex-1 rounded-[24px] border border-[#f1e3b9] bg-[#fffefb] p-3 text-sm leading-relaxed text-[#4a5d4f] sm:text-base">
                  <div className="absolute -left-2 top-5 h-4 w-4 rotate-45 border-b border-l border-[#f1e3b9] bg-[#fffefb]" />
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7c9d72]">Irya</p>
                  <p className="mt-1">
                    Eu analisei seu resultado e organizei um plano simples para melhorar seus
                    pilares de saúde.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-5 irya-section-label">
              Plano criado a partir do seu resultado
            </p>

            <div className="relative mt-3 overflow-hidden rounded-[28px] border border-[#f1e3b9] bg-white/88 p-4">
              <div className="pointer-events-none absolute inset-0 z-20 bg-white/25 backdrop-blur-[4px]" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-16 bg-gradient-to-t from-[#edf4e0] to-transparent" />

              <div className="relative z-10 grid gap-2 text-sm text-[#4f5a45] sm:grid-cols-2">
                <div className="rounded-lg border border-[#e5ebdb] bg-[#f8fbf3] p-3">
                  Pilar prioritário da semana: Energia e Sono
                </div>
                <div className="rounded-lg border border-[#e5ebdb] bg-[#f8fbf3] p-3">
                  Meta semanal: rotina noturna em 3 passos
                </div>
                <div className="rounded-lg border border-[#e5ebdb] bg-[#f8fbf3] p-3">
                  Plano alimentar guiado por sintomas
                </div>
                <div className="rounded-lg border border-[#e5ebdb] bg-[#f8fbf3] p-3">
                  Ajustes de estilo de vida com acompanhamento
                </div>
              </div>

              <div className="absolute inset-0 z-40 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/assinatura")}
                className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#e4c884] bg-[#fffaf1]/95 text-[#4a5d4f] shadow-[0_10px_20px_rgba(74,93,79,0.18)] transition hover:scale-[1.04] hover:bg-white"
                  aria-label="Desbloquear plano personalizado"
                >
                  <FiLock className="h-7 w-7" />
                </button>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-2xl font-semibold text-[#4a5d4f]">R$49/mês</p>
              <p className="mt-1 text-sm text-[#4a5d4f] sm:text-base">
                Cancele com facilidade quando quiser.
              </p>
            </div>

            <Button
              onClick={() => navigate("/assinatura")}
              variant="primary"
              label="Desbloquear meu plano personalizado"
              className="mt-5"
            />
          </section>
        )}

        {status?.primeiroQuestionario && (
          <section className="mt-8 rounded-[32px] border border-[#f1e3b9] bg-white/88 p-5 text-center shadow-[0_8px_24px_rgba(74,93,79,0.14)] sm:p-6">
            <h4 className="font-['Libre_Baskerville',serif] text-xl font-normal text-[#4a5d4f] sm:text-2xl">
              Finalize seu primeiro MEV com a Irya
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-[#4a5d4f] sm:text-base">
              Avise pelo WhatsApp que você concluiu o preenchimento.
            </p>
            <a
              href={IRYA_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-[50px] border border-[#3a4d3f] bg-[#3a4d3f] px-6 py-[14px] font-['Libre_Baskerville',serif] text-base font-bold text-white shadow-[0_8px_24px_rgba(74,93,79,0.24)] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#6a8d60] hover:shadow-[0_12px_28px_rgba(74,93,79,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c9d72]/25"
            >
              Chamar a Irya no WhatsApp
            </a>
          </section>
        )}
      </div>
    </Container>
  );
};

export default Resultado;
