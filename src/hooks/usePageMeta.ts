import { useEffect } from 'react';

interface PageMetaOptions {
  noindex?: boolean;
}

export function usePageMeta(title: string, description?: string, options?: PageMetaOptions) {
  useEffect(() => {
    // 1. Set document title
    const fullTitle = title.includes('Al Shujaiat Foundation')
      ? title
      : `${title} | Al Shujaiat Foundation J&K`;
    document.title = fullTitle;

    // 2. Set Meta Description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    // 3. Sync Open Graph and Twitter tags if they exist in the DOM
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', fullTitle);
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', fullTitle);
    }

    if (description) {
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        ogDesc.setAttribute('content', description);
      }

      const twitterDesc = document.querySelector('meta[name="twitter:description"]');
      if (twitterDesc) {
        twitterDesc.setAttribute('content', description);
      }
    }

    // 4. Set Robots tag (noindex for private/donor/auth routes)
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (options?.noindex) {
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.setAttribute('name', 'robots');
        document.head.appendChild(metaRobots);
      }
      metaRobots.setAttribute('content', 'noindex, nofollow');
    } else if (metaRobots) {
      metaRobots.setAttribute('content', 'index, follow');
    }
  }, [title, description, options?.noindex]);
}
