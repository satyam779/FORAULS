import { useEffect } from 'react';

/** Keeps <title> and the meta description in sync during in-app navigation
 *  (the prerendered HTML sets the same values for direct visits). */
export function useMeta(title, description) {
  useEffect(() => {
    document.title = title;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}
