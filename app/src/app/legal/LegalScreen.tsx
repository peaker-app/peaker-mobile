import {
  LegalDocument,
  type LegalDocumentId,
} from "@/components/features/legal/LegalDocument";

export const LegalScreen = ({ id }: { id: LegalDocumentId }) => (
  <main className="flex flex-1 flex-col p-6">
    <LegalDocument id={id} />
  </main>
);
