import {
  AdViewGroupItem,
  AdViewSelectionPlan,
  AdViewSelectionStage,
  AdViewSourceRef,
} from 'typings';

export type ResolvedSourceRef = {
  source: string;
  weight: number;
};

export type WeightedItem = {
  item: AdViewGroupItem;
  weight: number;
  source: string;
};

/** Normalize a SourceRef to `{ source, weight }` (weight 0 stays 0). */
export function resolveSourceRef(
  ref: AdViewSourceRef,
  fallbackWeight?: number,
): ResolvedSourceRef {
  if (typeof ref === 'string') {
    return {
      source: ref,
      weight: fallbackWeight !== undefined ? fallbackWeight : 1,
    };
  }
  const w =
    ref.weight !== undefined
      ? ref.weight
      : fallbackWeight !== undefined
        ? fallbackWeight
        : 1;
  return { source: ref.source, weight: w };
}

/** True when value looks like a SelectionPlan (array), not a legacy algorithm. */
export function isSelectionPlan(value: unknown): value is AdViewSelectionPlan {
  return Array.isArray(value);
}

export function normalizeStage(stage: AdViewSelectionStage): AdViewSourceRef[] {
  return Array.isArray(stage) ? stage : [stage];
}

export function isMultiSourceStage(stage: AdViewSelectionStage): boolean {
  return Array.isArray(stage);
}

/**
 * Weighted shuffle without replacement: at each step pick item i with
 * probability w_i / sum(w), until `limit` items or the pool is empty.
 * Items with weight <= 0 are excluded.
 */
export function weightedShuffle(
  items: WeightedItem[],
  limit: number,
  random: () => number = Math.random,
): AdViewGroupItem[] {
  const pool = items.filter(entry => entry.weight > 0);
  const picked: AdViewGroupItem[] = [];

  while (picked.length < limit && pool.length > 0) {
    const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
    if (total <= 0) {
      break;
    }
    let ticket = random() * total;
    let index = 0;
    for (; index < pool.length; index++) {
      ticket -= pool[index]!.weight;
      if (ticket <= 0) {
        break;
      }
    }
    if (index >= pool.length) {
      index = pool.length - 1;
    }
    const [chosen] = pool.splice(index, 1);
    if (chosen) {
      picked.push(chosen.item);
    }
  }

  return picked;
}

/** Drop duplicate ids, keeping the first occurrence. */
export function dedupeById(items: AdViewGroupItem[]): AdViewGroupItem[] {
  const seen = new Set<string>();
  const out: AdViewGroupItem[] = [];
  for (const item of items) {
    if (seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    out.push(item);
  }
  return out;
}
