<?php

/**
 * Enqueue styles for "new post" or "edit post" pages in administration
 */

add_action('admin_enqueue_scripts', 'cttm_styles_admin');

function cttm_styles_admin($hook)
{
    if ($hook != 'post.php' && $hook != 'post-new.php' && $hook != 'travelers-map_page_cttm_travelersmap_shortcode' && $hook != 'toplevel_page_cttm_travelersmap') {
        return;
    }

    wp_register_style('leaflet_css', plugins_url('css/leaflet.css', __FILE__));
    wp_register_style('leaflet_search_css', plugins_url('css/leaflet-search.css', __FILE__));
    wp_register_style('travelers_map_admin_css', plugins_url('css/travelers-map.admin.css', __FILE__));

    wp_enqueue_style('leaflet_css');
    wp_enqueue_style('leaflet_search_css');
    wp_enqueue_style('travelers_map_admin_css');
}

/**
 * Enqueue scripts for "new post" or "edit post" pages in administration
 */

add_action('admin_enqueue_scripts', 'cttm_scripts_admin', 10);

function cttm_scripts_admin($hook)
{

    wp_register_script('travelersmap_admin_notice', plugins_url('js/travelersmap-admin-notice.js', __FILE__), array('jquery'), false, true);
    wp_enqueue_script('travelersmap_admin_notice');

    if ($hook != 'post.php' && $hook != 'post-new.php' && $hook != 'travelers-map_page_cttm_travelersmap_shortcode' && $hook != 'toplevel_page_cttm_travelersmap') {
        return;
    }
    wp_register_script('leaflet', plugins_url('js/leaflet/leaflet.js', __FILE__));
    wp_register_script('leaflet_search', plugins_url('js/leaflet/leaflet-search.js', __FILE__));
    wp_enqueue_media();
    if ($hook != 'toplevel_page_cttm_travelersmap') {
        wp_register_script('travelersmap_admin', plugins_url('js/travelersmap.admin.js', __FILE__), array('jquery'), false, true);
    }
    //register travelersmap_admin.js in footer so wp_localize_script() works.
    wp_register_script('travelersmap_admin', plugins_url('js/travelersmap.admin.js', __FILE__), array(), false, true);

    wp_enqueue_script('leaflet');
    wp_enqueue_script('leaflet_search');

    wp_enqueue_script('travelersmap_admin');
}

/**
 * Send wp_options parameters to javascript
 */

//We set priority to 20 so it runs after script is enqueued
add_action('admin_enqueue_scripts', 'cttm_localize_script', 20);

function cttm_localize_script($hook)
{
    //Get options from the setting page
    //cttm_options is an array
    $cttm_options = json_encode(get_option('cttm_options'));

    //Create the array sent to Javascript
    $cttm_params = array(
        'cttm_options' => $cttm_options,
    );

    //Send Json array of all markers to our javascript file 'travelersmap.admin.js'
    wp_localize_script('travelersmap_admin', 'php_params', $cttm_params);
}

/**
 * Adds necessary meta boxes to the post editing screen
 * Lat/lng, Marker ID
 */

add_action('add_meta_boxes', 'cttm_add_custom_metaboxes');

function cttm_add_custom_metaboxes()
{
    $cttm_options = get_option('cttm_options');
    $posttypes = explode(',', $cttm_options['posttypes']);

    add_meta_box('LatLngMarker', __('Travelers\' Map - Add / edit your post marker', 'travelers-map'), 'cttm_meta_callback', $posttypes);
}

/**
 * Output metabox in "new/edit post" pages (and selected custom post types in plugin settings).
 * Display a leaflet map with leaflet-search.js for searching location.
 * Show existing markers to choose from, and a link to add new markers.
 * Display Lat/lng box for entering data manually (auto-complete when clicking on the map or searching a location)
 *
 */
function cttm_meta_callback($post)
{
    wp_nonce_field(basename(__FILE__), 'cttm_nonce');
    if (metadata_exists('post', $post->ID, '_latlngmarker')) {
        $cttm_stored_meta = get_post_meta($post->ID, '_latlngmarker', true);
        $marker_data_array = json_decode($cttm_stored_meta, true);
    }

    //Arguments for querying existing markers created by user
    $cttm_marker_query_args = array(
        'post_type' => 'cttm-marker',
        'posts_per_page' => 1,
        'nopaging' => true,
        'orderby' => 'ID',
        'order' => 'ASC',
    );
    //Query user's markers
    $the_markers_query = get_posts($cttm_marker_query_args);

?>
    <div id="form-copy-multimarker" style="display:none; visibility:hidden">
        <?php
        //Generate first marker form
        cttm_generate_marker_form_HTML("ReplaceWithID", $the_markers_query, null); ?>

    </div>
    <div class="row row-markers-edit">
        <div class="col-map-container">
            <h3>
                <strong><?php _e('Locate your marker on the map:', 'travelers-map'); ?></strong>
            </h3>
            <div id="travelersmap-container" style="min-height: 400px;width: 100%;"></div>
        </div>
        <?php
        //Generate first marker form
        cttm_generate_marker_form_HTML(0, $the_markers_query, $marker_data_array);

        // If multiple markers are set, loop through each and create a form
        if ($marker_data_array['multiplemarkers'] !== false) {
            for ($index = 1; $index < $marker_data_array['multiplemarkers']; $index++) {
                $current_additional_marker = "additional_marker_" . $index;
                cttm_generate_marker_form_HTML($index, $the_markers_query, $marker_data_array[$current_additional_marker]);
            }
        }
        ?>

        <div class="col-multimarkers-container">

            <h3><strong><?php _e('Multiple markers:', 'travelers-map'); ?></strong></h3>
            <div id="multimarkers-activated">
                <button id="btn-add-another-marker" type="button" class="components-button is-button is-default is-large is-secondary"><?php _e('Add an additional marker', 'travelers-map'); ?></button>
            </div>
        </div>
    </div>


<?php
}

function cttm_generate_marker_form_HTML($marker_number, $markers_query, $marker_data_array)
{
    //get all variables inside $marker_data_array :
    //$latitude, longitude, $markerdata, $customtitle, $customexcerpt, $customthumbnail
    $latitude = $marker_data_array['latitude'];
    $longitude = $marker_data_array['longitude'];
    $markerdata = $marker_data_array['markerdata'];
    $customtitle = $marker_data_array['customtitle'];
    $customexcerpt = $marker_data_array['customexcerpt'];
    $customthumbnail = $marker_data_array['customthumbnail'];
    $customanchor = $marker_data_array['customanchor'];

    $marker_url_cleaned = esc_url($markerdata[0]);
    $isContainerToCopy = $marker_number === "ReplaceWithID" ? true : false;
?>
    <div class="col-markers-container" data-marker-number="<?php echo $marker_number; ?>">
        <h3><strong><?php _e('Edit marker information', 'travelers-map'); ?></strong></h3>
        <p>
            <strong><?php _e('Choose marker image:', 'travelers-map'); ?></strong>

        </p>

        <div id="<?php echo ('cttm-markers-' . $marker_number); ?>" class="cttm-markers">
            <?php

            $markerchecked = false;

            foreach ($markers_query as $marker_post) {
                // For each marker, check if it was selected already and check it by default on page load.
                if (isset($marker_url_cleaned) && $marker_url_cleaned == get_the_post_thumbnail_url($marker_post)) {

                    $markerchecked = true;
                    if ($isContainerToCopy) {

                        echo '<label><input type="radio" name="RemoveWhenCopiedmarker[' . $marker_number . ']" value="' . $marker_post->ID . '" checked="checked">';
                    } else {
                        echo '<label><input type="radio" name="marker[' . $marker_number . ']" value="' . $marker_post->ID . '" checked="checked">';
                    }
                } else {
                    if ($isContainerToCopy) {

                        echo '<label><input type="radio" name="RemoveWhenCopiedmarker[' . $marker_number . ']" value="' . $marker_post->ID . '" >';
                    } else {
                        echo '<label><input type="radio" name="marker[' . $marker_number . ']" value="' . $marker_post->ID . '" >';
                    }
                }
                echo '<img src="' . get_the_post_thumbnail_url($marker_post) . '"></label>';
            }
            ?>
            <label>
                <?php
                // If no marker was selected already, check default marker by default
                if ($markerchecked == false) {
                    if ($isContainerToCopy) {

                        echo '<input type="radio" name="RemoveWhenCopiedmarker[' . $marker_number . ']" value="default" checked="checked">';
                    } else {
                        echo '<input type="radio" name="marker[' . $marker_number . ']" value="default" checked="checked">';
                    }
                } else {
                    if ($isContainerToCopy) {

                        echo '<input type="radio" name="RemoveWhenCopiedmarker[' . $marker_number . ']" value="default">';
                    } else {
                        echo '<input type="radio" name="marker[' . $marker_number . ']" value="default">';
                    }
                } ?>
                <img src="<?php echo (plugins_url('images/marker-icon.png', __FILE__)) ?>">
            </label>


        </div>
        <div class="cttm-custom-flexcontainer">
            <label for="<?php echo ('cttm-latfield-' . $marker_number); ?>" class="cttm-label"><?php _e('Latitude', 'travelers-map'); ?></label>
            <input id="<?php echo ('cttm-latfield-' . $marker_number); ?>" type="number" name="<?php if ($isContainerToCopy) {

                                                                                                    echo 'RemoveWhenCopiedlatitude[]';
                                                                                                } else {
                                                                                                    echo 'latitude[]';
                                                                                                } ?> " step="0.00001" max="90" min="-90" value="<?php if (isset($latitude)) {
                                                                                                                                                    echo $latitude;
                                                                                                                                                }
                                                                                                                                                ?>" />
        </div>
        <div class="cttm-custom-flexcontainer">
            <label for="<?php echo ('cttm-longitude-' . $marker_number); ?>" class="cttm-label"><?php _e('Longitude', 'travelers-map'); ?></label>
            <input id="<?php echo ('cttm-longitude-' . $marker_number); ?>" type="number" name="<?php if ($isContainerToCopy) {

                                                                                                    echo 'RemoveWhenCopiedlongitude[]';
                                                                                                } else {
                                                                                                    echo 'longitude[]';
                                                                                                } ?> " step="0.00001" value="<?php if (isset($longitude)) {
                                                                                                                                    echo $longitude;
                                                                                                                                }
                                                                                                                                ?>" />
        </div>

        <div class="customize-popover-container">
            <button type="button" class="customize-popover-title components-button is-secondary is-button" title="Open popover customizer section"><?php _e('Edit information displayed in popover', 'travelers-map'); ?></button>
            <div class="customize-popover-content">
                <div class="cttm-custom-flexcontainer">
                    <label id="<?php echo ('cttm-customtitle-label-' . $marker_number); ?>" for="<?php echo ('cttm-customtitle-' . $marker_number); ?>" class="cttm-label"> <?php _e('Post title', 'travelers-map'); ?></label>
                    <input id="<?php echo ('cttm-customtitle-' . $marker_number); ?>" class="cttm-input" name="<?php if ($isContainerToCopy) {

                                                                                                                    echo 'RemoveWhenCopiedcustomtitle[]';
                                                                                                                } else {
                                                                                                                    echo 'customtitle[]';
                                                                                                                } ?>" type="text" value="<?php if (isset($customtitle)) {
                                                                                                                                                echo $customtitle;
                                                                                                                                            }
                                                                                                                                            ?>"> <br>
                </div>
                <div class="cttm-custom-flexcontainer">
                    <label id="<?php echo ('cttm-customexcerpt-label-' . $marker_number); ?>" for="<?php echo ('cttm-customexcerpt-' . $marker_number); ?>" class="cttm-label"> <?php _e('Post excerpt', 'travelers-map'); ?></label>
                    <textarea class="cttm-textarea" id="<?php echo ('cttm-customexcerpt-' . $marker_number); ?>" name="<?php if ($isContainerToCopy) {

                                                                                                                            echo 'RemoveWhenCopiedcustomexcerpt[]';
                                                                                                                        } else {
                                                                                                                            echo 'customexcerpt[]';
                                                                                                                        } ?>" type="text"><?php if (isset($customexcerpt)) {
                                                                                                                                                echo $customexcerpt;
                                                                                                                                            }
                                                                                                                                            ?></textarea><br>
                </div>
                <div class="cttm-custom-flexcontainer cttm-custom-flexcontainer--anchor">
                    <div class="cttm-anchor-label-container"> <label id="<?php echo ('cttm-customanchor-label-' . $marker_number); ?>" for="<?php echo ('cttm-customanchor-' . $marker_number); ?>" class="cttm-label"> <?php _e('Link anchor (#id)', 'travelers-map'); ?> </label><a href="#" target="_blank" class="description"><?php _e('What is this?', 'travelers-map'); ?></a></div>
                    <div class="cttm-anchor-input-container"> <input id="<?php echo ('cttm-customanchor-' . $marker_number); ?>" class="cttm-input cttm-input-anchor" name="<?php if ($isContainerToCopy) {

                                                                                                                                                                                echo 'RemoveWhenCopiedcustomanchor[]';
                                                                                                                                                                            } else {
                                                                                                                                                                                echo 'customanchor[]';
                                                                                                                                                                            } ?>" type="text" value="<?php if (isset($customanchor)) {
                                                                                            echo $customanchor;
                                                                                        }
                                                                                        ?>">
                        <p class="anchor-before">#</p>
                    </div>
                </div>
                <div class="cttm-custom-flexcontainer">
                    <label class="cttm-label"> <?php _e('Post thumbnail', 'travelers-map'); ?></label>
                    <?php
                    //This code was taken from the WP media codex page : https://codex.wordpress.org/Javascript_Reference/wp.media
                    global $post;
                    if (isset($customthumbnail)) {
                        // See if there's a media id already saved as post meta
                        $your_img_id = intval($customthumbnail);
                    } else {
                        $your_img_id = "";
                    }
                    // Get the image src
                    $your_img_src = wp_get_attachment_image_src($your_img_id, 'travelersmap-thumb');
                    // For convenience, see if the array is valid
                    $you_have_img = is_array($your_img_src);
                    ?>
                    <!-- Your image container, which can be manipulated with js -->
                    <?php if ($you_have_img) : ?>
                        <div id="<?php echo ('cttm-custom-thumb-container-' . $marker_number); ?>" class="cttm-custom-thumb-container">
                            <img src="<?php echo $your_img_src[0] ?>" alt="" style="max-width:300px; width:100%;" class="cttm-custom-thumb-el" />
                            <div class="delete-custom-thumb-container">
                                <button type="button" class="delete-custom-img components-button is-link is-destructive">
                                    <?php _e('Remove this thumbnail', 'travelers-map'); ?>
                                </button>
                            </div>
                        </div>
                        <div id="<?php echo ('cttm-custom-thumb-link-container-' . $marker_number); ?>" class="cttm-custom-thumb-container cttm-custom-thumb-link-container hidden">
                            <button class="upload-custom-img" type="button">
                                <?php _e('Set thumbnail', 'travelers-map'); ?>
                            </button>
                        </div>
                    <?php else : ?>
                        <div id="<?php echo ('cttm-custom-thumb-container-' . $marker_number); ?>" class="cttm-custom-thumb-container hidden">
                            <div class="delete-custom-thumb-container">
                                <button type="button" class="delete-custom-img components-button is-link is-destructive">
                                    <?php _e('Remove this marker thumbnail', 'travelers-map'); ?>
                                </button>
                            </div>
                        </div>
                        <div id="<?php echo ('cttm-custom-thumb-link-container-' . $marker_number); ?>" class="cttm-custom-thumb-container cttm-custom-thumb-link-container">
                            <button class="upload-custom-img" type="button">
                                <?php _e('Set custom marker thumbnail', 'travelers-map'); ?>
                            </button>
                        </div>
                    <?php endif; ?>


                    <!-- A hidden input to set and post the chosen image id -->
                    <input id="<?php echo ('cttm-customthumbnail-' . $marker_number); ?>" class="custom-img-id" name="<?php if ($isContainerToCopy) {

                                                                                                                            echo 'RemoveWhenCopiedcustomthumbnail[]';
                                                                                                                        } else {
                                                                                                                            echo 'customthumbnail[]';
                                                                                                                        } ?>" type="hidden" value="<?php echo esc_attr($your_img_id); ?>" />
                </div>
            </div>





        </div>
        <button id="<?php echo ('btn-delete-current-marker-' . $marker_number); ?>" type="button" class="components-button is-button is-destructive cttm-delete-marker" title="<?php _e('Delete this marker', 'travelers-map'); ?>"><?php _e('Delete', 'travelers-map'); ?></button>
    </div>
<?php } // cttm_generate_marker_form_HTML()

//Hook cttm_meta_save function only to chosen post_type in plugin settings, using this hook : save_post_{post-type}, WP 3.7 minimum
//Loop through each selected post_type and add action to them
$cttm_options = get_option('cttm_options');
$posttypes = explode(',', $cttm_options['posttypes']);

foreach ($posttypes as $posttype) {
    $cttm_action_string = 'save_post_' . $posttype;
    add_action($cttm_action_string, 'cttm_meta_save');
}

/**
 * Saves the custom meta input sent by the form
 * This function is doing the following :
 * 1 - Security checks, if something is off, abort
 * 2 - Check every values sent, if something necessary (lat/long/markerURL) is missing, delete existing values and abort
 * 3 - Get all values (latitude, longitude, and marker img URL, width and height) sanitized and compacted in one json array, for database query speed.
 * 4 - Save json array to database
 * 5 - Set current post "hasmarker" term in our private taxonomy 'cttm-markers-tax', so we can easily query every post with a marker without any speed problem. (querying posts by multiple meta-datas can be really slow in Wordpress)
 */
function cttm_meta_save($post_id)
{
    //Don't run on  Wordpress autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    //Nonce check for security
    if (!(isset($_POST['cttm_nonce']) && wp_verify_nonce($_POST['cttm_nonce'], basename(__FILE__)))) {
        return;
    }

    //Abort if no marker is set
    if (!is_array($_POST['marker'])) {
        return;
    }

    $number_of_markers = count($_POST['marker']);


    if ($number_of_markers === 1) {
        $marker_data_array = cttm_get_sanitized_markerdata_array($post_id, 0, $number_of_markers);

        if (!$marker_data_array) {
            return;
        }
        $markers_json_array = cttm_json_encode_markers($marker_data_array);
    }
    if ($number_of_markers > 1) {
        $markers_data_array = cttm_get_sanitized_markerdata_array($post_id, 0, $number_of_markers);


        $number_of_validated_markers = $number_of_markers;

        for ($index = 1, $marker_index = 1; $index < $number_of_markers; $index++) {

            $current_marker_data_array = cttm_get_sanitized_markerdata_array($post_id, $index, $number_of_markers);
            if ($current_marker_data_array) {
                $keyname = "additional_marker_" . $marker_index;
                $markers_data_array[$keyname] = $current_marker_data_array;
                $marker_index++;
            } else {
                $number_of_validated_markers--;
            }
        }
        if ($number_of_validated_markers !== $number_of_markers) {
            $markers_data_array = cttm_update_multiplemarkers_in_array($number_of_validated_markers, $markers_data_array);
        }
        $markers_json_array = cttm_json_encode_markers($markers_data_array);
    }

    cttm_update_postmeta_and_privatetax($post_id, $markers_json_array);
}

function cttm_get_sanitized_markerdata_array($post_id, $index, $number_of_markers)
{
    // If Latitude & Longitude input are missing or are not valid numbers, delete existing post_meta and terms in private taxonomy, and abort
    if (!cttm_validate_latlong($_POST['latitude'][$index], $_POST['longitude'][$index])) {
        cttm_delete_marker_from_database(($post_id));
        return false;
    }

    $markerdata = cttm_get_markerdata($_POST['marker'][$index]);

    if (!$markerdata) {
        return false;
    }

    $customtitle = sanitize_text_field($_POST['customtitle'][$index]);
    $customexcerpt = cttm_purify_html($_POST['customexcerpt'][$index]);
    $customanchorfirstword = explode(" ",$_POST['customanchor'][$index])[0];
    //Remove http:// automatically added by esc_url_raw()
    $customanchor = str_replace(["http://", "https://"], "", esc_url_raw($customanchorfirstword)); 
    $customthumbnail = cttm_sanitize_thumbnail_id($_POST['customthumbnail'][$index]);
    $latitude = cttm_float_to_string($_POST['latitude'][$index]);
    $longitude = cttm_float_to_string($_POST['longitude'][$index]);

    if ($index > 0) {
        return compact('latitude', 'longitude', 'markerdata', 'customtitle', 'customexcerpt', 'customthumbnail', 'customanchor');
    }

    if ($number_of_markers === 1) {
        $multiplemarkers = false;
    } else {
        $multiplemarkers = $number_of_markers;
    }
    return compact('latitude', 'longitude', 'markerdata', 'multiplemarkers', 'customtitle', 'customexcerpt', 'customthumbnail', 'customanchor');
}
function cttm_update_multiplemarkers_in_array($number_of_markers, $markers_data_array)
{
    if ($number_of_markers === 1) {
        $multiplemarkers = false;
    } else {
        $multiplemarkers = $number_of_markers;
    }
    $markers_data_array['multiplemarkers'] = $multiplemarkers;
    return $markers_data_array;
}
function cttm_validate_latlong($latitude, $longitude)
{
    if (!is_numeric($latitude) || !is_numeric($longitude) || abs($latitude > 90) || abs($longitude) > 180) {
        return false;
    }

    return true;
}
function cttm_purify_html($string)
{
    if ($string != "") {
        //In order to sanitize attribution without removing html code, we load HTMLPurifier http://htmlpurifier.org/
        require_once plugin_dir_path(__FILE__) . '/HTMLPurifier/HTMLPurifier.auto.php';
        $config = HTMLPurifier_Config::createDefault();
        $purifier = new HTMLPurifier($config);
        return $purifier->purify($string);
    }
    return $string;
}
function cttm_sanitize_thumbnail_id($thumbnail_id)
{
    if (!is_numeric($thumbnail_id)) {
        return "";
    }
    return $thumbnail_id;
}
function cttm_get_markerdata($marker)
{
    //If marker is default, sanitize and store in $markerdata
    if ($marker == 'default') {
        return sanitize_text_field($marker);
    }
    if (!is_numeric($marker) || get_post_type($marker) != 'cttm-marker') {
        //else if '$_POST[ 'marker' ]' (post_id) is non-numeric and if it's post type is not 'cttm-marker', abort
        return false;
    }
    //If a custom marker is selected,
    //Get marker thumbnail URL, Width and Height
    //$markerdata[0] : Image URL
    //$markerdata[1] : Image Width
    //$markerdata[2] : Image Height
    $markerimg = wp_get_attachment_image_src(get_post_thumbnail_id($marker), "full");
    $markerdata[] = esc_url_raw($markerimg[0]);
    $markerdata[] = absint($markerimg[1]);
    $markerdata[] = absint($markerimg[2]);
    return $markerdata;
}
function cttm_delete_marker_from_database($post_id)
{
    delete_post_meta($post_id, '_latlngmarker');
    // if term hasmarker is set, remove it.
    if (has_term('hasmarker', 'cttm-markers-tax', $post_id)) {
        wp_remove_object_terms($post_id, 'hasmarker', 'cttm-markers-tax');
    }
}

function cttm_update_postmeta_and_privatetax($post_id, $markers_json_array)
{

    if ($markers_json_array != null) {
        // Update post meta
        update_post_meta($post_id, '_latlngmarker', $markers_json_array);
        // add terms in private taxonomy
        wp_set_post_terms($post_id, 'hasmarker', 'cttm-markers-tax', false);
        return true;
    }
    return false;
}

/**
 * Transform markers array into json.
 */
function cttm_json_encode_markers($markers_array)
{
    // json_encode second parameter is here to prevent custom title and excerpt from breaking the map and accented characters.
    return json_encode($markers_array, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_APOS);
}
/**
 * Sanitize float without displaying scientific notation when using a decimal
 */
function cttm_float_to_string($val)
{
    preg_match("#^([\+\-]|)([0-9]*)(\.([0-9]*?)|)(0*)$#", trim($val), $o);
    return $o[1] . sprintf('%d', $o[2]) . ($o[3] != '.' ? $o[3] : '');
}
/**
 * Little function for debugging and development.
 * Console log data into the browsers console instead of var_dumping.
 */
function console_log($data)
{
    echo '<script>';
    echo 'console.log(' . json_encode($data) . ')';
    echo '</script>';
}
