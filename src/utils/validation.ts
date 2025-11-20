/**
 * Validações de formato para formulários
 */

/**
 * Valida formato de placa de veículo brasileira
 * Aceita dois formatos:
 * - Placa antiga: ABC-1234 (3 letras, hífen, 4 números)
 * - Placa Mercosul: ABC1D23 (3 letras, 1 número, 1 letra, 2 números)
 * @param plate - A placa a ser validada (sem espaços)
 * @returns true se a placa está válida, false caso contrário
 */
export const isValidPlate = (plate: string): boolean => {
  if (!plate) return false;

  // Remove espaços em branco
  const cleanedPlate = plate.trim().toUpperCase();

  // Regex para placa antiga: ABC-1234
  const oldFormatRegex = /^[A-Z]{3}-\d{4}$/;

  // Regex para placa Mercosul: ABC1D23
  const mercosulFormatRegex = /^[A-Z]{3}\d[A-Z]\d{2}$/;

  return (
    oldFormatRegex.test(cleanedPlate) || mercosulFormatRegex.test(cleanedPlate)
  );
};

/**
 * Valida formato de telefone brasileiro
 * Aceita apenas o formato: (DDD) 99999-9999
 * - Onde DDD é 2 dígitos
 * - 9 dígitos do número (começando com 9 para celular)
 * @param phone - O telefone a ser validado (ex: "(061) 99234-1149")
 * @returns true se o telefone está válido, false caso contrário
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;

  // Regex para formato (DDD) 99999-9999
  // (XX) - parênteses com 2 dígitos
  // espaço
  // 9 - começa com 9 (celular)
  // XXXX - 4 dígitos
  // - hífen
  // XXXX - 4 dígitos
  const phoneRegex = /^\(\d{2}\)\s9\d{4}-\d{4}$/;

  return phoneRegex.test(phone);
};

/**
 * Formata placa automaticamente enquanto o usuário digita
 * Se digita "ABC1234", converte para "ABC-1234" (formato antigo)
 * Se digita "ABC1D23", mantém "ABC1D23" (formato Mercosul)
 * @param input - O valor digitado pelo usuário
 * @returns A placa formatada
 */
export const formatPlateInput = (input: string): string => {
  if (!input) return "";

  // Remove caracteres especiais e espaços
  let cleaned = input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  // Se tem 7 caracteres e parece ser placa antiga (ABC1234)
  if (cleaned.length === 7) {
    // Tenta detectar se é placa antiga (3 letras + 4 números)
    const oldFormatPattern = /^[A-Z]{3}\d{4}$/;
    if (oldFormatPattern.test(cleaned)) {
      return `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
    }
  }

  // Se tem 7 caracteres e é Mercosul (ABC1D23)
  if (cleaned.length === 7) {
    const mercosulPattern = /^[A-Z]{3}\d[A-Z]\d{2}$/;
    if (mercosulPattern.test(cleaned)) {
      return cleaned;
    }
  }

  // Se tem 8 caracteres com hífen (já formatado como placa antiga)
  if (cleaned.length === 8 && cleaned.includes("-")) {
    return cleaned;
  }

  return cleaned;
};

/**
 * Formata telefone automaticamente no formato (DDD) 99999-9999
 * Converte "06199234149" para "(061) 99234-1149"
 * @param input - O valor digitado pelo usuário
 * @returns O telefone formatado ou entrada sem formatação se incompleta
 */
export const formatPhoneInput = (input: string): string => {
  if (!input) return "";

  // Remove caracteres especiais
  const cleaned = input.replace(/\D/g, "");

  // Se tem menos de 10 dígitos, retorna sem formatação
  if (cleaned.length < 10) {
    return cleaned;
  }

  // Se tem 11 dígitos (com 9), formata como (DDD) 99999-9999
  if (cleaned.length >= 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(
      2,
      7
    )}-${cleaned.substring(7, 11)}`;
  }

  return cleaned;
};

/**
 * Obtém mensagem de erro de validação amigável
 * @param field - O campo que está com erro
 * @param validationType - O tipo de validação que falhou
 * @returns Uma mensagem amigável para o usuário
 */
export const getValidationErrorMessage = (
  field: string,
  validationType: "plate" | "phone" | "required"
): string => {
  const messages: Record<string, Record<string, string>> = {
    plate: {
      plate: "Placa deve estar em formato ABC-1234 ou ABC1D23",
      required: "Placa é obrigatória",
    },
    phone: {
      phone: "Telefone deve estar em formato válido (11) 99999-9999",
      required: "Telefone é obrigatório",
    },
  };

  return messages[field]?.[validationType] || `${field} inválido`;
};
