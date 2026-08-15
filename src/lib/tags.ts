import { CATEGORIES, type CategoryId, type SaleTag } from "../types";

const KEYWORDS: Array<{ id: CategoryId; patterns: RegExp[] }> = [
  {
    id: "electronics",
    patterns: [
      /\belectronics?\b/i,
      /\bstereos?\b/i,
      /\baudio\b/i,
      /\bcomputers?\b/i,
      /\blaptops?\b/i,
      /\bradios?\b/i,
      /\btvs?\b/i,
      /\btelevisions?\b/i,
      /\bconsoles?\b/i,
      /\bnintendo\b/i,
      /\bplaystation\b/i,
      /\bxbox\b/i,
    ],
  },
  {
    id: "crts",
    patterns: [/\bcrts?\b/i, /\btube\s+tvs?\b/i],
  },
  {
    id: "cameras",
    patterns: [/\bcameras?\b/i, /\bphotography\b/i, /\bphoto(?:s|graphy)?\b/i],
  },
  {
    id: "games",
    patterns: [
      /\bgames?\b/i,
      /\bconsoles?\b/i,
      /\bnintendo\b/i,
      /\bplaystation\b/i,
      /\bxbox\b/i,
      /\bsega\b/i,
    ],
  },
  {
    id: "vintage",
    patterns: [
      /\bvintage\b/i,
      /\bantiques?\b/i,
      /\bpickin[g']?\b/i,
      /\b50\s+years\b/i,
    ],
  },
  {
    id: "clothing",
    patterns: [/\bcloth(?:es|ing)\b/i, /\bapparel\b/i, /\bwardrobe\b/i],
  },
  {
    id: "jewelry",
    patterns: [/\bjewel(?:ry|lery|s)?\b/i],
  },
  {
    id: "tools",
    patterns: [/\btools?\b/i, /\btoolbox\b/i],
  },
  {
    id: "furniture",
    patterns: [/\bfurniture\b/i, /\bsofas?\b/i, /\bdressers?\b/i],
  },
  {
    id: "toys",
    patterns: [/\btoys?\b/i, /\bhobby\s+room\b/i],
  },
  {
    id: "records",
    patterns: [/\brecords?\b/i, /\bvinyl\b/i, /\blps?\b/i],
  },
];

const LABEL = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category.label]),
) as Record<CategoryId, string>;

export function inferTags(text: string): SaleTag[] {
  const found = new Map<CategoryId, SaleTag>();

  for (const { id, patterns } of KEYWORDS) {
    if (patterns.some((pattern) => pattern.test(text))) {
      found.set(id, { id, label: LABEL[id], inferred: true });
    }
  }

  return CATEGORIES.map((category) => found.get(category.id)).filter(
    (tag): tag is SaleTag => Boolean(tag),
  );
}

export function saleMatchesCategories(
  tags: SaleTag[],
  selected: CategoryId[],
): boolean {
  if (selected.length === 0) return true;
  const have = new Set(tags.map((tag) => tag.id));
  return selected.some((id) => have.has(id));
}
