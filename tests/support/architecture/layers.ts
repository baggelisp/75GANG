export const LayerEnum = {
  DOMAIN: 'DOMAIN',
  STORAGE_PORTS: 'STORAGE_PORTS',
  STORAGE_ADAPTERS: 'STORAGE_ADAPTERS',
  STORAGE_REPOSITORIES: 'STORAGE_REPOSITORIES',
  STORAGE_ROOT: 'STORAGE_ROOT',
  FEATURES: 'FEATURES',
  ROUTES: 'ROUTES',
  UNGOVERNED: 'UNGOVERNED',
} as const;

export type Layer = (typeof LayerEnum)[keyof typeof LayerEnum];

const LAYER_BY_PATH_PREFIX: readonly (readonly [string, Layer])[] = [
  ['src/domain/', LayerEnum.DOMAIN],
  ['src/storage/ports/', LayerEnum.STORAGE_PORTS],
  ['src/storage/adapters/', LayerEnum.STORAGE_ADAPTERS],
  ['src/storage/repositories/', LayerEnum.STORAGE_REPOSITORIES],
  ['src/storage/', LayerEnum.STORAGE_ROOT],
  ['src/features/', LayerEnum.FEATURES],
  ['app/', LayerEnum.ROUTES],
];

export const resolveLayer = (filePath: string): Layer => {
  const normalised = filePath.replace(/\\/g, '/');
  const match = LAYER_BY_PATH_PREFIX.find(([prefix]) => normalised.startsWith(prefix));

  if (!match) {
    return LayerEnum.UNGOVERNED;
  }

  return match[1];
};
