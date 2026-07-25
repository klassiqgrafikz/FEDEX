(function() {
    if (!window.FDX) window.FDX = {};
    if (!window.FDX.components) window.FDX.components = [];

    window.FDX.components.push(function() {
        if (!window.FDX.supabase) return;

        var supabaseClient = window.FDX.supabase;
        var sidebar = document.getElementById('adminSidebar');
        var hamburger = document.getElementById('adminHamburger');
        var logoutBtn = document.getElementById('adminLogout');
        var userEl = document.getElementById('adminUserEmail');

        /* Sidebar toggle on mobile */
        if (hamburger) {
            hamburger.addEventListener('click', function() {
                sidebar.classList.toggle('fxg-admin__sidebar--open');
            });
        }

        /* Highlight current page in nav */
        var page = document.body.getAttribute('data-admin-page');
        if (page) {
            document.querySelectorAll('.fxg-admin__nav-item[data-page]').forEach(function(el) {
                if (el.getAttribute('data-page') === page) {
                    el.classList.add('fxg-admin__nav-item--active');
                }
            });
        }

        /* Auth guard — redirect to login if no session */
        supabaseClient.auth.getSession().then(function(res) {
            if (res.error || !res.data.session) {
                if (!window.location.pathname.includes('login.html')) {
                    var loginUrl = 'login.html';
                    var depth = window.location.pathname.split('/').filter(function(p){return p}).length - 1;
                    if (depth > 1) loginUrl = '../'.repeat(depth - 1) + 'login.html';
                    window.location.href = loginUrl;
                }
                return;
            }
            /* Show user email in topbar */
            var user = res.data.session.user;
            if (userEl && user && user.email) {
                userEl.textContent = user.email;
            }
        });

        /* Logout */
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                supabaseClient.auth.signOut().then(function() {
                    window.location.href = 'login.html';
                });
            });
        }
    });
})();
