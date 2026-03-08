// 1729 Sphere OS Access Protection
// This script must be included at the TOP of every protected page

(function() {
    // Check if access was granted
    const access = sessionStorage.getItem('qQq_access');
    const accessTime = sessionStorage.getItem('qQq_time');

    // Session expires after 4 hours (14400000 ms)
    const SESSION_DURATION = 14400000;

    if (access !== 'granted') {
        // No access token - redirect to gate
        window.location.href = 'gate.html';
        return;
    }

    if (accessTime) {
        const elapsed = Date.now() - parseInt(accessTime);
        if (elapsed > SESSION_DURATION) {
            // Session expired - clear and redirect
            sessionStorage.removeItem('qQq_access');
            sessionStorage.removeItem('qQq_time');
            window.location.href = 'gate.html';
            return;
        }
    }

    // Access granted - page will render normally
})();
