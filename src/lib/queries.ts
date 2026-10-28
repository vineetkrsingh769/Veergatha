import { queryOptions } from "@tanstack/react-query";
import {
  getHomeData,
  getMemorial,
  getRecipient,
  getWar,
  listMedia,
  listMemorials,
  listRecipients,
  listWars,
  searchArchive,
  type RecipientFilters,
} from "./archive.functions";

const STALE = 60_000;

export const homeQuery = () => queryOptions({ queryKey: ["home"], queryFn: () => getHomeData(), staleTime: STALE });
export const recipientsQuery = (f: RecipientFilters) =>
  queryOptions({ queryKey: ["recipients", f], queryFn: () => listRecipients({ data: f }), staleTime: STALE });
export const recipientQuery = (slug: string) =>
  queryOptions({ queryKey: ["recipient", slug], queryFn: () => getRecipient({ data: { slug } }), staleTime: STALE });
export const memorialsQuery = () => queryOptions({ queryKey: ["memorials"], queryFn: () => listMemorials(), staleTime: STALE });
export const memorialQuery = (slug: string) =>
  queryOptions({ queryKey: ["memorial", slug], queryFn: () => getMemorial({ data: { slug } }), staleTime: STALE });
export const warsQuery = () => queryOptions({ queryKey: ["wars"], queryFn: () => listWars(), staleTime: STALE });
export const warQuery = (slug: string) =>
  queryOptions({ queryKey: ["war", slug], queryFn: () => getWar({ data: { slug } }), staleTime: STALE });
export const mediaQuery = () => queryOptions({ queryKey: ["media"], queryFn: () => listMedia(), staleTime: STALE });
export const searchQuery = (q: string) =>
  queryOptions({ queryKey: ["search", q], queryFn: () => searchArchive({ data: { q } }), staleTime: STALE });
