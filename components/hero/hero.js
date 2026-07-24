(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];
    window.FDX.components.push(function() {
        var video = document.querySelector('.fxg-hero__video');
        var toggle = document.querySelector('.fxg-hero__sound-toggle');
        if (!video || !toggle) return;
        toggle.addEventListener('click', function() {
            video.muted = !video.muted;
            toggle.classList.toggle('fxg-hero__sound-toggle--unmuted');
            toggle.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
        });
    });
})();