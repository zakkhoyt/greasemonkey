// ==UserScript==
// @name         Override GitHub Date Format
// @namespace    https://github.com/zakkhoyt/greasemonkey/blob/main/github_dateformat_override/override_github_date_format.js
// @version      0.1
// @description  Replace GitHub's relative date/times with absolute date/times. Supports custom format. 
// @author       Zakk Hoyt
// @include      *://*.github.com/*
// @require      http://code.jquery.com/jquery-latest.js
// @grant        none
// @run-at document-end
// ==/UserScript==


$ = jQuery.noConflict(true);
$(document).ready(function() {
    console.log("GHDF: loaded");
    var count = 0;

    

    // The css classes that we want to recursively inspect
    const cssParents = [
        '.celwidget',
        '.s-widget',
        '.rhf-border'
    ];

    // The css class types to search for nested inside of each cssParent
    const cssSponsorTargets = [
        '._bGlmZ_ad-feedback-sprite_28uwB',
        '._bXVsd_ad-feedback-text-desktop_q3xp_',
        '._sp-rhf-desktop-carousel_style_ad-feedback-sprite__28uwB',
        '.ad-feedback-text',
        '.puis-sponsored-label-info-icon',
        '.s-sponsored-info-icon',
        '.s-widget-sponsored-label-text',
        'Sponsor',
        'Sponsored',
    ];

    const cssBestSellerTargets = [
        '.a-badge-label'
    ];

    for (let x = 0; x < cssParents.length; x++) {
        let cssParent = cssParents[x];
        $(cssParent).each(function(i, obj) {
            // Best Seller
            for (let y = 0; y < cssBestSellerTargets.length; y++) {
                let cssBestSellerTarget = cssBestSellerTargets[y];
                if ($(this).find(cssBestSellerTarget).length > 0) {
                    console.log("GHDF: cssParent[" + i + "] (" + cssParent + ") contains a 'Best Seller' match: " + cssBestSellerTarget);

                    // The action(s) to take on cssParent if any cssBestSellerTarget is found within
                    // $(this).css('display', 'none');
                    $(this).css('background-color', 'rgb(0, 0, 128)');
                    $(this).css('opacity', '0.25');

                    count++;
                }
            }
            
            // Sponsored
            for (let y = 0; y < cssSponsorTargets.length; y++) {
                let cssSponsorTarget = cssSponsorTargets[y];
                if ($(this).find(cssSponsorTarget).length > 0) {
                    // console.log("GHDF: Object " + i + " contains a sponsor tag (" + cssParent + " " + cssSponsorTarget + ")");
                    // console.log("GHDF: " + cssParent + "[" + i + "] contains a best seller: " + cssBestSellerTarget);
                    console.log("GHDF: cssParent[" + i + "] (" + cssParent + ") contains a 'Sponsor' match: " + cssSponsorTarget);

                    // The action to take on cssParent if any cssSponsorTarget is found within
                    // $(this).css('display', 'none');
                    $(this).css('background-color', 'rgb(128, 0, 0)');
                    $(this).css('opacity', '0.25');
                    // $(this).css(cssRemoveKey, cssRemoveValue);
                    count++;
                }
            }


        });
    }

    console.log("GHDF: " + count + " sponsors/ads removed.");
});
