(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    window.FDX.components.push(function() {
        const headerForm = document.querySelector('#HeaderTrackingModule');
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
                    window.open('https://www.fedex.com/apps/fedextrack/?tracknumbers=' + encodeURIComponent(val), '_blank');
                }
            });
        }
    });
})();