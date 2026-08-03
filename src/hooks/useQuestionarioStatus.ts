import { useState, useEffect, useCallback } from "react";
import api from "../api";

export interface DetalhePilar {
  nome: string;
  pontuacaoObtida: number;
  pontuacaoMaxima: number;
  percentualPilar: number;
}

export interface ResultadoData {
  questionarioId: number;
  dataConclusao: string;
  dataLimite?: string;
  pontuacaoTotal: number;
  percentualGlobal: number;
  classificacao: string;
  alturaM?: number | null;
  imcAtual?: number | null;
  detalhesPilares: DetalhePilar[];
}

interface QuestionarioStatus {
  podeResponder: boolean;
  primeiroQuestionario: boolean;
  resultadoAnterior: ResultadoData | null;
  pesoAtualKg: number | null;
  variacaoPesoKg: number | null;
  alturaM: number | null;
  imcAtual: number | null;
}

export const useQuestionarioStatus = (enabled = true) => {
  const [status, setStatus] = useState<QuestionarioStatus | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string>("");

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get<QuestionarioStatus>("/questionario/status");
      setStatus(response.data);
    } catch {
      setError("Erro ao verificar status da avaliação.");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setStatus(null);
      setError("");
      return;
    }

    fetchStatus();
  }, [enabled, fetchStatus]);

  return { status, loading, error, refetch: fetchStatus };
};
