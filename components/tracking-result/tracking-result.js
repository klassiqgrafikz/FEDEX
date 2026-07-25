(function () {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    var STEP_MAP = [1, 2, 3, 3, 3, 3, 4, 5];

    function stepperStep(status) {
        var STATUSES = window.FDX.admin && window.FDX.admin.STATUSES ? window.FDX.admin.STATUSES : [];
        var idx = STATUSES.indexOf(status);
        if (idx < 0 || idx >= STEP_MAP.length) return 0;
        return STEP_MAP[idx];
    }

    function escape(t) {
        if (!t) return '';
        var d = document.createElement('div');
        d.appendChild(document.createTextNode(t));
        return d.innerHTML;
    }

    function fmtDate(iso) {
        if (!iso) return '';
        var d = new Date(iso);
        return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear() + ' at ' +
            d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    function fmtShort(iso) {
        if (!iso) return '';
        var d = new Date(iso);
        return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
    }

    function fmtTime(iso) {
        if (!iso) return '';
        var d = new Date(iso);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    function dotClass(status) {
        var s = (status || '').toLowerCase();
        if (s === 'delivered') return 'fxg-tracking-timeline__dot--delivered';
        if (s === 'out for delivery') return 'fxg-tracking-timeline__dot--outfordelivery';
        if (s === 'exception') return 'fxg-tracking-timeline__dot--exception';
        if (s === 'pending') return 'fxg-tracking-timeline__dot--pending';
        return 'fxg-tracking-timeline__dot--default';
    }

    /* ---------- Polished SVG Icons ---------- */
    function statusIcon(shipment) {
        var s = (shipment.currentStatus || '').toLowerCase();
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 64 64');

        if (s === 'delivered') {
            svg.innerHTML =
                '<circle cx="32" cy="32" r="30" fill="#4CAF50"/>' +
                '<circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>' +
                '<path d="M20 33l8 8 16-16" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
        } else if (s === 'out for delivery') {
            svg.innerHTML =
                '<circle cx="32" cy="32" r="30" fill="#FF6600"/>' +
                '<rect x="20" y="26" width="10" height="10" rx="2" fill="#fff" opacity="0.9"/>' +
                '<rect x="30" y="28" width="14" height="8" rx="1.5" fill="#fff" opacity="0.9"/>' +
                '<circle cx="24" cy="42" r="4" fill="#fff" opacity="0.8"/>' +
                '<circle cx="40" cy="42" r="4" fill="#fff" opacity="0.8"/>' +
                '<path d="M20 36l-4-6h6l4 6z" fill="#fff" opacity="0.7"/>';
        } else if (s === 'exception') {
            svg.innerHTML =
                '<circle cx="32" cy="32" r="30" fill="#F44336"/>' +
                '<circle cx="32" cy="19" r="2.5" fill="#fff"/>' +
                '<rect x="29.5" y="28" width="5" height="16" rx="2" fill="#fff"/>';
        } else if (s === 'pending') {
            svg.innerHTML =
                '<circle cx="32" cy="32" r="30" fill="#FFC107"/>' +
                '<circle cx="32" cy="22" r="2" fill="#fff"/>' +
                '<path d="M32 28v14" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/>' +
                '<path d="M32 38l8 4" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/>';
        } else {
            svg.innerHTML =
                '<circle cx="32" cy="32" r="30" fill="#660099"/>' +
                '<circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>' +
                '<rect x="20" y="25" width="10" height="10" rx="2" fill="#fff" opacity="0.9"/>' +
                '<rect x="30" y="27" width="14" height="8" rx="1.5" fill="#fff" opacity="0.9"/>' +
                '<circle cx="24" cy="41" r="4" fill="#fff" opacity="0.8"/>' +
                '<circle cx="40" cy="41" r="4" fill="#fff" opacity="0.8"/>' +
                '<path d="M20 35l-4-6h6l4 6z" fill="#fff" opacity="0.65"/>';
        }
        return svg;
    }

    /* Checkmark SVG used in stepper circles */
    function checkSvg(cx, cy, size) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.innerHTML = '<path d="M6 13l4 4 8-8" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
        return svg;
    }

    /* Inline SVG for timeline delivered dot */
    function timelineCheckSvg() {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.innerHTML = '<path d="M6 13l4 4 8-8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
        return svg;
    }

    /* ---------- Render Functions ---------- */
    function renderHero(el, shipment) {
        var iconBox = el.querySelector('#trStatusIcon');
        iconBox.innerHTML = '';
        iconBox.appendChild(statusIcon(shipment));

        var st = shipment.currentStatus || 'Pending';
        el.querySelector('#trStatusText').textContent = st;

        var parts = [];
        if (shipment.serviceType) parts.push(shipment.serviceType);
        if (shipment.weight) parts.push(shipment.weight);
        el.querySelector('#trServiceInfo').textContent = parts.join(' - ') || '';

        var isDel = st === 'Delivered';
        var dateEl = el.querySelector('#trDeliveryDate');
        if (isDel) {
            var tl = shipment.statusTimeline || [];
            var last = tl.length ? tl[tl.length - 1] : null;
            if (last && last.timestamp) dateEl.textContent = 'Delivered ' + fmtDate(last.timestamp);
            else if (shipment.updatedAt) dateEl.textContent = 'Delivered ' + fmtDate(shipment.updatedAt);
            else dateEl.textContent = 'Delivered';
        } else if (shipment.estDeliveryDate) {
            dateEl.textContent = 'Scheduled delivery: ' + fmtShort(shipment.estDeliveryDate);
        } else {
            dateEl.textContent = '';
        }

        var sigEl = el.querySelector('#trSignedBy');
        sigEl.textContent = (isDel && shipment.signatureName) ? 'Signed for by: ' + shipment.signatureName : '';
        var recipEl = el.querySelector('#trRecipientName');
        if (recipEl) {
            var rn = (shipment.recipient && shipment.recipient.name) || '';
            if (rn) { recipEl.textContent = 'Recipient: ' + rn; recipEl.style.display = ''; }
            else { recipEl.style.display = 'none'; }
        }
        var locEl = el.querySelector('#trDeliveryLocation');
        var re = shipment.recipient || {};
        var loc = [];
        if (re.city) loc.push(re.city);
        if (re.state) loc.push(re.state);
        if (re.country) loc.push(re.country);
        if (re.zip) {
            if (loc.length) loc[loc.length - 1] += ' ' + re.zip;
            else loc.push(re.zip);
        }
        locEl.textContent = loc.length ? loc.join(', ') : '';

        var podEl = el.querySelector('#trProofOfDelivery');
        if (isDel && shipment.image) {
            podEl.innerHTML = '<a href="' + escape(shipment.image) + '" target="_blank">' +
                '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-2 10h-2v-2h2v2zm0-4h-2V9h2v4z"/></svg>' +
                ' Obtain proof of delivery</a>';
        } else if (isDel) {
            podEl.innerHTML = '<span style="font-size:13px;color:#999;display:inline-flex;align-items:center;gap:6px">' +
                '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/></svg>' +
                ' Proof of delivery not available</span>';
        } else {
            podEl.innerHTML = '';
        }
    }

    function renderStepper(el, shipment) {
        var wrap = el.querySelector('#trStepperWrap');
        var status = shipment.currentStatus || 'Pending';
        if (status === 'Pending' || status === 'Exception') {
            wrap.style.display = 'none';
            return;
        }
        wrap.style.display = '';

        var active = stepperStep(status);
        var steps = wrap.querySelectorAll('.fxg-tracking-stepper__step');
        var connectors = wrap.querySelectorAll('.fxg-tracking-stepper__connector');
        var isDel = status === 'Delivered';

        /* Determine dates per stepper step from timeline */
        var tl = shipment.statusTimeline || [];
        var stepDates = [null, null, null, null, null];
        tl.forEach(function (e) {
            var st = (e.status || '').toLowerCase();
            var step = 0;
            if (st === 'shipment created' || st === 'label created') step = 1;
            else if (st === 'package received' || st === 'picked up') step = 2;
            else if (st === 'departed warehouse' || st === 'customs' || st === 'in transit' || st === 'arrived destination') step = 3;
            else if (st === 'out for delivery') step = 4;
            else if (st === 'delivered') step = 5;
            if (step && e.timestamp) stepDates[step - 1] = fmtShort(e.timestamp);
        });

        steps.forEach(function (step) {
            var num = parseInt(step.getAttribute('data-step'), 10);
            var circle = step.querySelector('.fxg-tracking-stepper__circle');
            var dateEl = step.querySelector('.fxg-tracking-stepper__date');

            step.classList.remove('fxg-tracking-stepper__step--completed', 'fxg-tracking-stepper__step--active', 'fxg-tracking-stepper__step--delivered');

            if (isDel && num <= active) {
                step.classList.add('fxg-tracking-stepper__step--delivered');
            } else if (num < active) {
                step.classList.add('fxg-tracking-stepper__step--completed');
            } else if (num === active) {
                step.classList.add('fxg-tracking-stepper__step--active');
            }

            /* Add checkmark SVG inside completed/active/delivered circles */
            var existingCheck = circle.querySelector('svg');
            if (existingCheck) existingCheck.remove();
            if ((num < active) || (num === active) || (isDel && num <= active)) {
                var ck = checkSvg();
                circle.appendChild(ck);
            }

            /* Set date */
            if (dateEl) {
                dateEl.textContent = stepDates[num - 1] || '';
            }
        });

        connectors.forEach(function (conn) {
            conn.classList.remove('fxg-tracking-stepper__connector--filled', 'fxg-tracking-stepper__connector--delivered');
        });
        for (var i = 0; i < active - 1 && i < connectors.length; i++) {
            connectors[i].classList.add(isDel ? 'fxg-tracking-stepper__connector--delivered' : 'fxg-tracking-stepper__connector--filled');
        }
    }

    function renderId(el, shipment) {
        var idEl = el.querySelector('#trTrackingNumber');
        if (shipment.id) {
            idEl.textContent = shipment.id;
            idEl.style.display = '';
        } else {
            idEl.style.display = 'none';
        }
    }

    function renderTimeline(el, shipment) {
        var tl = shipment.statusTimeline || [];
        var container = el.querySelector('#trTravelHistory');
        if (!tl.length) {
            container.innerHTML = '<div style="padding:16px 36px 24px;color:#999;font-size:14px;">No tracking events available.</div>';
            return;
        }

        var sorted = tl.slice().sort(function (a, b) { return new Date(a.timestamp) - new Date(b.timestamp); });
        var html = '<div class="fxg-tracking-timeline">';
        var curDate = null;

        sorted.forEach(function (entry) {
            var d = entry.timestamp ? fmtShort(entry.timestamp) : '';
            if (d && d !== curDate) {
                if (curDate !== null) html += '</div>';
                curDate = d;
                html += '<div class="fxg-tracking-timeline__date-group">';
                html += '<div class="fxg-tracking-timeline__date-header">' + escape(d) + '</div>';
            } else if (!d && curDate === null) {
                html += '<div class="fxg-tracking-timeline__date-group">';
                curDate = '';
            }

            var dc = dotClass(entry.status);
            html += '<div class="fxg-tracking-timeline__item">';
            html += '<div class="fxg-tracking-timeline__dot ' + dc + '">';
            if ((entry.status || '').toLowerCase() === 'delivered') {
                html += '<svg viewBox="0 0 24 24" width="8" height="8"><path d="M6 13l4 4 8-8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            }
            html += '</div>';
            html += '<div class="fxg-tracking-timeline__content">';
            if (entry.timestamp) html += '<div class="fxg-tracking-timeline__time">' + escape(fmtTime(entry.timestamp)) + '</div>';
            html += '<div class="fxg-tracking-timeline__status">' + escape(entry.status) + '</div>';
            if (entry.remark) html += '<div class="fxg-tracking-timeline__remark">' + escape(entry.remark) + '</div>';
            if (entry.location) html += '<div class="fxg-tracking-timeline__location">' + escape(entry.location) + '</div>';
            html += '</div></div>';
        });
        if (curDate !== null) html += '</div>';
        html += '</div>';
        container.innerHTML = html;

        /* Reset collapsible state */
        if (container.classList.contains('fxg-tracking-section__body--closed')) {
            container.classList.remove('fxg-tracking-section__body--closed');
            container.classList.add('fxg-tracking-section__body--open');
            container.style.maxHeight = container.scrollHeight + 20 + 'px';
            container.classList.remove('fxg-tracking-section__body--open');
            container.classList.add('fxg-tracking-section__body--closed');
            container.style.maxHeight = '0';
        }
    }

    function renderFacts(el, shipment) {
        var container = el.querySelector('#trShipmentFacts');
        var facts = [];
        facts.push({ label: 'TRACKING NUMBER', value: shipment.id || '-' });
        if (shipment.createdAt) facts.push({ label: 'SHIP DATE', value: fmtShort(shipment.createdAt) });
        if (shipment.serviceType) facts.push({ label: 'SERVICE', value: shipment.serviceType });
        if (shipment.weight) facts.push({ label: 'WEIGHT', value: shipment.weight });
        if (shipment.dimensions) facts.push({ label: 'DIMENSIONS', value: shipment.dimensions });
        if (shipment.estDeliveryDate) facts.push({ label: 'SCHEDULED DELIVERY', value: fmtShort(shipment.estDeliveryDate) });
        facts.push({ label: 'TOTAL PIECES', value: shipment.totalPieces || '1' });
        if (shipment.packaging) facts.push({ label: 'PACKAGING', value: shipment.packaging });
        if (shipment.referenceNumber) facts.push({ label: 'REFERENCE', value: shipment.referenceNumber });
        if (shipment.signatureRequired) facts.push({ label: 'SIGNATURE SERVICES', value: 'Yes' });
        var re = shipment.recipient || {};
        if (re.isResidential) facts.push({ label: 'DELIVERED TO', value: 'Residence' });
        if (shipment.currentStatus === 'Delivered' && shipment.signatureName) {
            facts.push({ label: 'SIGNED BY', value: shipment.signatureName });
        }
        if (facts.length === 0) {
            container.innerHTML = '<div style="padding:16px 36px 24px;color:#999;font-size:14px;">No shipment details available.</div>';
            return;
        }
        var html = '<div class="fxg-tracking-facts">';
        facts.forEach(function (f) {
            html += '<div class="fxg-tracking-facts__item">';
            html += '<span class="fxg-tracking-facts__label">' + escape(f.label) + '</span>';
            html += '<span class="fxg-tracking-facts__value">' + escape(f.value) + '</span>';
            html += '</div>';
        });
        html += '</div>';
        container.innerHTML = html;

        if (container.classList.contains('fxg-tracking-section__body--closed')) {
            container.classList.remove('fxg-tracking-section__body--closed');
            container.classList.add('fxg-tracking-section__body--open');
            container.style.maxHeight = container.scrollHeight + 20 + 'px';
            container.classList.remove('fxg-tracking-section__body--open');
            container.classList.add('fxg-tracking-section__body--closed');
            container.style.maxHeight = '0';
        }
    }

    function showBanner(el, type, msg) {
        var existing = el.querySelector('.fxg-tracking-status-banner');
        if (existing) existing.remove();
        var b = document.createElement('div');
        b.className = 'fxg-tracking-status-banner fxg-tracking-status-banner--' + type;
        b.textContent = msg;
        var sw = el.querySelector('#trStepperWrap');
        if (sw) sw.parentNode.insertBefore(b, sw.nextSibling);
    }

    function showNotFound(el, id) {
        el.innerHTML =
            '<div class="fxg-tracking-not-found">' +
                '<div class="fxg-tracking-not-found__icon">' +
                    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>' +
                '</div>' +
                '<h2>We don\'t have any information for this tracking number</h2>' +
                '<p>No results were found for the FedEx tracking number <strong>' + escape(id) + '</strong>. Please verify the number and try again.</p>' +
            '</div>';
    }

    function showSystemError(el) {
        el.innerHTML =
            '<div class="fxg-tracking-error">' +
                '<div class="fxg-tracking-error__icon">' +
                    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>' +
                '</div>' +
                '<h2>We\'re sorry, we can\'t process your request right now</h2>' +
                '<p>Please try again later. For assistance, call 1.800.GoFedEx 1.800.463.3339.</p>' +
            '</div>';
    }

    function setupToggle(btn, body) {
        if (!btn || !body) return;
        btn.addEventListener('click', function () {
            var expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', !expanded);
            if (expanded) {
                body.classList.remove('fxg-tracking-section__body--open');
                body.classList.add('fxg-tracking-section__body--closed');
                body.style.maxHeight = '0';
            } else {
                body.classList.remove('fxg-tracking-section__body--closed');
                body.classList.add('fxg-tracking-section__body--open');
                body.style.maxHeight = body.scrollHeight + 20 + 'px';
            }
        });
    }

    /* ---------- Main ---------- */
    window.FDX.components.push(function () {
        var el = document.getElementById('trackingResult');
        if (!el) return;

        var loader = el.querySelector('#trLoader');
        var card = el.querySelector('#trCard');
        var params = new URLSearchParams(window.location.search);
        var trackingId = params.get('tracking');

        if (!trackingId) {
            if (loader) loader.classList.add('fxg-tracking-loader--hidden');
            if (card) card.style.display = '';
            showNotFound(el, '');
            return;
        }

        var F = window.FDX.admin;
        var shipment = null;
        try {
            shipment = F && F.getShipment ? F.getShipment(trackingId) : null;
        } catch (e) {
            shipment = null;
        }

        if (!shipment) {
            if (loader) loader.classList.add('fxg-tracking-loader--hidden');
            if (card) card.style.display = '';
            showNotFound(el, trackingId);
            return;
        }

        /* Small delay so user sees the spinner */
        setTimeout(function () {
            try {
                if (loader) loader.classList.add('fxg-tracking-loader--hidden');
                if (card) {
                    card.style.display = '';
                    card.style.animation = 'none';
                    void card.offsetHeight;
                    card.style.animation = '';
                }

                renderHero(card, shipment);
                renderStepper(card, shipment);
                renderId(card, shipment);
                renderTimeline(card, shipment);
                renderFacts(card, shipment);

                var st = (shipment.currentStatus || '').toLowerCase();
                if (st === 'pending') showBanner(card, 'pending', 'Your shipment is pending. Additional information may be needed.');
                else if (st === 'exception') showBanner(card, 'exception', 'There is a delivery exception for this shipment. Please check the travel history for details.');

                setupToggle(el.querySelector('#trHistoryToggle'), el.querySelector('#trTravelHistory'));
                setupToggle(el.querySelector('#trFactsToggle'), el.querySelector('#trShipmentFacts'));
            } catch (e) {
                if (loader) loader.classList.add('fxg-tracking-loader--hidden');
                if (card) card.style.display = '';
                showSystemError(el);
            }
        }, 600);
    });

    /* ---------- Full-screen Overlay ---------- */
    var overlayHTML = [
        '<div class="fxg-tracking-overlay" id="fxgTrackingOverlay">',
        '<button class="fxg-tracking-overlay__close" id="trOverlayClose" aria-label="Close tracking result">',
        '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
        '</button>',
        '<div class="fxg-tracking-wrap">',
        '<div class="fxg-tracking-loader" id="trLoader">',
        '<div class="fxg-tracking-loader__spinner" style="width:64px;height:64px;border-width:5px"></div>',
        '<p class="fxg-tracking-loader__text">Looking up your shipment...</p>',
        '</div>',
        '<div class="fxg-tracking" id="trCard" style="display:none">',
        '<div class="fxg-tracking-hero" id="trHero">',
        '<div class="fxg-tracking-hero__icon" id="trStatusIcon"></div>',
        '<div class="fxg-tracking-hero__info">',
        '<h1 class="fxg-tracking-hero__status" id="trStatusText"></h1>',
        '<p class="fxg-tracking-hero__service" id="trServiceInfo"></p>',
        '<p class="fxg-tracking-hero__date" id="trDeliveryDate"></p>',
        '<p class="fxg-tracking-hero__signature" id="trSignedBy"></p>',
        '<p class="fxg-tracking-hero__recipient" id="trRecipientName"></p>',
        '<p class="fxg-tracking-hero__location" id="trDeliveryLocation"></p>',
        '<div class="fxg-tracking-hero__pod" id="trProofOfDelivery"></div>',
        '</div></div>',
        '<div class="fxg-tracking-stepper-wrap" id="trStepperWrap">',
        '<div class="fxg-tracking-stepper" id="trProgressStepper">',
        '<div class="fxg-tracking-stepper__step" data-step="1"><div class="fxg-tracking-stepper__circle"></div><span class="fxg-tracking-stepper__label">Label Created</span><span class="fxg-tracking-stepper__date" id="trStepDate1"></span></div>',
        '<div class="fxg-tracking-stepper__connector"></div>',
        '<div class="fxg-tracking-stepper__step" data-step="2"><div class="fxg-tracking-stepper__circle"></div><span class="fxg-tracking-stepper__label">Picked Up</span><span class="fxg-tracking-stepper__date" id="trStepDate2"></span></div>',
        '<div class="fxg-tracking-stepper__connector"></div>',
        '<div class="fxg-tracking-stepper__step" data-step="3"><div class="fxg-tracking-stepper__circle"></div><span class="fxg-tracking-stepper__label">In Transit</span><span class="fxg-tracking-stepper__date" id="trStepDate3"></span></div>',
        '<div class="fxg-tracking-stepper__connector"></div>',
        '<div class="fxg-tracking-stepper__step" data-step="4"><div class="fxg-tracking-stepper__circle"></div><span class="fxg-tracking-stepper__label">Out for Delivery</span><span class="fxg-tracking-stepper__date" id="trStepDate4"></span></div>',
        '<div class="fxg-tracking-stepper__connector"></div>',
        '<div class="fxg-tracking-stepper__step" data-step="5"><div class="fxg-tracking-stepper__circle"></div><span class="fxg-tracking-stepper__label">Delivered</span><span class="fxg-tracking-stepper__date" id="trStepDate5"></span></div>',
        '</div></div>',
        '<div class="fxg-tracking-id" id="trTrackingNumber"></div>',
        '<div class="fxg-tracking-section"><button class="fxg-tracking-section__toggle" id="trHistoryToggle" aria-expanded="false"><svg class="fxg-tracking-section__toggle-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9.29 6.71a1 1 0 0 0 0 1.42L13.17 12l-3.88 3.88a1 1 0 0 0 1.42 1.42l4.59-4.59a1 1 0 0 0 0-1.42L10.7 6.71a1 1 0 0 0-1.41 0z"/></svg>View travel history</button><div class="fxg-tracking-section__body fxg-tracking-section__body--closed" id="trTravelHistory"></div></div>',
        '<div class="fxg-tracking-section"><button class="fxg-tracking-section__toggle" id="trFactsToggle" aria-expanded="false"><svg class="fxg-tracking-section__toggle-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9.29 6.71a1 1 0 0 0 0 1.42L13.17 12l-3.88 3.88a1 1 0 0 0 1.42 1.42l4.59-4.59a1 1 0 0 0 0-1.42L10.7 6.71a1 1 0 0 0-1.41 0z"/></svg>Shipment facts</button><div class="fxg-tracking-section__body fxg-tracking-section__body--closed" id="trShipmentFacts"></div></div>',
        '</div></div></div>'
    ].join('');

    window.FDX.track = function (trackingId) {
        if (!trackingId) return;
        var existing = document.getElementById('fxgTrackingOverlay');
        if (existing) existing.remove();
        var wrap = document.createElement('div');
        wrap.innerHTML = overlayHTML;
        var overlay = wrap.firstElementChild;
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        var loader = overlay.querySelector('#trLoader');
        var card = overlay.querySelector('#trCard');

        /* Ensure loader visible, card hidden */
        if (loader) loader.classList.remove('fxg-tracking-loader--hidden');
        if (card) card.style.display = 'none';

        function closeTrackOverlay() {
            overlay.remove();
            document.body.style.overflow = '';
        }
        var closeBtn = overlay.querySelector('#trOverlayClose');
        if (closeBtn) closeBtn.addEventListener('click', closeTrackOverlay);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeTrackOverlay();
        });

        function renderShipment(shipment) {
            if (loader) loader.classList.add('fxg-tracking-loader--hidden');
            if (card) {
                card.style.display = '';
                card.style.animation = 'none';
                void card.offsetHeight;
                card.style.animation = '';
            }
            try {
                renderHero(card, shipment);
                renderStepper(card, shipment);
                renderId(card, shipment);
                renderTimeline(card, shipment);
                renderFacts(card, shipment);

                var st = (shipment.currentStatus || '').toLowerCase();
                if (st === 'pending') showBanner(card, 'pending', 'Your shipment is pending. Additional information may be needed.');
                else if (st === 'exception') showBanner(card, 'exception', 'There is a delivery exception for this shipment. Please check the travel history for details.');

                setupToggle(card.querySelector('#trHistoryToggle'), card.querySelector('#trTravelHistory'));
                setupToggle(card.querySelector('#trFactsToggle'), card.querySelector('#trShipmentFacts'));
            } catch (e) {
                if (loader) loader.classList.add('fxg-tracking-loader--hidden');
                if (card) card.style.display = '';
                showSystemError(card);
            }
        }

        function showNoResult() {
            if (loader) loader.classList.add('fxg-tracking-loader--hidden');
            if (card) { card.style.display = ''; card.style.animation = 'none'; void card.offsetHeight; card.style.animation = ''; }
            showNotFound(card, trackingId);
        }

        /* Brief spinner, then try local */
        setTimeout(function () {
            var F = window.FDX.admin;
            var shipment = null;
            try {
                shipment = F && F.getShipment ? F.getShipment(trackingId) : null;
            } catch (e) {}

            if (shipment) {
                renderShipment(shipment);
                return;
            }

            /* Not found locally — try Supabase */
            if (F && F.fetchShipment) {
                try {
                    F.fetchShipment(trackingId).then(function (remote) {
                        if (remote) renderShipment(remote);
                        else showNoResult();
                    }).catch(function () {
                        showNoResult();
                    });
                } catch (e) {
                    showNoResult();
                }
            } else {
                showNoResult();
            }
        }, 600);
    };
})();
