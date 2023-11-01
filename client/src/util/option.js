// Copyright 2017 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-frontend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.
//
// Defines the Option class we use throughout the codebase when the result of an
// operation might be null, and that null must be handled explicitly.

export default class Option {
  static of(value) {
    if (value instanceof Option)
      return value;
    if (value === null || value === undefined)
      return none; // eslint-disable-line no-use-before-define
    return new Some(value); // eslint-disable-line no-use-before-define
  }

  static none() {
    return none; // eslint-disable-line no-use-before-define
  }

  static firstDefined(options) {
    for (const option of options)
      if (option.isDefined())
        return option;
    return Option.none();
  }
}

class Some extends Option {
  constructor(value) {
    super();
    this.value = value;
  }

  get() { return this.value; }

  map(fn) { return Option.of(fn(this.value)); }
  // eslint-disable-next-line no-use-before-define
  filter(predicate) { return predicate(this.value) === true ? this : none; }

  orNull() { return this.value; }
  orElse() { return this.value; }
  orElseGet() { return this.value; }
  orThrow() { return this.value; }

  isDefined() { return true; }
  isEmpty() { return false; }

  ifDefined(consumer) { consumer(this.value); }
}

class None extends Option {
  get() { throw new Error('Option value not present on get.'); }

  map() { return this; }
  filter() { return this; }

  orNull() { return null; }
  orElse(defaultValue) { return defaultValue; }
  orElseGet(defaultValueProvider) { return defaultValueProvider(); }
  orThrow(err) { throw err; }

  isDefined() { return false; }
  isEmpty() { return true; }

  ifDefined() { }
}

const none = new None();
