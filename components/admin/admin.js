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

    var SEND_EMAIL_FN_URL = SUPABASE_URL + '/functions/v1/send-email';

    var EMAIL_SENDERS = [
        { key: 'shipping', label: 'FedEx Shipping' },
        { key: 'tracking', label: 'FedEx Tracking' },
        { key: 'delivery', label: 'FedEx Delivery' }
    ];

    function senderDefaultFor(shipment) {
        var st = shipment.currentStatus || '';
        if (st === 'Out for Delivery' || st === 'Delivered') return 'delivery';
        return 'shipping';
    }

    function sendEmail(payload) {
        return fetch(SEND_EMAIL_FN_URL, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).then(function(res) {
            return res.json().catch(function() { return { ok: false, error: 'Invalid response from email service' }; });
        });
    }

    function siteBaseUrl() {
        var p = window.location.pathname;
        var idx = p.indexOf('/pages/');
        return window.location.origin + (idx >= 0 ? p.slice(0, idx + 1) : p.replace(/[^/]*$/, ''));
    }

    function emailTrackUrl(shipment) {
        return siteBaseUrl() + 'pages/track.html?tracking=' + encodeURIComponent(shipment.id);
    }

    function emailSubjectFor(shipment) {
        var st = shipment.currentStatus || '';
        if (st === 'Delivered') return 'Your FedEx package ' + shipment.id + ' has been delivered';
        if (st === 'Out for Delivery') return 'Your FedEx package ' + shipment.id + ' is out for delivery';
        if (st === 'Shipment Created') return 'Your FedEx shipment ' + shipment.id + ' is on its way';
        return 'Your FedEx shipment ' + shipment.id + ' — ' + st;
    }

    function emailMessageFor(shipment) {
        var re = shipment.recipient || {};
        var name = re.name ? re.name.split(' ')[0] : 'there';
        var eta = shipment.estDeliveryDate ? formatDateShort(shipment.estDeliveryDate) : 'to be confirmed';
        var st = shipment.currentStatus || 'Pending';

        if (st === 'Delivered') {
            return 'Hello ' + name + ',\n\nGreat news! Your FedEx package ' + shipment.id + ' has been delivered.\n\nThank you for choosing FedEx.';
        }
        if (st === 'Out for Delivery') {
            return 'Hello ' + name + ',\n\nYour FedEx package ' + shipment.id + ' is out for delivery today and should arrive by the end of the day.\n\nPlease make sure someone is available to receive it. Thank you for choosing FedEx.';
        }
        return 'Hello ' + name + ',\n\nYour FedEx package ' + shipment.id + ' is currently ' + st.toLowerCase() + ' and is scheduled for delivery by ' + eta + '.\n\nYou can track your package anytime using the button below. Thank you for choosing FedEx.';
    }

    function buildEmailHtml(shipment, message) {
        var re = shipment.recipient || {};
        var se = shipment.sender || {};
        var trackUrl = emailTrackUrl(shipment);
        var text = (message || '').split('\n').map(function(line) {
            return '<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#333">' +
                (line ? escapeHtml(line) : '&nbsp;') + '</p>';
        }).join('');
        var eta = shipment.estDeliveryDate ? formatDateShort(shipment.estDeliveryDate) : '-';
        var status = shipment.currentStatus || 'Pending';

        return '' +
            '<div style="background:#fff;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif">' +
                '<div style="background:#4D148C;padding:24px 32px;display:flex;justify-content:space-between;align-items:center">' +
                    '<svg viewBox="0 0 451.694 220.997" style="width:110px;height:auto;display:block">' +
                        '<defs><style>.fxg-em-ex{fill:#FF6600;}.fxg-em-fed{fill:#fff;}</style></defs>' +
                        '<polygon class="fxg-em-ex" points="360.671 159 346.805 143.415 333.547 159.009 306.001 159.012 332.991 127.8 306.001 97.012 335.001 97.012 348.006 111.984 361.001 97.012 388.001 97.012 361.62 127.6 389.705 159 360.671 159"/>' +
                        '<polygon class="fxg-em-ex" points="252.001 159.012 252.001 62.012 306.001 62.012 306.001 84.012 275.001 84.012 275.001 97.012 306.001 97.012 306.001 118.012 275.001 118.012 275.001 137.012 306.001 137.012 306.001 159.012 252.001 159.012"/>' +
                        '<path class="fxg-em-fed" d="M230,62.012v40l-.814-.639c-5.005-5.7-11.879-7.361-19.186-7.361-14.915,0-25.458,9.664-29.362,23.077C176.134,102.374,164.118,94.012,147,94.012c-13.914,0-25.294,5.789-31,16v-13H88v-13h31v-22H62v97H88v-41l25.571-.222a36.939,36.939,0,0,0-1.2,9.509c0,20.12,15.316,34.535,34.935,34.535,16.517,0,26.89-7.708,32.7-21.822H158c-3,4.2-4.69,5.205-10.6,5.205-6.907,0-13.113-6.206-13.113-13.413h45.045c1.9,16.016,14.41,30.208,31.528,30.208A24.082,24.082,0,0,0,230,151.755v7.257h22v-97ZM135.293,118.09c1.4-6.106,6.206-10.11,12.112-10.11,6.507,0,11.011,3.9,12.213,10.11Zm80.381,25.626c-8.309,0-13.514-7.808-13.514-15.916,0-8.709,4.5-17.017,13.514-17.017,9.309,0,13.113,8.308,13.113,17.017C228.787,136.108,224.783,143.716,215.674,143.716Z"/>' +
                    '</svg>' +
                    '<div style="text-align:right">' +
                        '<div style="font-size:18px;font-weight:700;color:#fff;letter-spacing:1.5px;margin-bottom:2px">SHIPPING NOTIFICATION</div>' +
                        '<div style="font-size:10px;color:rgba(255,255,255,0.7);letter-spacing:0.5px">TRACKING ID: ' + escapeHtml(shipment.id) + '</div>' +
                    '</div>' +
                '</div>' +
                '<div style="padding:28px 32px">' +
                    text +
                    '<div style="margin:20px 0;border:1px solid #e8e8e8;border-radius:8px;overflow:hidden">' +
                        '<div style="background:#f8f6fb;padding:10px 16px;font-size:11px;font-weight:700;color:#4D148C;letter-spacing:0.8px;text-transform:uppercase;border-bottom:1px solid #e8e8e8">Shipment Details</div>' +
                        '<table style="width:100%;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333">' +
                            '<tr><td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;color:#888;width:45%">Tracking ID</td><td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;font-weight:700;color:#4D148C">' + escapeHtml(shipment.id) + '</td></tr>' +
                            '<tr><td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;color:#888">Package</td><td style="padding:10px 16px;border-bottom:1px solid #f0f0f0">' + escapeHtml(shipment.packageName || '-') + '</td></tr>' +
                            '<tr><td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;color:#888">Service</td><td style="padding:10px 16px;border-bottom:1px solid #f0f0f0">' + escapeHtml(shipment.serviceType || '-') + '</td></tr>' +
                            '<tr><td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;color:#888">Status</td><td style="padding:10px 16px;border-bottom:1px solid #f0f0f0">' + escapeHtml(status) + '</td></tr>' +
                            '<tr><td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;color:#888">Estimated Delivery</td><td style="padding:10px 16px;border-bottom:1px solid #f0f0f0">' + escapeHtml(eta) + '</td></tr>' +
                            '<tr><td style="padding:10px 16px;color:#888">Sender</td><td style="padding:10px 16px">' + escapeHtml(se.name || '-') + '</td></tr>' +
                        '</table>' +
                    '</div>' +
                    '<div style="text-align:center;margin:24px 0">' +
                        '<a href="' + escapeHtml(trackUrl) + '" style="display:inline-block;background:#4D148C;color:#fff;text-decoration:none;padding:13px 32px;border-radius:6px;font-size:14px;font-weight:700;letter-spacing:0.5px">TRACK YOUR PACKAGE</a>' +
                    '</div>' +
                    '<p style="font-size:11px;color:#999;text-align:center;margin:0">Thank you for using FedEx</p>' +
                '</div>' +
                '<div style="background:#f5f5f5;padding:16px 32px;text-align:center;font-size:11px;color:#999;border-top:3px solid #FF6600">' +
                    '&copy; FedEx 1995-2026 &nbsp;|&nbsp; ' + escapeHtml((re.name || '')) + (re.address ? ' &nbsp;|&nbsp; ' + escapeHtml(re.address) : '') +
                '</div>' +
            '</div>';
    }

    function openEmailModal(shipment, prefill) {
        var re = shipment.recipient || {};
        prefill = prefill || {};
        var prefillTo = (prefill.to !== undefined) ? prefill.to : (re.email || '');
        var prefillSubject = (prefill.subject !== undefined) ? prefill.subject : emailSubjectFor(shipment);
        var prefillMessage = (prefill.message !== undefined) ? prefill.message : emailMessageFor(shipment);

        var overlay = document.createElement('div');
        overlay.className = 'fxg-admin-modal-overlay';
        overlay.innerHTML =
            '<div class="fxg-admin-modal">' +
                '<div class="fxg-admin-modal__header">' +
                    '<h3>Email Recipient</h3>' +
                    '<button type="button" class="fxg-admin-modal__close" data-email-close aria-label="Close">&#10005;</button>' +
                '</div>' +
                '<div class="fxg-admin-modal__body">' +
                    '<div class="fxg-admin-form__group">' +
                        '<label class="fxg-admin-form__label">Sender</label>' +
                        '<select class="fxg-admin-form__select" id="emailSender">' +
                            EMAIL_SENDERS.map(function(snd) {
                                return '<option value="' + snd.key + '"' + (snd.key === senderDefaultFor(shipment) ? ' selected' : '') + '>' + snd.label + '</option>';
                            }).join('') +
                        '</select>' +
                    '</div>' +
                    '<div class="fxg-admin-form__group">' +
                        '<label class="fxg-admin-form__label">To</label>' +
                        '<input type="email" class="fxg-admin-form__input" id="emailTo" value="' + escapeHtml(prefillTo) + '" placeholder="recipient@example.com">' +
                    '</div>' +
                    '<div class="fxg-admin-form__group">' +
                        '<label class="fxg-admin-form__label">Subject</label>' +
                        '<input type="text" class="fxg-admin-form__input" id="emailSubject" value="' + escapeHtml(prefillSubject) + '">' +
                    '</div>' +
                    '<div class="fxg-admin-form__group">' +
                        '<label class="fxg-admin-form__label">Message</label>' +
                        '<textarea class="fxg-admin-form__textarea" id="emailMessage" rows="7">' + escapeHtml(prefillMessage) + '</textarea>' +
                    '</div>' +
                    '<p class="fxg-admin-modal__hint">A branded FedEx email will be sent with the shipment details and a tracking link.</p>' +
                '</div>' +
                '<div class="fxg-admin-modal__footer">' +
                    '<button type="button" class="fxg-admin-btn fxg-admin-btn--outline" data-email-cancel>Cancel</button>' +
                    '<button type="button" class="fxg-admin-btn fxg-admin-btn--primary" id="emailSendBtn">Send Email</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(overlay);

        function close() {
            document.body.removeChild(overlay);
        }
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) close();
        });
        var closeBtn = overlay.querySelector('[data-email-close]');
        if (closeBtn) closeBtn.addEventListener('click', close);
        var cancelBtn = overlay.querySelector('[data-email-cancel]');
        if (cancelBtn) cancelBtn.addEventListener('click', close);

        var sendBtn = overlay.querySelector('#emailSendBtn');
        sendBtn.addEventListener('click', function() {
            var sender = overlay.querySelector('#emailSender').value;
            var to = overlay.querySelector('#emailTo').value.trim();
            var subject = overlay.querySelector('#emailSubject').value.trim();
            var message = overlay.querySelector('#emailMessage').value.trim();
            var err = overlay.querySelector('.fxg-admin-modal__hint');

            if (!to) {
                err.style.color = '#d32f2f';
                err.textContent = 'Please enter the recipient email address.';
                return;
            }
            if (!subject || !message) {
                err.style.color = '#d32f2f';
                err.textContent = 'Subject and message are required.';
                return;
            }

            sendBtn.disabled = true;
            sendBtn.textContent = 'Sending...';
            err.style.color = '';
            err.textContent = '';

            sendEmail({ sender: sender, to: to, subject: subject, html: buildEmailHtml(shipment, message) }).then(function(res) {
                if (res && res.ok) {
                    close();
                    showToast('Email sent to ' + to, 'success');
                } else {
                    sendBtn.disabled = false;
                    sendBtn.textContent = 'Send Email';
                    err.style.color = '#d32f2f';
                    err.textContent = 'Failed to send: ' + ((res && res.error) || 'Unknown error');
                }
            });
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
        saveShipmentMedia: saveShipmentMedia,
        deleteFromStorage: deleteFromStorage,
        deleteShipment: deleteShipment,
        deleteAllShipments: deleteAllShipments,
        getStats: getStats,
        formatDate: formatDate,
        formatDateShort: formatDateShort,
        escapeHtml: escapeHtml,
        badgeHtml: badgeHtml,
        generateInvoice: generateInvoice,
        sendEmail: sendEmail,
        openEmailModal: openEmailModal
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
                var titles = { dashboard: 'Dashboard', create: 'Create Shipment', shipments: 'All Shipments', shipment: 'Shipment Detail', inbox: 'Inbox' };
                titleEl.textContent = titles[page] || page;
            }
        }

        var pageType = contentEl.getAttribute('data-page-type');
        if (pageType === 'dashboard') initDashboard(contentEl);
        else if (pageType === 'create') initCreate(contentEl);
        else if (pageType === 'shipments') initShipments(contentEl);
        else if (pageType === 'inbox') initInbox(contentEl);

        if (pageType !== 'create') {
            setTimeout(function() {
                syncFromSupabase(function() {
                    if (pageType === 'dashboard') initDashboard(contentEl);
                    else if (pageType === 'shipments') initShipments(contentEl);
                    else if (pageType === 'shipment') initShipmentDetail(contentEl);
                    else if (pageType === 'inbox') initInbox(contentEl);
                });
            }, 50);
        }
    });

    function initInbox(el) {
        var listEl = el.querySelector('#inboxList');
        var emptyEl = el.querySelector('#noInbox');
        var searchEl = el.querySelector('#inboxSearch');
        var refreshBtn = el.querySelector('#inboxRefresh');
        var rows = [];
        if (!listEl) return;
        if (listEl.getAttribute('data-inbox-init')) return;
        listEl.setAttribute('data-inbox-init', '1');

        function load() {
            fetch(SUPABASE_URL + '/rest/v1/email_inbox?select=*&order=created_at.desc&limit=100', {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
                }
            }).then(function(res) {
                return res.json();
            }).then(function(data) {
                rows = Array.isArray(data) ? data : [];
                render();
            }).catch(function() {
                listEl.innerHTML = '<p class="fxg-inbox__error">Failed to load inbox. Check your connection.</p>';
            });
        }

        function markRead(row) {
            if (row.read) return;
            fetch(SUPABASE_URL + '/rest/v1/email_inbox?id=eq.' + row.id, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ read: true })
            }).then(function() {
                row.read = true;
                var itemEl = listEl.querySelector('[data-row-id="' + row.id + '"]');
                if (itemEl) itemEl.classList.remove('fxg-inbox-item--unread');
            });
        }

        function deleteRow(row) {
            if (!window.confirm('Delete this reply from ' + (row.from_name || row.from_email) + '?')) return;
            fetch(SUPABASE_URL + '/rest/v1/email_inbox?id=eq.' + row.id, {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
                }
            }).then(function(res) {
                if (res.ok) {
                    rows = rows.filter(function(r) { return r.id !== row.id; });
                    render();
                    showToast('Reply deleted', 'success');
                }
            });
        }

        function replyTo(row) {
            var m = String(row.subject || '').match(/\b\d{8,16}\b/);
            var fake = {
                id: m ? m[1] : 'reply',
                recipient: { email: row.from_email, name: row.from_name },
                currentStatus: ''
            };
            var firstName = (row.from_name || 'there').split(' ')[0];
            openEmailModal(fake, {
                subject: 'Re: ' + row.subject,
                message: 'Hello ' + firstName + ','
            });
        }

        function preview(row) {
            return String(row.body_text || '').replace(/\s+/g, ' ').trim().slice(0, 140);
        }

        function formatTime(ts) {
            if (!ts) return '';
            var d = new Date(ts);
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var pad = function(n) { return (n < 10 ? '0' : '') + n; };
            return months[d.getMonth()] + ' ' + d.getDate() + ', ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
        }

        function render() {
            var query = (searchEl.value || '').trim().toLowerCase();
            var filtered = rows.filter(function(r) {
                if (!query) return true;
                return (r.from_name + ' ' + r.from_email + ' ' + r.subject).toLowerCase().indexOf(query) !== -1;
            });

            if (rows.length === 0) {
                listEl.innerHTML = '';
                emptyEl.style.display = '';
                return;
            }
            emptyEl.style.display = 'none';

            listEl.innerHTML = filtered.map(function(row) {
                var att = (row.attachments && row.attachments.length)
                    ? '<span class="fxg-inbox-item__att">' + row.attachments.length + ' attachment' + (row.attachments.length > 1 ? 's' : '') + '</span>'
                    : '';
                return '' +
                    '<div class="fxg-inbox-item' + (row.read ? '' : ' fxg-inbox-item--unread') + '" data-row-id="' + row.id + '">' +
                        '<div class="fxg-inbox-item__head">' +
                            '<div class="fxg-inbox-item__from">' + escapeHtml(row.from_name || row.from_email || 'Unknown sender') +
                                (row.from_email ? ' <span class="fxg-inbox-item__email">&lt;' + escapeHtml(row.from_email) + '&gt;</span>' : '') +
                            '</div>' +
                            '<div class="fxg-inbox-item__time">' + formatTime(row.created_at) + '</div>' +
                        '</div>' +
                        '<div class="fxg-inbox-item__subject">' + (row.subject ? escapeHtml(row.subject) : '(no subject)') + att + '</div>' +
                        '<div class="fxg-inbox-item__preview">' + escapeHtml(preview(row)) + '</div>' +
                        '<div class="fxg-inbox-item__body" hidden>' + escapeHtml(row.body_text || row.body_html || '') + '</div>' +
                        '<div class="fxg-inbox-item__actions">' +
                            '<button type="button" class="fxg-admin-btn fxg-admin-btn--primary fxg-admin-btn--small" data-inbox-reply>Reply</button>' +
                            '<button type="button" class="fxg-admin-btn fxg-admin-btn--outline fxg-admin-btn--small" data-inbox-delete>Delete</button>' +
                        '</div>' +
                    '</div>';
            }).join('');

            if (filtered.length === 0) {
                listEl.innerHTML = '<p class="fxg-inbox__error">No matches for "' + escapeHtml(query) + '".</p>';
            }
        }

        listEl.addEventListener('click', function(e) {
            var itemEl = e.target.closest('.fxg-inbox-item');
            if (!itemEl) return;
            var id = itemEl.getAttribute('data-row-id');
            var row = null;
            for (var i = 0; i < rows.length; i++) {
                if (String(rows[i].id) === id) { row = rows[i]; break; }
            }
            if (!row) return;

            var replyBtn = e.target.closest('[data-inbox-reply]');
            var deleteBtn = e.target.closest('[data-inbox-delete]');
            if (replyBtn) { replyTo(row); return; }
            if (deleteBtn) { deleteRow(row); return; }

            var bodyEl = itemEl.querySelector('.fxg-inbox-item__body');
            var previewEl = itemEl.querySelector('.fxg-inbox-item__preview');
            var hidden = bodyEl.hasAttribute('hidden');
            bodyEl.hidden = !hidden;
            previewEl.hidden = hidden;
            if (hidden) markRead(row);
        });

        if (searchEl) {
            searchEl.addEventListener('input', render);
        }
        if (refreshBtn) {
            refreshBtn.addEventListener('click', load);
        }
        load();
    }

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
                        '<button class="fxg-admin-btn-icon fxg-admin-btn--email" data-email="' + escapeHtml(s.id) + '" title="Email Recipient">' +
                            '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>' +
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
            var id = btn.getAttribute('data-edit') || btn.getAttribute('data-delete') || btn.getAttribute('data-invoice') || btn.getAttribute('data-email');
            if (!id) return;

            if (btn.hasAttribute('data-invoice')) {
                var shipment = window.FDX.admin.getShipment(id);
                if (shipment) window.FDX.admin.generateInvoice(shipment);
            } else if (btn.hasAttribute('data-email')) {
                var shipment = window.FDX.admin.getShipment(id);
                if (shipment) window.FDX.admin.openEmailModal(shipment);
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

        var emailBtn = document.createElement('button');
        emailBtn.type = 'button';
        emailBtn.className = 'fxg-admin-btn fxg-admin-btn--small fxg-admin-btn--email-label';
        emailBtn.title = 'Send an email to the recipient';
        emailBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg> Email Recipient';
        emailBtn.addEventListener('click', function() {
            F.openEmailModal(shipment);
        });
        var trackingIdWrap = el.querySelector('#trackingIdWrap');
        if (trackingIdWrap) trackingIdWrap.appendChild(emailBtn);

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