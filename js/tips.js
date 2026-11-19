// Tip jar. One interface, two backends:
//  - MockStore (now): runs in the browser, charges nothing, clearly marked as test mode.
//  - Store purchases (later): when packaged with Capacitor, swap in RevenueCat
//    (@revenuecat/purchases-capacitor) — consumable products with the same ids on
//    App Store Connect and Google Play Console. Prices then come from the store, localised.
window.Tips = (function () {
  const PRODUCTS = [
    { id: "tip_ale",       title: "A cup of ale",  blurb: "A small thanks",        price: "$2" },
    { id: "tip_whetstone", title: "A whetstone",   blurb: "Keeps the edge keen",   price: "$10" },
    { id: "tip_blade",     title: "A new blade",   blurb: "A true patron of the Salle", price: "$20" },
  ];

  const MockStore = {
    testMode: true,
    async getProducts() { return PRODUCTS; },
    purchase(id) {
      return new Promise((resolve, reject) => {
        // Mimic the store sheet: the player can still back out.
        const ok = window.confirm("TEST MODE — no money will be charged.\n\nSimulate buying “" +
          PRODUCTS.find((p) => p.id === id).title + "”?");
        setTimeout(() => (ok ? resolve({ id }) : reject(new Error("cancelled"))), 300);
      });
    },
  };

  // TODO(capacitor): detect window.Capacitor?.isNativePlatform() and return a RevenueCat-backed store here.
  const backend = MockStore;

  return {
    get testMode() { return !!backend.testMode; },
    getProducts: () => backend.getProducts(),
    purchase: (id) => backend.purchase(id),
  };
})();
