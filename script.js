
/* --- header --- */
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
                    window.open('https://www.fedex.com/apps/fedextrack/?tracknumbers=' + encodeURIComponent(val), '_blank');
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

/* --- hero --- */
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

/* --- floating-widget --- */
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
                    window.open('https://www.fedex.com/apps/fedextrack/?tracknumbers=' + encodeURIComponent(val), '_blank');
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
        var tooltip = document.getElementById('chatTooltip');
        var tooltipTimer = null;
        var tooltipTimeout = null;

        function showTooltip() {
            if (!tooltip || panel.classList.contains('fxg-chat-panel--open')) return;
            tooltip.classList.add('fxg-chat-bubble__tooltip--visible');
            clearTimeout(tooltipTimeout);
            tooltipTimeout = setTimeout(function() {
                tooltip.classList.remove('fxg-chat-bubble__tooltip--visible');
                clearTimeout(tooltipTimer);
                tooltipTimer = setTimeout(showTooltip, 12000);
            }, 5000);
        }

        function startTooltipCycle() {
            clearTimeout(tooltipTimer);
            clearTimeout(tooltipTimeout);
            tooltipTimer = setTimeout(showTooltip, 3000);
        }

        function stopTooltipCycle() {
            clearTimeout(tooltipTimer);
            clearTimeout(tooltipTimeout);
            if (tooltip) tooltip.classList.remove('fxg-chat-bubble__tooltip--visible');
        }

        if (bubble && panel && closeBtn) {
            bubble.addEventListener('click', function() {
                var isOpen = panel.classList.contains('fxg-chat-panel--open');
                if (isOpen) {
                    panel.classList.remove('fxg-chat-panel--open');
                    bubble.classList.remove('fxg-chat-bubble--active');
                    startTooltipCycle();
                } else {
                    panel.classList.add('fxg-chat-panel--open');
                    bubble.classList.add('fxg-chat-bubble--active');
                    stopTooltipCycle();
                }
            });

            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                panel.classList.remove('fxg-chat-panel--open');
                bubble.classList.remove('fxg-chat-bubble--active');
                startTooltipCycle();
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

/* --- footer --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    window.FDX.components.push(function() {
        // Footer init placeholder
    });
})();

/* --- init --- */
/* --- header --- */
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
                    window.open('https://www.fedex.com/apps/fedextrack/?tracknumbers=' + encodeURIComponent(val), '_blank');
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

/* --- hero --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];
    window.FDX.components.push(function() {});
})();

/* --- floating-widget --- */
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
                    window.open('https://www.fedex.com/apps/fedextrack/?tracknumbers=' + encodeURIComponent(val), '_blank');
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
        var tooltip = document.getElementById('chatTooltip');
        var tooltipTimer = null;
        var tooltipTimeout = null;

        function showTooltip() {
            if (!tooltip || panel.classList.contains('fxg-chat-panel--open')) return;
            tooltip.classList.add('fxg-chat-bubble__tooltip--visible');
            clearTimeout(tooltipTimeout);
            tooltipTimeout = setTimeout(function() {
                tooltip.classList.remove('fxg-chat-bubble__tooltip--visible');
                clearTimeout(tooltipTimer);
                tooltipTimer = setTimeout(showTooltip, 12000);
            }, 5000);
        }

        function startTooltipCycle() {
            clearTimeout(tooltipTimer);
            clearTimeout(tooltipTimeout);
            tooltipTimer = setTimeout(showTooltip, 3000);
        }

        function stopTooltipCycle() {
            clearTimeout(tooltipTimer);
            clearTimeout(tooltipTimeout);
            if (tooltip) tooltip.classList.remove('fxg-chat-bubble__tooltip--visible');
        }

        if (bubble && panel && closeBtn) {
            bubble.addEventListener('click', function() {
                var isOpen = panel.classList.contains('fxg-chat-panel--open');
                if (isOpen) {
                    panel.classList.remove('fxg-chat-panel--open');
                    bubble.classList.remove('fxg-chat-bubble--active');
                    startTooltipCycle();
                } else {
                    panel.classList.add('fxg-chat-panel--open');
                    bubble.classList.add('fxg-chat-bubble--active');
                    stopTooltipCycle();
                }
            });

            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                panel.classList.remove('fxg-chat-panel--open');
                bubble.classList.remove('fxg-chat-bubble--active');
                startTooltipCycle();
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

/* --- footer --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    window.FDX.components.push(function() {
        // Footer init placeholder
    });
})();

/* --- init --- */
/* --- header --- */
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

/* --- hero --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];
    window.FDX.components.push(function() {});
})();

/* --- floating-widget --- */
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
                    window.open('https://www.fedex.com/apps/fedextrack/?tracknumbers=' + encodeURIComponent(val), '_blank');
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
        var tooltip = document.getElementById('chatTooltip');
        var tooltipTimer = null;
        var tooltipTimeout = null;

        function showTooltip() {
            if (!tooltip || panel.classList.contains('fxg-chat-panel--open')) return;
            tooltip.classList.add('fxg-chat-bubble__tooltip--visible');
            clearTimeout(tooltipTimeout);
            tooltipTimeout = setTimeout(function() {
                tooltip.classList.remove('fxg-chat-bubble__tooltip--visible');
                clearTimeout(tooltipTimer);
                tooltipTimer = setTimeout(showTooltip, 12000);
            }, 5000);
        }

        function startTooltipCycle() {
            clearTimeout(tooltipTimer);
            clearTimeout(tooltipTimeout);
            tooltipTimer = setTimeout(showTooltip, 3000);
        }

        function stopTooltipCycle() {
            clearTimeout(tooltipTimer);
            clearTimeout(tooltipTimeout);
            if (tooltip) tooltip.classList.remove('fxg-chat-bubble__tooltip--visible');
        }

        if (bubble && panel && closeBtn) {
            bubble.addEventListener('click', function() {
                var isOpen = panel.classList.contains('fxg-chat-panel--open');
                if (isOpen) {
                    panel.classList.remove('fxg-chat-panel--open');
                    bubble.classList.remove('fxg-chat-bubble--active');
                    startTooltipCycle();
                } else {
                    panel.classList.add('fxg-chat-panel--open');
                    bubble.classList.add('fxg-chat-bubble--active');
                    stopTooltipCycle();
                }
            });

            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                panel.classList.remove('fxg-chat-panel--open');
                bubble.classList.remove('fxg-chat-bubble--active');
                startTooltipCycle();
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

/* --- footer --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    window.FDX.components.push(function() {
        // Footer init placeholder
    });
})();

/* --- init --- */
/* --- header --- */
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

/* --- hero --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];
    window.FDX.components.push(function() {});
})();

/* --- floating-widget --- */
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
                    window.open('https://www.fedex.com/apps/fedextrack/?tracknumbers=' + encodeURIComponent(val), '_blank');
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
        var tooltip = document.getElementById('chatTooltip');
        var tooltipTimer = null;
        var tooltipTimeout = null;

        function showTooltip() {
            if (!tooltip || panel.classList.contains('fxg-chat-panel--open')) return;
            tooltip.classList.add('fxg-chat-bubble__tooltip--visible');
            clearTimeout(tooltipTimeout);
            tooltipTimeout = setTimeout(function() {
                tooltip.classList.remove('fxg-chat-bubble__tooltip--visible');
                clearTimeout(tooltipTimer);
                tooltipTimer = setTimeout(showTooltip, 12000);
            }, 5000);
        }

        function startTooltipCycle() {
            clearTimeout(tooltipTimer);
            clearTimeout(tooltipTimeout);
            tooltipTimer = setTimeout(showTooltip, 3000);
        }

        function stopTooltipCycle() {
            clearTimeout(tooltipTimer);
            clearTimeout(tooltipTimeout);
            if (tooltip) tooltip.classList.remove('fxg-chat-bubble__tooltip--visible');
        }

        if (bubble && panel && closeBtn) {
            bubble.addEventListener('click', function() {
                var isOpen = panel.classList.contains('fxg-chat-panel--open');
                if (isOpen) {
                    panel.classList.remove('fxg-chat-panel--open');
                    bubble.classList.remove('fxg-chat-bubble--active');
                    startTooltipCycle();
                } else {
                    panel.classList.add('fxg-chat-panel--open');
                    bubble.classList.add('fxg-chat-bubble--active');
                    stopTooltipCycle();
                }
            });

            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                panel.classList.remove('fxg-chat-panel--open');
                bubble.classList.remove('fxg-chat-bubble--active');
                startTooltipCycle();
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

/* --- footer --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    window.FDX.components.push(function() {
        // Footer init placeholder
    });
})();

/* --- init --- */
/* --- header --- */
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

/* --- hero --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];
    window.FDX.components.push(function() {});
})();

/* --- floating-widget --- */
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
                    window.open('https://www.fedex.com/apps/fedextrack/?tracknumbers=' + encodeURIComponent(val), '_blank');
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
        var tooltip = document.getElementById('chatTooltip');
        var tooltipTimer = null;
        var tooltipTimeout = null;

        function showTooltip() {
            if (!tooltip || panel.classList.contains('fxg-chat-panel--open')) return;
            tooltip.classList.add('fxg-chat-bubble__tooltip--visible');
            clearTimeout(tooltipTimeout);
            tooltipTimeout = setTimeout(function() {
                tooltip.classList.remove('fxg-chat-bubble__tooltip--visible');
                clearTimeout(tooltipTimer);
                tooltipTimer = setTimeout(showTooltip, 12000);
            }, 5000);
        }

        function startTooltipCycle() {
            clearTimeout(tooltipTimer);
            clearTimeout(tooltipTimeout);
            tooltipTimer = setTimeout(showTooltip, 3000);
        }

        function stopTooltipCycle() {
            clearTimeout(tooltipTimer);
            clearTimeout(tooltipTimeout);
            if (tooltip) tooltip.classList.remove('fxg-chat-bubble__tooltip--visible');
        }

        if (bubble && panel && closeBtn) {
            bubble.addEventListener('click', function() {
                var isOpen = panel.classList.contains('fxg-chat-panel--open');
                if (isOpen) {
                    panel.classList.remove('fxg-chat-panel--open');
                    bubble.classList.remove('fxg-chat-bubble--active');
                    startTooltipCycle();
                } else {
                    panel.classList.add('fxg-chat-panel--open');
                    bubble.classList.add('fxg-chat-bubble--active');
                    stopTooltipCycle();
                }
            });

            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                panel.classList.remove('fxg-chat-panel--open');
                bubble.classList.remove('fxg-chat-bubble--active');
                startTooltipCycle();
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

/* --- footer --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    window.FDX.components.push(function() {
        // Footer init placeholder
    });
})();

/* --- init --- */
/* --- header --- */
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

/* --- hero --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];
    window.FDX.components.push(function() {});
})();

/* --- floating-widget --- */
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
                    window.open('https://www.fedex.com/apps/fedextrack/?tracknumbers=' + encodeURIComponent(val), '_blank');
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
        var tooltip = document.getElementById('chatTooltip');
        var tooltipTimer = null;
        var tooltipTimeout = null;

        function showTooltip() {
            if (!tooltip || panel.classList.contains('fxg-chat-panel--open')) return;
            tooltip.classList.add('fxg-chat-bubble__tooltip--visible');
            clearTimeout(tooltipTimeout);
            tooltipTimeout = setTimeout(function() {
                tooltip.classList.remove('fxg-chat-bubble__tooltip--visible');
                clearTimeout(tooltipTimer);
                tooltipTimer = setTimeout(showTooltip, 12000);
            }, 5000);
        }

        function startTooltipCycle() {
            clearTimeout(tooltipTimer);
            clearTimeout(tooltipTimeout);
            tooltipTimer = setTimeout(showTooltip, 3000);
        }

        function stopTooltipCycle() {
            clearTimeout(tooltipTimer);
            clearTimeout(tooltipTimeout);
            if (tooltip) tooltip.classList.remove('fxg-chat-bubble__tooltip--visible');
        }

        if (bubble && panel && closeBtn) {
            bubble.addEventListener('click', function() {
                var isOpen = panel.classList.contains('fxg-chat-panel--open');
                if (isOpen) {
                    panel.classList.remove('fxg-chat-panel--open');
                    bubble.classList.remove('fxg-chat-bubble--active');
                    startTooltipCycle();
                } else {
                    panel.classList.add('fxg-chat-panel--open');
                    bubble.classList.add('fxg-chat-bubble--active');
                    stopTooltipCycle();
                }
            });

            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                panel.classList.remove('fxg-chat-panel--open');
                bubble.classList.remove('fxg-chat-bubble--active');
                startTooltipCycle();
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

/* --- footer --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    window.FDX.components.push(function() {
        // Footer init placeholder
    });
})();

/* --- init --- */
/* --- header --- */
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

/* --- hero --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];
    window.FDX.components.push(function() {});
})();

/* --- floating-widget --- */
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
                    window.open('https://www.fedex.com/apps/fedextrack/?tracknumbers=' + encodeURIComponent(val), '_blank');
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
        var tooltip = document.getElementById('chatTooltip');
        var tooltipTimer = null;
        var tooltipTimeout = null;

        function showTooltip() {
            if (!tooltip || panel.classList.contains('fxg-chat-panel--open')) return;
            tooltip.classList.add('fxg-chat-bubble__tooltip--visible');
            clearTimeout(tooltipTimeout);
            tooltipTimeout = setTimeout(function() {
                tooltip.classList.remove('fxg-chat-bubble__tooltip--visible');
                clearTimeout(tooltipTimer);
                tooltipTimer = setTimeout(showTooltip, 12000);
            }, 5000);
        }

        function startTooltipCycle() {
            clearTimeout(tooltipTimer);
            clearTimeout(tooltipTimeout);
            tooltipTimer = setTimeout(showTooltip, 3000);
        }

        function stopTooltipCycle() {
            clearTimeout(tooltipTimer);
            clearTimeout(tooltipTimeout);
            if (tooltip) tooltip.classList.remove('fxg-chat-bubble__tooltip--visible');
        }

        if (bubble && panel && closeBtn) {
            bubble.addEventListener('click', function() {
                var isOpen = panel.classList.contains('fxg-chat-panel--open');
                if (isOpen) {
                    panel.classList.remove('fxg-chat-panel--open');
                    bubble.classList.remove('fxg-chat-bubble--active');
                    startTooltipCycle();
                } else {
                    panel.classList.add('fxg-chat-panel--open');
                    bubble.classList.add('fxg-chat-bubble--active');
                    stopTooltipCycle();
                }
            });

            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                panel.classList.remove('fxg-chat-panel--open');
                bubble.classList.remove('fxg-chat-bubble--active');
                startTooltipCycle();
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

/* --- footer --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    window.FDX.components.push(function() {
        // Footer init placeholder
    });
})();

/* --- init --- */
/* --- header --- */
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

/* --- hero --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];
    window.FDX.components.push(function() {});
})();

/* --- floating-widget --- */
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
                    window.open('https://www.fedex.com/apps/fedextrack/?tracknumbers=' + encodeURIComponent(val), '_blank');
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
    });
})();

/* --- footer --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    window.FDX.components.push(function() {
        // Footer init placeholder
    });
})();

/* --- init --- */
/* --- header --- */
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

/* --- hero --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];
    window.FDX.components.push(function() {});
})();

/* --- floating-widget --- */
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
                    window.open('https://www.fedex.com/apps/fedextrack/?tracknumbers=' + encodeURIComponent(val), '_blank');
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
    });
})();

/* --- footer --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    window.FDX.components.push(function() {
        // Footer init placeholder
    });
})();

/* --- init --- */
/* --- header --- */
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

/* --- hero --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];
    window.FDX.components.push(function() {});
})();

/* --- floating-widget --- */
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
                    window.open('https://www.fedex.com/apps/fedextrack/?tracknumbers=' + encodeURIComponent(val), '_blank');
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
    });
})();

/* --- footer --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    window.FDX.components.push(function() {
        // Footer init placeholder
    });
})();

/* --- init --- */
/* --- header --- */
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

/* --- hero --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];
    window.FDX.components.push(function() {});
})();

/* --- floating-widget --- */
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
                    window.open('https://www.fedex.com/apps/fedextrack/?tracknumbers=' + encodeURIComponent(val), '_blank');
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
    });
})();

/* --- footer --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    window.FDX.components.push(function() {
        // Footer init placeholder
    });
})();

/* --- init --- */
/* --- header --- */
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

/* --- hero --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];
    window.FDX.components.push(function() {});
})();

/* --- floating-widget --- */
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
                    window.open('https://www.fedex.com/apps/fedextrack/?tracknumbers=' + encodeURIComponent(val), '_blank');
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
    });
})();

/* --- footer --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    window.FDX.components.push(function() {
        // Footer init placeholder
    });
})();

/* --- init --- */
document.addEventListener('DOMContentLoaded',function(){if(window.FDX&&window.FDX.components){window.FDX.components.forEach(function(f){if(typeof f==='function')f()})}})
