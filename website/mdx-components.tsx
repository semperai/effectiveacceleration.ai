import { type MDXComponents } from 'mdx/types';

import * as mdxComponents from '@/components/Mdx';

export function useMDXComponents(components: MDXComponents) {
  return {
    ...components,
    ...mdxComponents,
  };
}
