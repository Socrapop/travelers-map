<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
	exit;
}

require_once plugin_dir_path(__FILE__) . '/cttm-shortcode.php';

add_action('wp_enqueue_scripts', 'cttm_scripts_frontend');
/**
 * Register scripts for front-end
 */
function cttm_scripts_frontend()
{

	wp_register_script('leaflet', plugins_url('js/leaflet.js', __FILE__));
	wp_register_script('leaflet_markercluster', plugins_url('js/leaflet.markercluster.js', __FILE__));
	//register travelersmap.js in footer so wp_localize_script() works when shortcode is used.
	wp_register_script('travelersmap_init', plugins_url('js/travelersmap.js', __FILE__), array(), false, true);
	wp_register_script('leaflet_search', plugins_url('js/leaflet-search.js', __FILE__));
	wp_register_script('leaflet_fullscreen', plugins_url('js/Leaflet.fullscreen.min.js', __FILE__));
}

add_action('wp_enqueue_scripts', 'cttm_styles_frontend');
/**
 * Register scripts for front-end
 */
function cttm_styles_frontend()
{

	wp_register_style('leaflet_css', plugins_url('css/leaflet.css', __FILE__));
	wp_register_style('leaflet_markerclustercss', plugins_url('css/MarkerCluster.css', __FILE__));
	wp_register_style('travelersmap_css', plugins_url('css/cttm-styles.css', __FILE__));
	wp_register_style('leaflet_search_css', plugins_url('css/leaflet-search.css', __FILE__));
	wp_register_style('leaflet_fullscreen_css', plugins_url('css/leaflet.fullscreen.css', __FILE__));
}
