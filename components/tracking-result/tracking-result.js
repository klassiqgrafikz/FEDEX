(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    var STATUS_STEP_MAP = [1, 2, 3, 3, 3, 3, 4, 5];

    function getStepperStep(status) {
        var idx = window.FDX.admin.STATUSES.indexOf(status);
        if (idx < 0 || idx >= STATUS_STEP_MAP.length) return 0;
        return STATUS_STEP_MAP[idx];
    }

    function escapeHtml(text) {
        if (!text) return '';
        var d = document.createElement('div');
        d.appendChild(document.createTextNode(text));
        return d.innerHTML;
    }

    function formatDate(iso) {
        if (!iso) return '';
        var d = new Date(iso);
        return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear() + ' at ' +
            d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    function formatDateShort(iso) {
        if (!iso) return '';
        var d = new Date(iso);
        return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
    }

    function formatTime(iso) {
        if (!iso) return '';
        var d = new Date(iso);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    function statusDotClass(status) {
        var s = (status || '').toLowerCase();
        if (s === 'delivered') return 'fxg-tracking-timeline__dot--delivered';
        if (s === 'out for delivery') return 'fxg-tracking-timeline__dot--outfordelivery';
        if (s === 'exception') return 'fxg-tracking-timeline__dot--exception';
        if (s === 'pending') return 'fxg-tracking-timeline__dot--pending';
        return 'fxg-tracking-timeline__dot--default';
    }

    function getStatusIcon(shipment) {
        var svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgEl.setAttribute('viewBox', '0 0 56 56');

        var status = (shipment.currentStatus || '').toLowerCase();

        if (status === 'delivered') {
            svgEl.innerHTML =
                '<circle cx="28" cy="28" r="28" fill="#4CAF50"/>' +
                '<path d="M16 28l8 8 16-16" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
        } else if (status === 'out for delivery') {
            svgEl.innerHTML =
                '<circle cx="28" cy="28" r="28" fill="#FF6600"/>' +
                '<path d="M18 38V20l10-6 10 6v18z" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>' +
                '<circle cx="28" cy="30" r="5" fill="none" stroke="#fff" stroke-width="2.5"/>' +
                '<path d="M28 26v4l3 2" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>';
        } else if (status === 'exception') {
            svgEl.innerHTML =
                '<circle cx="28" cy="28" r="28" fill="#F44336"/>' +
                '<path d="M28 15v16" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' +
                '<circle cx="28" cy="37" r="2.5" fill="#fff"/>';
        } else if (status === 'pending') {
            svgEl.innerHTML =
                '<circle cx="28" cy="28" r="28" fill="#FFC107"/>' +
                '<circle cx="28" cy="28" r="2" fill="#fff"/>' +
                '<path d="M28 16v12l8 4" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>';
        } else {
            svgEl.innerHTML =
                '<circle cx="28" cy="28" r="28" fill="#660099"/>' +
                '<path d="M18 38V20l10-6 10 6v18z" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>' +
                '<circle cx="28" cy="30" r="5" fill="none" stroke="#fff" stroke-width="2.5"/>' +
                '<path d="M28 26v4l3 2" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>';
        }
        return svgEl;
    }

    function renderStatusHero(el, shipment) {
        var iconBox = el.querySelector('#trStatusIcon');
        iconBox.innerHTML = '';
        iconBox.appendChild(getStatusIcon(shipment));

        var status = shipment.currentStatus || 'Pending';
        el.querySelector('#trStatusText').textContent = status;

        var serviceParts = [];
        if (shipment.serviceType) serviceParts.push(shipment.serviceType);
        if (shipment.weight) serviceParts.push(shipment.weight);
        el.querySelector('#trServiceInfo').textContent = serviceParts.join(' - ') || '';

        var isDelivered = status === 'Delivered';
        var dateEl = el.querySelector('#trDeliveryDate');
        if (isDelivered) {
            var timeline = shipment.statusTimeline || [];
            var lastEntry = timeline.length ? timeline[timeline.length - 1] : null;
            if (lastEntry && lastEntry.timestamp) {
                dateEl.textContent = 'Delivered ' + formatDate(lastEntry.timestamp);
            } else if (shipment.updatedAt) {
                dateEl.textContent = 'Delivered ' + formatDate(shipment.updatedAt);
            } else {
                dateEl.textContent = 'Delivered';
            }
        } else if (shipment.estDeliveryDate) {
            dateEl.textContent = 'Scheduled delivery: ' + formatDateShort(shipment.estDeliveryDate);
        } else {
            dateEl.textContent = '';
        }

        var sigEl = el.querySelector('#trSignedBy');
        if (isDelivered && shipment.signatureName) {
            sigEl.textContent = 'Signed for by: ' + shipment.signatureName;
        } else {
            sigEl.textContent = '';
        }

        var locEl = el.querySelector('#trDeliveryLocation');
        var re = shipment.recipient || {};
        var locParts = [];
        if (re.city) locParts.push(re.city);
        if (re.state) locParts.push(re.state);
        if (re.country) locParts.push(re.country);
        if (re.zip) {
            if (locParts.length) locParts[locParts.length - 1] += ' ' + re.zip;
            else locParts.push(re.zip);
        }
        locEl.textContent = locParts.length ? locParts.join(', ') : '';

        var podEl = el.querySelector('#trProofOfDelivery');
        if (isDelivered && shipment.image) {
            podEl.innerHTML = '<a href="' + escapeHtml(shipment.image) + '" target="_blank">Obtain proof of delivery</a>';
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

        var activeStep = getStepperStep(status);
        var steps = wrap.querySelectorAll('.fxg-tracking-stepper__step');
        var connectors = wrap.querySelectorAll('.fxg-tracking-stepper__connector');

        var isDelivered = status === 'Delivered';

        steps.forEach(function(step) {
            var stepNum = parseInt(step.getAttribute('data-step'), 10);
            step.classList.remove('fxg-tracking-stepper__step--completed', 'fxg-tracking-stepper__step--active', 'fxg-tracking-stepper__step--delivered');
            if (isDelivered && stepNum <= activeStep) {
                step.classList.add('fxg-tracking-stepper__step--delivered');
            } else if (stepNum < activeStep) {
                step.classList.add('fxg-tracking-stepper__step--completed');
            } else if (stepNum === activeStep) {
                step.classList.add('fxg-tracking-stepper__step--active');
            }
        });

        connectors.forEach(function(conn) {
            conn.classList.remove('fxg-tracking-stepper__connector--filled', 'fxg-tracking-stepper__connector--delivered');
        });
        for (var i = 0; i < activeStep - 1 && i < connectors.length; i++) {
            if (isDelivered) {
                connectors[i].classList.add('fxg-tracking-stepper__connector--delivered');
            } else {
                connectors[i].classList.add('fxg-tracking-stepper__connector--filled');
            }
        }
    }

    function renderTrackingNumber(el, shipment) {
        var idEl = el.querySelector('#trTrackingNumber');
        if (shipment.id) {
            idEl.textContent = shipment.id;
            idEl.style.display = '';
        } else {
            idEl.style.display = 'none';
        }
    }

    function renderTravelHistory(el, shipment) {
        var timeline = shipment.statusTimeline || [];
        var container = el.querySelector('#trTravelHistory');
        if (!timeline.length) {
            container.innerHTML = '<div style="padding:16px 32px 20px;color:#999;font-size:14px;">No tracking events available.</div>';
            return;
        }

        var sorted = timeline.slice().sort(function(a, b) {
            return new Date(a.timestamp) - new Date(b.timestamp);
        });

        var html = '<div class="fxg-tracking-timeline">';
        var currentDate = null;
        sorted.forEach(function(entry) {
            var entryDate = entry.timestamp ? formatDateShort(entry.timestamp) : '';
            if (entryDate && entryDate !== currentDate) {
                if (currentDate !== null) {
                    html += '</div>';
                }
                currentDate = entryDate;
                html += '<div class="fxg-tracking-timeline__date-group">';
                html += '<div class="fxg-tracking-timeline__date-header">' + escapeHtml(entryDate) + '</div>';
            } else if (!entryDate && currentDate === null) {
                html += '<div class="fxg-tracking-timeline__date-group">';
                currentDate = '';
            }

            var dotClass = statusDotClass(entry.status);
            html += '<div class="fxg-tracking-timeline__item">';
            html += '<div class="fxg-tracking-timeline__dot ' + dotClass + '"></div>';
            html += '<div class="fxg-tracking-timeline__content">';
            if (entry.timestamp) {
                html += '<div class="fxg-tracking-timeline__time">' + escapeHtml(formatTime(entry.timestamp)) + '</div>';
            }
            html += '<div class="fxg-tracking-timeline__status">' + escapeHtml(entry.status) + '</div>';
            if (entry.remark) {
                html += '<div class="fxg-tracking-timeline__remark">' + escapeHtml(entry.remark) + '</div>';
            }
            if (entry.location) {
                html += '<div class="fxg-tracking-timeline__location">' + escapeHtml(entry.location) + '</div>';
            }
            html += '</div></div>';
        });
        if (currentDate !== null) {
            html += '</div>';
        }
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

    function renderShipmentFacts(el, shipment) {
        var container = el.querySelector('#trShipmentFacts');
        var F = window.FDX.admin;
        var facts = [];

        facts.push({ label: 'TRACKING NUMBER', value: shipment.id || '-' });
        if (shipment.createdAt) facts.push({ label: 'SHIP DATE', value: formatDateShort(shipment.createdAt) });
        if (shipment.serviceType) facts.push({ label: 'SERVICE', value: shipment.serviceType });
        if (shipment.weight) facts.push({ label: 'WEIGHT', value: shipment.weight });
        if (shipment.dimensions) facts.push({ label: 'DIMENSIONS', value: shipment.dimensions });
        if (shipment.estDeliveryDate) facts.push({ label: 'SCHEDULED DELIVERY', value: formatDateShort(shipment.estDeliveryDate) });
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
            container.innerHTML = '<div style="padding:16px 32px 20px;color:#999;font-size:14px;">No shipment details available.</div>';
            return;
        }

        var html = '<div class="fxg-tracking-facts">';
        facts.forEach(function(f) {
            html += '<div class="fxg-tracking-facts__item">';
            html += '<span class="fxg-tracking-facts__label">' + escapeHtml(f.label) + '</span>';
            html += '<span class="fxg-tracking-facts__value">' + escapeHtml(f.value) + '</span>';
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

    function showBanner(el, type, message) {
        var existing = el.querySelector('.fxg-tracking-status-banner');
        if (existing) existing.remove();
        var banner = document.createElement('div');
        banner.className = 'fxg-tracking-status-banner fxg-tracking-status-banner--' + type;
        banner.textContent = message;
        var stepperWrap = el.querySelector('#trStepperWrap');
        if (stepperWrap) {
            stepperWrap.parentNode.insertBefore(banner, stepperWrap.nextSibling);
        }
    }

    function showNotFound(el, trackingId) {
        el.innerHTML =
            '<div class="fxg-tracking-not-found">' +
                '<div class="fxg-tracking-not-found__icon">' +
                    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>' +
                '</div>' +
                '<h2>We don\'t have any information for this tracking number</h2>' +
                '<p>No results were found for the FedEx tracking number <strong>' + escapeHtml(trackingId) + '</strong>. Please verify the number and try again.</p>' +
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

    window.FDX.components.push(function() {
        var el = document.getElementById('trackingResult');
        if (!el) return;

        var params = new URLSearchParams(window.location.search);
        var trackingId = params.get('tracking');
        var F = window.FDX.admin;

        if (!trackingId) {
            showNotFound(el, '');
            return;
        }

        var shipment = null;
        try {
            shipment = F && F.getShipment ? F.getShipment(trackingId) : null;
        } catch (e) {
            shipment = null;
        }

        if (!shipment) {
            showNotFound(el, trackingId);
            return;
        }

        try {
            renderStatusHero(el, shipment);
            renderStepper(el, shipment);
            renderTrackingNumber(el, shipment);
            renderTravelHistory(el, shipment);
            renderShipmentFacts(el, shipment);

            var status = (shipment.currentStatus || '').toLowerCase();
            if (status === 'pending') {
                showBanner(el, 'pending', 'Your shipment is pending. Additional information may be needed.');
            } else if (status === 'exception') {
                showBanner(el, 'exception', 'There is a delivery exception for this shipment. Please check the travel history for details.');
            }

            var toggleHistory = el.querySelector('#trHistoryToggle');
            var historyBody = el.querySelector('#trTravelHistory');
            if (toggleHistory && historyBody) {
                toggleHistory.addEventListener('click', function() {
                    var expanded = toggleHistory.getAttribute('aria-expanded') === 'true';
                    toggleHistory.setAttribute('aria-expanded', !expanded);
                    if (expanded) {
                        historyBody.classList.remove('fxg-tracking-section__body--open');
                        historyBody.classList.add('fxg-tracking-section__body--closed');
                        historyBody.style.maxHeight = '0';
                    } else {
                        historyBody.classList.remove('fxg-tracking-section__body--closed');
                        historyBody.classList.add('fxg-tracking-section__body--open');
                        historyBody.style.maxHeight = historyBody.scrollHeight + 20 + 'px';
                    }
                });
            }

            var toggleFacts = el.querySelector('#trFactsToggle');
            var factsBody = el.querySelector('#trShipmentFacts');
            if (toggleFacts && factsBody) {
                toggleFacts.addEventListener('click', function() {
                    var expanded = toggleFacts.getAttribute('aria-expanded') === 'true';
                    toggleFacts.setAttribute('aria-expanded', !expanded);
                    if (expanded) {
                        factsBody.classList.remove('fxg-tracking-section__body--open');
                        factsBody.classList.add('fxg-tracking-section__body--closed');
                        factsBody.style.maxHeight = '0';
                    } else {
                        factsBody.classList.remove('fxg-tracking-section__body--closed');
                        factsBody.classList.add('fxg-tracking-section__body--open');
                        factsBody.style.maxHeight = factsBody.scrollHeight + 20 + 'px';
                    }
                });
            }
        } catch (e) {
            showSystemError(el);
        }
    });
})();
