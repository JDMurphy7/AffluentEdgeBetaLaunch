// vite.config.pathalias.ts
import { Plugin } from "vite";

export function pathAlias(): Plugin {
  return {
    name: 'path-alias-resolver',
    resolveId(source) {
      if (source.startsWith('@/')) {
        // Map @/ to ./src/
        return {
          id: source.replace('@/', './'),
          external: false
        };
      }
      return null;
    }
  };
}
