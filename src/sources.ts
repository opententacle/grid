import { WIENER_NETZE_TARIFFS } from "./core/tariffs";
import type { Tariff } from "./core/types";
import type { MessageKey } from "./i18n/i18n";

/** Data source = export format with instructions. The parser detects the format from the file. */
export interface DataSource {
  id: string;
  label: MessageKey;
  portal?: string;
  requirements: MessageKey[];
  steps: MessageKey[];
  /** Tariff set used for the calculation (version 1: Wiener Netze only). */
  tariffs: Tariff[];
}

export const SOURCES: DataSource[] = [
  {
    id: "e-control",
    label: "source.econtrol",
    portal: "https://www.e-control.at/tarifkalkulator",
    requirements: ["ec.req.1", "ec.req.2"],
    steps: ["ec.step.1", "ec.step.2"],
    tariffs: WIENER_NETZE_TARIFFS,
  },
  {
    id: "wienernetze",
    label: "source.wienernetze",
    portal: "https://smartmeter-web.wienernetze.at/",
    requirements: ["wn.req.1", "wn.req.2"],
    steps: ["wn.step.1", "wn.step.2", "wn.step.3", "wn.step.4"],
    tariffs: WIENER_NETZE_TARIFFS,
  },
  {
    id: "at-format",
    label: "source.atformat",
    requirements: ["at.req.1", "at.req.2"],
    steps: ["at.step.1", "at.step.2", "at.step.3", "at.step.4"],
    tariffs: WIENER_NETZE_TARIFFS,
  },
];

export const sourceById = (id: string) => SOURCES.find((s) => s.id === id) ?? SOURCES[0];
