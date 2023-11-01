// Copyright 2021 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.
//
// Handles requests to ODK analytics server data.getodk.cloud
// using some default configuration values.
//
// This is used in one task only so the whole container doesn't need to know about it.

const { request } = require('https');
const { isBlank } = require('../util/util');
const Problem = require('../util/problem');
const { pipeline } = require('stream');

const mock = {
  submit: () => Promise.reject(Problem.internal.analyticsNotConfigured()),
};

const odkAnalytics = (url) => {
  const _submit = (formXml) => new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml'
      }
    };

    const req = request(
      url,
      options,
      response => {
        if (response.statusCode === 200)
          resolve();
        else
          reject(Problem.internal.analyticsUnexpectedResponse());
      }
    );

    pipeline(formXml, req, (err) => { if (err != null) reject(err); });
  });

  return {
    submit: _submit,
  };
};

// sorts through config and returns an object containing stubs or real functions for submitting
// to external ODK Analytics server.
const init = (config) => {
  if (config == null) return mock;
  if (isBlank(config.url) || isBlank(config.formId) || isBlank(config.version)) return mock;
  return odkAnalytics(config.url);
};

module.exports = { init };
