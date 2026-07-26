(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    /* ===========================================
       Tawk.to white-label setup
       =========================================== */
    window.Tawk_API = window.Tawk_API || {};

    window.Tawk_API.onLoad = function() {
        Tawk_API.maximize();
        setTimeout(function() { Tawk_API.minimize(); }, 200);
    };

    window.Tawk_API.onStatusChange = function(status) {
        var el = document.querySelector('.fxg-chat-panel__status');
        if (el) el.textContent = status === 'online' ? 'Online' : 'Offline';
    };

    window.Tawk_API.onChatMessage = function(msg) {
        if (!msg || msg.type !== 'agent') return;
        var text = msg.message || msg.text || msg.content || '';
        if (!text) return;
        var area = document.getElementById('chatMessages');
        if (!area) return;
        var div = document.createElement('div');
        div.className = 'fxg-chat-msg fxg-chat-msg--bot';
        div.innerHTML =
            '<div class="fxg-chat-msg__avatar">' +
                '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>' +
            '</div>' +
            '<div class="fxg-chat-msg__content"><p>' + escHtml(text) + '</p></div>';
        area.appendChild(div);
        area.scrollTop = area.scrollHeight;
    };

    window.Tawk_LoadStart = new Date();
    (function() {
        var s1 = document.createElement('script');
        var s0 = document.getElementsByTagName('script')[0];
        s1.async = true;
        s1.src = 'https://embed.tawk.to/6a66333abfed411d4618f20c/default';
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        s0.parentNode.insertBefore(s1, s0);
    })();

    function escHtml(str) {
        var d = document.createElement('div');
        d.appendChild(document.createTextNode(str));
        return d.innerHTML;
    }

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

                    if (window.Tawk_API && Tawk_API.sendMessage) {
                        Tawk_API.sendMessage(label);
                    }
                });
            });

            /* Enable chat input and wire to Tawk.to */
            var chatInput = document.querySelector('.fxg-chat-panel__input input');
            var sendBtn = document.querySelector('.fxg-chat-panel__input button');
            var chatArea = document.getElementById('chatMessages');

            function sendMessage() {
                var val = chatInput.value.trim();
                if (!val) return;
                var div = document.createElement('div');
                div.className = 'fxg-chat-msg fxg-chat-msg--user';
                div.innerHTML = '<div class="fxg-chat-msg__content"><p>' + escHtml(val) + '</p></div>';
                chatArea.appendChild(div);
                chatArea.scrollTop = chatArea.scrollHeight;
                if (window.Tawk_API && Tawk_API.sendMessage) Tawk_API.sendMessage(val);
                chatInput.value = '';
            }

            if (chatInput && sendBtn) {
                chatInput.disabled = false;
                chatInput.placeholder = 'Type your message...';
                sendBtn.disabled = false;
                sendBtn.addEventListener('click', sendMessage);
                chatInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') sendMessage();
                });
            }
        }
    });
})();
