// Copyright 2021 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.
//
// Mocks the odk analytics client to pretend successful and failed requests.

class ODKAnalytics {

  constructor() {
    this.mockError = null;
  }

  submit() {
    if (this.mockError !== null) {
      return Promise.reject(this.mockError);
    }
    return Promise.resolve();
  }

  setError(err) {
    // set up in test to return a custom error
    this.mockError = err;
  }
}

module.exports = { ODKAnalytics };

