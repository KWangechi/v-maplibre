export interface Example {
  title: string;
  description: string;
  href: string;
  icon: string;
  badge?: string;
}

export interface ExampleCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  examples: Example[];
}

export interface PackageManager {
  id: string;
  label: string;
  prefix: string;
}
