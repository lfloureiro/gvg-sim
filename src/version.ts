// Atualiza sÃ³ este ficheiro quando quiseres mudar a versÃ£o.
// Regra simples:
// - patch: correÃ§Ãµes pequenas ou ajustes visuais -> 3.4.1
// - minor: rebrand / pequenas funcionalidades -> 3.5.0
// - major: mudanÃ§a grande de lÃ³gica/estrutura -> 4.0.0

export const APP_VERSION = {
  major: 3,
  minor: 4,
  patch: 0,
} as const;

export const APP_VERSION_STRING = `${APP_VERSION.major}.${APP_VERSION.minor}.${APP_VERSION.patch}`;

export const BRAND_TITLE = "MF69";
export const BRAND_MOTTO = "United under one banner.";

// Mantido para compatibilidade com componentes existentes.
// Numa fase posterior podemos renomear PHOENIX_* para BRAND_*.
export const PHOENIX_TITLE = BRAND_TITLE;
export const PHOENIX_MOTTO = BRAND_MOTTO;
