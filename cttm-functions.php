<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit; 
}

add_action( 'after_setup_theme', 'cttm_add_image_thumbnail' );
/**
 * Add image size for markers' tooltips
 */
function cttm_add_image_thumbnail() {
    add_image_size( 'travelersmap-thumb', 300, 0 ); 
}

add_action('init', 'cttm_markers_register_post_type');
/**
 * Register cttm-marker Post Type used to add different markers images
 */
function cttm_markers_register_post_type(){
   $labels = array(
        'name'               => 'Markers',
        'singular_name'      => 'Marker',
        'menu_name'          => 'Markers',
        'name_admin_bar'     => 'Travelers\' Map Markers',
        'add_new'            => 'Add new',
        'add_new_item'       => 'Add new marker',
        'new_item'           => 'New marker',
        'edit_item'          => 'Edit marker',
        'view_item'          => 'View marker',
        'all_items'          => 'Customize markers',
        'search_items'       => 'Search marker',
        'not_found'          => 'No marker found',
        'not_found_in_trash' => 'No marker found in trash',
    );

    $args = array(
        'labels'             => $labels,
        'public'             => false,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => 'cttm_travelersmap',
        'capability_type'    => 'post',
        'has_archive'        => false,
        'hierarchical'       => false,
        'menu_position'      => null,
        'supports'           => array( 'title', 'thumbnail')
    );

     register_post_type( 'cttm-marker', $args );

}
/**
 * Register a private taxonomy for posts, automatically added to posts with markers metadata. Used to avoid heavy metadata queries, thus speeding up the query when showing the map in front-end. "Private" means it's only available internally by the plugin, and doesn't generate a url on it's own.
 * 
 */
add_action( 'init', 'cttm_create_private_markers_taxonomy' );

function cttm_create_private_markers_taxonomy() {
    register_taxonomy(
        'cttm-markers-tax',
        'post',
        array(
            'label' => __( 'Travelers Map Markers' ),
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
    if ($column == 'featuredimage')
        {
        global $post;
        echo (has_post_thumbnail($post->ID)) ? the_post_thumbnail() : '<p>No thumbnail found</p>' ;
        }
    }

add_action('manage_cttm-marker_posts_custom_column', 'cttm_thumbnail_column_content');

function cttm_thumbnail_column_setup($columns)
    {
    return array_merge($columns, array('featuredimage'=>'Marker'));
    }
// replace posts with name of the post type to add the column on other post types   
add_filter('manage_edit-cttm-marker_columns', 'cttm_thumbnail_column_setup');
