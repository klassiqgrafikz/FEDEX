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

    function checkSvg(cx, cy, size) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.innerHTML = '<path d="M6 13l4 4 8-8" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
        return svg;
    }

    function timelineCheckSvg() {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.innerHTML = '<path d="M6 13l4 4 8-8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
        return svg;
    }

    function alertSvg() {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '20');
        svg.setAttribute('height', '20');
        svg.innerHTML = '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor"/>';
        return svg;
    }

    function copySvg() {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '18');
        svg.setAttribute('height', '18');
        svg.innerHTML = '<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>';
        return svg;
    }

    function editSvg() {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '18');
        svg.setAttribute('height', '18');
        svg.innerHTML = '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>';
        return svg;
    }

    function renderStatusSummary(el, shipment) {
        var statusTextEl = el.querySelector('#trStatusText');
        var dateEl = el.querySelector('#trDeliveryDate');
        var iconBox = el.querySelector('#trStatusIcon');

        if (iconBox) {
            iconBox.innerHTML = '';
            iconBox.appendChild(statusIcon(shipment));
        }

        var st = shipment.currentStatus || 'Pending';
        if (statusTextEl) statusTextEl.textContent = st;

        var isDel = st === 'Delivered';
        if (dateEl) {
            if (isDel) {
                var tl = shipment.statusTimeline || [];
                var last = tl.length ? tl[tl.length - 1] : null;
                if (last && last.timestamp) dateEl.innerHTML = '<strong>Delivered:</strong> ' + fmtDate(last.timestamp);
                else if (shipment.updatedAt) dateEl.innerHTML = '<strong>Delivered:</strong> ' + fmtDate(shipment.updatedAt);
                else dateEl.innerHTML = '<strong>Delivered</strong>';
            } else if (shipment.estDeliveryDate) {
                dateEl.innerHTML = '<strong>Scheduled delivery:</strong> ' + fmtShort(shipment.estDeliveryDate);
            } else {
                dateEl.textContent = '';
            }
        }
    }

    function renderAlertBanner(el, shipment) {
        var alertEl = el.querySelector('#trAlertBanner');
        if (!alertEl) return;

        var messages = [];
        if (shipment.signatureRequired) {
            messages.push('Signature required for delivery');
        }
        if (shipment.shipperNote) {
            messages.push(shipment.shipperNote);
        }

        if (messages.length > 0) {
            alertEl.classList.remove('fxg-tr-alert--hidden');
            alertEl.innerHTML = '';
            var svg = alertSvg();
            alertEl.appendChild(svg);
            alertEl.appendChild(document.createTextNode(' ' + messages.join(' | ')));
        } else {
            alertEl.classList.add('fxg-tr-alert--hidden');
        }
    }

    function renderStepper(el, shipment) {
        var wrap = el.querySelector('#trStepperWrap');
        if (!wrap) return;
        var status = shipment.currentStatus || 'Pending';
        if (status === 'Pending' || status === 'Exception') {
            wrap.style.display = 'none';
            return;
        }
        wrap.style.display = '';

        var active = stepperStep(status);
        var steps = wrap.querySelectorAll('.fxg-tr-stepper__step');
        var connectors = wrap.querySelectorAll('.fxg-tr-stepper__connector');
        var isDel = status === 'Delivered';

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
            var circle = step.querySelector('.fxg-tr-stepper__circle');
            var dateEl = step.querySelector('.fxg-tr-stepper__date');

            step.classList.remove('fxg-tr-stepper__step--completed', 'fxg-tr-stepper__step--active', 'fxg-tr-stepper__step--delivered');

            if (isDel && num <= active) {
                step.classList.add('fxg-tr-stepper__step--delivered');
            } else if (num < active) {
                step.classList.add('fxg-tr-stepper__step--completed');
            } else if (num === active) {
                step.classList.add('fxg-tr-stepper__step--active');
            }

            var existingCheck = circle.querySelector('svg');
            if (existingCheck) existingCheck.remove();
            if ((num < active) || (num === active) || (isDel && num <= active)) {
                var ck = checkSvg(0, 0, 24);
                circle.appendChild(ck);
            }

            if (dateEl) {
                dateEl.textContent = stepDates[num - 1] || '';
            }
        });

        connectors.forEach(function (conn) {
            conn.classList.remove('fxg-tr-stepper__connector--filled', 'fxg-tr-stepper__connector--delivered');
        });
        for (var i = 0; i < active - 1 && i < connectors.length; i++) {
            connectors[i].classList.add(isDel ? 'fxg-tr-stepper__connector--delivered' : 'fxg-tr-stepper__connector--filled');
        }
    }

    function scanDotClass(status) {
        var s = (status || '').toLowerCase();
        if (s === 'delivered') return 'fxg-tr-scans__dot--delivered';
        if (s === 'out for delivery') return 'fxg-tr-scans__dot--outfordelivery';
        if (s === 'exception') return 'fxg-tr-scans__dot--exception';
        if (s === 'pending') return 'fxg-tr-scans__dot--pending';
        return '';
    }

    function renderScanEvents(el, shipment) {
        var container = el.querySelector('#trScansContainer');
        if (!container) return;

        var tl = shipment.statusTimeline || [];
        if (!tl.length) {
            container.innerHTML = '';
            container.classList.add('fxg-tr-scans--empty');
            return;
        }
        container.classList.remove('fxg-tr-scans--empty');

        var sorted = tl.slice().sort(function (a, b) { return new Date(a.timestamp) - new Date(b.timestamp); });
        var html = '';
        var curDate = null;
        var dateGroups = 0;

        sorted.forEach(function (entry, idx) {
            var d = entry.timestamp ? fmtShort(entry.timestamp) : '';
            if (d && d !== curDate) {
                if (curDate !== null) html += '</div>';
                curDate = d;
                dateGroups++;
                html += '<div class="fxg-tr-scans__date-group">';
                if (dateGroups > 1) {
                    html += '<div class="fxg-tr-scans__date-header">' + escape(d) + '</div>';
                }
            } else if (!d && curDate === null) {
                html += '<div class="fxg-tr-scans__date-group">';
                curDate = '';
            }

            var sc = scanDotClass(entry.status);
            var isActive = (idx === sorted.length - 1);
            var statusKey = (entry.status || '').toLowerCase().replace(/\s+/g, '');
            html += '<div class="fxg-tr-scans__item' + (isActive ? ' fxg-tr-scans__item--active fxg-tr-scans__item--' + escape(statusKey) : '') + '">';
            html += '<div class="fxg-tr-scans__dot ' + sc + '">';
            if (isActive) {
                html += '<svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="23" stroke="#fff" stroke-width="3" fill="none"/><polyline points="18,18 34,26 18,34" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            }
            html += '</div>';
            html += '<div class="fxg-tr-scans__content">';
            if (entry.timestamp) html += '<div class="fxg-tr-scans__time">' + escape(fmtTime(entry.timestamp)) + '</div>';
            html += '<div class="fxg-tr-scans__status">' + escape(entry.status) + '</div>';
            if (entry.remark) html += '<div class="fxg-tr-scans__remark">' + escape(entry.remark) + '</div>';
            if (entry.location) html += '<div class="fxg-tr-scans__location">' + escape(entry.location) + '</div>';
            html += '</div></div>';
        });
        if (curDate !== null) html += '</div>';

        container.innerHTML = html;
    }

    function renderFacts(el, shipment) {
        var container = el.querySelector('#trShipmentFacts');
        if (!container) return;

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
            container.innerHTML = '<div style="padding:16px 0 24px;color:#999;font-size:14px;">No shipment details available.</div>';
            return;
        }

        var html = '<div class="fxg-tr-facts">';
        facts.forEach(function (f) {
            html += '<div class="fxg-tr-facts__item">';
            html += '<span class="fxg-tr-facts__label">' + escape(f.label) + '</span>';
            html += '<span class="fxg-tr-facts__value">' + escape(f.value) + '</span>';
            html += '</div>';
        });
        html += '</div>';
        container.innerHTML = html;
    }

    function renderPackageMedia(el, shipment) {
        var container = el.querySelector('#trPackageMedia');
        if (!container) return;
        var mediaList = shipment.media || [];
        var hasMedia = mediaList.some(function(m) { return m && m.data; });
        if (!hasMedia) { container.innerHTML = ''; return; }
        var html = '<div class="fxg-tr-media__inner">';
        for (var mi = 0; mi < mediaList.length; mi++) {
            var m = mediaList[mi];
            if (!m || !m.data) continue;
            if (m.media_type === 'image') {
                html += '<div class="fxg-tr-media__item"><img src="' + m.data + '" alt="Package image"></div>';
            } else if (m.media_type === 'video') {
                html += '<div class="fxg-tr-media__item"><video src="' + m.data + '" muted controls></video></div>';
            }
        }
        html += '</div>';
        container.innerHTML = html;
    }

    function renderTrackingHeader(el, shipment) {
        var headerEl = el.querySelector('#trHeader');
        if (!headerEl) return;

        var valueEl = headerEl.querySelector('#trTrackingValue');
        if (valueEl && shipment.id) {
            valueEl.textContent = shipment.id;
        }

        var copyBtn = headerEl.querySelector('#trCopyBtn');
        var editBtn = headerEl.querySelector('#trEditBtn');

        if (copyBtn) {
            copyBtn.onclick = function () {
                navigator.clipboard.writeText(shipment.id || '').then(function () {
                    var orig = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/></svg>';
                    copyBtn.style.color = '#4CAF50';
                    setTimeout(function () {
                        copyBtn.innerHTML = orig;
                        copyBtn.style.color = '';
                    }, 1500);
                });
            };
        }

        if (editBtn) {
            editBtn.onclick = function () {
                if (window.FDX && window.FDX.admin && window.FDX.admin.openEditPage) {
                    window.FDX.admin.openEditPage(shipment.id);
                }
            };
        }
    }

    function showNotFound(el, id) {
        el.innerHTML =
            '<div class="fxg-tr-not-found">' +
                '<div class="fxg-tr-not-found__icon">' +
                    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>' +
                '</div>' +
                '<h2>We don\'t have any information for this tracking number</h2>' +
                '<p>No results were found for the FedEx tracking number <strong>' + escape(id) + '</strong>. Please verify the number and try again.</p>' +
            '</div>';
    }

    function showSystemError(el) {
        el.innerHTML =
            '<div class="fxg-tr-error">' +
                '<div class="fxg-tr-error__icon">' +
                    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>' +
                '</div>' +
                '<h2>We\'re sorry, we can\'t process your request right now</h2>' +
                '<p>Please try again later. For assistance, call 1.800.GoFedEx 1.800.463.3339.</p>' +
            '</div>';
    }

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
        '<div class="fxg-tracking-card" id="trCard" style="display:none">',
        '<div class="fxg-tr-header" id="trHeader">',
        '<div class="fxg-tr-header__main">',
        '<span class="fxg-tr-header__label">TRACKING NUMBER</span>',
        '<span class="fxg-tr-header__value" id="trTrackingValue"></span>',
        '</div>',
        '<div class="fxg-tr-header__actions">',
        '<button class="fxg-tr-header__action" id="trCopyBtn" aria-label="Copy tracking number" title="Copy">',
        copySvg().outerHTML,
        '</button>',
        '<button class="fxg-tr-header__action" id="trEditBtn" aria-label="Edit shipment" title="Edit">',
        editSvg().outerHTML,
        '</button>',
        '</div>',
        '</div>',
        '<div class="fxg-tr-summary">',
        '<div class="fxg-tr-summary__main">',
        '<div class="fxg-tr-summary__status-row">',
        '<span class="fxg-tr-summary__status-text" id="trStatusText"></span>',
        '</div>',
        '<p class="fxg-tr-summary__date" id="trDeliveryDate"></p>',
        '</div>',
        '<div class="fxg-tr-summary__icon" id="trStatusIcon"></div>',
        '</div>',
        '<div class="fxg-tr-alert fxg-tr-alert--hidden" id="trAlertBanner"></div>',
        '<div class="fxg-tr-stepper-wrap" id="trStepperWrap">',
        '<div class="fxg-tr-stepper" id="trProgressStepper">',
        '<div class="fxg-tr-stepper__step" data-step="1"><div class="fxg-tr-stepper__circle"></div><span class="fxg-tr-stepper__label">Label Created</span><span class="fxg-tr-stepper__date" id="trStepDate1"></span></div>',
        '<div class="fxg-tr-stepper__connector"></div>',
        '<div class="fxg-tr-stepper__step" data-step="2"><div class="fxg-tr-stepper__circle"></div><span class="fxg-tr-stepper__label">Picked Up</span><span class="fxg-tr-stepper__date" id="trStepDate2"></span></div>',
        '<div class="fxg-tr-stepper__connector"></div>',
        '<div class="fxg-tr-stepper__step" data-step="3"><div class="fxg-tr-stepper__circle"></div><span class="fxg-tr-stepper__label">In Transit</span><span class="fxg-tr-stepper__date" id="trStepDate3"></span></div>',
        '<div class="fxg-tr-stepper__connector"></div>',
        '<div class="fxg-tr-stepper__step" data-step="4"><div class="fxg-tr-stepper__circle"></div><span class="fxg-tr-stepper__label">Out for Delivery</span><span class="fxg-tr-stepper__date" id="trStepDate4"></span></div>',
        '<div class="fxg-tr-stepper__connector"></div>',
        '<div class="fxg-tr-stepper__step" data-step="5"><div class="fxg-tr-stepper__circle"></div><span class="fxg-tr-stepper__label">Delivered</span><span class="fxg-tr-stepper__date" id="trStepDate5"></span></div>',
        '</div></div>',
        '<div class="fxg-tr-scans" id="trScansContainer"></div>',
        '<div class="fxg-tr-media" id="trPackageMedia"></div>',
        '<div class="fxg-tr-facts" id="trShipmentFacts"></div>',
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
        var origOverflow = document.body.style.overflow;
        var origPos = document.body.style.position;
        var origWidth = document.body.style.width;
        var origTop = document.body.style.top;
        var scrollY = window.scrollY;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = '-' + scrollY + 'px';

        var loader = overlay.querySelector('#trLoader');
        var card = overlay.querySelector('#trCard');

        if (loader) loader.classList.remove('fxg-tracking-loader--hidden');
        if (card) card.style.display = 'none';

        function closeTrackOverlay() {
            overlay.remove();
            document.body.style.overflow = origOverflow;
            document.body.style.position = origPos;
            document.body.style.width = origWidth;
            document.body.style.top = origTop;
            window.scrollTo(0, scrollY);
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
                renderTrackingHeader(card, shipment);
                renderStatusSummary(card, shipment);
                renderAlertBanner(card, shipment);
                renderStepper(card, shipment);
                renderScanEvents(card, shipment);
                renderPackageMedia(card, shipment);
                renderFacts(card, shipment);
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

        setTimeout(function () {
            var F = window.FDX.admin;
            console.log('[FDX Track] window.FDX.admin:', !!F);
            var shipment = null;
            try {
                shipment = F && F.getShipment ? F.getShipment(trackingId) : null;
            } catch (e) {}
            console.log('[FDX Track] getShipment result:', shipment ? 'found' : 'null');

            if (shipment) {
                renderShipment(shipment);
                return;
            }

            if (F && F.fetchShipment) {
                console.log('[FDX Track] Calling fetchShipment for:', trackingId);
                try {
                    F.fetchShipment(trackingId).then(function (remote) {
                        console.log('[FDX Track] fetchShipment resolved:', remote ? 'found' : 'null');
                        if (remote) renderShipment(remote);
                        else showNoResult();
                    }).catch(function (err) {
                        console.log('[FDX Track] fetchShipment error:', err);
                        showNoResult();
                    });
                } catch (e) {
                    console.log('[FDX Track] fetchShipment threw:', e);
                    showNoResult();
                }
            } else {
                console.log('[FDX Track] fetchShipment not available');
                showNoResult();
            }
        }, 600);
    };

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

        setTimeout(function () {
            try {
                if (loader) loader.classList.add('fxg-tracking-loader--hidden');
                if (card) {
                    card.style.display = '';
                    card.style.animation = 'none';
                    void card.offsetHeight;
                    card.style.animation = '';
                }

                renderTrackingHeader(el, shipment);
                renderStatusSummary(el, shipment);
                renderAlertBanner(el, shipment);
                renderStepper(el, shipment);
                renderScanEvents(el, shipment);
                renderFacts(el, shipment);
            } catch (e) {
                if (loader) loader.classList.add('fxg-tracking-loader--hidden');
                if (card) card.style.display = '';
                showSystemError(el);
            }
        }, 600);
    });
})();