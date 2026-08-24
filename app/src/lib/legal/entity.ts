export const pendingMarker = "[PENDIENTE";

export interface LegalEntity {
  holder: string;
  taxId: string;
  address: string;
  email: string;
  dpo?: string;
}

const placeholders: LegalEntity = {
  holder: "[PENDIENTE: nombre o razón social del titular]",
  taxId: "[PENDIENTE: NIF]",
  address: "[PENDIENTE: domicilio completo]",
  email: "[PENDIENTE: correo de contacto]",
};

export const legalEntity: LegalEntity = {
  holder: import.meta.env.VITE_LEGAL_HOLDER || placeholders.holder,
  taxId: import.meta.env.VITE_LEGAL_TAX_ID || placeholders.taxId,
  address: import.meta.env.VITE_LEGAL_ADDRESS || placeholders.address,
  email: import.meta.env.VITE_LEGAL_EMAIL || placeholders.email,
  dpo: import.meta.env.VITE_LEGAL_DPO || undefined,
};

export const termsVersion = "2026-08-11";

export const lastUpdated = "2026-08-11";

export const authoritativeLocale = "es";

export const unresolvedLegalFields = (
  entity: LegalEntity = legalEntity,
): readonly string[] =>
  Object.entries(entity)
    .filter(([, value]) => typeof value === "string" && value.includes(pendingMarker))
    .map(([field]) => field);
