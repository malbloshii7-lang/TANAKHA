// Shared data-shape types. These mirror the JSON files in /data —
// if you edit the JSON schema, update these and src/validate.ts together.

export type Tag = 'public' | 'approx' | 'representative' | 'not-public';
export type ScenarioId = 'A' | 'B' | 'C';

export interface Zone {
  name_en: string;
  name_ar: string;
  color: string;
}

export interface Unit {
  id: string;
  zone: string;
  type:
    | 'column' | 'drum' | 'reactor' | 'tank' | 'tankfarm' | 'sphere'
    | 'box' | 'furnace' | 'flare' | 'jetty' | 'pipeline' | 'context';
  name_en: string;
  name_ar: string;
  capacity_bpd: number | null;
  capacity_note?: string;
  tag: Tag;
  tank_count?: number;
  position: [number, number, number];
  size: [number, number, number];
  description_en: string;
  description_ar: string;
  inputs: string[];
  outputs: string[];
  temp_c: string;
  pressure: string;
  why_en: string;
  heavier_en: string;
  source_refs: string[];
}

export interface UnitsData {
  zones: Record<string, Zone>;
  units: Unit[];
}

export interface StreamDef {
  name_en: string;
  name_ar: string;
  color: string;
}

export interface Flow {
  from: string;
  to: string;
  stream: string;
  volume: Record<ScenarioId, number>;
  context?: boolean;
  note_en?: string;
}

export interface FlowsData {
  streams: Record<string, StreamDef>;
  flows: Flow[];
}

export interface CrudeSpec {
  name_en: string;
  name_ar: string;
  api: number;
  sulfur_pct: number;
  tag: Tag;
  color: string;
}

export interface StatValue {
  value: number;
  tag: Tag;
  detail_en?: string;
}

export interface Scenario {
  name_en: string;
  name_ar: string;
  short_en: string;
  short_ar: string;
  feed: { crude: string; kbpd: number }[];
  tank_grades: string[];
  cdu_cuts_pct: Record<string, number>;
  yields_pct: Record<string, number>;
  stats: Record<string, StatValue>;
  why_en: string;
  why_ar: string;
}

export interface ScenariosData {
  crudes: Record<string, CrudeSpec>;
  scenarios: Record<ScenarioId, Scenario>;
  notes: Record<string, string>;
}

export interface TourStep {
  unit: string;
  title: string;
  text: string;
}

export type I18nData = Record<'en' | 'ar', Record<string, string | TourStep[]>>;

export interface AppData {
  units: UnitsData;
  flows: FlowsData;
  scenarios: ScenariosData;
  i18n: I18nData;
}
