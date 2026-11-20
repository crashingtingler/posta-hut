// Tip jar. One interface, several backends:
//  - StripeStore (website): each tip opens its Stripe Payment Link. After paying, Stripe sends the
//    player back to the game with ?tipped=<id>, and the game thanks them and grants the gold seal.
//  - MockStore: used while the Stripe links below are empty. Charges nothing, clearly marked as test mode.
//  - Store purchases (later): when packaged with Capacitor, swap in RevenueCat
//    (@revenuecat/purchases-capacitor) — consumable products with the same ids on
//    App Store Connect and Google Play Console. Prices then come from the store, localised.
//    App stores don't allow outside payment links for tips, so the native app must never use StripeStore.
window.Tips = (function () {
  const PRODUCTS = [
    { id: "tip_ale",       title: "A cup of ale",  blurb: "A small thanks",        price: "$2" },
    { id: "tip_whetstone", title: "A whetstone",   blurb: "Keeps the edge keen",   price: "$10" },
    { id: "tip_blade",     title: "A new blade",   blurb: "A true patron of the Salle", price: "$20" },
  ];

  // Stripe Payment Links (https://buy.stripe.com/...), one per tip. In Stripe, set each link's
  // "After payment" to "Don't show confirmation page" and redirect to:
  //   https://crashingtingler.github.io/posta-hut/?tipped=<id>     (e.g. ?tipped=tip_ale)
  const STRIPE_LINKS = {
    tip_ale: "",
    tip_whetstone: "",
    tip_blade: "",
  };

  const PENDING = "so.tipPending"; // the tip the player left to pay for, and when
  const read = () => { try { return JSON.parse(localStorage.getItem(PENDING) || "null"); } catch (e) { return null; } };
  const write = (v) => { try { v ? localStorage.setItem(PENDING, JSON.stringify(v)) : localStorage.removeItem(PENDING); } catch (e) {} };

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

  const StripeStore = {
    testMode: false,
    async getProducts() { return PRODUCTS; },
    purchase(id) {
      const url = STRIPE_LINKS[id];
      if (!url) return Promise.reject(new Error("no link"));
      write({ id, t: Date.now() });
      location.href = url; // the player comes back through the redirect (see returned())
      return new Promise(() => {}); // the page is leaving; nothing to resolve
    },
  };

  const native = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  const stripeReady = Object.values(STRIPE_LINKS).every(Boolean);
  // TODO(capacitor): when native, return a RevenueCat-backed store here.
  const backend = !native && stripeReady ? StripeStore : MockStore;

  // Called once at startup: if Stripe just sent the player back after a tip they started here,
  // returns that tip's id (and tidies the address bar); otherwise null.
  function returned() {
    const m = location.search.match(/[?&]tipped=(\w+)/);
    if (!m) return null;
    try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) {}
    const p = read(); write(null);
    // only a tip started on this device in the last day counts (the seal is cosmetic, so this is enough)
    return p && p.id === m[1] && Date.now() - p.t < 864e5 ? p.id : null;
  }

  return {
    get testMode() { return !!backend.testMode; },
    getProducts: () => backend.getProducts(),
    purchase: (id) => backend.purchase(id),
    returned,
  };
})();
