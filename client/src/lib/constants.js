/** Mirrors the server enums. Keep in sync with server/src/models/. */

export const MARTYR_STATUS = {
  FELL: "fell-in-action",
  SURVIVED: "survived",
};

/**
 * The single source of truth for how status is worded. Living recipients must
 * never be described with martyrdom language — routing every label through here
 * means that rule is enforced in one place instead of a ternary on each page.
 */
export const STATUS_LABELS = {
  [MARTYR_STATUS.FELL]: "Fell in Action",
  [MARTYR_STATUS.SURVIVED]: "Survived",
};

export const STATUS_OPTIONS = [
  { value: MARTYR_STATUS.FELL, label: STATUS_LABELS[MARTYR_STATUS.FELL] },
  { value: MARTYR_STATUS.SURVIVED, label: STATUS_LABELS[MARTYR_STATUS.SURVIVED] },
];

export const VERIFICATION_STATUS = ["draft", "in-review", "verified"];

export const SERVICE_BRANCHES = [
  "Army",
  "Navy",
  "Air Force",
  "BSF",
  "CRPF",
  "Assam Rifles",
  "ITBP",
  "Other",
];

export const PAGE_SIZE = 12;

/** Palette tokens, so pages stop hardcoding hex values inline. */
export const THEME = {
  ink: "#1A241A",
  saffron: "#D96B27",
  saffronDeep: "#C25016",
  forest: "#2E5E2A",
  forestDeep: "#1E431B",
  parchment: "#FAF7F2",
};
