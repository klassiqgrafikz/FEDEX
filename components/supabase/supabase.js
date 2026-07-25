(function() {
    if (!window.FDX) window.FDX = {};
    var SUPABASE_URL = 'https://oramrawrldblhvkccxit.supabase.co';
    var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yYW1yYXdybGRibGh2a2NjeGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MjQ3NzYsImV4cCI6MjEwMDUwMDc3Nn0.hfwIs-_WLgRSq_liBXhrlT0ncAgOwj7QGyvZtnGUwGE';
    if (typeof supabase !== 'undefined') {
        window.FDX.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
})();
