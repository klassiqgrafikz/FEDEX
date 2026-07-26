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
        saveShipmentMedia: saveShipmentMedia,
        deleteShipment: deleteShipment,
        deleteAllShipments: deleteAllShipments,
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
        var videoPreviewEl = el.querySelector('#videoPreview');
        var videoInput = el.querySelector('#packageVideo');
        var trackingDisplay = el.querySelector('#newTrackingId');
        var imageFile = null;
        var videoFile = null;

        if (previewEl && fileInput) {
            previewEl.addEventListener('click', function() { fileInput.click(); });
            fileInput.addEventListener('change', function() {
                var file = fileInput.files[0];
                if (!file) return;
                imageFile = file;
                var reader = new FileReader();
                reader.onload = function(e) {
                    previewEl.innerHTML = '<img src="' + e.target.result + '" alt="Package image">';
                    previewEl.dataset.image = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        }

        if (videoPreviewEl && videoInput) {
            videoPreviewEl.addEventListener('click', function() { videoInput.click(); });
            videoInput.addEventListener('change', function() {
                var file = videoInput.files[0];
                if (!file) return;
                videoFile = file;
                var reader = new FileReader();
                reader.onload = function(e) {
                    videoPreviewEl.innerHTML = '<video src="' + e.target.result + '" muted controls style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></video>';
                    videoPreviewEl.dataset.video = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        }

        if (!form) return;

        function uploadMedia(file, id, mediaType, fallbackBase64) {
            var ext = file.name.split('.').pop() || (mediaType === 'image' ? 'png' : 'mp4');
            var filepath = id + '/' + mediaType + '.' + ext;
            return uploadToStorage(file, 'shipment-media', filepath).then(function(publicUrl) {
                return window.FDX.admin.saveShipmentMedia(id, mediaType, publicUrl);
            }).catch(function() {
                if (fallbackBase64) {
                    return window.FDX.admin.saveShipmentMedia(id, mediaType, fallbackBase64);
                }
            });
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            try {
            var id = window.FDX.admin.generateTrackingId();
            var imgBase64 = previewEl ? (previewEl.dataset.image || '') : '';
            var vidBase64 = videoPreviewEl ? (videoPreviewEl.dataset.video || '') : '';

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
                    previewEl.dataset.image = '';
                }
                if (videoPreviewEl) {
                    videoPreviewEl.innerHTML = '<div class="fxg-admin-image-upload__preview--empty">Click to upload<br>package video</div>';
                    videoPreviewEl.dataset.video = '';
                }
                setTimeout(function() {
                    if (alertEl) alertEl.style.display = 'none';
                }, 5000);

                var mediaPromises = [];
                if (imageFile && imageFile.size > 0) mediaPromises.push(uploadMedia(imageFile, id, 'image', imgBase64));
                if (videoFile && videoFile.size > 0) mediaPromises.push(uploadMedia(videoFile, id, 'video', vidBase64));
                if (mediaPromises.length > 0) {
                    Promise.all(mediaPromises).catch(function(err) {
                        console.error('[Create] Media upload failed:', err);
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

            var imgWrap = el.querySelector('#shipmentImage');
            var videoWrap = el.querySelector('#shipmentVideo');
            var mediaList = shipment.media || [];
            var imgItem = null;
            var vidItem = null;
            for (var mi = 0; mi < mediaList.length; mi++) {
                if (mediaList[mi].media_type === 'image') imgItem = mediaList[mi];
                else if (mediaList[mi].media_type === 'video') vidItem = mediaList[mi];
            }

            if (imgItem && imgItem.data) {
                imgWrap.innerHTML = '<img src="' + imgItem.data + '" alt="Package">';
                imgWrap.className = 'fxg-admin-detail-header__image';
            } else {
                imgWrap.innerHTML = 'No image';
                imgWrap.className = 'fxg-admin-detail-header__image--empty';
            }

            if (videoWrap) {
                if (vidItem && vidItem.data) {
                    videoWrap.innerHTML = '<video src="' + vidItem.data + '" muted controls style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></video>';
                    videoWrap.className = 'fxg-admin-detail-header__image';
                } else {
                    videoWrap.innerHTML = 'No video';
                    videoWrap.className = 'fxg-admin-detail-header__image--empty';
                }
            }

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
        });

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