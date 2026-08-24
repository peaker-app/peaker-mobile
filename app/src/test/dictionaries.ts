import ar from "../../messages/ar.json";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import fr from "../../messages/fr.json";
import zh from "../../messages/zh.json";
import type { Locale } from "@/i18n/config";

export const dictionaries: Record<Locale, typeof en> = { en, es, zh, fr, ar };
