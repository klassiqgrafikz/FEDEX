
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
        }).then(function(r) {
            if (!r.ok) { return r.text().then(function(t) { throw new Error(method + ' ' + path + ' ' + r.status + ': ' + t.slice(0, 200)); }); }
            return r;
        }).catch(function(err) {
            console.warn('[Tawk] Supabase request failed:', err.message);
            throw err;
        });
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

        /* Fetch Tawk.to config from Supabase */
        supabaseFetch('tawkto_config?id=eq.1').then(function(r) {
            return r.json();
        }).then(function(data) {
            if (data && data.length > 0 && data[0].enabled) {
                loadTawkWidget(data[0].property_id, data[0].widget_id || 'default');
            }
        }).catch(function(err) {
            // Tawk not configured or table missing — no chat at all
        });
    });

    function loadTawkWidget(propertyId, widgetId) {
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();
        (function() {
            var s1 = document.createElement('script');
            var s0 = document.getElementsByTagName('script')[0];
            s1.async = true;
            s1.src = 'https://embed.tawk.to/' + propertyId + '/' + widgetId;
            s1.charset = 'UTF-8';
            s1.setAttribute('crossorigin', '*');
            s0.parentNode.insertBefore(s1, s0);
        })();
    }
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
        }).then(function(res) {
            if (!res.ok) {
                return res.text().then(function(text) {
                    throw new Error('Supabase ' + method + ' ' + path + ' returned ' + res.status + ': ' + text.slice(0, 200));
                });
            }
            return res;
        }).catch(function(err) {
            console.error('[Supabase] Request failed:', method, path, err.message || err);
            throw err;
        });
    }

    function toDb(s) {
        return {
            id: s.id,
            package_name: s.packageName,
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
            media: r.shipment_media || [],
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

    var _cache = { shipments: {} };

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
        var rand = Math.floor(Math.random() * 100000000000).toString().padStart(11, '0');
        return '8' + rand;
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
        return supabaseFetch('shipments?id=eq.' + encodeURIComponent(id) + '&select=*,shipment_media(*)', {
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

    function saveShipmentMedia(shipmentId, mediaType, data) {
        return supabaseFetch('shipment_media', {
            method: 'POST',
            body: { shipment_id: shipmentId, media_type: mediaType, data: data }
        });
    }

    function uploadToStorage(file, bucket, filepath) {
        var url = SUPABASE_URL + '/storage/v1/object/' + bucket + '/' + filepath;
        return fetch(url, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                'Content-Type': file.type
            },
            body: file
        }).then(function(res) {
            if (!res.ok) return res.text().then(function(t) { throw new Error('Storage upload failed: ' + t.slice(0, 200)); });
            return SUPABASE_URL + '/storage/v1/object/public/' + bucket + '/' + filepath;
        });
    }

    function deleteFromStorage(bucket, filepath) {
        return fetch(SUPABASE_URL + '/storage/v1/object/' + bucket + '/' + filepath, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            }
        });
    }

    function deleteShipment(id) {
        delete _cache.shipments[id];
        return supabaseFetch('shipments?id=eq.' + encodeURIComponent(id), {
            method: 'DELETE'
        });
    }

    function deleteAllShipments() {
        var ids = Object.keys(_cache.shipments);
        if (ids.length === 0) return Promise.resolve();
        _cache.shipments = {};
        var promises = ids.map(function(id) {
            return supabaseFetch('shipments?id=eq.' + encodeURIComponent(id), {
                method: 'DELETE'
            });
        });
        return Promise.all(promises);
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
            return supabaseFetch('shipments?order=created_at.desc&select=*,shipment_media(*)', {
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
            if (callback) callback();
        }).catch(function() {
            if (callback) callback();
        });
    }

    function generateInvoice(shipment) {
        var re = shipment.recipient || {};
        var se = shipment.sender || {};
        var today = new Date();
        var invDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        var invNum = 'INV-' + shipment.id.slice(-8);
        var dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() + 30);
        var dueStr = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        var div = document.createElement('div');
        div.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:999999';
        div.innerHTML =
            '<div id="fxg-invoice" style="width:600px;background:#fff;padding:0;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#222;line-height:1.4">' +
                '<div style="background:#4D148C;padding:20px 36px;display:flex;justify-content:space-between;align-items:center">' +
                    '<div>' +
                        '<svg viewBox="0 0 451.694 220.997" style="width:130px;height:auto;display:block">' +
                            '<defs><style>.fxg-iv-ex{fill:#FF6600;}.fxg-iv-fed{fill:#fff;}</style></defs>' +
                            '<polygon class="fxg-iv-ex" points="360.671 159 346.805 143.415 333.547 159.009 306.001 159.012 332.991 127.8 306.001 97.012 335.001 97.012 348.006 111.984 361.001 97.012 388.001 97.012 361.62 127.6 389.705 159 360.671 159"/>' +
                            '<polygon class="fxg-iv-ex" points="252.001 159.012 252.001 62.012 306.001 62.012 306.001 84.012 275.001 84.012 275.001 97.012 306.001 97.012 306.001 118.012 275.001 118.012 275.001 137.012 306.001 137.012 306.001 159.012 252.001 159.012"/>' +
                            '<path class="fxg-iv-fed" d="M230,62.012v40l-.814-.639c-5.005-5.7-11.879-7.361-19.186-7.361-14.915,0-25.458,9.664-29.362,23.077C176.134,102.374,164.118,94.012,147,94.012c-13.914,0-25.294,5.789-31,16v-13H88v-13h31v-22H62v97H88v-41l25.571-.222a36.939,36.939,0,0,0-1.2,9.509c0,20.12,15.316,34.535,34.935,34.535,16.517,0,26.89-7.708,32.7-21.822H158c-3,4.2-4.69,5.205-10.6,5.205-6.907,0-13.113-6.206-13.113-13.413h45.045c1.9,16.016,14.41,30.208,31.528,30.208A24.082,24.082,0,0,0,230,151.755v7.257h22v-97ZM135.293,118.09c1.4-6.106,6.206-10.11,12.112-10.11,6.507,0,11.011,3.9,12.213,10.11Zm80.381,25.626c-8.309,0-13.514-7.808-13.514-15.916,0-8.709,4.5-17.017,13.514-17.017,9.309,0,13.113,8.308,13.113,17.017C228.787,136.108,224.783,143.716,215.674,143.716Z"/>' +
                        '</svg>' +
                    '</div>' +
                    '<div style="text-align:right">' +
                        '<div style="font-size:24px;font-weight:700;color:#fff;letter-spacing:2px;margin-bottom:2px">SHIPPING INVOICE</div>' +
                        '<div style="font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:0.5px">DOCUMENT NUMBER: ' + escapeHtml(invNum) + '</div>' +
                    '</div>' +
                '</div>' +
                '<div style="padding:28px 36px 0">' +
                    '<div style="display:flex;justify-content:space-between;margin-bottom:28px;gap:20px">' +
                        '<div style="flex:1">' +
                            '<div style="font-size:8px;color:#888;font-weight:700;letter-spacing:1.2px;margin-bottom:6px">FROM</div>' +
                            '<div style="background:#f8f6fa;border:1px solid #e8e0f0;border-radius:4px;padding:12px 14px">' +
                                '<div style="font-size:13px;font-weight:700;color:#222">' + escapeHtml(se.name || '') + '</div>' +
                                (se.company ? '<div style="font-size:12px;color:#555;margin-top:2px">' + escapeHtml(se.company) + '</div>' : '') +
                            '</div>' +
                        '</div>' +
                        '<div style="flex:1">' +
                            '<div style="font-size:8px;color:#888;font-weight:700;letter-spacing:1.2px;margin-bottom:6px">SHIP TO</div>' +
                            '<div style="background:#f8f6fa;border:1px solid #e8e0f0;border-radius:4px;padding:12px 14px">' +
                                '<div style="font-size:13px;font-weight:700;color:#222">' + escapeHtml(re.name || '') + '</div>' +
                                (re.company ? '<div style="font-size:12px;color:#555;margin-top:2px">' + escapeHtml(re.company) + '</div>' : '') +
                                (re.address ? '<div style="font-size:12px;color:#555;margin-top:2px">' + escapeHtml(re.address) + '</div>' : '') +
                                '<div style="font-size:12px;color:#555;margin-top:2px">' + escapeHtml([re.city, re.state, re.zip].filter(Boolean).join(' ') || '') + '</div>' +
                                (re.country && re.country !== 'US' ? '<div style="font-size:12px;color:#555;margin-top:2px">' + escapeHtml(re.country) + '</div>' : '') +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div style="display:flex;gap:20px;margin-bottom:24px">' +
                        '<div style="flex:1">' +
                            '<table style="width:100%;border-collapse:collapse;font-size:11px">' +
                                '<tr><td style="padding:3px 6px 3px 0;color:#888;width:100px">Invoice Date</td><td style="padding:3px 0;color:#333">' + escapeHtml(invDate) + '</td></tr>' +
                                '<tr><td style="padding:3px 6px 3px 0;color:#888">Due Date</td><td style="padding:3px 0;color:#333">' + escapeHtml(dueStr) + '</td></tr>' +
                                '<tr><td style="padding:3px 6px 3px 0;color:#888">Reference</td><td style="padding:3px 0;color:#333">' + escapeHtml(shipment.referenceNumber || '-') + '</td></tr>' +
                            '</table>' +
                        '</div>' +
                        '<div style="flex:1">' +
                            '<table style="width:100%;border-collapse:collapse;font-size:11px">' +
                                '<tr><td style="padding:3px 6px 3px 0;color:#888;width:100px">Tracking #</td><td style="padding:3px 0;color:#660099;font-weight:700;font-size:12px">' + escapeHtml(shipment.id) + '</td></tr>' +
                                '<tr><td style="padding:3px 6px 3px 0;color:#888">Service</td><td style="padding:3px 0;color:#333">' + escapeHtml(shipment.serviceType || '-') + '</td></tr>' +
                                '<tr><td style="padding:3px 6px 3px 0;color:#888">Status</td><td style="padding:3px 0;color:#333">' + escapeHtml(shipment.currentStatus || '-') + '</td></tr>' +
                            '</table>' +
                        '</div>' +
                    '</div>' +
                    '<div style="border:1px solid #ddd;border-radius:4px;overflow:hidden;margin-bottom:24px">' +
                        '<div style="background:#f0ecf4;padding:8px 14px;font-size:10px;font-weight:700;color:#4D148C;letter-spacing:1px">SHIPMENT DETAILS</div>' +
                        '<div style="padding:10px 14px">' +
                            '<table style="width:100%;border-collapse:collapse;font-size:11px">' +
                                '<tr><td style="padding:4px 8px 4px 0;color:#888;width:130px">Package</td><td style="padding:4px 0;color:#333;font-weight:500">' + escapeHtml(shipment.packageName || '-') + '</td></tr>' +
                                '<tr><td style="padding:4px 8px 4px 0;color:#888;border-top:1px solid #f0f0f0">Service</td><td style="padding:4px 0;color:#333;font-weight:500;border-top:1px solid #f0f0f0">' + escapeHtml(shipment.serviceType || '-') + '</td></tr>' +
                                '<tr><td style="padding:4px 8px 4px 0;color:#888;border-top:1px solid #f0f0f0">Weight</td><td style="padding:4px 0;color:#333;font-weight:500;border-top:1px solid #f0f0f0">' + escapeHtml(shipment.weight || '-') + '</td></tr>' +
                                '<tr><td style="padding:4px 8px 4px 0;color:#888;border-top:1px solid #f0f0f0">Packaging</td><td style="padding:4px 0;color:#333;font-weight:500;border-top:1px solid #f0f0f0">' + escapeHtml(shipment.packaging || '-') + '</td></tr>' +
                                '<tr><td style="padding:4px 8px 4px 0;color:#888;border-top:1px solid #f0f0f0">Ship Date</td><td style="padding:4px 0;color:#333;font-weight:500;border-top:1px solid #f0f0f0">' + formatDateShort(shipment.createdAt) + '</td></tr>' +
                                '<tr><td style="padding:4px 8px 4px 0;color:#888;border-top:1px solid #f0f0f0">Est. Delivery</td><td style="padding:4px 0;color:#333;font-weight:500;border-top:1px solid #f0f0f0">' + formatDateShort(shipment.estDeliveryDate) + '</td></tr>' +
                                (shipment.dimensions ? '<tr><td style="padding:4px 8px 4px 0;color:#888;border-top:1px solid #f0f0f0">Dimensions</td><td style="padding:4px 0;color:#333;font-weight:500;border-top:1px solid #f0f0f0">' + escapeHtml(shipment.dimensions) + '</td></tr>' : '') +
                                (shipment.totalPieces ? '<tr><td style="padding:4px 8px 4px 0;color:#888;border-top:1px solid #f0f0f0">Total Pieces</td><td style="padding:4px 0;color:#333;font-weight:500;border-top:1px solid #f0f0f0">' + escapeHtml(shipment.totalPieces) + '</td></tr>' : '') +
                            '</table>' +
                        '</div>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;justify-content:center;gap:20px;padding-top:20px;border-top:2px solid #4D148C">' +
                        '<div id="fxg-invoice-qr" style="flex-shrink:0;padding:8px;border:1px solid #e0e0e0;border-radius:4px"></div>' +
                        '<div style="text-align:left">' +
                            '<div style="font-size:9px;color:#888;letter-spacing:0.4px">Scan to track your shipment</div>' +
                            '<div style="font-size:8px;color:#aaa;margin-top:4px;letter-spacing:0.5px">Thank you for using FedEx</div>' +
                            '<div style="margin-top:10px;font-size:8px;color:#999">FedEx Corporation &bull; 942 S Shady Grove Road, Memphis, TN 38120</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(div);
        if (typeof QRCode !== 'undefined') {
            new QRCode(document.getElementById('fxg-invoice-qr'), {
                text: shipment.id,
                width: 130,
                height: 130,
                colorDark: '#4D148C',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        }
        setTimeout(function () {
            if (typeof html2canvas !== 'undefined' && typeof jspdf !== 'undefined') {
                html2canvas(document.getElementById('fxg-invoice'), {
                    scale: 2,
                    backgroundColor: '#ffffff',
                    logging: false,
                    width: 600
                }).then(function (canvas) {
                    var imgData = canvas.toDataURL('image/png');
                    var pdf = new jspdf.jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4'
                    });
                    var pdfW = pdf.internal.pageSize.getWidth();
                    var pdfH = (canvas.height * pdfW) / canvas.width;
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
                    pdf.save('FedEx_Invoice_' + shipment.id + '.pdf');
                    document.body.removeChild(div);
                }).catch(function () {
                    document.body.removeChild(div);
                });
            } else {
                document.body.removeChild(div);
            }
        }, 500);
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
        saveShipmentMedia: saveShipmentMedia,
        deleteFromStorage: deleteFromStorage,
        deleteShipment: deleteShipment,
        deleteAllShipments: deleteAllShipments,
        getStats: getStats,
        formatDate: formatDate,
        formatDateShort: formatDateShort,
        escapeHtml: escapeHtml,
        badgeHtml: badgeHtml,
        generateInvoice: generateInvoice
    };

    window.FDX.components.push(function() {
        var sidebar = document.getElementById('adminSidebar');
        var hamburger = document.getElementById('adminHamburger');
        var contentEl = document.getElementById('adminContent');
        if (!contentEl) return;

        var overlay = document.createElement('div');
        overlay.className = 'fxg-admin__overlay';
        document.body.appendChild(overlay);

        function toggleSidebar() {
            sidebar.classList.toggle('fxg-admin__sidebar--open');
            overlay.classList.toggle('fxg-admin__overlay--visible');
        }

        function closeSidebar() {
            sidebar.classList.remove('fxg-admin__sidebar--open');
            overlay.classList.remove('fxg-admin__overlay--visible');
        }

        if (hamburger) {
            hamburger.addEventListener('click', toggleSidebar);
        }

        overlay.addEventListener('click', closeSidebar);

        sidebar.querySelectorAll('.fxg-admin__nav-item').forEach(function(el) {
            el.addEventListener('click', closeSidebar);
        });

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

        initTawkSettings(el);
    }

    function initTawkSettings(el) {
        var section = el.querySelector('#tawkSettingsSection');
        if (!section) return;

        var enabledCb = section.querySelector('#tawkEnabled');
        var propertyInput = section.querySelector('#tawkPropertyId');
        var widgetInput = section.querySelector('#tawkWidgetId');
        var saveBtn = section.querySelector('#saveTawkBtn');
        var msgEl = section.querySelector('#tawkSaveMsg');

        function loadConfig() {
            supabaseFetch('tawkto_config?id=eq.1').then(function(r) {
                if (r.status === 404) throw new Error('Table not found');
                return r.json();
            }).then(function(data) {
                if (data && data.length > 0) {
                    var cfg = data[0];
                    if (enabledCb) enabledCb.checked = cfg.enabled;
                    if (propertyInput) propertyInput.value = cfg.property_id || '';
                    if (widgetInput) widgetInput.value = cfg.widget_id || '';
                }
            }).catch(function(err) {
                console.warn('[Tawk] Could not load config:', err.message);
                if (msgEl) { msgEl.textContent = 'Table not found — run SQL migration'; msgEl.style.color = '#C62828'; msgEl.style.display = ''; }
            });
        }

        function saveConfig() {
            var body = {
                id: 1,
                enabled: enabledCb ? enabledCb.checked : false,
                property_id: propertyInput ? propertyInput.value.trim() : '',
                widget_id: widgetInput ? widgetInput.value.trim() || 'default' : 'default'
            };
            supabaseFetch('tawkto_config', {
                method: 'POST',
                body: body,
                headers: { 'Prefer': 'resolution=merge-duplicates, return=minimal' }
            }).then(function() {
                showToast('Tawk.to settings saved', 'success');
            }).catch(function(err) {
                console.error('[Tawk] Save failed:', err.message);
                showToast('Save failed: ' + err.message, 'error');
            });
        }

        loadConfig();
        if (saveBtn) saveBtn.addEventListener('click', saveConfig);
    }

    function showToast(msg, type) {
        var toast = document.createElement('div');
        var bg = type === 'success' ? '#2E7D32' : '#C62828';
        toast.textContent = msg;
        toast.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;padding:12px 20px;border-radius:8px;background:' + bg + ';color:#fff;font-size:13px;font-weight:600;box-shadow:0 4px 16px rgba(0,0,0,0.2);opacity:0;transition:opacity 0.3s;font-family:inherit';
        document.body.appendChild(toast);
        requestAnimationFrame(function() { toast.style.opacity = '1'; });
        setTimeout(function() {
            toast.style.opacity = '0';
            setTimeout(function() { toast.remove(); }, 300);
        }, 3500);
    }

    function initCreate(el) {
        var form = el.querySelector('#createForm');
        var alertEl = el.querySelector('#createAlert');
        var previewEl = el.querySelector('#imagePreview');
        var fileInput = el.querySelector('#packageImage');
        var videoPreviewEl = el.querySelector('#videoPreview');
        var videoInput = el.querySelector('#packageVideo');
        var trackingDisplay = el.querySelector('#newTrackingId');
        var uploadedImageUrl = null;
        var uploadedVideoUrl = null;
        var imageStoragePath = null;
        var videoStoragePath = null;

        function handleFile(file, isImage) {
            var preview = isImage ? previewEl : videoPreviewEl;
            var input = isImage ? fileInput : videoInput;
            var reader = new FileReader();
            reader.onload = function(e) {
                var ext = file.name.split('.').pop() || (isImage ? 'png' : 'mp4');
                var ts = Date.now();
                var rand = Math.random().toString(36).slice(2, 6);
                var path = ts + '_' + rand + '.' + ext;
                var dataUrl = e.target.result;

                if (isImage) {
                    previewEl.innerHTML = '<img src="' + dataUrl + '" alt="Package image"><button class="fxg-admin-remove-btn" data-remove="image" title="Remove image">&times;</button>';
                } else {
                    videoPreviewEl.innerHTML = '<video src="' + dataUrl + '" muted controls style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></video><button class="fxg-admin-remove-btn" data-remove="video" title="Remove video">&times;</button>';
                }

                uploadToStorage(file, 'shipment-media', path).then(function(publicUrl) {
                    if (isImage) {
                        uploadedImageUrl = publicUrl;
                        imageStoragePath = path;
                    } else {
                        uploadedVideoUrl = publicUrl;
                        videoStoragePath = path;
                    }
                    showToast((isImage ? 'Image' : 'Video') + ' saved', 'success');
                }).catch(function() {
                    showToast('Failed to upload ' + (isImage ? 'image' : 'video'), 'error');
                });
            };
            reader.readAsDataURL(file);
        }

        function clearMedia(isImage) {
            var path = isImage ? imageStoragePath : videoStoragePath;
            if (path) deleteFromStorage('shipment-media', path);
            if (isImage) {
                uploadedImageUrl = null;
                imageStoragePath = null;
                previewEl.innerHTML = '<div class="fxg-admin-image-upload__preview--empty">Click to upload<br>package image</div>';
                fileInput.value = '';
            } else {
                uploadedVideoUrl = null;
                videoStoragePath = null;
                videoPreviewEl.innerHTML = '<div class="fxg-admin-image-upload__preview--empty">Click to upload<br>package video</div>';
                videoInput.value = '';
            }
        }

        if (previewEl && fileInput) {
            previewEl.addEventListener('click', function(e) {
                if (e.target.closest('.fxg-admin-remove-btn')) return;
                fileInput.click();
            });
            fileInput.addEventListener('change', function() {
                var file = fileInput.files[0];
                if (!file) return;
                clearMedia(true);
                handleFile(file, true);
            });
        }

        if (videoPreviewEl && videoInput) {
            videoPreviewEl.addEventListener('click', function(e) {
                if (e.target.closest('.fxg-admin-remove-btn')) return;
                videoInput.click();
            });
            videoInput.addEventListener('change', function() {
                var file = videoInput.files[0];
                if (!file) return;
                clearMedia(false);
                handleFile(file, false);
            });
        }

        el.addEventListener('click', function(e) {
            var rmBtn = e.target.closest('[data-remove]');
            if (rmBtn) {
                e.preventDefault();
                clearMedia(rmBtn.getAttribute('data-remove') === 'image');
            }
        });

        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            try {
            var id = window.FDX.admin.generateTrackingId();

            var shipment = {
                id: id,
                packageName: form.querySelector('#pkgName').value.trim(),
                media: [],
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

            window.FDX.admin.saveShipment(shipment).then(function() {
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
                }
                if (videoPreviewEl) {
                    videoPreviewEl.innerHTML = '<div class="fxg-admin-image-upload__preview--empty">Click to upload<br>package video</div>';
                }
                setTimeout(function() {
                    if (alertEl) alertEl.style.display = 'none';
                }, 5000);

                var mediaPromise = null;
                if (uploadedImageUrl) {
                    mediaPromise = saveShipmentMedia(id, 'image', uploadedImageUrl);
                }
                if (uploadedVideoUrl) {
                    var p = saveShipmentMedia(id, 'video', uploadedVideoUrl);
                    mediaPromise = mediaPromise ? Promise.all([mediaPromise, p]) : p;
                }
                if (mediaPromise) {
                    mediaPromise.then(function() {
                        _cache.shipments[id].media = [];
                        if (uploadedImageUrl) _cache.shipments[id].media.push({ media_type: 'image', data: uploadedImageUrl });
                        if (uploadedVideoUrl) _cache.shipments[id].media.push({ media_type: 'video', data: uploadedVideoUrl });
                    });
                }
            }).catch(function() {
                if (alertEl) {
                    alertEl.className = 'fxg-admin-alert fxg-admin-alert--error';
                    alertEl.textContent = 'Failed to create shipment. Please try again.';
                    alertEl.style.display = 'block';
                }
            });
            } catch (err) {
                console.error('[Create] Error:', err);
                if (alertEl) {
                    alertEl.className = 'fxg-admin-alert fxg-admin-alert--error';
                    alertEl.textContent = 'Error: ' + (err.message || err);
                    alertEl.style.display = 'block';
                }
            }
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
                        '<button class="fxg-admin-btn-icon fxg-admin-btn--invoice" data-invoice="' + escapeHtml(s.id) + '" title="Download Invoice">' +
                            '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>' +
                        '</button>' +
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
            var id = btn.getAttribute('data-edit') || btn.getAttribute('data-delete') || btn.getAttribute('data-invoice');
            if (!id) return;

            if (btn.hasAttribute('data-invoice')) {
                var shipment = window.FDX.admin.getShipment(id);
                if (shipment) window.FDX.admin.generateInvoice(shipment);
            } else if (btn.hasAttribute('data-edit')) {
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

        var clearAllBtn = el.querySelector('#clearAllBtn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', function() {
                if (confirm('Delete ALL shipments? This cannot be undone.')) {
                    window.FDX.admin.deleteAllShipments().then(function() {
                        _cache.shipments = {};
                        render('');
                    });
                }
            });
        }
    }

    function initShipmentDetail(el) {
        var params = new URLSearchParams(window.location.search);
        var id = params.get('id');
        var shipment = window.FDX.admin.getShipment(id);
        var F = window.FDX.admin;

        if (!shipment) {
            el.innerHTML = '<div class="fxg-admin-alert fxg-admin-alert--error">Shipment <strong>' + escapeHtml(id) + '</strong> not found.</div>';
            return;
        }

        var se = shipment.sender || {};
        var re = shipment.recipient || {};

        function renderAll() {
            el.querySelector('#shipmentTrackingId').textContent = shipment.id;
            el.querySelector('#shipmentPackageName').textContent = shipment.packageName || '(no name)';
            el.querySelector('#shipmentCreatedDate').textContent = F.formatDate(shipment.createdAt);

            renderDetailMedia();

            el.querySelector('#shipmentStatus').innerHTML = F.badgeHtml(shipment.currentStatus);

            renderSenderDisplay();
            renderRecipientDisplay();
            renderPackageDisplay();

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
            if (statusSelect.options.length === 0) {
                F.STATUSES.forEach(function(s) {
                    var opt = document.createElement('option');
                    opt.value = s;
                    opt.textContent = s;
                    if (s === shipment.currentStatus) opt.selected = true;
                    statusSelect.appendChild(opt);
                });
            }
        }

        function renderSenderDisplay() {
            var html = '';
            if (se.name) html += '<p><strong>Name:</strong> ' + escapeHtml(se.name) + '</p>';
            if (se.company) html += '<p><strong>Company:</strong> ' + escapeHtml(se.company) + '</p>';
            if (se.address) html += '<p><strong>Address:</strong> ' + escapeHtml(se.address) + '</p>';
            if (se.city || se.state || se.zip) {
                var sloc = '';
                if (se.city) sloc += escapeHtml(se.city);
                if (se.state) sloc += (sloc ? ', ' : '') + escapeHtml(se.state);
                if (se.zip) sloc += ' ' + escapeHtml(se.zip);
                html += '<p>' + sloc + '</p>';
            }
            if (se.country) html += '<p><strong>Country:</strong> ' + escapeHtml(se.country) + '</p>';
            if (se.phone) html += '<p><strong>Phone:</strong> ' + escapeHtml(se.phone) + '</p>';
            if (se.email) html += '<p><strong>Email:</strong> ' + escapeHtml(se.email) + '</p>';
            el.querySelector('#senderDisplay').innerHTML = html || '<p class="fxg-admin-empty">No sender information provided.</p>';
        }

        function renderRecipientDisplay() {
            var html = '';
            if (re.name) html += '<p><strong>Name:</strong> ' + escapeHtml(re.name) + '</p>';
            if (re.company) html += '<p><strong>Company:</strong> ' + escapeHtml(re.company) + '</p>';
            if (re.address) html += '<p><strong>Address:</strong> ' + escapeHtml(re.address) + '</p>';
            if (re.city || re.state || re.zip) {
                var rloc = '';
                if (re.city) rloc += escapeHtml(re.city);
                if (re.state) rloc += (rloc ? ', ' : '') + escapeHtml(re.state);
                if (re.zip) rloc += ' ' + escapeHtml(re.zip);
                html += '<p>' + rloc + '</p>';
            }
            if (re.country) html += '<p><strong>Country:</strong> ' + escapeHtml(re.country) + '</p>';
            if (re.phone) html += '<p><strong>Phone:</strong> ' + escapeHtml(re.phone) + '</p>';
            if (re.email) html += '<p><strong>Email:</strong> ' + escapeHtml(re.email) + '</p>';
            if (re.isResidential) html += '<p><span class="fxg-admin-badge fxg-admin-badge--received">Residential</span></p>';
            el.querySelector('#recipientDisplay').innerHTML = html || '<p class="fxg-admin-empty">No recipient information provided.</p>';
        }

        function renderPackageDisplay() {
            var html = '';
            if (shipment.weight) html += '<p><strong>Weight:</strong> ' + escapeHtml(shipment.weight) + '</p>';
            if (shipment.serviceType) html += '<p><strong>Service:</strong> ' + escapeHtml(shipment.serviceType) + '</p>';
            if (shipment.departureDate) html += '<p><strong>Departure:</strong> ' + F.formatDateShort(shipment.departureDate) + '</p>';
            if (shipment.estDeliveryDate) html += '<p><strong>Est. Delivery:</strong> ' + F.formatDateShort(shipment.estDeliveryDate) + '</p>';
            if (shipment.signatureRequired) html += '<p><strong>Signature Required:</strong> Yes</p>';
            if (shipment.referenceNumber) html += '<p><strong>Reference:</strong> ' + escapeHtml(shipment.referenceNumber) + '</p>';
            el.querySelector('#shipmentDetails').innerHTML = html || '<p class="fxg-admin-empty">No package details provided.</p>';
        }

        function buildField(name, label, value, type) {
            type = type || 'text';
            if (type === 'select') {
                var opts = ['FedEx Priority Overnight', 'FedEx Standard Overnight', 'FedEx 2Day', 'FedEx Express Saver', 'FedEx Ground', 'FedEx Home Delivery'];
                var s = '<div class="fxg-admin-form__group"><label class="fxg-admin-form__label">' + label + '</label><select class="fxg-admin-form__select" data-field="' + name + '">';
                opts.forEach(function(o) {
                    s += '<option value="' + escapeHtml(o) + '"' + (o === value ? ' selected' : '') + '>' + escapeHtml(o) + '</option>';
                });
                return s + '</select></div>';
            }
            if (type === 'checkbox') {
                return '<div class="fxg-admin-form__group fxg-admin-form__group--full"><label class="fxg-admin-form__checkbox"><input type="checkbox" data-field="' + name + '"' + (value ? ' checked' : '') + '> ' + label + '</label></div>';
            }
            return '<div class="fxg-admin-form__group"><label class="fxg-admin-form__label">' + label + '</label><input type="' + type + '" class="fxg-admin-form__input" data-field="' + name + '" value="' + escapeHtml(value || '') + '"></div>';
        }

        var displayIdMap = { sender: 'senderDisplay', recipient: 'recipientDisplay', package: 'shipmentDetails' };
        var editIdMap = { sender: 'senderEdit', recipient: 'recipientEdit', package: 'packageEdit' };

        function showEdit(section, fields, obj) {
            var displayEl = el.querySelector('#' + (displayIdMap[section] || section + 'Display'));
            var editEl = el.querySelector('#' + (editIdMap[section] || section + 'Edit'));
            if (!editEl) return;

            var html = '<div class="fxg-admin-form__row">';
            fields.forEach(function(f) {
                html += buildField(f.name, f.label, obj[f.name] !== undefined ? obj[f.name] : '', f.type || 'text');
            });
            html += '</div>';
            html += '<div class="fxg-admin-edit-actions">';
            html += '<button class="fxg-admin-btn fxg-admin-btn--success fxg-admin-btn--small" data-edit-save="' + section + '">Save</button>';
            html += '<button class="fxg-admin-btn fxg-admin-btn--outline fxg-admin-btn--small" data-edit-cancel="' + section + '">Cancel</button>';
            html += '</div>';
            editEl.innerHTML = html;
            if (displayEl) displayEl.style.display = 'none';
            editEl.style.display = 'block';
        }

        function hideEdit(section) {
            var displayEl = el.querySelector('#' + (displayIdMap[section] || section + 'Display'));
            var editEl = el.querySelector('#' + (editIdMap[section] || section + 'Edit'));
            if (displayEl) displayEl.style.display = '';
            if (editEl) editEl.style.display = 'none';
        }

        function collectEdit(section, fields, obj) {
            var editEl = el.querySelector('#' + section + 'Edit');
            if (!editEl) return;
            fields.forEach(function(f) {
                var input = editEl.querySelector('[data-field="' + f.name + '"]');
                if (!input) return;
                if (input.type === 'checkbox') {
                    obj[f.name] = input.checked;
                } else {
                    obj[f.name] = input.value;
                }
            });
        }

        function getStoragePathFromUrl(url) {
            if (!url || url.indexOf('/storage/v1/object/public/shipment-media/') === -1) return null;
            var prefix = SUPABASE_URL + '/storage/v1/object/public/shipment-media/';
            return url.indexOf(prefix) === 0 ? url.slice(prefix.length) : null;
        }

        function renderDetailMedia() {
            var imgWrap = el.querySelector('#shipmentImage');
            var videoWrap = el.querySelector('#shipmentVideo');
            var mediaList = shipment.media || [];
            var imgItem = null, vidItem = null;
            for (var mi = 0; mi < mediaList.length; mi++) {
                if (mediaList[mi].media_type === 'image') imgItem = mediaList[mi];
                else if (mediaList[mi].media_type === 'video') vidItem = mediaList[mi];
            }
            renderMediaItem(imgWrap, imgItem, 'image');
            renderMediaItem(videoWrap, vidItem, 'video');
        }

        function renderMediaItem(wrap, item, type) {
            if (!wrap) return;
            var pencilSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
            var trashSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';

            if (item && item.data) {
                var isVideo = type === 'video';
                var tag = isVideo
                    ? '<video src="' + item.data + '" muted controls style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></video>'
                    : '<img src="' + item.data + '" alt="Package" style="width:100%;height:100%;object-fit:cover;">';
                wrap.innerHTML = tag +
                    '<div class="fxg-admin-media-overlay">' +
                        '<button class="fxg-admin-btn-icon" data-media-edit="' + type + '" title="Edit ' + type + '">' + pencilSvg + '</button>' +
                        '<button class="fxg-admin-btn-icon fxg-admin-btn-icon--danger" data-media-delete="' + type + '" title="Remove ' + type + '">' + trashSvg + '</button>' +
                    '</div>';
                wrap.className = 'fxg-admin-detail-header__image';
            } else {
                wrap.innerHTML = '<div class="fxg-admin-detail-header__image-upload" data-media-upload="' + type + '">Click to upload<br>' + type + '</div>';
                wrap.className = 'fxg-admin-detail-header__image--empty';
            }
        }

        function handleMediaUpload(type) {
            var input = el.querySelector(type === 'image' ? '#detailImageInput' : '#detailVideoInput');
            if (!input) return;
            input.value = '';
            input.click();
        }

        function onMediaFileSelected(type) {
            var input = el.querySelector(type === 'image' ? '#detailImageInput' : '#detailVideoInput');
            var file = input && input.files[0];
            if (!file) return;
            var ext = file.name.split('.').pop() || (type === 'image' ? 'png' : 'mp4');
            var ts = Date.now();
            var rand = Math.random().toString(36).slice(2, 6);
            var path = ts + '_' + rand + '.' + ext;

            uploadToStorage(file, 'shipment-media', path).then(function(publicUrl) {
                var oldMedia = shipment.media || [];
                var oldPath = null;
                for (var i = 0; i < oldMedia.length; i++) {
                    if (oldMedia[i].media_type === type) {
                        oldPath = getStoragePathFromUrl(oldMedia[i].data);
                        oldMedia.splice(i, 1);
                        break;
                    }
                }
                if (oldPath) deleteFromStorage('shipment-media', oldPath);

                return saveShipmentMedia(id, type, publicUrl).then(function() {
                    shipment.media = shipment.media || [];
                    shipment.media.push({ media_type: type, data: publicUrl });
                    shipment.updatedAt = new Date().toISOString();
                    return F.saveShipment(shipment);
                });
            }).then(function() {
                renderDetailMedia();
                showToast((type === 'image' ? 'Image' : 'Video') + ' updated', 'success');
            }).catch(function() {
                showToast('Failed to upload ' + type, 'error');
            });
        }

        function handleMediaDelete(type) {
            if (!confirm('Remove this ' + type + '?')) return;
            var oldMedia = shipment.media || [];
            var oldPath = null;
            for (var i = 0; i < oldMedia.length; i++) {
                if (oldMedia[i].media_type === type) {
                    oldPath = getStoragePathFromUrl(oldMedia[i].data);
                    oldMedia.splice(i, 1);
                    break;
                }
            }
            if (oldPath) deleteFromStorage('shipment-media', oldPath);

            supabaseFetch('shipment_media?shipment_id=eq.' + encodeURIComponent(id) + '&media_type=eq.' + type, {
                method: 'DELETE'
            }).then(function() {
                shipment.updatedAt = new Date().toISOString();
                return F.saveShipment(shipment);
            }).then(function() {
                renderDetailMedia();
                showToast((type === 'image' ? 'Image' : 'Video') + ' removed', 'success');
            });
        }

        var editSections = {
            sender: {
                fields: [
                    { name: 'name', label: 'Name' },
                    { name: 'company', label: 'Company' },
                    { name: 'address', label: 'Address' },
                    { name: 'city', label: 'City' },
                    { name: 'state', label: 'State' },
                    { name: 'zip', label: 'ZIP' },
                    { name: 'country', label: 'Country' },
                    { name: 'phone', label: 'Phone' },
                    { name: 'email', label: 'Email', type: 'email' }
                ]
            },
            recipient: {
                fields: [
                    { name: 'name', label: 'Name' },
                    { name: 'company', label: 'Company' },
                    { name: 'address', label: 'Address' },
                    { name: 'city', label: 'City' },
                    { name: 'state', label: 'State' },
                    { name: 'zip', label: 'ZIP' },
                    { name: 'country', label: 'Country' },
                    { name: 'phone', label: 'Phone' },
                    { name: 'email', label: 'Email', type: 'email' },
                    { name: 'isResidential', label: 'Residential Address', type: 'checkbox' }
                ]
            },
            package: {
                fields: [
                    { name: 'weight', label: 'Weight' },
                    { name: 'serviceType', label: 'Service', type: 'select' },
                    { name: 'departureDate', label: 'Departure Date', type: 'date' },
                    { name: 'estDeliveryDate', label: 'Est. Delivery Date', type: 'date' },
                    { name: 'signatureRequired', label: 'Signature Required', type: 'checkbox' },
                    { name: 'referenceNumber', label: 'Reference Number' }
                ]
            }
        };

        renderAll();

        /* Tracking ID edit toggle */
        var editIdBtn = el.querySelector('#editTrackingIdBtn');
        var saveIdBtn = el.querySelector('#saveTrackingIdBtn');
        var cancelIdBtn = el.querySelector('#cancelTrackingIdBtn');
        var idWrap = el.querySelector('#trackingIdWrap');
        var idEdit = el.querySelector('#trackingIdEdit');
        var idInput = el.querySelector('#trackingIdInput');

        function showTrackingIdEdit() {
            if (idInput) idInput.value = shipment.id || '';
            if (idWrap) idWrap.style.display = 'none';
            if (idEdit) idEdit.style.display = 'block';
        }

        function hideTrackingIdEdit() {
            if (idWrap) idWrap.style.display = 'flex';
            if (idEdit) idEdit.style.display = 'none';
        }

        if (editIdBtn) {
            editIdBtn.addEventListener('click', showTrackingIdEdit);
        }
        if (cancelIdBtn) {
            cancelIdBtn.addEventListener('click', hideTrackingIdEdit);
        }
        if (saveIdBtn) {
            saveIdBtn.addEventListener('click', function() {
                var newId = idInput ? idInput.value.trim() : '';
                if (!newId) {
                    showToast('Tracking ID cannot be empty', 'error');
                    return;
                }
                if (newId === shipment.id) {
                    hideTrackingIdEdit();
                    return;
                }
                var oldId = shipment.id;
                shipment.id = newId;
                shipment.updatedAt = new Date().toISOString();
                F.saveShipment(shipment).then(function() {
                    var newUrl = window.location.pathname + '?id=' + encodeURIComponent(newId);
                    window.location.href = newUrl;
                }).catch(function() {
                    shipment.id = oldId;
                    showToast('Failed to update tracking ID', 'error');
                });
            });
        }

        if (!shipment.media || shipment.media.length === 0) {
            F.fetchShipment(id).then(function(fresh) {
                if (fresh && fresh.media && fresh.media.length > 0) {
                    Object.assign(shipment, fresh);
                    se = shipment.sender || {};
                    re = shipment.recipient || {};
                    renderAll();
                }
            });
        }

        el.addEventListener('click', function(e) {
            var toggleBtn = e.target.closest('[data-toggle-edit]');
            if (toggleBtn) {
                var sectionName = toggleBtn.getAttribute('data-toggle-edit');
                var section = editSections[sectionName];
                if (!section) return;
                var obj = sectionName === 'package' ? shipment : (sectionName === 'sender' ? se : re);
                showEdit(sectionName, section.fields, obj);
                return;
            }

            var saveBtn = e.target.closest('[data-edit-save]');
            if (saveBtn) {
                var sectionName = saveBtn.getAttribute('data-edit-save');
                var section = editSections[sectionName];
                if (!section) return;
                var obj = sectionName === 'package' ? shipment : (sectionName === 'sender' ? se : re);
                collectEdit(sectionName, section.fields, obj);
                shipment.updatedAt = new Date().toISOString();
                F.saveShipment(shipment).then(function() {
                    hideEdit(sectionName);
                    if (sectionName === 'sender') renderSenderDisplay();
                    else if (sectionName === 'recipient') renderRecipientDisplay();
                    else renderPackageDisplay();
                });
                return;
            }

            var cancelBtn = e.target.closest('[data-edit-cancel]');
            if (cancelBtn) {
                var sectionName = cancelBtn.getAttribute('data-edit-cancel');
                hideEdit(sectionName);
                if (sectionName === 'sender') renderSenderDisplay();
                else if (sectionName === 'recipient') renderRecipientDisplay();
                else renderPackageDisplay();
                return;
            }

            var mediaEditBtn = e.target.closest('[data-media-edit]');
            if (mediaEditBtn) {
                handleMediaUpload(mediaEditBtn.getAttribute('data-media-edit'));
                return;
            }

            var mediaDeleteBtn = e.target.closest('[data-media-delete]');
            if (mediaDeleteBtn) {
                handleMediaDelete(mediaDeleteBtn.getAttribute('data-media-delete'));
                return;
            }

            var mediaUploadBtn = e.target.closest('[data-media-upload]');
            if (mediaUploadBtn) {
                handleMediaUpload(mediaUploadBtn.getAttribute('data-media-upload'));
                return;
            }
        });

        var imgInput = el.querySelector('#detailImageInput');
        if (imgInput) {
            imgInput.addEventListener('change', function() { onMediaFileSelected('image'); });
        }
        var vidInput = el.querySelector('#detailVideoInput');
        if (vidInput) {
            vidInput.addEventListener('change', function() { onMediaFileSelected('video'); });
        }

        var updateForm = el.querySelector('#updateStatusForm');
        var statusSelect = el.querySelector('#updateStatus');
        if (updateForm) {
            updateForm.addEventListener('submit', function(e) {
                e.preventDefault();
                var newStatus = statusSelect.value;
                var remark = el.querySelector('#updateRemark').value.trim();

                var isSame = newStatus === shipment.currentStatus;
                shipment.currentStatus = newStatus;
                shipment.updatedAt = new Date().toISOString();
                shipment.statusTimeline.push({
                    status: newStatus,
                    timestamp: shipment.updatedAt,
                    remark: remark
                });

                F.saveShipment(shipment).then(function() {
                    var toast = document.createElement('div');
                    toast.className = 'fxg-admin-alert fxg-admin-alert--success';
                    toast.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);opacity:0;transition:opacity 0.3s;max-width:400px';
                    toast.textContent = isSame ? 'Remark added to "' + newStatus + '"' : 'Status updated to "' + newStatus + '" successfully!';
                    document.body.appendChild(toast);
                    requestAnimationFrame(function() { toast.style.opacity = '1'; });
                    setTimeout(function() { window.location.reload(); }, 1500);
                });
            });
        }
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
            svg.innerHTML = '<circle cx="32" cy="32" r="14" fill="#e0dce6"/>';
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

        var lastEntry = sorted.length ? sorted[sorted.length - 1] : null;
        var isDelivered = lastEntry && (lastEntry.status || '').toLowerCase() === 'delivered';
        container.classList.toggle('fxg-tr-scans--delivered', isDelivered);
    }

    function renderFacts(el, shipment) {
        var container = el.querySelector('#trShipmentFacts');
        if (!container) return;

        var facts = [];
        facts.push({ label: 'TRACKING NUMBER', value: shipment.id || '-' });
        if (shipment.packageName) facts.push({ label: 'PACKAGE NAME', value: shipment.packageName });
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
        if (re.name) facts.push({ label: 'RECIPIENT', value: re.name });
        var addrParts = [re.address, re.city, re.state, re.zip, re.country].filter(Boolean);
        if (addrParts.length > 0) facts.push({ label: 'DELIVERED TO', value: addrParts.join(', ') });
        if (shipment.currentStatus === 'Delivered' && shipment.signatureName) {
            facts.push({ label: 'SIGNED BY', value: shipment.signatureName });
        }

        if (facts.length === 0) {
            container.innerHTML = '<div style="padding:16px 0 24px;color:#999;font-size:14px;">No shipment details available.</div>';
            return;
        }

        var html = '';
        facts.forEach(function (f) {
            html += '<div class="fxg-tr-facts__item">';
            html += '<span class="fxg-tr-facts__label">' + escape(f.label) + '</span>';
            html += '<span class="fxg-tr-facts__value">' + escape(f.value) + '</span>';
            html += '</div>';
        });
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

    var headerHTML = '<header class="fxg-header" id="trOverlayHeader">' +
        '<fedex-smart-banner><script type="application/json" data-config="js-smartbanner-config">{"title":"FedEx Mobile","buttonText":"VIEW","description":"Track, ship, and more.","android_enabled":true,"android_image":"https://lh3.googleusercontent.com/YtXTsa-6SaaMl02-OUo8iRztlX5Thu4aCLavunIV1M5hm9y4ySTPpMjpY44fL4ayz7Se","android_url":"https://play.google.com/store/apps/details?id=com.fedex.ida.android","android_instore":"Get on the Google Play store.","ios_enabled":true,"ios_image":"https://is1-ssl.mzstatic.com/image/thumb/Purple124/v4/16/9f/c2/169fc22b-b2b5-5e5a-097a-c0bc3a5dbddc/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/246x0w.png","ios_url":"https://apps.apple.com/app/fedex/id1010729050","ios_instore":"Get on the App Store."}</script></fedex-smart-banner>' +
        '<nav class="fxg-nav"><div class="fxg-wrapper">' +
        '<a class="fxg-header__logo_wrapper" href="index.html" aria-label="FedEx Logo"><svg class="fxg-header__logo" viewBox="0 0 451.694 220.997" aria-hidden="true"><defs><style>.fxg-logo-ex{fill:#FF6600;}.fxg-logo-fed{fill:#660099;}</style></defs><polygon class="fxg-logo-ex" points="360.671 159 346.805 143.415 333.547 159.009 306.001 159.012 332.991 127.8 306.001 97.012 335.001 97.012 348.006 111.984 361.001 97.012 388.001 97.012 361.62 127.6 389.705 159 360.671 159"/><polygon class="fxg-logo-ex" points="252.001 159.012 252.001 62.012 306.001 62.012 306.001 84.012 275.001 84.012 275.001 97.012 306.001 97.012 306.001 118.012 275.001 118.012 275.001 137.012 306.001 137.012 306.001 159.012 252.001 159.012"/><path class="fxg-logo-fed" d="M230,62.012v40l-.814-.639c-5.005-5.7-11.879-7.361-19.186-7.361-14.915,0-25.458,9.664-29.362,23.077C176.134,102.374,164.118,94.012,147,94.012c-13.914,0-25.294,5.789-31,16v-13H88v-13h31v-22H62v97H88v-41l25.571-.222a36.939,36.939,0,0,0-1.2,9.509c0,20.12,15.316,34.535,34.935,34.535,16.517,0,26.89-7.708,32.7-21.822H158c-3,4.2-4.69,5.205-10.6,5.205-6.907,0-13.113-6.206-13.113-13.413h45.045c1.9,16.016,14.41,30.208,31.528,30.208A24.082,24.082,0,0,0,230,151.755v7.257h22v-97ZM135.293,118.09c1.4-6.106,6.206-10.11,12.112-10.11,6.507,0,11.011,3.9,12.213,10.11Zm80.381,25.626c-8.309,0-13.514-7.808-13.514-15.916,0-8.709,4.5-17.017,13.514-17.017,9.309,0,13.113,8.308,13.113,17.017C228.787,136.108,224.783,143.716,215.674,143.716Z"/></svg></a>' +
        '<button class="fxg-hamburger" aria-label="Toggle navigation menu"><span class="fxg-hamburger__line"></span><span class="fxg-hamburger__line"></span><span class="fxg-hamburger__line"></span></button>' +
        '<a href="javascript:void(0)" class="cc-aem-c-button cc-aem-c-button--tertiary fxg-skip-to-main-content">Skip to main content</a>' +
        '<div class="fxg-dropdown fxg-global-nav"><div class="fxg-dropdown__list">' +
        '<div class="fxg-dropdown__item"><a href="#" aria-label="Open Shipping Menu" class="fxg-link fxg-dropdown-js">Shipping</a><div class="fxg-dropdown__sub-menu"><div class="link fxg-button-link"><a href="pages/create-shipment.html" class="fxg-link">Create a Shipment</a></div><div class="link fxg-button-link"><a href="pages/rates.html" class="fxg-link">Shipping Rates &amp; Delivery Times</a></div><div class="link fxg-button-link"><a href="pages/schedule-pickup.html" class="fxg-link">Schedule &amp; Manage Pickups</a></div><div class="link fxg-button-link"><a href="pages/packing.html" class="fxg-link">Packing &amp; Shipping Supplies</a></div><div class="link fxg-button-link"><a href="pages/international.html" class="fxg-link">International Shipping Guide</a></div><div class="link fxg-button-link"><a href="pages/freight.html" class="fxg-link">Freight</a></div><div class="link fxg-button-link"><a href="pages/returns.html" class="fxg-link">Manage a Return</a></div><div class="link fxg-button-link"><a href="pages/shipping.html" class="fxg-link fxg-link--blue">ALL SHIPPING SERVICES</a></div></div></div>' +
        '<div class="fxg-dropdown__item"><a href="#" aria-label="Open Tracking Menu" class="fxg-link fxg-dropdown-js">Tracking</a><div class="fxg-dropdown__sub-menu"><div class="fxg-tracking-module fxg-field__default"><form method="POST" action="#" class="fxg-form" id="HeaderTrackingModule"><div class="fxg-field"><label class="fxg-field__label" for="trackingModuleTrackingNum">Tracking ID</label><input id="trackingModuleTrackingNum" tabindex="0" type="text" class="fxg-field__input-text fxg-field__input--required" name="trackingNumber" required title="Tracking ID" placeholder="Tracking ID" aria-required="true" data-errmsg="Please enter at least one tracking number."><div class="fxg-field__error_text"><span>Please enter at least one tracking number.</span></div></div><button type="submit" aria-label="Click here to track your package" class="cc-aem-c-button cc-aem-c-button--primary">TRACK</button></form></div><div class="link fxg-button-link"><a href="pages/advanced-tracking.html" class="fxg-link">Advanced Shipment Tracking</a></div><div class="link fxg-button-link"><a href="pages/manage-delivery.html" class="fxg-link">Manage Your Delivery</a></div><div class="link fxg-button-link"><a href="pages/tracking.html" class="fxg-link fxg-link--blue">ALL TRACKING SERVICES</a></div></div></div>' +
        '<div class="fxg-dropdown__item"><a href="#" aria-label="Open Design & Print menu" class="fxg-link fxg-dropdown-js">Design &amp; Print</a><div class="fxg-dropdown__sub-menu"><div class="link fxg-button-link"><a href="pages/office-print.html" class="fxg-link">Explore Print, Products &amp; Design</a></div><div class="link fxg-button-link"><a href="pages/office-services.html" class="fxg-link">Browse Services</a></div><div class="link fxg-button-link"><a href="pages/office.html" class="fxg-link fxg-link--blue">VISIT NEW MARKETPLACE</a></div></div></div>' +
        '<div class="fxg-dropdown__item"><a href="#" aria-label="Open Locations Menu" class="fxg-link fxg-dropdown-js">Locations</a><div class="fxg-dropdown__sub-menu"><div class="link fxg-button-link"><a href="pages/drop-off.html" class="fxg-link">Drop Off a Package</a></div><div class="link fxg-button-link"><a href="pages/locations.html" class="fxg-link fxg-link--blue">Find a Location</a></div></div></div>' +
        '<div class="fxg-dropdown__item"><a href="#" aria-label="Open Customer Support Menu" class="fxg-link fxg-dropdown-js">Support</a><div class="fxg-dropdown__sub-menu"><div class="link fxg-button-link"><a href="pages/small-business.html" class="fxg-link">Small Business Center</a></div><div class="link fxg-button-link"><a href="pages/service-guide.html" class="fxg-link">FedEx Service Guide</a></div><div class="link fxg-button-link"><a href="pages/manage-account.html" class="fxg-link">Account Management Tools</a></div><div class="link fxg-button-link"><a href="pages/faq.html" class="fxg-link">Frequently Asked Questions</a></div><div class="link fxg-button-link"><a href="pages/claims.html" class="fxg-link">File a Claim</a></div><div class="link fxg-button-link"><a href="pages/billing.html" class="fxg-link">Billing &amp; Invoicing</a></div><div class="link fxg-button-link"><a href="pages/customer-support.html" class="fxg-link fxg-link--blue">Customer Support</a></div></div></div>' +
        '</div></div>' +
        '<div class="fxg-header__right"><div class="fxg-header__search"><a href="#" class="fxg-link fxg-search-js" aria-label="Search"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/></svg><span>Search</span></a></div>' +
        '<div class="fxg-header__account"><a href="#" class="fxg-link" aria-label="Sign Up or Log In"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg><span>Sign Up or Log In</span></a></div></div>' +
        '</div></nav></header>';

    var overlayHTML = [
        '<div class="fxg-tracking-overlay" id="fxgTrackingOverlay">',
        headerHTML,
        '<button class="fxg-tracking-overlay__close" id="trOverlayClose" aria-label="Close tracking result">',
        '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
        '</button>',
        '<div class="fxg-tracking-scroll" id="trScrollArea">',
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
        '<div class="fxg-tr-bottom-row">',
        '<div class="fxg-tr-media" id="trPackageMedia"></div>',
        '<div class="fxg-tr-facts" id="trShipmentFacts"></div>',
        '</div>',
        '</div></div></div></div>'
    ].join('');

    window.FDX.track = function (trackingId) {
        if (!trackingId) return;
        var existing = document.getElementById('fxgTrackingOverlay');
        if (existing) existing.remove();
        var wrap = document.createElement('div');
        wrap.innerHTML = overlayHTML;
        var overlay = wrap.firstElementChild;
        document.body.appendChild(overlay);

        /* Init header inside overlay */
        (function initOverlayHeader() {
            var header = overlay.querySelector('.fxg-header');
            if (!header) return;
            var hamburger = header.querySelector('.fxg-hamburger');
            var globalNav = header.querySelector('.fxg-global-nav');
            var dropdownItems = header.querySelectorAll('.fxg-dropdown__item');

            if (hamburger) {
                hamburger.addEventListener('click', function (e) {
                    e.stopPropagation();
                    header.classList.toggle('fxg-header--mobile-open');
                    hamburger.setAttribute('aria-label',
                        header.classList.contains('fxg-header--mobile-open')
                            ? 'Close navigation menu' : 'Toggle navigation menu');
                });
            }

            header.querySelectorAll('.fxg-dropdown__sub-menu a').forEach(function (link) {
                link.addEventListener('click', function () {
                    header.classList.remove('fxg-header--mobile-open');
                    if (hamburger) hamburger.setAttribute('aria-label', 'Toggle navigation menu');
                });
            });

            var overlayEl = header.querySelector('.fxg-header__overlay');
            if (!overlayEl) {
                overlayEl = document.createElement('div');
                overlayEl.className = 'fxg-header__overlay';
                header.appendChild(overlayEl);
            }
            overlayEl.addEventListener('click', function () {
                header.classList.remove('fxg-header--mobile-open');
                if (hamburger) hamburger.setAttribute('aria-label', 'Toggle navigation menu');
            });

            dropdownItems.forEach(function (item) {
                var toggle = item.querySelector('.fxg-dropdown-js');
                if (toggle) {
                    toggle.addEventListener('click', function (e) {
                        if (window.innerWidth <= 900) {
                            e.preventDefault();
                            item.classList.toggle('fxg-dropdown--open');
                        }
                    });
                }
            });

            var headerForm = header.querySelector('#HeaderTrackingModule');
            if (headerForm) {
                headerForm.addEventListener('submit', function (e) {
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

            var resizeTimer;
            window.addEventListener('resize', function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function () {
                    if (window.innerWidth > 900 && header.classList.contains('fxg-header--mobile-open')) {
                        header.classList.remove('fxg-header--mobile-open');
                        if (hamburger) hamburger.setAttribute('aria-label', 'Toggle navigation menu');
                        dropdownItems.forEach(function (item) {
                            item.classList.remove('fxg-dropdown--open');
                        });
                    }
                }, 200);
            });
        })();

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
                renderPackageMedia(el, shipment);
                renderFacts(el, shipment);
            } catch (e) {
                if (loader) loader.classList.add('fxg-tracking-loader--hidden');
                if (card) card.style.display = '';
                showSystemError(el);
            }
        }, 600);
    });
})();

/* --- init --- */
document.addEventListener('DOMContentLoaded',function(){if(window.FDX&&window.FDX.components){window.FDX.components.forEach(function(f){if(typeof f==='function')f()})}})
