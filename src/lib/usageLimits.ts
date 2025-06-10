
// src/lib/usageLimits.ts

type FeatureKey = 'quiz' | 'guessTheText' | 'whoSaidThis' | 'trueFalse' | 'personalizedPrayer';
type Period = 'daily' | 'weekly';

interface UsageRecord {
  count: number;
  // Para 'daily', a data no formato YYYY-MM-DD
  // Para 'weekly', o ano e o número da semana, ex: YYYY-WW
  lastResetDate: string; 
}

const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekNumberString = (date: Date): string => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`;
};

const getCurrentPeriodKey = (period: Period): string => {
  if (period === 'daily') {
    return getTodayDateString();
  } else { // weekly
    return getWeekNumberString(new Date());
  }
};

const getStorageKey = (userId: string, featureKey: FeatureKey): string => {
  return `usage_${userId}_${featureKey}`;
};

/**
 * Verifica se o usuário pode usar uma funcionalidade baseada nos limites.
 * @param userId ID do usuário.
 * @param featureKey Chave da funcionalidade (ex: 'quiz').
 * @param limit Limite de uso para o período.
 * @param period 'daily' ou 'weekly'.
 * @returns true se o usuário PODE usar, false caso contrário.
 */
export function canUseFeature(userId: string, featureKey: FeatureKey, limit: number, period: Period): boolean {
  if (typeof window === 'undefined') return true; // Permite no lado do servidor ou se o localStorage não estiver disponível

  const storageKey = getStorageKey(userId, featureKey);
  const currentPeriod = getCurrentPeriodKey(period);
  
  try {
    const rawRecord = localStorage.getItem(storageKey);
    if (!rawRecord) {
      return true; // Nenhum registro, pode usar
    }

    const record = JSON.parse(rawRecord) as UsageRecord;

    if (record.lastResetDate !== currentPeriod) {
      // Período diferente, reseta o contador implicitamente
      return true; 
    }

    return record.count < limit;

  } catch (error) {
    console.error("Erro ao ler o limite de uso do localStorage:", error);
    return true; // Em caso de erro, permite o uso para não bloquear o usuário indevidamente
  }
}

/**
 * Registra o uso de uma funcionalidade.
 * @param userId ID do usuário.
 *   * @param featureKey Chave da funcionalidade (ex: 'quiz').
 * @param period 'daily' ou 'weekly'.
 */
export function recordFeatureUsage(userId: string, featureKey: FeatureKey, period: Period): void {
  if (typeof window === 'undefined') return;

  const storageKey = getStorageKey(userId, featureKey);
  const currentPeriod = getCurrentPeriodKey(period);
  let newRecord: UsageRecord;

  try {
    const rawRecord = localStorage.getItem(storageKey);
    if (rawRecord) {
      const record = JSON.parse(rawRecord) as UsageRecord;
      if (record.lastResetDate === currentPeriod) {
        newRecord = { ...record, count: record.count + 1 };
      } else {
        // Novo período, reseta o contador
        newRecord = { count: 1, lastResetDate: currentPeriod };
      }
    } else {
      // Primeiro uso
      newRecord = { count: 1, lastResetDate: currentPeriod };
    }
    localStorage.setItem(storageKey, JSON.stringify(newRecord));
  } catch (error) {
    console.error("Erro ao registrar o uso no localStorage:", error);
  }
}


// Definição dos planos e seus limites específicos (pode vir de um config central no futuro)
export const USER_PLANS_CONFIG: Record<string, { name: string; limits: Record<FeatureKey, { limit: number; period: Period } | null >}> = {
  free: {
    name: "Usuário Free",
    limits: {
      quiz: { limit: 5, period: 'daily' },
      guessTheText: { limit: 3, period: 'daily' },
      whoSaidThis: { limit: 3, period: 'daily' },
      trueFalse: { limit: 3, period: 'daily' },
      personalizedPrayer: { limit: 1, period: 'weekly' },
    }
  },
  peregrino_digital: {
    name: "Peregrino Digital",
    limits: {
      quiz: null, // Ilimitado
      guessTheText: null,
      whoSaidThis: null,
      trueFalse: null,
      personalizedPrayer: { limit: 7, period: 'weekly' }, // Exemplo: 1 por dia
    }
  },
  mestre_escrituras: {
    name: "Mestre das Escrituras",
    limits: {
      quiz: null,
      guessTheText: null,
      whoSaidThis: null,
      trueFalse: null,
      personalizedPrayer: null,
    }
  }
};

/**
 * Obtém o limite para uma dada funcionalidade e plano de usuário.
 * @param planId 'free', 'peregrino_digital', etc.
 * @param featureKey A chave da funcionalidade.
 * @returns O objeto de limite { limit: number, period: Period } ou null se for ilimitado.
 */
export function getFeatureLimitConfig(planId: string | undefined, featureKey: FeatureKey): { limit: number; period: Period } | null {
  const safePlanId = planId || 'free'; // Default para 'free' se o plano for undefined
  const planConfig = USER_PLANS_CONFIG[safePlanId] || USER_PLANS_CONFIG.free; // Fallback para config 'free'
  return planConfig.limits[featureKey] || null;
}
