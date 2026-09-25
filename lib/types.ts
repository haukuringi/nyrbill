export interface Utfaersla {
  id: string;
  heiti: string;
  verd: number;
  styrkhaef: boolean;
  verd_med_styrk: number;
  orkugjafi: string;
  drif: string;
  hestofl: number | null;
  rafhlada_kwh: number | null;
  draegni_km: number | null;
  eydsla_l_100km: number | null;
  saeti: number | null;
  farangursrymi_l: number | null;
  hrodun_0_100_s: number | null;
  heimild: string;
  uppfaert: string;
}

export interface Gerd {
  id: string;
  merki: string;
  gerd: string;
  umbod: string;
  flokkur: string;
  arsgerd: number;
  utfaerslur: Utfaersla[];
  verd_fra: number;
  verd_med_styrk_fra: number;
  uppfaert: string;
}

export interface Umbod {
  id: string;
  nafn: string;
  vefsida: string;
}

export interface Stillingar {
  rafbilastyrkur: {
    upphaed: number;
    verdthak: number;
    heimild: string;
  };
  buid_til: string;
}
