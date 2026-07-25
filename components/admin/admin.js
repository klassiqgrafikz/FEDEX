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

    function getData() {
        try {
            var data = JSON.parse(localStorage.getItem('fdx_data'));
            return data || { shipments: {}, nextNum: 1 };
        } catch (e) {
            return { shipments: {}, nextNum: 1 };
        }
    }

    function saveData(data) {
        localStorage.setItem('fdx_data', JSON.stringify(data));
    }

    function generateTrackingId(data) {
        var d = new Date();
        var y = d.getFullYear().toString().slice(-2);
        var m = ('0' + (d.getMonth() + 1)).slice(-2);
        var day = ('0' + d.getDate()).slice(-2);
        var num = ('000000' + data.nextNum).slice(-6);
        data.nextNum++;
        return 'FDX' + y + m + day + num;
    }

    function getAllShipments() {
        var data = getData();
        var list = [];
        for (var key in data.shipments) {
            if (data.shipments.hasOwnProperty(key)) {
                list.push(data.shipments[key]);
            }
        }
        list.sort(function(a, b) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        return list;
    }

    function getShipment(id) {
        var data = getData();
        return data.shipments[id] || null;
    }

    function saveShipment(shipment) {
        var data = getData();
        data.shipments[shipment.id] = shipment;
        saveData(data);
        supabaseFetch('shipments', {
            method: 'POST',
            body: toDb(shipment),
            headers: { 'Prefer': 'resolution=merge-duplicates' }
        });
    }

    function deleteShipment(id) {
        var data = getData();
        delete data.shipments[id];
        saveData(data);
        supabaseFetch('shipments?id=eq.' + encodeURIComponent(id), {
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
        var data = getData();
        var migrated = localStorage.getItem('fdx_migrated');

        supabaseFetch('shipments?order=created_at.desc', {
            headers: { 'Prefer': '' }
        }).then(function(res) {
            if (!res.ok) throw new Error('Supabase fetch failed');
            return res.json();
        }).then(function(rows) {
            var hasRemote = rows && rows.length > 0;
            var hasLocal = Object.keys(data.shipments).length > 0;

            if (hasRemote) {
                rows.forEach(function(row) {
                    data.shipments[row.id] = fromDb(row);
                });
            }

            if (!migrated && hasLocal && !hasRemote) {
                var batch = [];
                for (var key in data.shipments) {
                    if (data.shipments.hasOwnProperty(key)) {
                        batch.push(toDb(data.shipments[key]));
                    }
                }
                if (batch.length > 0) {
                    supabaseFetch('shipments', {
                        method: 'POST',
                        body: batch,
                        headers: { 'Prefer': 'resolution=merge-duplicates' }
                    });
                }
                localStorage.setItem('fdx_migrated', '1');
            }

            saveData(data);

            supabaseFetch('tracking_config?id=eq.1', {
                headers: { 'Prefer': '' }
            }).then(function(r) { return r.json(); }).then(function(config) {
                if (config && config.length > 0) {
                    data.nextNum = Math.max(data.nextNum || 1, config[0].next_num);
                    saveData(data);
                }
                if (callback) callback();
            }).catch(function() {
                if (callback) callback();
            });
        }).catch(function() {
            if (callback) callback();
        });
    }

    window.FDX.admin = {
        STATUSES: STATUSES,
        getData: getData,
        saveData: saveData,
        generateTrackingId: generateTrackingId,
        getAllShipments: getAllShipments,
        getShipment: getShipment,
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
        else if (pageType === 'shipment') initShipmentDetail(contentEl);

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
                    tr.addEventListener('click', function() {
                        window.location.href = 'shipment.html?id=' + encodeURIComponent(s.id);
                    });
                    tr.innerHTML =
                        '<td><strong>' + escapeHtml(s.id) + '</strong></td>' +
                        '<td>' + escapeHtml(s.packageName) + '</td>' +
                        '<td>' + escapeHtml(s.recipient.name) + '</td>' +
                        '<td>' + window.FDX.admin.badgeHtml(s.currentStatus) + '</td>' +
                        '<td>' + window.FDX.admin.formatDateShort(s.estDeliveryDate) + '</td>';
                    recentBody.appendChild(tr);
                });
            }
        }
    }

    function initCreate(el) {
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
            var data = window.FDX.admin.getData();
            var id = window.FDX.admin.generateTrackingId(data);

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
            window.FDX.admin.saveData(data);
            supabaseFetch('tracking_config?id=eq.1', {
                method: 'PATCH',
                body: { next_num: data.nextNum }
            });

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
                tr.addEventListener('click', function() {
                    window.location.href = 'shipment.html?id=' + encodeURIComponent(s.id);
                });
                tr.innerHTML =
                    '<td><strong style="color:#660099">' + escapeHtml(s.id) + '</strong></td>' +
                    '<td>' + escapeHtml(s.packageName) + '</td>' +
                    '<td>' + escapeHtml(s.recipient.name) + '</td>' +
                    '<td>' + window.FDX.admin.badgeHtml(s.currentStatus) + '</td>' +
                    '<td>' + window.FDX.admin.formatDateShort(s.departureDate) + '</td>' +
                    '<td>' + window.FDX.admin.formatDateShort(s.estDeliveryDate) + '</td>';
                tbody.appendChild(tr);
            });
        }

        render('');

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