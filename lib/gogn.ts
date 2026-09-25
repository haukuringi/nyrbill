import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Gerd, Umbod, Stillingar } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

function lesa<T>(nafn: string): T {
  const skra = path.join(DATA_DIR, nafn);
  return JSON.parse(fs.readFileSync(skra, "utf-8")) as T;
}

export function saekjaBila(): Gerd[] {
  return lesa<Gerd[]>("bilar.json");
}

export function saekjaUmbod(): Umbod[] {
  return lesa<Umbod[]>("umbod.json");
}

export function saekjaStillingar(): Stillingar {
  return lesa<Stillingar>("stillingar.json");
}

export function finnaGerd(id: string): Gerd | undefined {
  return saekjaBila().find((g) => g.id === id);
}

export function utfaerslaUppfletting(bilar: Gerd[]): Map<string, { gerd: Gerd; utfaersla: Gerd["utfaerslur"][number] }> {
  const map = new Map<string, { gerd: Gerd; utfaersla: Gerd["utfaerslur"][number] }>();
  for (const gerd of bilar) {
    for (const utf of gerd.utfaerslur) {
      map.set(utf.id, { gerd, utfaersla: utf });
    }
  }
  return map;
}
