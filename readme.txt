=== Travelers' Map ===
Contributors: socrapop
Donate link: https://www.paypal.me/CamilleVerrier
Tags: geolocalize, openstreetmap, leaftlet, map, pin, travelers, markers, travel blog
Requires at least: 4.6
Tested up to: 6.4.2
Requires PHP: 5.2.4
Stable tag: 2.2.1
License: GPLv3 or later
License URI: https://www.gnu.org/licenses/gpl-3.0.html
Version 2.2.1

Geolocate your posts and display them on an interactive OpenStreetMap map using a simple shortcode. Customize your markers and map. 


== Description ==
Travelers' Map allows you to display your blog posts on a dynamic map using the Leaflet module and OpenStreetMap open data. This plugin is entirely free.

See this plugin in action on my [hiking blog](https://camilles-travels.com/la-carte/).
How to use: [Get started with Travelers' Map](https://camilles-travels.com/get-started-with-travelers-map-wordpress-plugin/)
[Developers documentation](https://camilles-travels.com/get-started-with-travelers-map-wordpress-plugin/#dev-documentation)

= Features of Travelers' Map =

* **Geolocalize your posts, pages or custom post types** on a map and choose the marker image. A **search module** is available to quickly locate the desired location.
* Add your own images to **customize your markers**.
* **Insert a dynamic map** that displays your articles using a **simple shortcode**. Choose the dimensions of your map.
* **Filter the posts** you want to display on the map by their type, categories and tags.
* **Markers clustering** is automatic when marker density is too high, to prevent them from overlapping.
* **Customize** the appearance of your maps with OpenStreetMap tile providers. By default, the plugin uses CARTO's free and open "Voyager" map tiles.
* **Customize** the popup style and content for your markers. You can also disable the plugin's CSS if you want to design your own popups.
* Travelers' Map is **compatible with the new Gutenberg editor** and the classic editor.
* This plugin **does not add any tables into your database**.

The geolocation data of your posts are saved as meta-data and **are not deleted if Travelers' Map is disabled or deleted**. However, if you want to uninstall Travelers' Map permanently, an option is available to **clean your database of any data added by the plugin**.

== Installation ==

1. Go to the Plugins -> 'Add New' page in your WP admin area
2. Search for 'Travelers Map'
3. Click the ‘Install Now’ button
4. Activate the plugin through the ‘Plugins’ menu

= Get started =

Detailed guide is available here: [Get started with Travelers' Map](https://camilles-travels.com/get-started-with-travelers-map-wordpress-plugin/)



== Bug reports and Contribution ==

Bug reports for Travelers' map are welcomed on my [GitHub Repository](https://github.com/Socrapop/travelers-map). Also, feel free to use Github to contribute to the plugin!

= Known Issues =
- Minor issue with Elementor: Map preview in Elementor Builder is not working. However the map is still working on the final page.

== Screenshots == 
1. Display an interactive map showing your geolocated posts using a shortcode.
2. Geolocate each of your post directly in your editor and assign them your custom markers icon. A search module is integrated into the map. 
3. Add custom markers easily. 6 default markers are available.
4. Customize your map in the settings page. Everything is explained clearly.
5. Shortcode Helper page. Change the default size of your map and it's behaviour, filter the posts you want to show by tags, category or post type.

== Changelog ==
= 2.2.1 - 16/01/2024 = 
* Security fix, thanks LVT-tholv2k from patchstack for the vulnerability report
* Tested up to WP 6.4.2

= 2.2.0 - 24/06/2023 = 
Developers Update : New filters to change popovers content
* Added "cttm_add_customfields" filter to add custom HTML to popovers
* Added "cttm_postdata_filter" filter to modify the data sent to the popovers
* Added custom field to popovers HTML
* Fix: Additionnal markers were labelled "Main markers" on page load
* Updated NPM dependencies
* Updated HTML Purifier 

= 2.1.0 - 15/03/2022 = 
Developers update and important fixes (PHP8, WP 5.9 and FSE):
Developers documentation is located here: https://camilles-travels.com/get-started-with-travelers-map-wordpress-plugin/#dev-documentation
Next update will add some filters for developers.

* Added global "cttm_markers" array to the front-end
Marker objects have additional information available in marker.additionalData: postid (int), title (string), multipleMarkersIndex.
* Added "cttm_map_loaded" event and global "cttm_map" object in post edition interface.
Developers can now access the map object in the admin "Edit page" area using the "cttm_map" object.
The event "cttm_map_loaded" is triggerring after the map is loaded (same behaviour as in the front-end)
-----
* Fix: Fixed PHP 8 notices on posts without markers, when Travelers Map is enabled.
* Fix: Global functions like initTravelersMap() are now accessible again in the front-end (regression from 2.0.2, since Webpack was introduced and added IIFE around the output).
* Fix: Travelers Map is now working with Full Site Editing themes introduced in WP 5.9 (e.g. Twenty Twenty Two)

= 2.0.6 - 16/01/2022 = 
* Add featured image "theme support" for custom markers post type, as some themes are enabling this for posts/pages exclusively.

= 2.0.5 - 07/01/2022 = 
* WP 5.8.3 security update of 07/01/2022 (and older versions security update) made the map bug. 
Markers are not loading anymore on the map.
This "emergency" update fixes this issue, please update.

= 2.0.4 - 22/10/2021 = 
* Fix multiple markers custom thumbnail not showing in popovers.

= 2.0.3 - 03/10/2021 = 
* Fix the map not showing when the date was not added to the popovers.

= 2.0.2 - 01/10/2021 = 
* Fix the map not showing when using a caching plugin that minified all the javascript files together.
* Falang compatibility added. Excerpt still need to be entered manually if activated globally.

Dev notes:
* Added NPM and webpack to the projet.
* Added a Javascript bundle file loaded on the front-end. (includes/public/js/dist/travelersmap-bundle.js)

= 2.0.0 - 26/09/2021 = 
Major update:
* Multiple markers on a single post is now possible. 
* Added custom anchor to markers, so the markers popovers can link to an anchor on the post.
* Added only_main_marker global setting to show or not the multiple markers on the maps. The shortcode parameter this_post=true will still show additional markers
* Major code rewriting to enable mutliple markers.
* Code refactoring with the help of @CCR-G on Github (still in progress, will continue in the next versions)

UX improvements:
* Improved initial zoom when loading a single marker

Fixes:
* Added a version number to CSS and JS files to avoid browser caching issues after updates.
* Fixed leaflet map not proprely displayed when loaded in a closed Gutenberg tab.
* 2.0.1 : Fixed multiple markers backoffice map loaded with a big zoom in the middle of nowhere.

= 1.12.0 - 13/05/2021 = 
UX improvement:
* Added a different error message on the map when no markers are loaded.
* Search in admin panel now automatically add / move the marker in the result location.
Bugfixes:
* Fixed the date in popovers to match with the post date set in the administration. Users from UTC+10 were having a 10 hours lag on the popover's date.
* Fixed an error in the settings page when using PHP 8
Other: 
* Updated HTMLPurifier library to latest build
* Added norwegian translation, thanks to user espenmn on Github! Thank you :)

= 1.11.4 - 20/12/2020 = 
* Adressing an issue with some page builders: 
 When the container of the map is resized after page load, the tiles were not loading properly inside the new container size -> Added a script to recalculate the container size after 1 second.
* Fixed the same problem inside the gutenberg editor for some people.

= 1.11.3 – 29/11/2020= 
* Added max bounds to south and north of the frontend map so the user can’t leave the map on panning.
* Fixed Travelers’ Map accidentally overriding the « take over editing » modal buttons when multiple editors tried to edit the same post at the same time.

= 1.11.2 - 07/11/2020 = 
* Fixed apostrophes in custom title and excerpt to break the map.
* Fixed accents and special characters in custom title and excerpt from displaying as html entities in popovers.
* You must save again your broken custom titles and excerpts for the fix to work, sorry for the inconvenience.

= 1.11.1 - 11/10/2020 = 
* Fixed the map not loading with "disable_clustering" parameter set to true.

= 1.11.0 - 08/10/2020 = 
Improved popovers customization:
* You can now choose which data you want to show in the popovers. Design will adapt accordingly.
* Added the possibility to show the post's date in the popovers.
* Added custom title, excerpt and thumbnail for markers' popovers. You can now change the default data shown in the popovers.
* Updated popovers CSS. If you have a caching plugin, you can clear the cache after the update if you have any problem.
* Old settings are automatically converted into the new settings when updating to 1.11.0.
* Updated Travelers' Map backend UI on post editing page, now optimized for V2.0 update.
* Changed backend map to center on the current marker on page load.
* Thanks to Rob de Cleen @rdc2701 for his Dutch and Italian translations! :)

= 1.10.0 - 24/07/2020 = 
* Added shortcode parameter "current_query_markers" to show current page query markers only. Ideal to put on the search results page. This will override every other filtering parameters. Please note this is not working with ajax loaded search results.
* Added shortcode parameter "max_cluster_radius" to define the maximum radius that a cluster will cover from the central marker (in pixels). Default is 45. Decreasing will make more, smaller clusters.
* Shortcode Helper page updated with the new parameters.

= 1.9.2 - 20/06/2020 = 
* Fixed double quotes in popovers' excerpt from throwing an error and preventing the map to load.

= 1.9.1 - 17/06/2020 = 
* Added stacking context to the map: map and control elements are not overlapping other plugins elements anymore (like overlays, modal windows...).
* Better English wording (ex: popups are now popovers). Do not hesitate to contact me if some sentences are weird, english is not my native tongue.
* French translation is now fully compatible with WordPress Translate. Plugin "readme" is translated too.
* German translation by Micha Zergiebel is up since 1.9.0, thank you a lot for this!
* New donation link in the settings page.


= 1.9.0 - Major update - 21/05/2020 = 

New features:
* Added custom taxonomy filtering in shortcodes! 
* Added shortcode parameter "disable_clustering" to disable marker clustering. Don't use this on a map with a lot of markers.
* Added shortcode parameter "open_link_in_new_tab" to open the link in a new tab on click on a marker's popup (however it's not recommended, in most cases, you should let the user decide what he/she wants to do).
* Added shortcode parameters "tileurl", "subdomains" and "attribution" to override global plugin settings. This option is advised for advanced users only.
* Added spiderfy for markers clustering: If a clusterGroup appears at the maximum zoom level of the map, clicking on it makes it "spiderfy" so you can see all of its markers. No more problem if your markers are located at the same place.

Changed: 
* Shortcode Helper page updated with new parameters : 
* Added a new "Advanced settings" section at the bottom of the page.
* Added "Filter by custom taxonomies section".
* French translation updated.

Fixed: 
* Travelers' Map now check if the map containers are on the page before initializing the maps. This removes the errors when the shortcode was loaded asynchronously.

For developers:
* Added possibility to initialize the map with initTravelersMap() function. This can be useful if you load the HTML container div asynchronously.
* Updated dependencies: Leaflet V1.6.0 and Leaflet MarkerCluster V1.4.1
* Refactorded some functions and formatted files with Prettier (.js) and Phpfmt (.php)


= 1.8.1 - 20/02/2020 =

Added compatibility with WPML (multilingual plugin) : 
*   Use duplication to copy marker information between posts. 
*   Shortcode is now showing posts of the current language only.
*   Added an option in Travelers' Map settings (when WPML is activated) to copy all markers from default language posts to their translations (useful if the translations are already created).
French translation updated.

= 1.8.0 - 17/02/2020 ==

Added compatibility with Polylang (multilingual plugin) : 
*   New translations for a post are getting the same marker's informations as original post. This might work for WPML too but I can't test without a licence, sorry.
*   Shortcode is now showing posts of the current language only.
*   Added an option in Travelers' Map settings (when Polylang is activated) to copy all markers from default language posts to their translations (useful if the translations are already created).
French translation updated.
Code formatting

= 1.7.0 - Major update - 14/12/2019 ==

New features:
* New shortcode parameter "centered_on_this" to show a map zoomed on the current post's marker, moreover other posts are also displayed on the map.
* New shortcode parameter "post_id" to fetch a post's marker by its ID. This can be combined with "centered_on_this" parameter to zoom on this ID's marker but keep the others showing.
* New option added to show a fullscreen button on your maps in the plugin settings.


Minor features and changes: 
* Added a dismissible admin notice warning the users to regenerate their thumbnail to speed up their markers' thumbnails loading.
* Overhaul UX/UI makeover for Shortcode helper page. Settings are now separated in different parts and is optimized for next update. 
* Changed default "Initialization max-zoom" to be 15 instead of 18.
* Changed some texts in admin area.
* French translation updated.

New options for developers:
* 'cttm_map[]' array is now a global variable. You can now initialize your own leaflet plugins to the maps. More information and tutorial added in the plugin's documentation.
* Custom event 'cttm_map_loaded' is triggered when maps are initialized on the frontend.

= 1.6.0 - 02/11/2019 =
* Added shortcode option "Initialization max zoom" to set a default max zoom on map load. The user can still zoom over this limit. This is useful for maps showing only one marker.
* Removed popup when using "this_post=true" to avoid end-user confusion.
* Markers' thumbnails are now hard cropped to 300*200px to avoid wide images not displaying correctly in markers' popup. If you had any problem, please regenerate your thumbnail using the awesome plugin "Regenerate Thumbnails".
* Updated French translation.

= 1.5.0 - 05/10/2019 =
* You can now add multiple maps within a single page or post.
* Added a new shortcode parameter "this_post=true" to show a map of the current post marker. Usefull when you want to add a map inside your geolocated posts and pages.
* Updated shortcode helper page with "this_post=true".
* Code optimization for future updates.
* Added placeholder message in case leaflet is not loading correctly. 
* Bugfix: Page no longer scroll to recenter on map after a search.
* Updated French translation.

= 1.4.0 - 28/08/2019 =
* Added a new option to disable one finger events for mobile users. This option is still in beta and is not yet warning the user to use two fingers.
* Updated shortcode parameters to accept the maximum and minimum zoom level of the map using 'maxzoom=' and 'minzoom='.
* Updated shortcode helper page.
* Updated French translation.

= 1.3.1 - 20/07/2019 =
* Leaflet search in frontend now zoom-in on search like in the admin area.
* Changed menu label for settings page.
* Fixed translation not showing up on admin menus.

= 1.3.0 - 19/07/2019 =
* Community requested: Added an option to enable Leaflet search module in frontend.
* Focus on search box now enable mousewheel zoom on map.
* Fixed errors showing when unchecking an option in settings.

= 1.2.0 - 17/07/2019 =
* You can now geolocalize and add markers to pages and custom post types.
* New setting in option page to select on which post type you want to activate markers.
* Updated shortcode parameters to accept post type filter using 'post_type='.
* Updated Shortcode Helper page. 
* "Delete all plugin data" now delete every marker of every possible public post type, even unchecked ones.
* "Markers" posts can no longer be accessed from URL.
* Bugfix: "Delete current marker" button no longer refresh the page with Classic Editor.
* French translation update.


= 1.1.0 - 28/06/2019 =
* Improvement of Travelers' Map backend UX.
* Changed Leaflet default icon to match with the plugin icons.
* Latitude and longitude are now below the map to avoid confusion.
* Changing Latitude and Longitude manually in the input field now change the marker position on the map.
* New button added to delete current marker data.
* Search input is now open by default to increase visibility.

= 1.0.0 - 21/06/2019 =
* Travelers' Map is now translatable.
* French language added.

= 0.9.0 - 13/06/2019 =
* NEW: Popup customization - You can now choose between pre-defined popups.
* You can now show excerpt in popups.
* Popups CSS can be turned off for developers.
* Fixed map not displaying in Internet Explorer...


= 0.8.2 - 06/06/2019 =
* Added new default markers on plugin activation.
* "Delete data" button in options page now remove every custom marker too.
* Clarified the "Delete button" description in options page.
* Fixed options not being removed when uninstalling the plugin.

= 0.8.1 - 04/06/2019 = 
* Fixed error when no custom marker is created

= 0.8.0 - 02/06/2019 = 
* First version released publicly on wordpress.org


== Frequently Asked Questions ==

= Is this open source and free of charge? =
Yes, it is. This plugin uses [Leaflet](https://leafletjs.com/) to display the interactive maps. [OpenStreetMap](https://www.openstreetmap.org/) open data is used. By default, this plugin uses [CARTO’s Voyager](https://carto.com/attribution/) tiles, which require attribution but are free. 

However, you may have to pay if you were to choose a premium Tile Provider.

= How can I find free tile providers to customize my map? =
You should visit the awesome [Leaflet-providers demo](https://leaflet-extras.github.io/leaflet-providers/preview/) to find a tile provider. Some of them require to register and request an API key.

= Can I use Google Maps = 
No, I decided to create Travelers' Map after Google Maps' pricing plans were updated. Furthermore, loading tiles from Google Maps by simply specifying the tiles URL to Leaflet is against the Google Maps terms of service.
If you really want to use Google Maps (but really, why?), you can use the plugin Novo-Map that I used to use on my personal blog.

= Can I add more markers images? =

Yes, you can add your own custom markers in "Travelers' Map" > "Customize markers" in your Wordpress admin area.

= Is this plugin only available in English? =
Since version 1.0.0, this plugin has English and French version. You can contribute and [translate the plugin into your language] (https://translate.wordpress.org/projects/wp-plugins/travelers-map/)! Thank you.

= My markers' thumbnails are heavy and long to load, what can I do ? =
Travelers' map is creating a small thumbnail size for your popups, however, Wordpress is not regenerating thumbnails for the images you uploaded before activating the plugin. To do that, you can install a plugin called "Regenerate Thumbnails" by Alex Mills.

= Can I add two maps on the same page? =
Yes you can since version 1.5.0, you can add multiple shortcodes on the same page.

= Can I change the marker popup style? =
Yes you can, since version 0.9.0. You can also disable the plugin's CSS to customize.

