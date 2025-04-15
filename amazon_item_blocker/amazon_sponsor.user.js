// ==UserScript==
// @name         Amazon item blocker
// @namespace    https://github.com/zakkhoyt/greasemonkey/blob/main/amazon_sponsor.js
// @version      0.1
// @description  Blocks sponsored search results, items tagges as "Best Seller", "Overall Pick", etc... Works on amazon.com, amazon.co.uk and amazon.de
// @author       Zakkus Hoyt
// @include      *://www.amazon.de/*
// @include      *://www.amazon.com/*
// @include      *://www.amazon.co.uk/*
// @require      http://code.jquery.com/jquery-latest.js
// @grant        none
// @run-at document-end
// ==/UserScript==

// References:
// * https://www.w3schools.com/Js/js_debugging.asp
// * [Use your fav editor](https://violentmonkey.github.io/posts/how-to-edit-scripts-with-your-favorite-editor/)
//
// CSS
// * Borders: https://www.w3schools.com/css/css_border.asp


// Notes;
// * To use breakpoints, insert the line `debugger;` which is like a programmatic breakpoint.
// * Reload page to hit breakpoint.
// * inspect elements and properties using breakpoint

// TODO:
// # Block items of these types:
// * [x] "Sponsored"
// * [x] "Best Seller"
//    * [ ] False triggers by:
//        * "Big Spring Deal"
//   * [ ] Omit "Purchased Sep 2023"
// * [ ] "Overall Pick"
//
// # Reactions
// * [ ] Stack effects vs lilo
//
// # Questions
// ## Javascript
// * [ ] How to log at different levels?
//
// ## CSS/Xpath
// * [ ] How to match plain text (instead of css class)
// * [ ] How to match by id (instead of css class)
//
// ## greasemonkey, violentmonkey, etc...
// * [ ] How to offer UI configuration?
// * [ ] Non-volatile storage?
// * [ ] How to submit a script to public tools?
//
// # Code / performance improvements
// * [ ] Use data structs to make searching more efficient (fewer looping permutations)
// * [ ] Use data structs to apply different css changes depending on what was found/matched

"use strict";

class TargetPlan {
  // Declare: every Color instance has a private field called #values.
  // #values;

  #containerCSSClass = "";
  #targetCSSClassItems = [];
  #targetInnerTextItems = [];

  constructor(
    containerCSSClass,
    targetCSSClassItems,
    targetInnerTextItems
  ) {
    this.#containerCSSClass = containerCSSClass;
    this.#targetCSSClassItems = targetCSSClassItems;
    this.#targetInnerTextItems = targetInnerTextItems;
  }

  getContainerCSSClass() {
    return this.#containerCSSClass;
  }

  getTargetCSSClassItems() {
    return this.#targetCSSClassItems;
  }

  getTargetInnerTextItems() {
    return this.#targetInnerTextItems;
  }
}


// class AmazonProductExtractor {
//   // function  
// }

function extractProductImageUrl(html) {
  try {
    console.log("amazon-debug 131");  
    // let result = url.match(/^(.*https:\/\/.*\/dp\/)(.*)(\?.*)$/);
    let imgResult = html.match(/(var iUrl = ")(.*)";/);
    console.log("amazon-debug 132");
    
    if ( imgResult == null ){
      console.log("amazon-debug 133");
      console.log("amazon-imgResult: null");
      return null;
    } else {
      console.log("amazon-debug 134");
      console.log("amazon-imgResult[0]: " + imgResult[0]);
      console.log("amazon-imgResult[1]: " + imgResult[1]);
      console.log("amazon-imgResult[2]: " + imgResult[2]);
      console.log("amazon-imgResult[3]: " + imgResult[3]);
      console.log("amazon-debug 135");
    }
    console.log("amazon-debug 136");

    let imgUrl = imgResult[2];
    console.log("amazon-debug 150");

    if ( imgUrl == null ){
      // some_variable is either null or undefined
      console.log("amazon-debug 151");
      console.log("amazon-imgUrl: null|undefined");
    } else {
      console.log("amazon-debug 152");
      console.log("amazon-imgUrl: " + imgUrl);
    }
    console.log("amazon-debug 153");
    return imgUrl;

  } catch(err) {
    console.log("amazon-debug 180");        
    console.error("amazon-debug [ERROR] err.name: " + err.name + " err.message: " + err.message); 
    debugger;
    console.log("amazon-debug 181");
    return null;
  }
}


function extractProductImageId(imgUrl) {

  // amazon-imgUrl: https://m.media-amazon.com/images/I/517W--vk2LL.__AC_SX300_SY300_QL70_ML2_.jpg

  // TODO; Extract imgID from imgUrl

  // https://m.media-amazon.com/images/I/517W--vk2LL.__AC_S2600_SY200.jpg
  // baseURL: https://m.media-amazon.com/images/I/
  // imgID: 517W--vk2LL
  // imgSize: .__AC_SX600_SY200
  //   .__AC_SX600
  //   .__AC_SY600
  //   .SY200
  // imgFormat: .jpg
  try {
    let imageUrlRegex = imgUrl.match(/^(.*https:\/\/.*\/I\/)(.*)\.(.*)\.(.*)$/)

    // [
    //   "https://m.media-amazon.com/images/I/517W--vk2LL.__AC_SX300_SY300_QL70_ML2_.jpg", // 0: 
    //   "https://m.media-amazon.com/images/I/", // 1: 
    //   "517W--vk2LL", // 2: 
    //   "__AC_SX300_SY300_QL70_ML2_", // 3: 
    //   "jpg", // 4:             
    // ]
    console.log("amazon-debug 170");  

    // console.log("amazon-imageUrlRegex[0]: " + imageUrlRegex[0]);
    // console.log("amazon-imageUrlRegex[1] (imageBaseUrl): " + imageUrlRegex[1]);
    // console.log("amazon-imageUrlRegex[2] (imageId): " + imageUrlRegex[2]);
    // console.log("amazon-imageUrlRegex[3] (imageQuality): " + imageUrlRegex[3]);
    // console.log("amazon-imageUrlRegex[4] (imageFormat): " + imageUrlRegex[4]);
    // console.log("amazon-debug 171");

    let imageBaseUrl = imageUrlRegex[1]
    let imageId = imageUrlRegex[2]
    let imageQuality = imageUrlRegex[3]
    let imageFormat = imageUrlRegex[4]
    console.log("amazon-extractImageId: imageBaseUrl: " + imageBaseUrl);
    console.log("amazon-extractImageId: imageId: " + imageId);
    console.log("amazon-extractImageId: imageQuality: " + imageQuality);
    console.log("amazon-extractImageId: imageFormat: " + imageFormat);
    console.log("amazon-debug 177");

    return imageId;
    
    // if ( imageUrlRegex == null ){
    //   console.log("amazon-debug 172");
    //   console.log("amazon-urlRegex: null");
    // } else {
    //   console.log("amazon-debug 173");
    //   for(var i = 0; i < imageUrlRegex.length; ++i){
    //     console.log("amazon-urlRegex[i]: i: " + i + " imageUrlRegex[i]" + imageUrlRegex[i]);
    //   }
    //   console.log("amazon-debug 174");
    // }
    // console.log("amazon-debug 175");
  } catch(err) {
    console.log("amazon-debug 180");        
    console.error("amazon-debug [ERROR] err.name: " + err.name + " err.message: " + err.message); 
    debugger;
    console.log("amazon-debug 181");
    return null;
  }
}



$ = jQuery.noConflict(true);
$(document).ready(function() {
    console.log("amazon-item-block: did load");

    // Counter for how many items we have changed
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
                    console.log("amazon-item-block: cssParent[" + i + "] (" + cssParent + ") contains a 'Best Seller' match: " + cssBestSellerTarget);

                    // debugger;

                    // The action(s) to take on cssParent if any cssBestSellerTarget is found within
                    // $(this).css('display', 'none');
                    $(this).css('background-color', 'rgb(0, 0, 128)');
                    $(this).css('opacity', '0.25');

                    $(this).css('border-color', '#000080');
                    $(this).css('border-style', 'dashed');
                    $(this).css('border-width', '5px');
                    count++;
                }
            }

            // Sponsored
            for (let y = 0; y < cssSponsorTargets.length; y++) {
                let cssSponsorTarget = cssSponsorTargets[y];
                if ($(this).find(cssSponsorTarget).length > 0) {
                    console.log("amazon-item-block: cssParent[" + i + "] (" + cssParent + ") contains a 'Sponsor' match: " + cssSponsorTarget);

                    // The action to take on cssParent if any cssSponsorTarget is found within
                    // $(this).css('display', 'none');
                    $(this).css('background-color', 'rgb(128, 0, 0)');
                    $(this).css('opacity', '0.25');
                    count++;
                }
            }
        });
    }


    console.log("amazon-stats");
    console.log("amazon-item-block: " + count + " sponsors/ads removed.");
    // console.log("amazon-url: " + this.url);

    //var url = window.location.search.substring(1);
    var url = window.location;
    console.log("amazon-location-url: " + url);
    //  https://www.amazon.com/Assortment-2mm-3mm-4mm-5mm/dp/B0CC312XMC?crid=2LJJ2YAS6ERRR&sprefix=tub%2Caps%2C261&sr=8-1

    url="https://www.amazon.com/Assortment-2mm-3mm-4mm-5mm/dp/B0CC312XMC?crid=2LJJ2YAS6ERRR&sprefix=tub%2Caps%2C261&sr=8-1";
    console.log("amazon-location-url: " + url);
    console.log("amazon-debug 10");
    //let urlRegex = /.*(https.*dp)(.*).*/;
    // let urlRegex = /^(.*https).*$/;
    // console.log("amazon-debug 20");


    try {
      let result = url.match(/^(.*https:\/\/.*\/dp\/)(.*)(\?.*)$/);
      console.log("amazon-debug 30");  

      console.log("amazon-urlRegex[0]: " + result[0]);
      console.log("amazon-urlRegex[1]: " + result[1]);
      console.log("amazon-urlRegex[2]: " + result[2]);
      console.log("amazon-urlRegex[3]: " + result[3]);
      console.log("amazon-debug 32");
      
      if ( result == null ){
        console.log("amazon-debug 31");
        console.log("amazon-urlRegex: null");
      } else {
        for(var i = 0; i < result.length; ++i){
          console.log("amazon-urlRegex[i]: i: " + i + " result[i]" + result[i]);
        }
  
  
        console.log("amazon-urlRegex[0]: " + result[0]);
        console.log("amazon-urlRegex[1]: " + result[1]);
        console.log("amazon-urlRegex[2]: " + result[2]);
        console.log("amazon-urlRegex[3]: " + result[3]);
        console.log("amazon-debug 32");
      }
      console.log("amazon-debug 33");
  
  
  
  
      let asid = result[2];
      console.log("amazon-debug 50");
  
      if ( asid == null ){
        // some_variable is either null or undefined
        console.log("amazon-asid: null|undefined");
      } else {
        console.log("amazon-asid: " + asid);
      }
  
    }
    catch(err) {      
      console.log("amazon-debug [ERROR] err.name: " + err.name + " err.message: " + err.message);
      console.error("amazon-debug [ERROR] err.name: " + err.name + " err.message: " + err.message);
      debugger;
    } 



    // Image
    // https://m.media-amazon.com/images/I/51x9uCIBEWL._SX466_.jpg
    // <!--CardsClient--><div id="CardInstancedJA80dDDGLRkeN08OZeCow" data-card-metrics-id="p13n-desktop-sims-fbt_DetailPage_0">
    // <img
    //   alt="OLYCRAFT 25Pcs 5 Sizes ABS Plastic Round Tubes 9.8 Inch Length White ABS Plastic Round Tube Hollow Round Tube Round Hollow Ba"
    //   src="https://images-na.ssl-images-amazon.com/images/I/51x9uCIBEWL._AC_UL116_SR116,116_.jpg"
    //   class="a-dynamic-image p13n-sc-dynamic-image p13n-product-image"
    //   height="140px" data-a-dynamic-
    //   image="{&quot;https://images-na.ssl-images-amazon.com/images/I/51x9uCIBEWL._AC_UL116_SR116,116_.jpg&quot;:[116,116],&quot;https://images-na.ssl-images-amazon.com/images/I/51x9uCIBEWL._AC_UL232_SR232,232_.jpg&quot;:[232,232],&quot;https://images-na.ssl-images-amazon.com/images/I/51x9uCIBEWL._AC_UL348_SR348,348_.jpg&quot;:[348,348]}"
    //   style="max-width:140px;max-height:140px"
    // />

    console.log("amazon-debug 60");
    //let html = $(this).html()
    //let html = document.body.innerHtml;
    //let html = document.activeElement.getHTML();
    //let html = document.title;
    //let html = document.body.getHTML();
    let html = document.documentElement.outerHTML;
    //let html = document.getElementById(id).innerHTML = new HTML
    console.log("amazon-debug 61");
    if (html == null){

      console.log("amazon-debug 62");
      console.log("amazon-html: null");
    } else {
      
      console.log("amazon-debug 200");
      try {
        let imgUrl = extractProductImageUrl(html);
        console.log("amazon-imgUrl: " + imgUrl);
        console.log("amazon-debug 201");
  
        let imageId = extractProductImageId(imgUrl);
        console.log("amazon-imageId: " + imageId);
        console.log("amazon-debug 202");
          
      } catch (error) {
        console.error("amazon-debug [ERROR] err.name: " + err.name + " err.message: " + err.message); 
        debugger;    
      }
    }

//     // let imageClass = "a-dynamic-image p13n-sc-dynamic-image p13n-product-image";
//     let imageClass = "html.a-ws.a-js.a-audio.a-video.a-canvas.a-svg.a-drag-drop.a-geolocation.a-history.a-webworker.a-autofocus.a-input-placeholder.a-textarea-placeholder.a-local-storage.a-gradients.a-hires.a-transform3d.a-touch-scrolling.a-text-shadow.a-text-stroke.a-box-shadow.a-border-radius.a-border-image.a-opacity.a-transform.a-transition.a-ember body.a-m-us.a-aui_72554-c.a-aui_a11y_6_837773-c.a-aui_killswitch_csa_logger_372963-t1.a-aui_template_weblab_cache_333406-c.a-bw_aui_cxc_alert_measurement_1074111-c.a-meter-animate div#a-page div#dp.home_improvement.en_US div#dp-container.a-container div#sims-productBundle_feature_div_01.celwidget div.celwidget.pd_rd_w-KXKRe.content-id-amzn1.sym.ea1d9533-fbb7-4608-bb6f-bfdceb6f6336.pf_rd_p-ea1d9533-fbb7-4608-bb6f-bfdceb6f6336.pf_rd_r-NSS4CD5VMXXYX7SK61T8.pd_rd_wg-b9mJo.pd_rd_r-4f831c36-c380-48bf-bb61-b3a29e40363f.c-f div#CardInstanceZs3YvvSG751TrwjmTSFIDA div.cardRoot.bucket div.a-cardui._c3AtZ_flex-thematicBundle-container_qF6zJ div.a-cardui._c3AtZ_new-thumbnail-box_1W9Ku div.a-cardui._c3AtZ_new-detail-faceout-box_394yC div.a-section.a-spacing-none._c3AtZ_detail-image-section_gjKPe div.a-section._c3AtZ_image-background_9iqTT div.a-section.a-spacing-none._c3AtZ_link-area_1soTP div._c3AtZ_image-display_14x-9.asin-1 img.a-dynamic-image.p13n-sc-dynamic-image.p13n-product-image"
//     if ($(this).find(imageClass).length > 0) {
//       //console.log("amazon-item-block: cssParent[" + i + "] (" + cssParent + ") contains a 'Best Seller' match: " + cssBestSellerTarget);
//       console.log("amazon-imageClass: contains imageClass: " + imageClass);


// //       // debugger;

// //       // The action(s) to take on cssParent if any cssBestSellerTarget is found within
// //       // $(this).css('display', 'none');
// //       $(this).css('background-color', 'rgb(0, 0, 128)');
// //       $(this).css('opacity', '0.25');

// //       $(this).css('border-color', '#000080');
// //       $(this).css('border-style', 'dashed');
// //       $(this).css('border-width', '5px');
// //       count++;
//     } else {
//       console.log("amazon-imageClass: Does not contain imageClass: " + imageClass);
//       debugger;
//     }



    
//     let str = '<span class="my">';

//     let regexp = /<(([a-z]+)\s*([^>]*))>/;

//     let result = str.match(regexp);
//     console.log("amazon-regex: " + result[0]); // <span class="my">
//     console.log("amazon-regex: " + result[1]); // span class="my"
//     console.log("amazon-regex: " + result[2]); // span
//     console.log("amazon-regex: " + result[3]); // class="my"

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

