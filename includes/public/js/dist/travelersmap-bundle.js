/******/ "use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./includes/public/js/generate-popover-html-output.js
/**
 * Generate unpopulated markers popovers HTML from the options set by the user.
 * The user can choose what to show inside every popover in Travelers' Map setting page.
 *
 * @param {object} cttm_shortcode_options contains all useful shortcode parameters currently set. We use
 * @param {object} cttm_options contains all useful plugins general settings set
 * @returns [popoverOutput,popoverOptions] an array of the HTML output and the popoverOptions object for leaflet
 */
function cttmGeneratePopoverHTMLOutput(cttm_shortcode_options, cttm_options) {
    //Define popovers depending of plugin setting.
    //First we create target property value _self (same tab) or _blank (new tab) for our <a> tag.
    let popoverTarget;
    let popoverOutput;
    let popoverOptions;
    if (cttm_shortcode_options.open_link_in_new_tab === 'true') {
        popoverTarget = '_blank';
    } else {
        popoverTarget = '_self';
    }
    //Then we create HMTL output for popovers depending of style set in plugin settings
    let popoverStyles = cttm_options['popup_style'].split(',');

    if (popoverStyles.indexOf('thumbnail') != -1) {
        if (popoverStyles.indexOf('excerpt') != -1) {
            //Detailed Popup : Thumbnail and excerpt, with (title) and (date). () = optionnal
            popoverOptions = { className: 'detailed-popup' };
            popoverOutput =
                '<a class="tooltip-link" href="%s_url" target="' + popoverTarget + '">';
            popoverOutput += '<div class="nothumbplaceholder"></div>';
            popoverOutput += '<div class="title">%s_title</div>';
            popoverOutput += '<div class="date">%s_date</div></a>';
            popoverOutput += '%s_customfields';
            popoverOutput += '<div class="excerpt">%s_excerpt</div>';
        } else {
            //Default Popup : Thumbnail with (title) and (date). () = optionnal
            popoverOptions = { className: 'default-popup' };

            popoverOutput = '<div class="img-mask">';
            popoverOutput += '<div class="nothumbplaceholder"></div>';
            popoverOutput +=
                '</div><a class="tooltip-link" href="%s_url" target="' +
                popoverTarget +
                '">';
            popoverOutput += '<div class="popup-thumb-text-wrapper">';
            popoverOutput += '<div class="title">%s_title</div>';
            popoverOutput += '<div class="date">%s_date</div>';
            popoverOutput += '%s_customfields';
            popoverOutput += '</div></a>';
        }
    } else {
        //Textual Popup : excerpt, title and date. At least one or more of those.
        popoverOptions = { className: 'textual-popup' };

        popoverOutput =
            '<a class="tooltip-link" href="%s_url" target="' + popoverTarget + '">';
        popoverOutput += '<div class="title">%s_title</div>';
        popoverOutput += '<div class="date">%s_date</div>';
        popoverOutput += '%s_customfields';
        popoverOutput += '<div class="excerpt">%s_excerpt</div></a>';
    }

    //If css is disabled, change popover class
    if (cttm_options['popup_css']) {
        popoverOptions = { className: 'custom-popup' };
    }
    return [popoverOutput, popoverOptions];
}
;// CONCATENATED MODULE: ./includes/public/js/populate-popovers-html-output.js
/**
 *
 * Populate markers' popovers HTML output with data sent.
 * Erase unnecessary HTML tags from the output when no data is found.
 * @param {object} postdatas - the current marker data. (Yes, data can't be plural, but I've added an 's' for naming convention)
 * @param {string} popoverOutput - the popover html output to use.
 * @returns populated HTML output of current marker
 */
function cttmPopulatePopoversHTMLOutput(
    postdatas,
    popoverOutput,
    cttm_options
) {
    let postThumb = postdatas.thumb;
    let posturl = postdatas.url;
    let postTitle = postdatas.thetitle;
    let postExcerpt = postdatas.excerpt;
    let postDate = new Date(postdatas.date.replace(/ /g, 'T') + 'Z');
    postDate = postDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    let postCustomFields = postdatas.customfields.fields;
    let popoverStyles = cttm_options['popup_style'].split(',');
    let postPopoverOutput = popoverOutput;

    if (postThumb) {
        postPopoverOutput = postPopoverOutput.replace(
            '<div class="nothumbplaceholder"></div>',
            '<img src="' + postThumb + '" alt="">'
        );
    }
    if (postExcerpt && popoverStyles.indexOf('excerpt') != -1) {
        postPopoverOutput = postPopoverOutput.replace('%s_excerpt', postExcerpt);
    } else {
        postPopoverOutput = postPopoverOutput.replace(
            '<div class="excerpt">%s_excerpt</div>',
            ''
        );
    }
    if (postTitle && popoverStyles.indexOf('title') != -1) {
        postPopoverOutput = postPopoverOutput.replace('%s_title', postTitle);
    } else {
        postPopoverOutput = postPopoverOutput.replace(
            '<div class="title">%s_title</div>',
            ''
        );
    }
    if (postDate && popoverStyles.indexOf('date') != -1) {
        postPopoverOutput = postPopoverOutput.replace('%s_date', postDate);
    } else {
        postPopoverOutput = postPopoverOutput.replace(
            '<div class="date">%s_date</div>',
            ''
        );
    }
    if (postCustomFields) {
        postPopoverOutput = postPopoverOutput.replace('%s_customfields', postCustomFields);
    } else {
        postPopoverOutput = postPopoverOutput.replace(
            '%s_customfields',
            ''
        );
    }

    postPopoverOutput = postPopoverOutput.replace('%s_url', posturl);

    return postPopoverOutput;
}

;// CONCATENATED MODULE: ./includes/public/js/init-travelers-map.js



function initTravelersMap() {
  /**
   * Get plugin options from database
   */

  //Get plugin options from the database, set in the setting page.
  let json_cttm_options = cttm_options_params.cttm_options;

  //Retrieve and store all shortcodes data arrays sent by php in "cttm_shortcode_vars_arr"
  let cttm_shortcode_vars_arr = new Array();

  //Search for every js variable beginning with "cttm_shortcode_"
  let cttm_varname_pattern = /^cttm_shortcode_/;
  for (let cttm_varName in window) {
    if (cttm_varname_pattern.test(cttm_varName)) {
      cttm_shortcode_vars_arr.push(window[cttm_varName]);
    }
  }
  /**
   * Loop : Create a new map for each shortcode in the page
   * Before the loop, initialize global array of map objects and index number
   */

  //Index of map objects in array
  let mapindex = 0;
  //Create cttm_map public array of object if not already created
  if (typeof cttm_map === 'undefined') {
    window.cttm_map = new Array();
    window.cttm_markers = new Array();
  } else {
    //if our maps are already initialized, this removes them nicely before initializing them again. Can be used to refresh the maps.
    for (let i = cttm_map.length - 1; i >= 0; i--) {
      cttm_map[i].remove();
      cttm_map.splice(i, 1);
    }
    for (let i = cttm_markers.length - 1; i >= 0; i--) {
      cttm_markers[i].remove();
      cttm_markers.splice(i, 1);
    }
  }

  cttm_shortcode_vars_arr.forEach(cttmMapLoop);

  function cttmMapLoop(cttm_shortcode_vars) {
    //If no markers are loaded, return without initiating leaflet
    if (cttm_shortcode_vars.cttm_metas == '0') {
      return;
    }
    //Get shortcode options
    let json_cttm_shortcode = cttm_shortcode_vars.cttm_shortcode_options;

    //Clean json string to be usable
    json_cttm_options = json_cttm_options.replace(/&quot;/g, '\\"');
    json_cttm_shortcode = json_cttm_shortcode.replace(/&quot;/g, '\\"');

    //Get arrays of all the options and shortcode options
    let cttm_options = JSON.parse(json_cttm_options);
    var cttm_shortcode_options = JSON.parse(json_cttm_shortcode);

    /**
     * Create leaflet map options object. This object is then passed as argument when the map initialized.
     */
    let cttm_map_options = new Object();

    //Add max bounds on north and south of the map
    cttm_map_options.maxBounds = [
      [-90, -Infinity],
      [90, Infinity],
    ];

    // If one-finger touch event is disabled on mobile
    if (cttm_options['onefinger']) {
      cttm_map_options.dragging = !L.Browser.mobile;
      cttm_map_options.tap = !L.Browser.mobile;
    }
    //Set maxzoom if defined
    if (cttm_shortcode_options.maxzoom != '') {
      cttm_map_options.maxZoom = cttm_shortcode_options.maxzoom;
    }
    //Set minzoom if defined
    if (cttm_shortcode_options.minzoom != '') {
      cttm_map_options.minZoom = cttm_shortcode_options.minzoom;
    }
    //Set init_maxzoom if defined. Convert to integer to avoid error.
    if (cttm_shortcode_options.init_maxzoom) {
      var init_maxzoom = parseInt(cttm_shortcode_options.init_maxzoom);
    } else {
      var init_maxzoom = 16;
    }

    if (cttm_shortcode_options.max_cluster_radius) {
      var max_cluster_radius = parseInt(
        cttm_shortcode_options.max_cluster_radius
      );
    } else {
      var max_cluster_radius = 45;
    }

    /**
     * Create leaflet map object "cttm_map"
     */

    //Get cttm_map container id
    let containerid = cttm_shortcode_options.id;
    let container = document.getElementById(
      'travelersmap-container-' + containerid
    );

    //Prevent some plugins incompatibilities where the shortcode is executed multiple times, sending additionnal cttm_shortcode_... variables in the front-end.
    // This way, we prevent an error where the container was not found, by stopping the script if the container is not found.
    if (!container) {
      console.warn(
        "Travelers' Map container with id: " + containerid + ' was not found.'
      );
      return;
    }

    //Set Tiles Server URL + API key + Attribution
    //If a shortcode tile server is set, override global settings' tile server
    let tileurl, subdomains, attribution;
    if (cttm_shortcode_options.tileurl !== '') {
      tileurl = cttm_shortcode_options.tileurl;
    } else {
      tileurl = cttm_options['tileurl'];
    }
    if (cttm_shortcode_options.subdomains !== '') {
      subdomains = cttm_shortcode_options.subdomains;
    } else {
      subdomains = cttm_options['subdomains'];
    }
    if (cttm_shortcode_options.attribution !== '') {
      attribution = cttm_shortcode_options.attribution;
    } else {
      attribution = cttm_options['attribution'];
    }

    //Push current map object to array
    cttm_map.push(L.map(container, cttm_map_options));
    cttm_markers.push(new Array());

    //Get Tiles server URL + API key + Attribution
    L.tileLayer(tileurl, {
      subdomains: subdomains,
      attribution: attribution,
    }).addTo(cttm_map[mapindex]);

    /**
     * Disable Scrollwheel zoom when map is not in focus
     */
    cttm_map[mapindex].scrollWheelZoom.disable();
    //Enable Scrollwheel Zoom on focus
    cttm_map[mapindex].on('focus', function (e) {
      this.scrollWheelZoom.enable();
    });

    /**
     * Create all markers and popovers, and add them to the leaflet map.
     */

    //Change default leaflet icon options
    L.Icon.Default.prototype.options.iconSize = [32, 45];
    L.Icon.Default.prototype.options.iconAnchor = [16, 45];
    L.Icon.Default.prototype.options.popupAnchor = [0, -42];
    L.Icon.Default.prototype.options.shadowSize = [0, 0];

    //Create a markerClusterGroup if Clustering is activated (default),
    //else, create a FeatureGroup instead (we need "getBounds()" method for initial zoom, that's why we don't use a LayerGroup.)
    let markersGroup;
    if (cttm_shortcode_options.disable_clustering === 'true') {
      markersGroup = L.featureGroup();
    } else {
      //default
      markersGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: max_cluster_radius,
        spiderLegPolylineOptions: {
          weight: 3,
          color: 'rgb(110, 204, 57)',
          opacity: 0.6,
          lineCap: 'round',
        },
        spiderfyDistanceMultiplier: 2.5,
      });
    }

    // Generate Popover HTML Output and assign them to variables
    let [popoverOutput, popoverOptions] = cttmGeneratePopoverHTMLOutput(
      cttm_shortcode_options,
      cttm_options
    );

    //Get markers metas and linked posts datas from shortcode
    let json_cttm_metas = cttm_shortcode_vars.cttm_metas;

    //If posts with markers exist
    if (json_cttm_metas != 0) {
      //Clean json string to be usable
      json_cttm_metas = json_cttm_metas.replace(/&quot;/g, '\\"');

      //Get an array of objects containing markerdatas and postdatas
      const cttm_metas = JSON.parse(json_cttm_metas);

      //Loop through cttm_metas array, create all the markers and popovers.
      for (let i = 0; i < cttm_metas.length; i++) {
        //If current markerdata is not falsy:
        //Prevent bug with multilingual plugins, where metadatas are synced but not taxonomy:
        //If one remove a marker from a post, the other languages of this post will still appear in the query...
        if (cttm_metas[i].markerdatas) {
          //Get markerdatas object
          let markerdatas = JSON.parse(cttm_metas[i].markerdatas);

          //Initialize all markers variables
          let markerlatitude = markerdatas.latitude;
          let markerlongitude = markerdatas.longitude;
          let markerURL = markerdatas.markerdata[0];
          let markerwidth = markerdatas.markerdata[1];
          let markerheight = markerdatas.markerdata[2];

          //Get linked postdatas object
          let postdatas = Object.assign({}, cttm_metas[i].postdatas);

          //Alter postdatas array in case we have custom data set
          if (markerdatas.customtitle) {
            postdatas.thetitle = markerdatas.customtitle;
          }
          if (markerdatas.customexcerpt) {
            postdatas.excerpt = markerdatas.customexcerpt;
          }
          if (markerdatas.customthumbnail) {
            postdatas.thumb = markerdatas.customthumbnail;
          }
          if (markerdatas.customanchor) {
            if (markerdatas.customanchor.charAt(0) == '#') {
              postdatas.url += markerdatas.customanchor;
            } else {
              postdatas.url += '#' + markerdatas.customanchor;
            }
          }

          // Create a leaflet icon object and add it to the map, if not set, use default
          //"d" is returned when no icon is set
          if (markerURL != 'd') {
            //Create custom icon
            let myIcon = L.icon({
              iconUrl: markerURL,
              iconSize: [markerwidth, markerheight],
              iconAnchor: [markerwidth / 2, markerheight],
              popupAnchor: [0, -markerheight + 3],
            });
            //Create marker object wih our icon
            var marker = L.marker([markerlatitude, markerlongitude], {
              icon: myIcon,
            });
          } else {
            //Create marker object with default icon
            var marker = L.marker([markerlatitude, markerlongitude]);
          }

          //Add custom values to our object for developers
          //Note for future: additional data should be created by a function with a WP filter to hook on
          marker.additionalData = {
            postid: postdatas.postID,
            title: postdatas.thetitle,
            multipleMarkersIndex: 0,
            customFields: postdatas.customfields.fields
          };

          cttm_markers[mapindex].push(marker);

          let postPopoverOutput = cttmPopulatePopoversHTMLOutput(
            postdatas,
            popoverOutput,
            cttm_options
          );

          //If "this_post" option is set
          //Add the marker in our cluster group layer without popover
          //Else add it with its popover
          if (
            cttm_shortcode_options.this_post == 'true' &&
            !markerdatas.multiplemarkers
          ) {
            markersGroup.addLayer(marker);
          } else {
            markersGroup.addLayer(
              marker.bindPopup(postPopoverOutput, popoverOptions)
            );
          }

          //Second loop for multiplemarkers
          if (
            markerdatas.multiplemarkers &&
            (cttm_options['only_main_marker'] === 0 ||
              cttm_shortcode_options.this_post === 'true')
          ) {
            for (let index = 1; index < markerdatas.multiplemarkers; index++) {
              let postdatas = Object.assign({}, cttm_metas[i].postdatas);
              //Get markerdatas object
              let markerdatasMultiple =
                markerdatas['additional_marker_' + index];

              //Initialize all markers variables
              let markerlatitude = markerdatasMultiple.latitude;
              let markerlongitude = markerdatasMultiple.longitude;
              let markerURL = markerdatasMultiple.markerdata[0];
              let markerwidth = markerdatasMultiple.markerdata[1];
              let markerheight = markerdatasMultiple.markerdata[2];

              //Alter postdatas array in case we have custom data set
              if (markerdatasMultiple.customtitle) {
                postdatas.thetitle = markerdatasMultiple.customtitle;
              }
              if (markerdatasMultiple.customexcerpt) {
                postdatas.excerpt = markerdatasMultiple.customexcerpt;
              }
              if (markerdatasMultiple.customthumbnail) {
                postdatas.thumb = markerdatasMultiple.customthumbnail;
              }
              if (markerdatasMultiple.customanchor) {
                if (markerdatasMultiple.customanchor.charAt(0) == '#') {
                  postdatas.url += markerdatasMultiple.customanchor;
                } else {
                  postdatas.url += '#' + markerdatasMultiple.customanchor;
                }
              }
              // Create a leaflet icon object and add it to the map, if not set, use default
              //"d" is returned when no icon is set
              if (markerURL != 'd') {
                //Create custom icon
                let myIcon = L.icon({
                  iconUrl: markerURL,
                  iconSize: [markerwidth, markerheight],
                  iconAnchor: [markerwidth / 2, markerheight],
                  popupAnchor: [0, -markerheight + 3],
                });
                //Create marker object wih our icon
                var marker = L.marker([markerlatitude, markerlongitude], {
                  icon: myIcon,
                });
              } else {
                //Create marker object with default icon
                var marker = L.marker([markerlatitude, markerlongitude]);
              }
              //Add custom values to our object for developers
              //Note for future: additional data should be created by a function with a WP filter to hook on
              marker.additionalData = {
                postid: postdatas.postID,
                title: postdatas.thetitle,
                multipleMarkersIndex: index,
              };
              cttm_markers[mapindex].push(marker);
              let postPopoverOutput = cttmPopulatePopoversHTMLOutput(
                postdatas,
                popoverOutput,
                cttm_options
              );

              //If "this_post" option is set
              //Add the marker in our cluster group layer without popover
              //Else add it with its popover
              if (
                cttm_shortcode_options.this_post == 'true' &&
                !markerdatas.multiplemarkers
              ) {
                markersGroup.addLayer(marker);
              } else {
                markersGroup.addLayer(
                  marker.bindPopup(postPopoverOutput, popoverOptions)
                );
              }
            }
          }
        } //END if(markerdatas)
      } //END For Loop through cttm_metas

      //add Leaflet.search to the map when option is checked
      if (cttm_options['search_field'] == 1) {
        cttm_map[mapindex].addControl(
          new L.Control.Search({
            url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
            jsonpParam: 'json_callback',
            propertyName: 'display_name',
            propertyLoc: ['lat', 'lon'],
            autoCollapse: false,
            collapsed: false,
            autoType: true,
            minLength: 2,
            zoom: 13,
            firstTipSubmit: true,
            hideMarkerOnCollapse: true,
          })
        );

        //On focus, enable zoom with mousewheel on map.
        document.querySelector('#searchtext9').addEventListener(
          'focus',
          function () {
            cttm_map[mapindex].scrollWheelZoom.enable();
          },
          true
        );
      }

      //add Leaflet.fullscreen to the map when option is checked
      if (cttm_options['fullscreen_button'] == 1) {
        cttm_map[mapindex].addControl(
          new L.Control.Fullscreen({
            position: 'topright',
          })
        );
      }

      //add markercluster layer to the map
      cttm_map[mapindex].addLayer(markersGroup);

      //Set the initial view
      //If centered_on_this is set, set view on this post
      if (cttm_shortcode_options.centered_on_this == 'true') {
        //get the marker latitude and longitude, the first of our query.
        let centered_on_marker = JSON.parse(cttm_metas[0].markerdatas);
        let centerlatitude = centered_on_marker.latitude;
        let centerlongitude = centered_on_marker.longitude;

        cttm_map[mapindex].setView(
          [centerlatitude, centerlongitude],
          init_maxzoom
        );
      } else {
        //If centered_on_this is not set, fit the view to see every maker on the map
        cttm_map[mapindex].fitBounds(markersGroup.getBounds(), {
          padding: [60, 60],
          maxZoom: init_maxzoom,
        });
      }
    } //END if (!json_cttm_metas)

    //Recalculate map size after 100ms to avoid problems with page builders changing element size on document load.
    //Avoid problem with tiles not loading inside the whole container.
    const mapindexcopy = mapindex;
    setTimeout(() => {
      cttm_map[mapindexcopy].invalidateSize();
    }, 1000);

    mapindex++;
  } // END FUNCTION cttmMapLoop()

  // Create event to listen to know when the maps are loaded and cttm_map array is created
  // Useful if you want to add a leaflet plugin to your maps.
  let event_cttm = document.createEvent('Event');

  // Define that the event name is 'build'.
  event_cttm.initEvent('cttm_map_loaded', true, true);

  // target can be any Element or other EventTarget.
  document.dispatchEvent(event_cttm);
}
;// CONCATENATED MODULE: ./includes/public/js/travelersmap.js


document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementsByClassName('travelersmap-container')) {
    initTravelersMap();
  }
});

