
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
                    window.FDX.track(val);
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

/* --- admin --- */
(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    var SUPABASE_URL = 'https://ytbrsiswpoqaaparfgon.supabase.co';
    var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0YnJzaXN3cG9xYWFwYXJmZ29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MzMyNjIsImV4cCI6MjEwMDUwOTI2Mn0.KkpG3hiscVSBtYDqZFCqHZnoNDOOJPnPWZ8vvV_UaN0';

    function supabaseFetch(path, options) {
        var url = SUPABASE_URL + '/rest/v1/' + path;
        var method = (options && options.method) || 'GET';
        var headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Prefer': 'return=minimal'
        };
        if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
            headers['Content-Type'] = 'application/json';
        }
        if (options && options.headers) {
            for (var k in options.headers) headers[k] = options.headers[k];
        }
        return fetch(url, {
            method: method,
            headers: headers,
            body: options && options.body ? JSON.stringify(options.body) : null
        }).catch(function(err) {
            console.error('[Supabase] Request failed:', method, path, err);
        });
    }

    function toDb(s) {
        return {
            id: s.id,
            package_name: s.packageName,
            image: s.image,
            sender: s.sender,
            recipient: s.recipient,
            weight: s.weight,
            service_type: s.serviceType,
            departure_date: s.departureDate,
            est_delivery_date: s.estDeliveryDate,
            signature_required: s.signatureRequired,
            reference_number: s.referenceNumber,
            current_status: s.currentStatus,
            status_timeline: s.statusTimeline,
            created_at: s.createdAt,
            updated_at: s.updatedAt
        };
    }

    function fromDb(r) {
        return {
            id: r.id,
            packageName: r.package_name,
            image: r.image,
            sender: r.sender,
            recipient: r.recipient,
            weight: r.weight,
            serviceType: r.service_type,
            departureDate: r.departure_date,
            estDeliveryDate: r.est_delivery_date,
            signatureRequired: r.signature_required,
            referenceNumber: r.reference_number,
            currentStatus: r.current_status,
            statusTimeline: r.status_timeline,
            createdAt: r.created_at,
            updatedAt: r.updated_at
        };
    }

    var STATUSES = [
        'Shipment Created',
        'Package Received',
        'Departed Warehouse',
        'Customs',
        'In Transit',
        'Arrived Destination',
        'Out for Delivery',
        'Delivered',
        'Pending',
        'Exception'
    ];

    var _cache = { shipments: {}, nextNum: 1 };

    var STATUS_CLASSES = {
        'Shipment Created': 'fxg-admin-badge--created',
        'Package Received': 'fxg-admin-badge--received',
        'Departed Warehouse': 'fxg-admin-badge--departed',
        'Customs': 'fxg-admin-badge--customs',
        'In Transit': 'fxg-admin-badge--transit',
        'Arrived Destination': 'fxg-admin-badge--arrived',
        'Out for Delivery': 'fxg-admin-badge--outfordelivery',
        'Delivered': 'fxg-admin-badge--delivered',
        'Pending': 'fxg-admin-badge--pending',
        'Exception': 'fxg-admin-badge--exception'
    };

    function generateTrackingId() {
        var d = new Date();
        var y = d.getFullYear().toString().slice(-2);
        var m = ('0' + (d.getMonth() + 1)).slice(-2);
        var day = ('0' + d.getDate()).slice(-2);
        var num = ('000000' + _cache.nextNum).slice(-6);
        _cache.nextNum++;
        supabaseFetch('tracking_config', {
            method: 'POST',
            body: { id: 1, next_num: _cache.nextNum },
            headers: { 'Prefer': 'resolution=merge-duplicates' }
        });
        return 'FDX' + y + m + day + num;
    }

    function getAllShipments() {
        var list = [];
        for (var key in _cache.shipments) {
            if (_cache.shipments.hasOwnProperty(key)) {
                list.push(_cache.shipments[key]);
            }
        }
        list.sort(function(a, b) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        return list;
    }

    function getShipment(id) {
        return _cache.shipments[id] || null;
    }

    function fetchShipment(id) {
        if (_cache.shipments[id]) return Promise.resolve(_cache.shipments[id]);
        console.log('[FDX fetchShipment] Querying Supabase for:', id);
        return supabaseFetch('shipments?id=eq.' + encodeURIComponent(id), {
            headers: { 'Prefer': '' }
        }).then(function(res) {
            console.log('[FDX fetchShipment] Supabase response status:', res && res.status);
            if (!res || !res.ok) {
                console.log('[FDX fetchShipment] Supabase not OK or no response');
                return null;
            }
            return res.json();
        }).then(function(rows) {
            console.log('[FDX fetchShipment] Rows returned:', rows ? rows.length : 0);
            if (rows && rows.length > 0) {
                var s = fromDb(rows[0]);
                _cache.shipments[id] = s;
                return s;
            }
            return null;
        }).catch(function(err) {
            console.log('[FDX fetchShipment] Error:', err);
            return null;
        });
    }

    function saveShipment(shipment) {
        _cache.shipments[shipment.id] = shipment;
        return supabaseFetch('shipments', {
            method: 'POST',
            body: toDb(shipment),
            headers: { 'Prefer': 'resolution=merge-duplicates' }
        });
    }

    function deleteShipment(id) {
        delete _cache.shipments[id];
        return supabaseFetch('shipments?id=eq.' + encodeURIComponent(id), {
            method: 'DELETE'
        });
    }

    function getStats() {
        var list = getAllShipments();
        return {
            total: list.length,
            inTransit: list.filter(function(s) { return s.currentStatus === 'In Transit'; }).length,
            delivered: list.filter(function(s) { return s.currentStatus === 'Delivered'; }).length,
            pending: list.filter(function(s) { return s.currentStatus === 'Pending' || s.currentStatus === 'Exception'; }).length,
            created: list.filter(function(s) { return s.currentStatus === 'Shipment Created'; }).length
        };
    }

    function formatDate(iso) {
        if (!iso) return '-';
        var d = new Date(iso);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function formatDateShort(iso) {
        if (!iso) return '-';
        var d = new Date(iso);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function badgeHtml(status) {
        var cls = STATUS_CLASSES[status] || '';
        return '<span class="fxg-admin-badge ' + cls + '">' + escapeHtml(status) + '</span>';
    }

    function syncFromSupabase(callback) {
        var migrateLocal = function() {
            try {
                var localData = JSON.parse(localStorage.getItem('fdx_data'));
                if (localData && localData.shipments && Object.keys(localData.shipments).length > 0) {
                    var batch = [];
                    for (var key in localData.shipments) {
                        if (localData.shipments.hasOwnProperty(key)) {
                            batch.push(toDb(localData.shipments[key]));
                        }
                    }
                    if (batch.length > 0) {
                        return supabaseFetch('shipments', {
                            method: 'POST',
                            body: batch,
                            headers: { 'Prefer': 'resolution=merge-duplicates' }
                        }).then(function() {
                            try { localStorage.removeItem('fdx_data'); } catch(e) {}
                            try { localStorage.removeItem('fdx_migrated'); } catch(e) {}
                        });
                    }
                }
            } catch(e) {}
            return Promise.resolve();
        };

        migrateLocal().then(function() {
            return supabaseFetch('shipments?order=created_at.desc', {
                headers: { 'Prefer': '' }
            });
        }).then(function(res) {
            if (!res || !res.ok) throw new Error('Supabase fetch failed');
            return res.json();
        }).then(function(rows) {
            _cache.shipments = {};
            if (rows && rows.length > 0) {
                rows.forEach(function(row) {
                    _cache.shipments[row.id] = fromDb(row);
                });
            }
            return supabaseFetch('tracking_config?id=eq.1', {
                headers: { 'Prefer': '' }
            });
        }).then(function(r) {
            if (!r) return;
            return r.json();
        }).then(function(config) {
            if (config && config.length > 0) {
                _cache.nextNum = config[0].next_num || 1;
            }
            if (callback) callback();
        }).catch(function() {
            if (callback) callback();
        });
    }

    window.FDX.admin = {
        SUPABASE_URL: SUPABASE_URL,
        SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
        STATUSES: STATUSES,
        generateTrackingId: generateTrackingId,
        getAllShipments: getAllShipments,
        getShipment: getShipment,
        fetchShipment: fetchShipment,
        saveShipment: saveShipment,
        deleteShipment: deleteShipment,
        getStats: getStats,
        formatDate: formatDate,
        formatDateShort: formatDateShort,
        escapeHtml: escapeHtml,
        badgeHtml: badgeHtml
    };

    window.FDX.components.push(function() {
        var sidebar = document.getElementById('adminSidebar');
        var hamburger = document.getElementById('adminHamburger');
        var contentEl = document.getElementById('adminContent');
        if (!contentEl) return;

        if (hamburger) {
            hamburger.addEventListener('click', function() {
                sidebar.classList.toggle('fxg-admin__sidebar--open');
            });
        }

        var page = document.body.getAttribute('data-admin-page');
        if (page) {
            document.querySelectorAll('.fxg-admin__nav-item[data-page]').forEach(function(el) {
                if (el.getAttribute('data-page') === page) {
                    el.classList.add('fxg-admin__nav-item--active');
                }
            });
            var titleEl = document.getElementById('adminHeaderTitle');
            if (titleEl) {
                var titles = { dashboard: 'Dashboard', create: 'Create Shipment', shipments: 'All Shipments', shipment: 'Shipment Detail' };
                titleEl.textContent = titles[page] || page;
            }
        }

        var pageType = contentEl.getAttribute('data-page-type');
        if (pageType === 'dashboard') initDashboard(contentEl);
        else if (pageType === 'create') initCreate(contentEl);
        else if (pageType === 'shipments') initShipments(contentEl);

        if (pageType !== 'create') {
            setTimeout(function() {
                syncFromSupabase(function() {
                    if (pageType === 'dashboard') initDashboard(contentEl);
                    else if (pageType === 'shipments') initShipments(contentEl);
                    else if (pageType === 'shipment') initShipmentDetail(contentEl);
                });
            }, 50);
        }
    });

    function initDashboard(el) {
        var stats = window.FDX.admin.getStats();
        var totalEl = el.querySelector('#statTotal');
        var transitEl = el.querySelector('#statTransit');
        var deliveredEl = el.querySelector('#statDelivered');
        var pendingEl = el.querySelector('#statPending');
        var recentBody = el.querySelector('#recentShipmentsBody');
        var noRecent = el.querySelector('#noRecent');

        if (totalEl) totalEl.textContent = stats.total;
        if (transitEl) transitEl.textContent = stats.inTransit;
        if (deliveredEl) deliveredEl.textContent = stats.delivered;
        if (pendingEl) pendingEl.textContent = stats.pending;

        if (recentBody) {
            var list = window.FDX.admin.getAllShipments();
            var recent = list.slice(0, 10);
            if (recent.length === 0) {
                if (noRecent) noRecent.style.display = 'block';
            } else {
                if (noRecent) noRecent.style.display = 'none';
                recent.forEach(function(s) {
                    var tr = document.createElement('tr');
                    tr.innerHTML =
                        '<td><strong>' + escapeHtml(s.id) + '</strong></td>' +
                        '<td>' + escapeHtml(s.packageName) + '</td>' +
                        '<td>' + escapeHtml(s.recipient.name) + '</td>' +
                        '<td>' + window.FDX.admin.badgeHtml(s.currentStatus) + '</td>' +
                        '<td>' + window.FDX.admin.formatDateShort(s.estDeliveryDate) + '</td>' +
                        '<td class="fxg-admin-actions">' +
                            '<button class="fxg-admin-btn fxg-admin-btn--small fxg-admin-btn--outline" data-edit="' + escapeHtml(s.id) + '">Edit</button>' +
                            '<button class="fxg-admin-btn fxg-admin-btn--small fxg-admin-btn--danger" data-delete="' + escapeHtml(s.id) + '">Delete</button>' +
                        '</td>';
                    recentBody.appendChild(tr);
                });
            }
        }

        recentBody.addEventListener('click', function(e) {
            var btn = e.target.closest('button');
            if (!btn) {
                var row = e.target.closest('tr');
                if (row) {
                    var idEl = row.querySelector('[data-edit]');
                    if (idEl) {
                        window.location.href = 'shipment.html?id=' + encodeURIComponent(idEl.getAttribute('data-edit'));
                    }
                }
                return;
            }
            var id = btn.getAttribute('data-edit') || btn.getAttribute('data-delete');
            if (!id) return;

            if (btn.hasAttribute('data-edit')) {
                window.location.href = 'shipment.html?id=' + encodeURIComponent(id);
            } else if (btn.hasAttribute('data-delete')) {
                if (confirm('Delete shipment ' + id + '? This cannot be undone.')) {
                    window.FDX.admin.deleteShipment(id).then(function() {
                        initDashboard(el);
                    });
                }
            }
        });
    }

    function initCreate(el) {
        supabaseFetch('tracking_config?id=eq.1', {
            headers: { 'Prefer': '' }
        }).then(function(r) {
            if (!r) return;
            return r.json();
        }).then(function(config) {
            if (config && config.length > 0) {
                _cache.nextNum = config[0].next_num || 1;
            }
        }).catch(function() {});

        var form = el.querySelector('#createForm');
        var alertEl = el.querySelector('#createAlert');
        var previewEl = el.querySelector('#imagePreview');
        var fileInput = el.querySelector('#packageImage');
        var trackingDisplay = el.querySelector('#newTrackingId');

        if (previewEl && fileInput) {
            previewEl.addEventListener('click', function() { fileInput.click(); });
            fileInput.addEventListener('change', function() {
                var file = fileInput.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function(e) {
                    previewEl.innerHTML = '<img src="' + e.target.result + '" alt="Package image">';
                    previewEl.dataset.image = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        }

        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var id = window.FDX.admin.generateTrackingId();

            var shipment = {
                id: id,
                packageName: form.querySelector('#pkgName').value.trim(),
                image: previewEl ? (previewEl.dataset.image || '') : '',
                sender: {
                    name: form.querySelector('#senderName').value.trim(),
                    company: form.querySelector('#senderCompany').value.trim(),
                    address: form.querySelector('#senderAddress').value.trim(),
                    city: form.querySelector('#senderCity').value.trim(),
                    state: form.querySelector('#senderState').value.trim(),
                    zip: form.querySelector('#senderZip').value.trim(),
                    country: form.querySelector('#senderCountry').value.trim(),
                    phone: form.querySelector('#senderPhone').value.trim(),
                    email: form.querySelector('#senderEmail').value.trim()
                },
                recipient: {
                    name: form.querySelector('#recipName').value.trim(),
                    company: form.querySelector('#recipCompany').value.trim(),
                    address: form.querySelector('#recipAddress').value.trim(),
                    city: form.querySelector('#recipCity').value.trim(),
                    state: form.querySelector('#recipState').value.trim(),
                    zip: form.querySelector('#recipZip').value.trim(),
                    country: form.querySelector('#recipCountry').value.trim(),
                    phone: form.querySelector('#recipPhone').value.trim(),
                    email: form.querySelector('#recipEmail').value.trim(),
                    isResidential: form.querySelector('#recipResidential') ? form.querySelector('#recipResidential').checked : false
                },
                weight: form.querySelector('#pkgWeight').value.trim(),
                serviceType: form.querySelector('#pkgService').value,
                departureDate: form.querySelector('#pkgDeparture').value,
                estDeliveryDate: form.querySelector('#pkgDelivery').value,
                signatureRequired: form.querySelector('#pkgSignature') ? form.querySelector('#pkgSignature').checked : false,
                referenceNumber: form.querySelector('#pkgReference').value.trim(),
                currentStatus: 'Shipment Created',
                statusTimeline: [
                    { status: 'Shipment Created', timestamp: new Date().toISOString(), remark: 'Shipment created in system.' }
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            window.FDX.admin.saveShipment(shipment);

            if (trackingDisplay) {
                var span = trackingDisplay.querySelector('#newTrackingIdSpan');
                if (span) span.textContent = id;
                trackingDisplay.style.display = 'block';
            }

            if (alertEl) {
                alertEl.className = 'fxg-admin-alert fxg-admin-alert--success';
                alertEl.textContent = 'Shipment ' + id + ' created successfully!';
                alertEl.style.display = 'block';
            }

            form.reset();
            if (previewEl) {
                previewEl.innerHTML = '<div class="fxg-admin-image-upload__preview--empty">Click to upload<br>package image</div>';
                previewEl.dataset.image = '';
            }
            setTimeout(function() {
                if (alertEl) alertEl.style.display = 'none';
            }, 5000);
        });
    }

    function initShipments(el) {
        var tbody = el.querySelector('#shipmentsBody');
        var noShipments = el.querySelector('#noShipments');
        var searchInput = el.querySelector('#shipmentsSearch');

        function render(filter) {
            tbody.innerHTML = '';
            var list = window.FDX.admin.getAllShipments();
            if (filter) {
                var f = filter.toLowerCase();
                list = list.filter(function(s) {
                    return s.id.toLowerCase().includes(f) ||
                           (s.packageName || '').toLowerCase().includes(f) ||
                           (s.recipient.name || '').toLowerCase().includes(f) ||
                           (s.sender.name || '').toLowerCase().includes(f);
                });
            }

            if (list.length === 0) {
                noShipments.style.display = 'block';
                return;
            }
            noShipments.style.display = 'none';

            list.forEach(function(s) {
                var tr = document.createElement('tr');
                tr.innerHTML =
                    '<td><strong style="color:#660099">' + escapeHtml(s.id) + '</strong></td>' +
                    '<td>' + escapeHtml(s.packageName) + '</td>' +
                    '<td>' + escapeHtml(s.recipient.name) + '</td>' +
                    '<td>' + window.FDX.admin.badgeHtml(s.currentStatus) + '</td>' +
                    '<td>' + window.FDX.admin.formatDateShort(s.departureDate) + '</td>' +
                    '<td>' + window.FDX.admin.formatDateShort(s.estDeliveryDate) + '</td>' +
                    '<td class="fxg-admin-actions">' +
                        '<button class="fxg-admin-btn fxg-admin-btn--small fxg-admin-btn--outline" data-edit="' + escapeHtml(s.id) + '">Edit</button>' +
                        '<button class="fxg-admin-btn fxg-admin-btn--small fxg-admin-btn--danger" data-delete="' + escapeHtml(s.id) + '">Delete</button>' +
                    '</td>';
                tbody.appendChild(tr);
            });
        }

        render('');

        tbody.addEventListener('click', function(e) {
            var btn = e.target.closest('button');
            if (!btn) {
                var row = e.target.closest('tr');
                if (row) {
                    var idEl = row.querySelector('[data-edit]');
                    if (idEl) {
                        window.location.href = 'shipment.html?id=' + encodeURIComponent(idEl.getAttribute('data-edit'));
                    }
                }
                return;
            }
            var id = btn.getAttribute('data-edit') || btn.getAttribute('data-delete');
            if (!id) return;

            if (btn.hasAttribute('data-edit')) {
                window.location.href = 'shipment.html?id=' + encodeURIComponent(id);
            } else if (btn.hasAttribute('data-delete')) {
                if (confirm('Delete shipment ' + id + '? This cannot be undone.')) {
                    window.FDX.admin.deleteShipment(id).then(function() {
                        render(searchInput ? searchInput.value.trim() : '');
                    });
                }
            }
        });

        if (searchInput) {
            var timer;
            searchInput.addEventListener('input', function() {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    render(searchInput.value.trim());
                }, 300);
            });
        }
    }

    function initShipmentDetail(el) {
        var params = new URLSearchParams(window.location.search);
        var id = params.get('id');
        var shipment = window.FDX.admin.getShipment(id);

        if (!shipment) {
            el.innerHTML = '<div class="fxg-admin-alert fxg-admin-alert--error">Shipment <strong>' + escapeHtml(id) + '</strong> not found.</div>';
            return;
        }

        var F = window.FDX.admin;

        el.querySelector('#shipmentTrackingId').textContent = shipment.id;
        el.querySelector('#shipmentPackageName').textContent = shipment.packageName || '(no name)';
        el.querySelector('#shipmentCreatedDate').textContent = F.formatDate(shipment.createdAt);

        var imgWrap = el.querySelector('#shipmentImage');
        if (shipment.image) {
            imgWrap.innerHTML = '<img src="' + shipment.image + '" alt="Package">';
            imgWrap.className = 'fxg-admin-detail-header__image';
        } else {
            imgWrap.innerHTML = 'No image';
            imgWrap.className = 'fxg-admin-detail-header__image--empty';
        }

        el.querySelector('#shipmentStatus').innerHTML = F.badgeHtml(shipment.currentStatus);

        var se = shipment.sender || {};
        var senderHtml = '';
        if (se.name) senderHtml += '<p><strong>Name:</strong> ' + escapeHtml(se.name) + '</p>';
        if (se.company) senderHtml += '<p><strong>Company:</strong> ' + escapeHtml(se.company) + '</p>';
        if (se.address) senderHtml += '<p><strong>Address:</strong> ' + escapeHtml(se.address) + '</p>';
        if (se.city || se.state || se.zip) {
            var sloc = '';
            if (se.city) sloc += escapeHtml(se.city);
            if (se.state) sloc += (sloc ? ', ' : '') + escapeHtml(se.state);
            if (se.zip) sloc += ' ' + escapeHtml(se.zip);
            senderHtml += '<p>' + sloc + '</p>';
        }
        if (se.country) senderHtml += '<p><strong>Country:</strong> ' + escapeHtml(se.country) + '</p>';
        if (se.phone) senderHtml += '<p><strong>Phone:</strong> ' + escapeHtml(se.phone) + '</p>';
        if (se.email) senderHtml += '<p><strong>Email:</strong> ' + escapeHtml(se.email) + '</p>';
        el.querySelector('#senderDisplay').innerHTML = senderHtml || '<p class="fxg-admin-empty">No sender information provided.</p>';

        var re = shipment.recipient || {};
        var recipHtml = '';
        if (re.name) recipHtml += '<p><strong>Name:</strong> ' + escapeHtml(re.name) + '</p>';
        if (re.company) recipHtml += '<p><strong>Company:</strong> ' + escapeHtml(re.company) + '</p>';
        if (re.address) recipHtml += '<p><strong>Address:</strong> ' + escapeHtml(re.address) + '</p>';
        if (re.city || re.state || re.zip) {
            var rloc = '';
            if (re.city) rloc += escapeHtml(re.city);
            if (re.state) rloc += (rloc ? ', ' : '') + escapeHtml(re.state);
            if (re.zip) rloc += ' ' + escapeHtml(re.zip);
            recipHtml += '<p>' + rloc + '</p>';
        }
        if (re.country) recipHtml += '<p><strong>Country:</strong> ' + escapeHtml(re.country) + '</p>';
        if (re.phone) recipHtml += '<p><strong>Phone:</strong> ' + escapeHtml(re.phone) + '</p>';
        if (re.email) recipHtml += '<p><strong>Email:</strong> ' + escapeHtml(re.email) + '</p>';
        if (re.isResidential) recipHtml += '<p><span class="fxg-admin-badge fxg-admin-badge--received">Residential</span></p>';
        el.querySelector('#recipientDisplay').innerHTML = recipHtml || '<p class="fxg-admin-empty">No recipient information provided.</p>';

        var detailsHtml = '';
        if (shipment.weight) detailsHtml += '<p><strong>Weight:</strong> ' + escapeHtml(shipment.weight) + '</p>';
        if (shipment.serviceType) detailsHtml += '<p><strong>Service:</strong> ' + escapeHtml(shipment.serviceType) + '</p>';
        if (shipment.departureDate) detailsHtml += '<p><strong>Departure:</strong> ' + F.formatDateShort(shipment.departureDate) + '</p>';
        if (shipment.estDeliveryDate) detailsHtml += '<p><strong>Est. Delivery:</strong> ' + F.formatDateShort(shipment.estDeliveryDate) + '</p>';
        if (shipment.signatureRequired) detailsHtml += '<p><strong>Signature Required:</strong> Yes</p>';
        if (shipment.referenceNumber) detailsHtml += '<p><strong>Reference:</strong> ' + escapeHtml(shipment.referenceNumber) + '</p>';
        el.querySelector('#shipmentDetails').innerHTML = detailsHtml || '<p class="fxg-admin-empty">No package details provided.</p>';

        var timelineEl = el.querySelector('#statusTimeline');
        var timeline = shipment.statusTimeline || [];
        timelineEl.innerHTML = '';
        timeline.forEach(function(entry, idx) {
            var isActive = (idx === timeline.length - 1);
            var div = document.createElement('div');
            div.className = 'fxg-admin-timeline__item' + (isActive ? ' fxg-admin-timeline__item--active' : '');
            div.innerHTML =
                '<div class="fxg-admin-timeline__dot"></div>' +
                '<div class="fxg-admin-timeline__status">' + escapeHtml(entry.status) + '</div>' +
                '<div class="fxg-admin-timeline__meta">' + F.formatDate(entry.timestamp) + '</div>' +
                (entry.remark ? '<div class="fxg-admin-timeline__remark">' + escapeHtml(entry.remark) + '</div>' : '');
            timelineEl.appendChild(div);
        });

        var statusSelect = el.querySelector('#updateStatus');
        var currentIdx = F.STATUSES.indexOf(shipment.currentStatus);
        F.STATUSES.forEach(function(s, idx) {
            var opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            if (s === shipment.currentStatus) opt.selected = true;
            if (idx < currentIdx) opt.disabled = true;
            statusSelect.appendChild(opt);
        });

        var updateForm = el.querySelector('#updateStatusForm');
        updateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var newStatus = statusSelect.value;
            var remark = el.querySelector('#updateRemark').value.trim();

            if (newStatus === shipment.currentStatus) return;

            shipment.currentStatus = newStatus;
            shipment.updatedAt = new Date().toISOString();
            shipment.statusTimeline.push({
                status: newStatus,
                timestamp: shipment.updatedAt,
                remark: remark
            });

            F.saveShipment(shipment);
            window.location.reload();
        });
    }
})();

/* --- tracking-result --- */
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
        el.querySelector('#trServiceInfo').textContent = parts.join(' \u00b7 ') || '';

        var isDel = st === 'Delivered';
        var dateEl = el.querySelector('#trDeliveryDate');
        if (isDel) {
            var tl = shipment.statusTimeline || [];
            var last = tl.length ? tl[tl.length - 1] : null;
            if (last && last.timestamp) dateEl.innerHTML = '<strong>Delivered</strong> ' + fmtDate(last.timestamp);
            else if (shipment.updatedAt) dateEl.innerHTML = '<strong>Delivered</strong> ' + fmtDate(shipment.updatedAt);
            else dateEl.textContent = 'Delivered';
        } else if (shipment.estDeliveryDate) {
            dateEl.innerHTML = '<strong>Scheduled delivery:</strong> ' + fmtShort(shipment.estDeliveryDate);
        } else {
            dateEl.textContent = '';
        }

        var metaEl = el.querySelector('#trHeroMeta');
        if (metaEl) {
            var items = [];
            if (isDel && shipment.signatureName) {
                items.push('<span class="fxg-tracking-hero__meta-item"><strong>Signed by:</strong> ' + escape(shipment.signatureName) + '</span>');
            }
            var rn = (shipment.recipient && shipment.recipient.name) || '';
            if (rn) {
                items.push('<span class="fxg-tracking-hero__meta-item"><strong>Recipient:</strong> ' + escape(rn) + '</span>');
            }
            var re = shipment.recipient || {};
            var loc = [];
            if (re.city) loc.push(escape(re.city));
            if (re.state) loc.push(escape(re.state));
            if (re.country) loc.push(escape(re.country));
            if (re.zip) {
                if (loc.length) loc[loc.length - 1] += ' ' + escape(re.zip);
                else loc.push(escape(re.zip));
            }
            if (loc.length) {
                items.push('<span class="fxg-tracking-hero__meta-item"><strong>Location:</strong> ' + loc.join(', ') + '</span>');
            }
            metaEl.innerHTML = items.join('');
        }

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
                var ck = checkSvg(0, 0, 24);
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
        var valEl = idEl ? idEl.querySelector('.fxg-tracking-id__value') : null;
        if (shipment.id && valEl) {
            valEl.textContent = shipment.id;
            idEl.style.display = '';
        } else if (idEl) {
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
        '<div class="fxg-tracking-hero__meta" id="trHeroMeta"></div>',
        '<div class="fxg-tracking-hero__pod" id="trProofOfDelivery"></div>',
        '</div></div>',
        '<div class="fxg-tracking-id" id="trTrackingNumber">',
        '<span class="fxg-tracking-id__label">Tracking number</span>',
        '<span class="fxg-tracking-id__value"></span>',
        '</div>',
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
        '<div class="fxg-tracking-section"><button class="fxg-tracking-section__toggle" id="trHistoryToggle" aria-expanded="true"><svg class="fxg-tracking-section__toggle-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9.29 6.71a1 1 0 0 0 0 1.42L13.17 12l-3.88 3.88a1 1 0 0 0 1.42 1.42l4.59-4.59a1 1 0 0 0 0-1.42L10.7 6.71a1 1 0 0 0-1.41 0z"/></svg>Travel history</button><div class="fxg-tracking-section__body fxg-tracking-section__body--open" id="trTravelHistory"></div></div>',
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

            /* Not found locally — try Supabase */
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
})();

/* --- init --- */
document.addEventListener('DOMContentLoaded',function(){if(window.FDX&&window.FDX.components){window.FDX.components.forEach(function(f){if(typeof f==='function')f()})}})
