(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    window.FDX.components.push(function() {
        var header = document.querySelector('.fxg-header');
        if (!header) return;

        var hamburger = header.querySelector('.fxg-hamburger');
        var globalNav = header.querySelector('.fxg-global-nav');
        var dropdownItems = header.querySelectorAll('.fxg-dropdown__item');

        /* Hamburger toggle */
        if (hamburger) {
            hamburger.addEventListener('click', function(e) {
                e.stopPropagation();
                header.classList.toggle('fxg-header--mobile-open');
                hamburger.setAttribute('aria-label',
                    header.classList.contains('fxg-header--mobile-open')
                        ? 'Close navigation menu'
                        : 'Toggle navigation menu');
            });
        }

        /* Close mobile menu when a sub-menu link is clicked */
        header.querySelectorAll('.fxg-dropdown__sub-menu a').forEach(function(link) {
            link.addEventListener('click', function() {
                header.classList.remove('fxg-header--mobile-open');
                if (hamburger) {
                    hamburger.setAttribute('aria-label', 'Toggle navigation menu');
                }
            });
        });

        /* Close on overlay click */
        var overlay = header.querySelector('.fxg-header__overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'fxg-header__overlay';
            header.appendChild(overlay);
        }
        overlay.addEventListener('click', function() {
            header.classList.remove('fxg-header--mobile-open');
            if (hamburger) {
                hamburger.setAttribute('aria-label', 'Toggle navigation menu');
            }
        });

        /* Dropdown toggle on mobile (click instead of hover) */
        dropdownItems.forEach(function(item) {
            var toggle = item.querySelector('.fxg-dropdown-js');
            if (toggle) {
                toggle.addEventListener('click', function(e) {
                    if (window.innerWidth <= 900) {
                        e.preventDefault();
                        item.classList.toggle('fxg-dropdown--open');
                    }
                });
            }
        });

        /* Tracking form */
        var headerForm = header.querySelector('#HeaderTrackingModule');
        if (headerForm) {
            headerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                var input = headerForm.querySelector('input[name="trackingNumber"]');
                var val = input.value.trim();
                if (!val) {
                    input.style.borderColor = '#CC0000';
                    var err = input.parentElement.querySelector('.fxg-field__error_text');
                    if (err) err.style.display = 'block';
                } else {
                    var prefix = window.location.pathname.includes('/pages/') ? '../' : '';
                    window.location.href = prefix + 'loading.html?tracking=' + encodeURIComponent(val);
                }
            });
        }

        /* Reset mobile state on resize past breakpoint */
        var resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 900 && header.classList.contains('fxg-header--mobile-open')) {
                    header.classList.remove('fxg-header--mobile-open');
                    if (hamburger) {
                        hamburger.setAttribute('aria-label', 'Toggle navigation menu');
                    }
                    dropdownItems.forEach(function(item) {
                        item.classList.remove('fxg-dropdown--open');
                    });
                }
            }, 200);
        });
    });
})();