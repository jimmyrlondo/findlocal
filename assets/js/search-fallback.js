/**
 * LocalFuse – lightweight fallback search used when Fuse.js CDN is unavailable.
 * Matches against a configurable set of keys with substring + character-sequence fuzzy logic.
 */
/* global window */
(function (global) {
  'use strict';

  function LocalFuse(items, options) {
    this.items = items || [];
    this.keys  = (options && options.keys) || [];
  }

  LocalFuse.prototype.search = function (query) {
    if (!query) return this.items.map(function (item) { return { item: item }; });
    var q = query.toLowerCase().trim();
    var keys = this.keys;

    return this.items
      .map(function (item) {
        var score = 0;
        keys.forEach(function (key) {
          var val = String(item[key] == null ? '' : item[key]).toLowerCase();
          if (val.includes(q)) {
            score += 2;           // exact substring – high score
          } else if (charSeq(val, q)) {
            score += 1;           // fuzzy character sequence – lower score
          }
        });
        return { item: item, score: score };
      })
      .filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return b.score - a.score });
  };

  /** Returns true if every character of query appears in str in order. */
  function charSeq(str, query) {
    var qi = 0;
    for (var i = 0; i < str.length && qi < query.length; i++) {
      if (str[i] === query[qi]) qi++;
    }
    return qi === query.length;
  }

  // Expose as global – mirrors Fuse constructor shape
  global.LocalFuse = LocalFuse;

  // If Fuse.js CDN did NOT load, alias as Fuse
  if (typeof global.Fuse === 'undefined') {
    global.Fuse = LocalFuse;
  }
}(typeof window !== 'undefined' ? window : this));
