/*
Copyright 2017 ODK Central Developers
See the NOTICE file at the top-level directory of this distribution and at
https://github.com/getodk/central-frontend/blob/master/NOTICE.

This file is part of ODK Central. It is subject to the license terms in
the LICENSE file found in the top-level directory of this distribution and at
https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
including this file, may be copied, modified, propagated, or distributed
except according to the terms contained in the LICENSE file.
*/

// A component that contains tabs may call useTabs(), which returns related
// helper functions. If the component contains at least one tab that uses a
// relative path, the component must pass in a prefix for relative paths.

import { useRoute } from 'vue-router';

export default (pathPrefix = undefined) => {
  const route = useRoute();
  const tabPath = (path) => {
    if (path.startsWith('/')) return path;
    if (pathPrefix == null) throw new Error('pathPrefix required');
    const slash = path !== '' ? '/' : '';
    return `${pathPrefix}${slash}${path}`;
  };
  const tabClass = (path) => ({ active: route.path === tabPath(path) });
  return { tabPath, tabClass };
};
