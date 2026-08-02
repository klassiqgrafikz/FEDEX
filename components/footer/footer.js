(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    window.FDX.components.push(function() {
        var toggle = document.getElementById('footerSocialToggle');
        if (!toggle) return;
        var wrap = toggle.closest('.fxg-footer__social');
        if (!wrap) return;

        var mobileQuery = window.matchMedia('(max-width: 768px)');
        var step = 0;

        function setStep(n) {
            step = n;
            if (step > 0) {
                wrap.setAttribute('data-step', step);
            } else {
                wrap.removeAttribute('data-step');
            }
            toggle.setAttribute('aria-expanded', step > 0 ? 'true' : 'false');
        }

        if (typeof mobileQuery.addEventListener === 'function') {
            mobileQuery.addEventListener('change', function() { setStep(0); });
        }
        setStep(0);

        toggle.addEventListener('click', function() {
            setStep((step + 1) % 4);
        });
    });
})();
