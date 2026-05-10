(function () {
  "use strict";

  async function withFallback(apiCall, fallbackValue, message) {
    try {
      return await apiCall();
    } catch (error) {
      console.warn(message || "Backend недоступен, используется локальный fallback.", error);
      return fallbackValue;
    }
  }

  window.ChemLabStorageFallback = { withFallback };
})();
