/* Compatibility wrapper. The real client lives in js/api.js. */
(function () {
  "use strict";
  if (!window.ChemLabApiClient) {
    console.warn("js/api.js должен быть подключён перед js/api-client.js");
  }
})();
