// ==UserScript==
// @name         Amazon sponsored items blocker
// @namespace    https://github.com/Stefan-Code/amazon-sponsored-items-blocker
// @version      0.1
// @description  Blocks sponsored search results on amazon.com, amazon.co.uk and amazon.de
// @author       Stefan-Code
// @include      *://www.amazon.de/*
// @include      *://www.amazon.com/*
// @include      *://www.amazon.co.uk/*
// @require      http://code.jquery.com/jquery-latest.js
// @grant        none
// @run-at document-end
// ==/UserScript==

// TODO: 
// * [x] "Best Seller"
// * [ ] "Overall Pick"

$ = jQuery.noConflict(true);
$(document).ready(function() {
    console.log("amazon-sponsored-items-blocker: loaded");
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
                    console.log("amazon-sponsored-items-blocker: cssParent[" + i + "] (" + cssParent + ") contains a 'Best Seller' match: " + cssBestSellerTarget);

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
                    // console.log("amazon-sponsored-items-blocker: Object " + i + " contains a sponsor tag (" + cssParent + " " + cssSponsorTarget + ")");
                    // console.log("amazon-sponsored-items-blocker: " + cssParent + "[" + i + "] contains a best seller: " + cssBestSellerTarget);
                    console.log("amazon-sponsored-items-blocker: cssParent[" + i + "] (" + cssParent + ") contains a 'Sponsor' match: " + cssSponsorTarget);

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

    console.log("amazon-sponsored-items-blocker: " + count + " sponsors/ads removed.");
});

// // [DONE] Sample cell with text/icon in it
// <span class="aok-inline-block puis-sponsored-label-info-icon"></span>

// // [DONE] Contained in headers/sections like "Trending Now"
// <span class="aok-inline-block s-widget-sponsored-label-text" aria-hidden="false" aria-label="  View Sponsored information or leave ad feedback  ">Sponsored</span>


// // [DONE] Results
// <span class="_bGlmZ_ad-feedback-text-desktop_q3xp_" aria-hidden="false" aria-label="Leave feedback on Sponsored ad" role="button" style="color: rgb(85, 85, 85); --darkreader-inline-color: #aaa59d;" data-darkreader-inline-color="">
//     Sponsored
//     <b class="_bGlmZ_ad-feedback-sprite_28uwB" style="background-position: 0px 0px;"></b>
// </span>

// // Recommended based on your browsing history
// <span class="_sp-rhf-desktop-carousel_style_ad-feedback-text-desktop__q3xp_" aria-hidden="false" aria-label="Leave feedback on Sponsored ad" role="button" style="color: rgb(85, 85, 85); --darkreader-inline-color: #aaa59d;" data-darkreader-inline-color="">
//     Sponsored
//    <b class="_sp-rhf-desktop-carousel_style_ad-feedback-sprite__28uwB" style="background-position: 0px 0px;"></b>
// </span>

// // Brands related to your search
// <span class="_bXVsd_ad-feedback-text-desktop_q3xp_" aria-hidden="false" aria-label="Leave feedback on Sponsored ad" role="button" style="color: rgb(85, 85, 85); --darkreader-inline-color: #aaa59d;" data-darkreader-inline-color="">
//     Sponsored
//     <b class="_bXVsd_ad-feedback-sprite_28uwB" style="background-position: 0px 0px;"></b>
// </span>

// s-widget
// rhf-border

