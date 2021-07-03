import { cttmGeneratePopoverHTMLOutput } from "./generate-popover-html-output.js";
import { cttmPopulatePopoversHTMLOutput } from "./populate-popovers-html-output.js";
import { getGlobalOptions } from "./global-options.js";

export function cttmMapLoop(doc, shortcode) {
    //If no markers are loaded, return without initiating leaflet
    if (shortcode.metas == '0') {
        return;
    }

    const global_options = getGlobalOptions(doc.defaultView);

    /**
     * Create leaflet map options object. This object is then passed as argument when the map initialized.
     */
    let map_options = new Object();

    //Add max bounds on north and south of the map
    map_options.maxBounds = [
        [-90, -Infinity],
        [90, Infinity],
    ];

    // If one-finger touch event is disabled on mobile
    if (global_options['onefinger']) {
        map_options.dragging = !L.Browser.mobile;
        map_options.tap = !L.Browser.mobile;
    }
    //Set maxzoom if defined
    if (shortcode.options.maxzoom != '') {
        map_options.maxZoom = shortcode.options.maxzoom;
    }
    //Set minzoom if defined
    if (shortcode.options.minzoom != '') {
        map_options.minZoom = shortcode.options.minzoom;
    }
    //Set init_maxzoom if defined. Convert to integer to avoid error.
    if (shortcode.options.init_maxzoom) {
        var init_maxzoom = parseInt(shortcode.options.init_maxzoom);
    } else {
        var init_maxzoom = 16;
    }

    if (shortcode.options.max_cluster_radius) {
        var max_cluster_radius = parseInt(
            shortcode.options.max_cluster_radius
        );
    } else {
        var max_cluster_radius = 45;
    }

    /**
     * Create leaflet map object "cttm_map"
     */

    //Get cttm_map container id
    let containerid = shortcode.options.id;
    let container = doc.getElementById(
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
    let tileurl;
    if (shortcode.options.tileurl !== '') {
        tileurl = shortcode.options.tileurl;
    } else {
        tileurl = global_options['tileurl'];
    }

    let subdomains;
    if (shortcode.options.subdomains !== '') {
        subdomains = shortcode.options.subdomains;
    } else {
        subdomains = global_options['subdomains'];
    }

    let attribution;
    if (shortcode.options.attribution !== '') {
        attribution = shortcode.options.attribution;
    } else {
        attribution = global_options['attribution'];
    }

    //Index of map objects in array
    let mapindex = 0;

    //Push current map object to array
    cttm_map.push(L.map(container, map_options));
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
    if (shortcode.options.disable_clustering === 'true') {
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
        shortcode.options,
        global_options
    );

    //Get markers metas and linked posts datas from shortcode
    //If posts with markers exist
    if (shortcode.metas != 0) {
        //Get an array of objects containing markerdatas and postdatas

        //Loop through shortcode.metas array, create all the markers and popovers.
        for (let i = 0; i < shortcode.metas.length; i++) {
            //If current markerdata is not falsy:
            //Prevent bug with multilingual plugins, where metadatas are synced but not taxonomy:
            //If one remove a marker from a post, the other languages of this post will still appear in the query...
            let markerdatas = shortcode.metas[i].markerdatas;
            if (markerdatas) {
                //Initialize all markers variables
                let markerlatitude = markerdatas.latitude;
                let markerlongitude = markerdatas.longitude;
                let markerURL = markerdatas.markerdata[0];
                let markerwidth = markerdatas.markerdata[1];
                let markerheight = markerdatas.markerdata[2];

                //Get linked postdatas object
                let postdatas = Object.assign({}, shortcode.metas[i].postdatas);

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

                let postPopoverOutput = cttmPopulatePopoversHTMLOutput(
                    postdatas,
                    popoverOutput,
                    global_options
                );

                //If "this_post" option is set
                //Add the marker in our cluster group layer without popover
                //Else add it with its popover
                if (shortcode.options.this_post == 'true') {
                    markersGroup.addLayer(marker);
                } else {
                    markersGroup.addLayer(
                        marker.bindPopup(postPopoverOutput, popoverOptions)
                    );
                }

                //Second loop for multiplemarkers
                if (markerdatas.multiplemarkers) {
                    for (let index = 1; index < markerdatas.multiplemarkers; index++) {
                        let postdatas = Object.assign({}, shortcode.metas[i].postdatas);
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

                        let postPopoverOutput = cttmPopulatePopoversHTMLOutput(
                            postdatas,
                            popoverOutput,
                            global_options
                        );

                        //If "this_post" option is set
                        //Add the marker in our cluster group layer without popover
                        //Else add it with its popover
                        if (shortcode.options.this_post == 'true') {
                            markersGroup.addLayer(marker);
                        } else {
                            markersGroup.addLayer(
                                marker.bindPopup(postPopoverOutput, popoverOptions)
                            );
                        }
                    }
                }
            } //END if(markerdatas)
        } //END For Loop through shortcode.metas

        //add Leaflet.search to the map when option is checked
        if (global_options['search_field'] == 1) {
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
            doc.querySelector('#searchtext9').addEventListener(
                'focus',
                function () {
                    cttm_map[mapindex].scrollWheelZoom.enable();
                },
                true
            );
        }

        //add Leaflet.fullscreen to the map when option is checked
        if (global_options['fullscreen_button'] == 1) {
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
        if (shortcode.options.centered_on_this == 'true') {
            //get the marker latitude and longitude, the first of our query.
            let centered_on_marker = shortcode.metas[0].markerdatas;
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
    } //END if (!json_shortcode.metas)

    //Recalculate map size after 100ms to avoid problems with page builders changing element size on doc load.
    //Avoid problem with tiles not loading inside the whole container.
    const mapindexcopy = mapindex;
    setTimeout(() => {
        cttm_map[mapindexcopy].invalidateSize();
    }, 1000);

    mapindex++;
}
