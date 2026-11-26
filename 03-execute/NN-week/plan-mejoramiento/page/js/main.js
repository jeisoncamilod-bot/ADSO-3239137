'use strict';

/**
 * Plans Archive - Public Website
 * Responsive navigation controller.
 */

const menuButton = document.querySelector('.menu');
const navigation = document.querySelector('#navigation');
const mobile = window.matchMedia('(max-width: 520px)');

/**
 * Synchronize navigation with the viewport size.
 */
function syncMenu() {
    menuButton.hidden = !mobile.matches;
    navigation.hidden = mobile.matches;

    menuButton.setAttribute(
        'aria-expanded',
        String(!mobile.matches)
    );
}

/**
 * Toggle mobile navigation.
 */
menuButton.addEventListener('click', () => {
    navigation.hidden = !navigation.hidden;

    menuButton.setAttribute(
        'aria-expanded',
        String(!navigation.hidden)
    );
});

/**
 * Close the menu after selecting a navigation link.
 */
navigation.addEventListener('click', (event) => {
    if (mobile.matches && event.target.closest('a')) {
        syncMenu();
    }
});

/**
 * Close the menu when Escape is pressed.
 */
document.addEventListener('keydown', (event) => {
    if (
        event.key === 'Escape' &&
        mobile.matches &&
        !navigation.hidden
    ) {
        syncMenu();
        menuButton.focus();
    }
});

/**
 * Respond to viewport size changes.
 */
mobile.addEventListener('change', syncMenu);

// Initialize responsive navigation.
syncMenu();