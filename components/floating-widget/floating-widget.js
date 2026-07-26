(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    window.FDX.components.push(function() {
        var trackBtn = document.getElementById('floatingTrackBtn');
        var trackInput = document.getElementById('floatingTrackingInput');

        if (trackBtn && trackInput) {
            function doTrack() {
                var val = trackInput.value.trim();
                if (!val) {
                    trackInput.style.borderColor = '#CC0000';
                    trackInput.placeholder = 'Please enter a tracking number';
                } else {
                    trackInput.style.borderColor = '';
                    trackInput.placeholder = 'Tracking number';
                    window.FDX.track(val);
                }
            }

            trackBtn.addEventListener('click', doTrack);
            trackInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') doTrack();
            });
            trackInput.addEventListener('input', function() {
                trackInput.style.borderColor = '';
            });
        }

        /* ===========================================
           Chat Bubble
           =========================================== */
        var bubble = document.getElementById('chatBubble');
        var panel = document.getElementById('chatPanel');
        var closeBtn = document.getElementById('chatClose');
        if (bubble && panel && closeBtn) {
            bubble.addEventListener('click', function() {
                var isOpen = panel.classList.contains('fxg-chat-panel--open');
                if (isOpen) {
                    panel.classList.remove('fxg-chat-panel--open');
                    bubble.classList.remove('fxg-chat-bubble--active');
                } else {
                    panel.classList.add('fxg-chat-panel--open');
                    bubble.classList.add('fxg-chat-bubble--active');
                }
            });

            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                panel.classList.remove('fxg-chat-panel--open');
                bubble.classList.remove('fxg-chat-bubble--active');
            });

            /* Option buttons */
            var optionBtns = document.querySelectorAll('.fxg-chat-options__btn');
            var messagesArea = document.getElementById('chatMessages');

            optionBtns.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var action = this.getAttribute('data-action');
                    var label = this.textContent;
                    var msgDiv = document.createElement('div');
                    msgDiv.className = 'fxg-chat-msg fxg-chat-msg--bot';

                    var responses = {
                        track: 'Sure! Please enter your tracking number and I\'ll look it up for you.',
                        schedule: 'I can help you schedule a pickup. Please provide your zip code and preferred date.',
                        rates: 'You can get shipping rates by visiting our <a href="https://www.fedex.com/en-us/online/rating.html" target="_blank" style="color:#660099;text-decoration:underline;">Rate & Ship page</a>.',
                        locations: 'Find a nearby FedEx location on our <a href="https://local.fedex.com/en-us" target="_blank" style="color:#660099;text-decoration:underline;">Locations page</a>.'
                    };

                    msgDiv.innerHTML =
                        '<div class="fxg-chat-msg__avatar">' +
                            '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>' +
                        '</div>' +
                        '<div class="fxg-chat-msg__content"><p>' + (responses[action] || 'Got it! How else can I help?') + '</p></div>';

                    messagesArea.appendChild(msgDiv);
                    messagesArea.scrollTop = messagesArea.scrollHeight;
                });
            });

            /* Start the ASK ME slide cycle */
            startTooltipCycle();
        }
    });
})();