<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Display leaflet map shortcode
 */
add_shortcode('travelersmap', 'cttm_shortcode');
add_shortcode('travelers-map', 'cttm_shortcode');

function cttm_shortcode($attr)
{

    //enqueue styles and scripts when shortcode is used
    wp_enqueue_style('leaflet_css');
    wp_enqueue_style('travelersmap_css');
    wp_enqueue_style('leaflet_markerclustercss');

    wp_enqueue_script('leaflet');
    wp_enqueue_script('leaflet_markercluster');
    wp_enqueue_script('travelersmap');

    //Get post types selected in plugin settings
    $cttm_options = get_option('cttm_options');
    $settings_posttypes = $cttm_options['posttypes'];
    $searchfield = $cttm_options['search_field'];
    $fullscreen = $cttm_options['fullscreen_button'];

    if ($searchfield) {
        wp_enqueue_script('leaflet_search');
        wp_enqueue_style('leaflet_search_css');
    }
    if ($fullscreen) {
        wp_enqueue_script('leaflet_fullscreen');
        wp_enqueue_style('leaflet_fullscreen_css');
    }

    /**
     * Define attributes and their defaults, return only supported attributes
     * Extract all values to independant variables
     */

    extract(shortcode_atts(array(
        'height' => '600px',
        'width' => '100%',
        "maxwidth" => '',
        "maxheight" => '',
        'cats' => '', //by slug, separated by a comma when multiple categories
        'tags' => '', // by slug, separated by a comma when multiple tags
        'custom_tax' => '', // (Format 'taxonomy-slug=value1,value2&taxonomy-slug2=value1'). key=value separated by '&' when multiple custom taxonomies. Values separated by comma.
        'post_types' => $settings_posttypes, // by slug, separated by a comma when multiple posttypes
        'minzoom' => '',
        'maxzoom' => '',
        'this_post' => false,
        'current_query_markers' => false,
        'centered_on_this' => false,
        'init_maxzoom' => 16,
        'post_id' => false,
        'open_link_in_new_tab' => false,
        'disable_clustering' => false,
        'max_cluster_radius' => 45,
        'tileurl' => false,
        'subdomains' => false,
        'attribution' => false,
    ), $attr));

    //If attribution is set, require HTMLPurifier and sanitize it
    if ($attribution !== false) {
        require_once plugin_dir_path(__DIR__) . '/admin/HTMLPurifier/HTMLPurifier.auto.php';
        $config = HTMLPurifier_Config::createDefault();
        $purifier = new HTMLPurifier($config);
        $attribution = $purifier->purify($attribution);
    }

    /**
     * Custom post taxonomy filtering, defining tax_query accordingly.
     */
    //If filtering is set in shortcode

    if (!empty($custom_tax)) {

        //Cleaning our string first from space and '&' HTML name code.
        $custom_tax = str_replace(' ', '', $custom_tax);
        $custom_tax = str_replace("&amp;", "&", $custom_tax);
        //Then we extract all the informations and transform into arrays
        $custom_tax_strings_array = explode('&', $custom_tax);
        //Define our final array for the query
        $custom_tax_query_array = array();
        //For each custom taxonomy array: extract, convert and push to our query array
        foreach ($custom_tax_strings_array as $custom_tax_strings) {
            //Get key (our taxonomy slug)
            $temp_key = substr($custom_tax_strings, 0, strpos($custom_tax_strings, "="));
            //Get our values (taxonomy terms) as a string
            $temp_values_string = substr($custom_tax_strings, strpos($custom_tax_strings, "=") + 1);
            //Convert this string as an array of values
            $temp_values_array = explode(',', $temp_values_string);
            //Create our query array
            $temp_query_array = array('taxonomy' => $temp_key, 'field' => 'slug', 'terms' => $temp_values_array);
            //Push this array into our final query array
            $custom_tax_query_array[] = $temp_query_array;
        }
        //Create our tax_query array
        $tax_query = array(
            'relation' => 'AND',
            array(
                'taxonomy' => 'cttm-markers-tax',
                'field' => 'name',
                'terms' => 'hasmarker',
            ),
        );

        //If we have only one custom taxonomy filter, add our custom tax query array directly into the tax_query array.
        if (count($custom_tax_strings_array) == 1) {
            $tax_query[] = $custom_tax_query_array[0];
        }
        //Else if we have multiple custom taxonomy filters, add them to an outer array with "relation" key, then push into the tax_query array.
        else if (count($custom_tax_strings_array) > 1) {
            $tax_multiple_query_array = array('relation' => 'AND', $custom_tax_query_array);
            $tax_query[] = $tax_multiple_query_array;
        }
    } else {
        //If filtering is not set, set tax_query to only get our private taxonomy cttm-markers-tax
       
        $tax_query = array(
            array(
                'taxonomy' => 'cttm-markers-tax',
                'field' => 'name',
                'terms' => 'hasmarker',
            ),
        );
    }

    /**
     * Transform post types string to array
     */
    $post_types = explode(',', $post_types);

    /**
     * Define ID to use in our query
     */
    //If a custom ID is set in the shortcode, set it as $current_id

    if (is_numeric($post_id)) {

        $current_id = $post_id;
    } // Else, if the current post has to be shown, or centered on, set its ID as $current_id
    elseif ($this_post == true || $centered_on_this == true) {

        global $post;
        $current_id = $post->ID;
    } // Else, set $current_id to false.
    else {

        $current_id = false;
    }

    /**
     * Define query parameters based on shortcode attributes.
     * current_query_markers has priority over the other attributes and override them.
     */
    if ($current_query_markers == true) {
        global $wp_query;
        $cttm_global_query_args = $wp_query->query_vars;
        $cttm_options_args = array_replace($cttm_global_query_args, array(
            'nopaging' => true,
            'tax_query' => array(
                array(
                    'taxonomy' => 'cttm-markers-tax',
                    'field' => 'name',
                    'terms' => 'hasmarker',
                ),
            ),

        ));
    } else {
        // IF '$current_id' has an ID (see above), we define WP_Query parameters to only get this post/page.
        if ($current_id) {

            $cttm_options_args = array(
                'post__in' => array($current_id),
                'post_type' => 'any',
                'tax_query' => array(
                    array(
                        'taxonomy' => 'cttm-markers-tax',
                        'field' => 'name',
                        'terms' => 'hasmarker',
                    ),
                ),
            );
        } else {

            $cttm_options_args = array(
                'post_type' => $post_types,
                'posts_per_page' => -1,
                'tax_query' => $tax_query,
                'tag' => $tags,
                'category_name' => $cats,
            );
        }
    }

    /**
     * Queries depending on shortcode parameters.
     */

    // If "centered on this" is set, we get two different queries, to be sure to include current post, even if the other arguments are not including current post:
    //   The first is our actual post to zoom on
    //   Second is our general query excluding current post
    //   Then we merge both into $cttm_query.
    if ($centered_on_this == true && $this_post == false && $current_query_markers != true) {
        //Get the single post to zoom on.
        $cttm_query_singlepost = new WP_Query($cttm_options_args);

        wp_reset_query();
        // We define the query arguments for the other posts, excluding $current_id
        $cttm_options_args_otherposts = array(
            'post_type' => $post_types,
            'post__not_in' => array($current_id),
            'posts_per_page' => -1,
            'tax_query' => $tax_query,
            'tag' => $tags,
            'category_name' => $cats,
        );

        //Get the other posts query
        $cttm_query_otherposts = new WP_Query($cttm_options_args_otherposts);

        //We create a new empty query object, and we merge our two previous query inside it.
        $cttm_query = new WP_Query();
        $cttm_query->posts = array_merge($cttm_query_singlepost->posts, $cttm_query_otherposts->posts);
        //Finally, we update post_count to loop inside our new query
        $cttm_query->post_count = $cttm_query_singlepost->post_count + $cttm_query_otherposts->post_count;
        wp_reset_query();
    } else {
        //If "Centered on this" is not set, query posts with our arguments
        $cttm_query = new WP_Query($cttm_options_args);
    }
    /**
     * Loop through our query, save all markers informations and send them to front-end
     */
    if (($cttm_query->have_posts())) {

        $cttm_posts = $cttm_query->posts;
        $i = 0;
        $popup_styles = explode(',', $cttm_options['popup_style']);

        foreach ($cttm_posts as $cttm_post) {
            // LOOP
            //for each posts get informations:
            //postdatas() is an array of the post thumbnail, url and title
            //latlngmarkerarr() is an array with only one value, a json array of markers' latitude, longitude and image url(<- or string "default"), boolean (multiplemarker true/false), custom title string, custom excerpt string, custom thumbnail string
            global $post;
            $post = get_post($cttm_post->ID);
            setup_postdata($post);

            $cttm_postdatas = array();
            $cttm_postdatas['thumb'] = in_array('thumbnail', $popup_styles) ? get_the_post_thumbnail_url($cttm_post->ID, "travelersmap-thumb") : '';
            $cttm_postdatas['url'] = get_permalink($cttm_post->ID);
            $cttm_postdatas['thetitle'] = in_array('title', $popup_styles) ? get_the_title($cttm_post->ID) : '';
            $cttm_postdatas['excerpt'] = in_array('excerpt', $popup_styles) ? get_the_excerpt($cttm_post->ID) : '';
            $cttm_postdatas['date'] = in_array('date', $popup_styles) ? get_the_date('Y-m-d H:i:s', $cttm_post->ID) : '';
            $latlngmarkerarr = get_post_meta($cttm_post->ID, '_latlngmarker');

            // If a custom thumbnail ID is defined, get the thumbnail url and replace it in the array
            $latlngmarkerarr_decoded = json_decode($latlngmarkerarr[0], true);

            if (isset($latlngmarkerarr_decoded['customthumbnail'])) {

                $cttm_thumbnail_id = intval($latlngmarkerarr_decoded['customthumbnail']);
                $latlngmarkerarr_decoded['customthumbnail'] = get_custom_thumbnail_url_with_id($cttm_thumbnail_id);

                //Do the same for multiple markers
                if ($latlngmarkerarr_decoded['multiplemarkers'] !== false) {
                    for ($index = 1; $index < $latlngmarkerarr_decoded['multiplemarkers']; $index++) {
                        $current_additional_marker = "additional_marker_" . $index;
                        $cttm_thumbnail_id = intval($latlngmarkerarr_decoded[$current_additional_marker]['customthumbnail']);
                        $latlngmarkerarr_decoded[$current_additional_marker]['customthumbnail'] = get_custom_thumbnail_url_with_id($cttm_thumbnail_id);
                    }
                }
            }

            $latlngmarkerarr[0] = json_encode($latlngmarkerarr_decoded);
            //Create the $cttm_metas array to store all the markers and posts informations. This will be send to our javascript file
            $cttm_metas[$i]['markerdatas'] = $latlngmarkerarr[0];
            $cttm_metas[$i]['postdatas'] = $cttm_postdatas;

            $i += 1;
            wp_reset_postdata();
        } //End foreach

    } else {
        //End If have_posts()
        $cttm_metas = 0;
    }

    //json_encode the array to send it to our javascript
    //htmlspecialchars to avoid errors with &quot; 
    $cttm_metas = htmlspecialchars(json_encode($cttm_metas));

    //Get global options from the setting page to show the map in front-end
    //cttm_options is an array
    $cttm_options_json = htmlspecialchars(json_encode($cttm_options));

    $id = uniqid();
    $containerid = "travelersmap-container-" . $id;

    //Create this shortcode options array to send to javascript
    $cttm_shortcode_options = array();
    $cttm_shortcode_options['id'] = $id;
    $cttm_shortcode_options['minzoom'] = $minzoom;
    $cttm_shortcode_options['maxzoom'] = $maxzoom;
    $cttm_shortcode_options['this_post'] = (string) $this_post;
    $cttm_shortcode_options['init_maxzoom'] = $init_maxzoom;
    $cttm_shortcode_options['centered_on_this'] = (string) $centered_on_this;
    $cttm_shortcode_options['open_link_in_new_tab'] = (string) $open_link_in_new_tab;
    $cttm_shortcode_options['disable_clustering'] = (string) $disable_clustering;
    $cttm_shortcode_options['max_cluster_radius'] = $max_cluster_radius;
    $cttm_shortcode_options['tileurl'] = (string) $tileurl;
    $cttm_shortcode_options['subdomains'] = (string) $subdomains;
    $cttm_shortcode_options['attribution'] = (string) $attribution;

    //Encode to Json
    $cttm_shortcode_options = json_encode($cttm_shortcode_options);

    //Create the array sent to Javascript
    $cttm_options_params = array(
        'cttm_options' => $cttm_options_json,
    );

    //Create the array with shortcode options
    ${"cttm_shortcode_$id"} = array(
        'cttm_metas' => $cttm_metas,
        'cttm_shortcode_options' => $cttm_shortcode_options,
    );

    //Send Json variables to our javascript file 'travelersmap.js'
    wp_localize_script('travelersmap', 'cttm_options_params', $cttm_options_params);
    wp_localize_script('travelersmap', 'cttm_shortcode_' . $id, ${"cttm_shortcode_$id"});
    if ($cttm_metas) {
        $cttm_output =   '<div id="' . $containerid . '" class="travelersmap-container" style="z-index: 1; min-height: 10px; min-width:10px; height:' . $height . ';width:' . $width . '; max-width:' . $maxwidth . '; max-height:' . $maxheight . '; position:relative;"><div style="position:absolute; z-index:-1;top: 50%;text-align: center;display: block;left: 50%;transform: translate(-50%,-50%);">Travelers\' Map is loading... <br> If you see this after your page is loaded completely, leafletJS files are missing.</div></div>';
    } else {
        $cttm_output =   '<div id="' . $containerid . '" class="travelersmap-container" style="z-index: 1; min-height: 10px; min-width:10px; height:' . $height . ';width:' . $width . '; max-width:' . $maxwidth . '; max-height:' . $maxheight . '; position:relative;"><div style="position:absolute; z-index:-1;top: 50%;text-align: center;display: block;left: 50%;transform: translate(-50%,-50%);">No markers found for this Travelers\' map. <br> Please add some markers to your posts before using this shortcode.</div></div>';
    }
    return $cttm_output;
}
// Get travelers map custom thumbnail with the image ID
// Return an empty string if no image is found
function get_custom_thumbnail_url_with_id($id)
{
    $url = wp_get_attachment_image_src($id, 'travelersmap-thumb');
    if ($url != false) {
        return $url[0];
    } else {
        return "";
    }
}
