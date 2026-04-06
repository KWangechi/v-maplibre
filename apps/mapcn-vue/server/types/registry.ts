export interface RegistryFile {
  path: string;
  type: string;
  content?: string;
  target?: string;
}

export interface RegistryItem {
  $schema: string;
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
}
