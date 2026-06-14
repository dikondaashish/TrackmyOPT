import {
  Banknote,
  BookUser,
  ClipboardList,
  CreditCard,
  FileText,
  FolderOpen,
  Mail,
  Plane,
  Receipt,
  type LucideIcon,
} from "lucide-react";

export const DOCUMENT_TYPE_ICONS: Record<string, LucideIcon> = {
  all: FolderOpen,
  passport: BookUser,
  visa: Plane,
  i20: ClipboardList,
  ead_card: CreditCard,
  i983: FileText,
  offer_letter: Mail,
  paystub: Banknote,
  receipt_notice: Receipt,
  other: FolderOpen,
};

export function getDocumentTypeIcon(type: string): LucideIcon {
  return DOCUMENT_TYPE_ICONS[type] ?? FolderOpen;
}
