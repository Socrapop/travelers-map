<?php
/*
Plugin Name: Travelers' Map
Plugin URI: https://wordpress.org/plugins/travelers-map
Description: Pin your Wordpress posts on a dynamic OpenStreetMap map
Version: 1.12.0
Author: Camille Verrier
Text Domain: travelers-map
Domain Path: /languages
Author URI: https://verriercamille.com/
License: GPLv3 or later
*/
/*  Copyright 2019  VERRIER CAMILLE  (email : contact@verriercamille.com)
    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License, version 2, as 
    published by the Free Software Foundation.
    
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

//Define version constant. We use this to see if the plugin was updated.
if (!defined('TRAVELERSMAP_VERSION')) {
    define('TRAVELERSMAP_VERSION', '1.12.0');
}

/**
 * Plugin activation function
 */
register_activation_hook(__FILE__, 'cttm_activation');

function cttm_activation()
{
    require_once plugin_dir_path(__FILE__) . 'cttm-activation.php';
}

/**
 * Plugin deactivation function
 */

register_deactivation_hook(__FILE__, 'cttm_deactivation');

function cttm_deactivation()
{
}


require_once plugin_dir_path(__FILE__) . 'includes/public/cttm-public.php';
require_once plugin_dir_path(__FILE__) . 'includes/admin/cttm-admin.php';
require_once plugin_dir_path(__FILE__) . 'includes/admin/cttm-shortcode-helper.php';
require_once plugin_dir_path(__FILE__) . 'cttm-functions.php';
require_once plugin_dir_path(__FILE__) . 'cttm-settings.php';



//Check if plugin was updated by comparing "TRAVELERSMAP_VERSION" to the version in database.
function cttm_check_version()
{
    if (TRAVELERSMAP_VERSION !== get_option('travelersmap_version')) {
        cttm_option_update();
    }
}

add_action('plugins_loaded', 'cttm_check_version');

function cttm_option_update()
{

    require_once plugin_dir_path(__FILE__) . 'cttm-update.php';
}

// Load plugin textdomain for translation

function cttm_load_textdomain()
{

    load_plugin_textdomain('travelers-map', false, dirname(plugin_basename(__FILE__)) . '/languages');
}
add_action('after_setup_theme', 'cttm_load_textdomain');

// Add admin notice on activation to ask for thumbnail regeneration
function cttm_admin_notices()
{
    echo "<div class='notice-warning notice cttm-notice is-dismissible'><p>";
    printf(__('Thank you for using Travelers\' Map. <br>This plugin is creating a new thumbnail size for your markers\' popovers to speed up their loading time in the frontend. <br><br><strong>If you already have images in your media library before activating this plugin, please consider regenerating them with the awesome plugin <a href="%1$s" target="_blank">Regenerate Thumbnails</a> as this is not supported by Wordpress alone.</strong> <br><br> Please note that <strong>images added after you activate this plugin are automatically generated in the right size</strong>.', 'travelers-map'), 'https://wordpress.org/plugins/regenerate-thumbnails/');
    echo "</p></div>";
}

// Show admin notice only if not dismissed already.
if (empty(get_option('travelersmap_notice_dismissed'))) {
    add_action('admin_notices', 'cttm_admin_notices');
}


/**
 * AJAX handler to store the state of dismissible notices.
 */
function cttm_ajax_notice_handler()
{
    // Store it in the options table
    update_option('travelersmap_notice_dismissed', 1);
}

add_action('wp_ajax_dismiss_cttm_notice', 'cttm_ajax_notice_handler');
