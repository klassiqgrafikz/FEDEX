(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    window.FDX.components.push(function() {
        var toggle = document.getElementById('footerSocialToggle');
        if (!toggle) return;
        var wrap = toggle.closest('.fxg-footer__social');
        if (!wrap) return;

        toggle.addEventListener('click', function() {
            var open = wrap.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    });
})();
