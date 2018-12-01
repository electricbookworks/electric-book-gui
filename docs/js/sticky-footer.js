// If the page is short and the footer is showing its underpants,
// make the footer high enough to fill the page.

function stickyFooter() {

    'use strict';

    var footer = document.querySelector('.footer');
    var footerDepth = footer.getBoundingClientRect().bottom;
    var content = document.querySelector('.content');
    var contentDepth = content.getBoundingClientRect().bottom;
    var footerHeight = window.innerHeight - contentDepth;

    if (footerDepth < window.innerHeight) {
        footer.style.minHeight = footerHeight + 'px';
    }

}

window.addEventListener('load', function() {
  console.log('All assets are loaded, adjusting footer accordingly.')
  stickyFooter();
})
