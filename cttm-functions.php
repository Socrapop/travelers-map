<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

add_action('after_setup_theme', 'cttm_add_image_thumbnail');
/**
 * Add image size for markers' tooltips
 */
function cttm_add_image_thumbnail()
{
    add_image_size('travelersmap-thumb', 300, 200, TRUE);
}

add_action('init', 'cttm_markers_register_post_type');
/**
 * Register cttm-marker Post Type used to add different markers images
 */
function cttm_markers_register_post_type()
{
    $labels = array(
        'name'               => __('Markers', 'travelers-map'),
        'singular_name'      => __('Marker', 'travelers-map'),
        'menu_name'          => __('Markers', 'travelers-map'),
        'name_admin_bar'     => __('Travelers\' Map Markers', 'travelers-map'),
        'add_new'            => __('Add new', 'travelers-map'),
        'add_new_item'       => __('Add new marker', 'travelers-map'),
        'new_item'           => __('New marker', 'travelers-map'),
        'edit_item'          => __('Edit marker', 'travelers-map'),
        'view_item'          => __('View marker', 'travelers-map'),
        'all_items'          => __('Customize markers', 'travelers-map'),
        'search_items'       => __('Search marker', 'travelers-map'),
        'not_found'          => __('No marker found', 'travelers-map'),
        'not_found_in_trash' => __('No marker found in trash', 'travelers-map')
    );

    $args = array(
        'labels'             => $labels,
        'public'             => false,
        'publicly_queryable' => false,
        'show_ui'            => true,
        'show_in_menu'       => 'cttm_travelersmap',
        'capability_type'    => 'post',
        'has_archive'        => false,
        'hierarchical'       => false,
        'menu_position'      => null,
        'supports'           => array('title', 'thumbnail')
    );

    register_post_type('cttm-marker', $args);
}
add_theme_support( 'post-thumbnails', array( 'cttm-marker' ) );
/**
 * Register a private taxonomy for posts, automatically added to posts with markers metadata. Used to avoid heavy metadata queries, thus speeding up the query when showing the map in front-end. "Private" means it's only available internally by the plugin, and doesn't generate a url on it's own.
 * 
 */
add_action('init', 'cttm_create_private_markers_taxonomy');

function cttm_create_private_markers_taxonomy()
{
    //Get all public post types that could be geolocalized to set them the private taxonomy.
    $public_posttypes = apply_filters('cttm_available_post_types', get_post_types(['public' => true]));

    register_taxonomy(
        'cttm-markers-tax',
        $public_posttypes,
        array(
            'label' => __('Travelers Map Markers'),
            'public' => false,
            'rewrite' => false
        )
    );
}

/**
 * Add a thumbnail column to the "Customize markers" page
 */
// Add the post thumbnail to admin panel 
function cttm_thumbnail_column_content($column)
{
    if ($column == 'featuredimage') {
        global $post;
        echo (has_post_thumbnail($post->ID)) ? the_post_thumbnail() : "<p>" . __('No thumbnail found.', 'travelers-map') . "</p>";
    }
}

add_action('manage_cttm-marker_posts_custom_column', 'cttm_thumbnail_column_content');

function cttm_thumbnail_column_setup($columns)
{
    return array_merge($columns, array('featuredimage' => 'Marker'));
}
// replace posts with name of the post type to add the column on other post types   
add_filter('manage_edit-cttm-marker_columns', 'cttm_thumbnail_column_setup');
add_filter('script_loader_tag', 'cttm_add_type_attribute' , 10, 3);

function cttm_add_type_attribute($tag, $handle, $src) {
    // if not your script, do nothing and return original $tag
    if ( 'travelersmap' !== $handle ) {
        return $tag;
    }
    // change the script tag by adding type="module" and return it.
    $tag = '<script type="module" content-type="application/javascript" src="' . esc_url( $src ) . '"></script>';
    return $tag;
}


