// Atualiza só este ficheiro quando quiseres mudar a versão.
// Regra simples:
// - patch: correções pequenas ou ajustes visuais -> 1.1.1
// - minor: novas funcionalidades pequenas/médias -> 1.2.0
// - major: mudança grande de lógica/estrutura -> 2.0.0

export const APP_VERSION = {
  major: 1,
  minor: 4,
  patch: 0,
} as const;

export const APP_VERSION_STRING = `${APP_VERSION.major}.${APP_VERSION.minor}.${APP_VERSION.patch}`;

export const PHOENIX_TITLE = "PHOENIX VERITAS";
export const PHOENIX_MOTTO = "Forged in fire, united in truth.";