<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Add the administration page and insert settings form
 */

//Add the admin options page
add_action('admin_menu', 'cttm_add_page', 9);
function cttm_add_page()
{
    add_menu_page("Travelers' Map", "Travelers' Map", "manage_options", "cttm_travelersmap", 'cttm_options_page', 'dashicons-admin-site-alt');
    add_submenu_page("cttm_travelersmap", __('Settings', 'travelers-map'), __('Settings', 'travelers-map'), 'manage_options', "cttm_travelersmap", 'cttm_options_page');
}

//Draw the options page
function cttm_options_page()
{
?>
    <div class="wrap">
        <h1>Travelers' Map
            <?php
            $cttm_data = get_plugin_data(plugin_dir_path(__FILE__) . 'travelers-map.php', false, false);
            echo "<small>| " . __('version', 'travelers-map') . " " . $cttm_data['Version'] . "</small>";
            ?>
        </h1>
        <div class="row">
            <p class="col-xl-9">
                <small><?php _e('Do you want to make Travelers\' Map better? All the updates are based on community feedbacks!', 'travelers-map'); ?>
                    <br>
                    <?php printf(__('Do not hesitate to <a href="%1$s" target="_blank">rate this plugin and give me some feedbacks</a>.', 'travelers-map'), 'https://wordpress.org/plugins/travelers-map/#reviews'); ?>
                </small>
            </p>
            <div class="col-xl-3">
                <p style="margin: 0 0 1em;"><strong style="padding-right:5px; "><?php _e('Support this free plugin:', 'travelers-map'); ?></strong>

                    <a href="https://www.paypal.me/CamilleVerrier" class="cttm-donate-button" title="Donate on PayPal"><?php _e('Donate', 'travelers-map'); ?>
                        <svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="11.8">
                            <style>
                                .st0 {
                                    fill: #fff
                                }
                            </style>
                            <path class="st0" d="M0 4.2V11c0 .5.4.8.8.8h2.5V3.4H.8c-.4 0-.8.3-.8.8zM11.9 4.2H9.4c-.2 0-.3-.1-.3-.2s-.1-.2 0-.4L9.9 2c.2-.3.2-.8.1-1.1-.2-.4-.5-.6-.9-.7L8.5 0c-.1 0-.3 0-.4.1L4.8 3.9c-.4.4-.6.9-.6 1.4v4.4c0 1.2.9 2.1 2.1 2.1h4.2c.9 0 1.8-.6 2-1.5l.9-4.1v-.4c.1-.9-.6-1.6-1.5-1.6z" />
                        </svg>

                    </a>
                </p>
            </div>
        </div>
        <hr>
        <p><strong><?php _e('Need some help setting up this plugin?', 'travelers-map'); ?> </strong><br>
            <?php printf(__('Please check the <a href="%1$s" target="_blank">"Get Started" tutorial</a> on my blog.', 'travelers-map'), 'https://camilles-travels.com/get-started-with-travelers-map-wordpress-plugin/'); ?>
            <br> </p>
        <hr>


        <form action="options.php" method="post">

            <?php
            settings_fields('cttm_options');
            do_settings_sections('cttm_travelersmap'); ?>
            <input type="submit" name="Submit" value="<?php _e('Save Changes', 'travelers-map'); ?>" class="button button-primary" style="margin:30px 0">
            <input type="submit" name="Reset" value="<?php _e('Reset settings to default', 'travelers-map'); ?>" class="button button-secondary" style="margin:30px 0" onclick="return confirm('<?php _e('Are you sure you wish to reset settings to default? Current settings will be deleted.', 'travelers-map'); ?>');">
            <hr style="margin:30px 0">


            <?php
            /*////////////// MULTILINGUAL PLUGIN SETTINGS //////////////*/

            //Polylang setting
            if (function_exists('pll_default_language')) {
                $default_language = pll_default_language('name');
                printf('<h2>' . __('Polylang - Synchronise markers from default language posts (%s) to other languages', 'travelers-map') . '</h2>', $default_language);
                printf('<p>' . __('Press the button below to copy every marker from default language posts (%s) to their translations:', 'travelers-map') . '<br></p>', $default_language);
                echo '<input type="submit" name="polylangsync" value="' . __('Synchronise markers', 'travelers-map') . '" class="button" onclick="return confirm(\'' . __('You are about to copy every marker from posts in the default language (set in Polylang settings) and set them to their translated posts in every other languages.', 'travelers-map') . '\')" >';

                echo '<hr style="margin:30px 0">';
            }

            //WPML setting
            if (has_filter('wpml_default_language')) {
                $default_language = apply_filters('wpml_default_language', null);
                printf('<h2>' . __('WPML - Synchronise markers from default language posts (%s) to other languages', 'travelers-map') . '</h2>', $default_language);
                printf('<p>' . __('Press the button below to copy every marker from default language posts (%s) to their translations:', 'travelers-map') . '<br></p>', $default_language);
                echo '<input type="submit" name="wpmlsync" value="' . __('Synchronise markers', 'travelers-map') . '" class="button" onclick="return confirm(\'' . __('You are about to copy every marker from posts in the default language (set in WPML settings) and set them to their translated posts in every other languages.', 'travelers-map') . '\')" >';

                echo '<hr style="margin:30px 0">';
            }

            ?>
            <h2><?php _e('Clean database - Delete all geolocalisation data and markers', 'travelers-map'); ?></h2>
            <p><?php _e('This button cleans every geolocalisation meta-data added to your posts and every custom markers added.', 'travelers-map'); ?><br>
                <strong><?php _e('Please understand this is irreversible.', 'travelers-map'); ?></strong><br></p>
            <input type="submit" name="Delete" value="<?php _e('Delete all plugin data in database', 'travelers-map'); ?>" style="background:#e64949;border-color:#c91c1c;box-shadow: 0 1px 0 #831212;color: #fff;text-decoration: none;text-shadow: 0 -1px 1px #990b00,1px 0 1px #c50e0e,0 1px 1px #990500,-1px 0 1px #900;" class="button" onclick="return confirm('<?php _e('Are you sure you wish to delete every geolocalisation data and custom markers in your database? This action is irreversible.', 'travelers-map'); ?>');">
            <p class="description"><br><?php _e('To prevent unintentional loss of data, this is how Travelers\' Map works:', 'travelers-map'); ?> <br>
                - <?php _e('Upon deactivation, every data (geolocalisation meta-data and settings) is kept. ', 'travelers-map'); ?> <br>
                - <?php _e('When uninstalling, above settings are deleted from database while geolocalisation data are kept. ', 'travelers-map'); ?><br>
            </p>

            <hr style="margin:30px 0">


        </form>
    </div>
<?php
}

add_action('admin_init', 'cttm_admin_init');
function cttm_admin_init()
{
    //Register new setting "cttm_options" in database (array).
    register_setting('cttm_options', 'cttm_options', 'cttm_validate_option');

    //add Travelers Map main settings section
    add_settings_section('main-config', __('Plugin main settings', 'travelers-map'), 'cttm_main_section_html', 'cttm_travelersmap');
    //add every setting field to our section
    add_settings_field('set-post-types', __('Activate Travelers\' Map on:', 'travelers-map'), 'cttm_posttypes_html', 'cttm_travelersmap', 'main-config');

    //add map tiles settings section
    add_settings_section('map-data-config', __('Map settings', 'travelers-map'), 'cttm_map_section_html', 'cttm_travelersmap');
    //add every setting field to our section
    add_settings_field('tileurl', __('Tiles Server URL', 'travelers-map'), 'cttm_tileurl_html', 'cttm_travelersmap', 'map-data-config');
    add_settings_field('subdomains', __('Tiles Server sub-domains', 'travelers-map'), 'cttm_subdomains_html', 'cttm_travelersmap', 'map-data-config');
    add_settings_field('attribution', __('Attribution', 'travelers-map'), 'cttm_attribution_html', 'cttm_travelersmap', 'map-data-config');
    add_settings_field('search_field', __('Enable search module in frontend', 'travelers-map'), 'cttm_searchfield_html', 'cttm_travelersmap', 'map-data-config');
    add_settings_field('fullscreen_button', __('Enable fullscreen button in frontend', 'travelers-map'), 'cttm_fullscreenbutton_html', 'cttm_travelersmap', 'map-data-config');
    add_settings_field('onefinger_disable', __('Disable one-finger touch event on touch devices (BETA)', 'travelers-map'), 'cttm_onefinger_html', 'cttm_travelersmap', 'map-data-config');

    //add popup settings section
    add_settings_section('popup-config', __('Popup settings', 'travelers-map'), 'cttm_popup_section_html', 'cttm_travelersmap');

    add_settings_field('popup_style', __('Popup style', 'travelers-map'), 'cttm_popupstyle_html', 'cttm_travelersmap', 'popup-config');
    add_settings_field('popup_css', __('Disable popup CSS', 'travelers-map'), 'cttm_popupcss_html', 'cttm_travelersmap', 'popup-config');
}

//Unused section header functions (mandatory)
function cttm_main_section_html()
{
};
function cttm_map_section_html()
{
};
function cttm_popup_section_html()
{
};

function cttm_posttypes_html()
{
    //get option array from database
    $options = get_option('cttm_options');

    //get checked post types string and transform it into an array
    $posttypes = explode(',', $options["posttypes"]);
    //get all public registered post types
    $registered_posttypes = get_post_types(['public' => true], 'objects');

    //Add a checkbox for each registered post type, and check it if already checked in options.
    foreach ($registered_posttypes as $registered_posttype) {
        if ($registered_posttype->name != 'attachment') {

            echo '<label style="margin-right:20px;"><input type="checkbox" name="cttm_options[posttypes_' . $registered_posttype->name . ']" value="' . $registered_posttype->name . '" ' . checked(in_array($registered_posttype->name, $posttypes), true, false) . '>' . $registered_posttype->labels->singular_name . '</label>';
        }
    }

    echo '<p class="description">' . __('By default, Travelers\' Map is activated on posts only. You can also activate the plugin on pages and custom post types.', 'travelers-map') . '<br></p>';
}

function cttm_tileurl_html()
{
    //get option array from database
    $options = get_option('cttm_options');
    $tileurl = $options["tileurl"];
    echo '<input id="tileurl" name="cttm_options[tileurl]" type="text" value="' . $tileurl . '" style="width: 100%;max-width:600px" />';
    echo '<div class="helptext"><br>';
    printf(__(' You can find a list of free tile providers <a href="%1$s" target="_blank">here</a>.', 'travelers-map'), 'http://leaflet-extras.github.io/leaflet-providers/preview/');
    echo '<p class="description">' . __('If your tile provider require an API key, please insert it directly as explained on their website. ', 'travelers-map') . '<br>

        ' . __('Exemple (thunderforest.com):', 'travelers-map') . ' <code>https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey={apikey}</code></p></div><br>';
}

function cttm_subdomains_html()
{
    //get option array from database
    $options = get_option('cttm_options');
    $subdomains = $options["subdomains"];
    echo '<input id="subdomains" name="cttm_options[subdomains]" type="text" value="' . $subdomains . '" style="width: 150px;" />';
    echo '<div class="helptext"><br>' . __('In this plugin, default is <code>abcd</code> because we use CartoDB.', 'travelers-map') . ' <br>' . __('However the most common subdomain is <code>abc</code>, you can find the information on your provider\'s website.', 'travelers-map') . '<br>
        <p class="description">';
    printf(__(' If you use the <a href="%1$s" target="_blank">free tile providers list</a>, subdomains are displayed when different from "abc".', 'travelers-map'), 'http://leaflet-extras.github.io/leaflet-providers/preview/');
    echo '</p><br>';
}

function cttm_attribution_html()
{
    //get option array from database
    $options = get_option('cttm_options');
    $attribution = $options["attribution"];

    echo '<script type="text/javascript" charset="utf-8">function cttmGetAttri(e){
        document.getElementById(\'attribution-code\').innerHTML=e.value;
    }</script>';
    echo '<textarea id="attribution" name="cttm_options[attribution]" oninput="cttmGetAttri(this)" style="width: 100%;max-width:800px;" />';

    echo $attribution;
    echo '</textarea>';
    echo '<div class="helptext"><br>' . __('Preview:', 'travelers-map') . ' <code id="attribution-code">' . $attribution . '</code>';
    echo '<br><br>' . __('Attribution is shown to the lower right of the map. It is necessary to give credit to the Openstreetmap datas and your tile provider. ', 'travelers-map') . '<br>

        <p class="description">' . __('It is not necessary, but you can support this plugin by adding: ', 'travelers-map') . '<code> | Built with &lt;a href="https://wordpress.org/plugins/travelers-map/" target="_blank"&gt;Travelers\' Map&lt;/a&gt;</code> </p>';
    echo "<br>";
}

function cttm_searchfield_html()
{
    $options = get_option('cttm_options');

    $search_field = $options["search_field"];

    echo '<label><input type="checkbox" name="cttm_options[search_field]" value="1" ' . checked($search_field, 1, false) . '> ' . __('Check this box to add a search module on your dynamic maps.', 'travelers-map') . '</label> <br><span class="description" style="margin-top:5px; display:block">' . __('The search box will show up on the top left corner of each map. ', 'travelers-map') . '</span>';
}
function cttm_fullscreenbutton_html()
{
    $options = get_option('cttm_options');

    $search_field = $options["fullscreen_button"];

    echo '<label><input type="checkbox" name="cttm_options[fullscreen_button]" value="1" ' . checked($search_field, 1, false) . '> ' . __('Check this box to add a fullscreen button to your dynamic maps.', 'travelers-map') . '</label> <br><span class="description" style="margin-top:5px; display:block">' . __('The fullscreen button will show up on the top right corner of each map. ', 'travelers-map') . '</span>';
}
function cttm_onefinger_html()
{
    $options = get_option('cttm_options');

    $onefinger = $options["onefinger"];

    echo '<label><input type="checkbox" name="cttm_options[onefinger]" value="1" ' . checked($onefinger, 1, false) . '> ' . __('Check this box to disable one-finger events on touch devices. ', 'travelers-map') . '</label> <br><span class="description" style="margin-top:5px; display:block">' . __('User needs to use two fingers to move or zoom the map. ', 'travelers-map') . '</span>';
}

function cttm_popupstyle_html()
{
    $options = get_option('cttm_options');
    $popup_style = $options["popup_style"];

    echo '<span  style="margin:5px 0 20px; display:block">' . __('Choose the content shown in popovers and their style: ', 'travelers-map') . '</span>';
    echo '<label style="display:inline-block;margin:0 0 10px 10px;background:#fff; padding:10px; box-shadow: #d1d1d1 0px 0px 4px;"><div style="text-align:center; font-weight:bold;  "><input type="radio" name="cttm_options[popup_style]" value="img_title" ' . checked($popup_style, "img_title", false) . '>' . __('Title and thumbnail (default)', 'travelers-map') . '</div><img src="' . plugins_url('includes\admin\images\img_title.png', __FILE__) . '"></label>';
    echo '<label style="display:inline-block;margin:0 0 10px 10px;background:#fff; padding:10px; box-shadow: #d1d1d1 0px 0px 4px;"><div style="text-align:center; font-weight:bold;  "><input type="radio" name="cttm_options[popup_style]" value="img_title_descr" ' . checked($popup_style, "img_title_descr", false) . '>' . __('Title, thumbnail and excerpt', 'travelers-map') . ' </div><img src="' . plugins_url('includes\admin\images\img_title_excerpt.png', __FILE__) . '"></label>';
    echo '<label style="display:inline-block;margin:0 0 10px 10px;background:#fff; padding:10px 10px 0; box-shadow: #d1d1d1 0px 0px 4px;"><div style="text-align:center; font-weight:bold; margin-bottom:10px; "><input type="radio" name="cttm_options[popup_style]" value="title_descr" ' . checked($popup_style, "title_descr", false) . '>' . __('Title and excerpt', 'travelers-map') . '</div><img src="' . plugins_url('includes\admin\images\title_excerpt.png', __FILE__) . '"></label>';
}

function cttm_popupcss_html()
{
    $options = get_option('cttm_options');

    $popup_css = $options["popup_css"];

    echo '<label><input type="checkbox" name="cttm_options[popup_css]" value="1" ' . checked($popup_css, 1, false) . '> ' . __('Check this box to disable Travelers\' Map popovers CSS. ', 'travelers-map') . '</label> <br><span class="description" style="margin-top:5px; display:block">' . __('Leaflet default CSS is still loaded. Please note that only the content chosen above is loaded. ', 'travelers-map') . '</span>';
}

function cttm_validate_option($input)
{

    //In order to sanitize attribution without removing html code, we load HTMLPurifier http://htmlpurifier.org/
    require_once plugin_dir_path(__FILE__) . 'includes/admin/HTMLPurifier/HTMLPurifier.auto.php';
    $config = HTMLPurifier_Config::createDefault();
    $purifier = new HTMLPurifier($config);

    //If Save Changes button is clicked
    if (isset($_POST['Submit'])) {

        $input['posttypes'] = '';

        //Loop through each $_POST variable, check if it begins with 'posttypes_'.
        //If so, add it to the $input['posttypes'] array
        foreach ($_POST['cttm_options'] as $key => $value) {
            if (strpos($key, 'posttypes_') === 0) {
                $input['posttypes'] .= ',' . $value;
                //remove unecessary keys in cttm_options
                unset($input[$key]);
            }
        }
        //Sanitize every option before returning the values
        $input['posttypes'] = cttm_sanitize_post_types($input['posttypes']);
        $input['tileurl'] = sanitize_text_field($input['tileurl']);
        $input['subdomains'] = sanitize_text_field($input['subdomains']);
        $input['attribution'] = $purifier->purify($input['attribution']);
        $input['popup_style'] = sanitize_key($input['popup_style']);

        if (isset($input['popup_css'])) {
            $input['popup_css'] = intval($input['popup_css']);
        } else {
            $input['popup_css'] = 0;
        }

        if (isset($input['search_field'])) {
            $input['search_field'] = intval($input['search_field']);
        } else {
            $input['search_field'] = 0;
        }
        if (isset($input['fullscreen_button'])) {
            $input['fullscreen_button'] = intval($input['fullscreen_button']);
        } else {
            $input['fullscreen_button'] = 0;
        }
        if (isset($input['onefinger'])) {
            $input['onefinger'] = intval($input['onefinger']);
        } else {
            $input['onefinger'] = 0;
        }

        return $input;
    }

    //If Reset to default is clicked
    else if (isset($_POST['Reset'])) {
        $cttm_options_default = array(
            'posttypes' => 'post',
            'tileurl' => 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
            'subdomains' => 'abcd',
            'attribution' => '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors and &copy; <a href="https://carto.com/attributions">CARTO</a>',
            'popup_style' => 'img_title',
            'popup_css' => 0,
            'search_field' => 0,
            'fullscreen_button' => 0,
            'onefinger' => 0,
        );
        $input['posttypes'] = $cttm_options_default['posttypes'];
        $input['tileurl'] = sanitize_text_field($cttm_options_default['tileurl']);
        $input['subdomains'] = sanitize_text_field($cttm_options_default['subdomains']);
        $input['attribution'] = $purifier->purify($cttm_options_default['attribution']);
        $input['popup_style'] = sanitize_key($cttm_options_default['popup_style']);
        $input['onefinger'] = intval($cttm_options_default['onefinger']);
        $input['popup_css'] = intval($cttm_options_default['popup_css']);
        $input['search_field'] = intval($cttm_options_default['search_field']);
        $input['fullscreen_button'] = intval($cttm_options_default['fullscreen_button']);
        return $input;
    }

    //If Delete all markers in database is clicked
    else if (isset($_POST['Delete'])) {

        //Get all public post types, that could have been geolocalized.
        //We don't get the cttm_option post types set by the user because if one unchecked post types that already had markers, it would not delete them.
        $public_posttypes = get_post_types(['public' => true]);

        //Get all posts with a marker set
        $cttm_delete_args = array(
            'post_type' => $public_posttypes,
            'posts_per_page' => -1,
            'tax_query' => array(
                array(
                    'taxonomy' => 'cttm-markers-tax',
                    'terms' => 'hasmarker',
                ),
            ),
        );

        $cttm_delete_query = new WP_Query($cttm_delete_args);

        if (($cttm_delete_query->have_posts())) {

            $cttm_posts = $cttm_delete_query->posts;

            //for each post with a marker, delete marker meta data, then delete taxonomy "hasmarker"
            foreach ($cttm_posts as $post) {
                delete_post_meta($post->ID, '_latlngmarker');
                wp_remove_object_terms($post->ID, 'hasmarker', 'cttm-markers-tax');
            }
        }

        //Reset Wp_Query
        wp_reset_postdata();

        //Get all markers from custom post type cttm-marker and delete them
        $cttm_markers_posts_args = array(
            'post_type' => 'cttm-marker',
            'posts_per_page' => -1,
            'post_status' => array('any', 'trash'),
        );
        $cttm_markers_posts_query = new WP_Query($cttm_markers_posts_args);

        if (($cttm_markers_posts_query->have_posts())) {

            $cttm_markers_posts = $cttm_markers_posts_query->posts;
            $array = [];
            $i = 0;
            foreach ($cttm_markers_posts as $post) {

                $array[$i] = $post->post_content;
                $i++;
                //Check if current marker is a Default marker by checking if has content (content field is hidden to users)
                if ($post->post_content) {
                    //Get the thumbnail ID and delete it from media library
                    if (has_post_thumbnail($post->ID)) {
                        $cttm_attachment_id = get_post_thumbnail_id($post->ID);
                        wp_delete_attachment($cttm_attachment_id, true);
                    }
                }

                //Delete post and force deletion (second argument : true)
                wp_delete_post($post->ID, true);
            }
        }
        $options = get_option('cttm_options');
        $input['posttypes'] = $options['posttypes'];
        $input['tileurl'] = $options['tileurl'];
        $input['subdomains'] = $options['subdomains'];
        $input['attribution'] = $options['attribution'];
        $input['popup_style'] = $options['popup_style'];
        $input['popup_css'] = $options['popup_css'];
        $input['search_field'] = $options['search_field'];
        $input['fullscreen_button'] = $options['fullscreen_button'];
        $input['onefinger'] = $options['onefinger'];
        return $input;
    }
    //If Polylang sync is clicked
    else if (isset($_POST['polylangsync'])) {

        //Get options
        $options = get_option('cttm_options');
        $settings_posttypes = $options['posttypes'];
        //transform post types string to array
        $settings_posttypes = explode(',', $settings_posttypes);
        //Get default polylang language
        if (function_exists('pll_default_language')) {
            $default_lang = pll_default_language();
        }

        // Detect every post with marker in default language
        $cttm_options_args = array(
            'post_type' => $settings_posttypes,
            'lang' => $default_lang,
            'posts_per_page' => -1,
            'tax_query' => array(
                array(
                    'taxonomy' => 'cttm-markers-tax',
                    'terms' => 'hasmarker',
                ),
            ),
        );
        $cttm_query = new WP_Query($cttm_options_args);

        if (($cttm_query->have_posts())) {

            $cttm_posts = $cttm_query->posts;
            // For each post, find if a translation is set
            foreach ($cttm_posts as $cttm_post) {
                // LOOP
                //Check if polylang is activated
                if (function_exists('pll_get_post_translations')) {
                    // Get marker data to copy to translations
                    $marker_to_copy = get_post_meta($cttm_post->ID, '_latlngmarker', true);
                    //Get all translations of the current post
                    $post_translations = pll_get_post_translations($cttm_post->ID);
                    // Loop through every translations
                    foreach ($post_translations as $post_lang => $post_translation) {
                        //If the current post is different from default language
                        if ($post_lang != $default_lang) {
                            // Copy marker information from default language and add private taxonomy
                            update_post_meta($post_translation, '_latlngmarker', $marker_to_copy);
                            wp_set_post_terms($post_translation, 'hasmarker', 'cttm-markers-tax', false);
                        }
                    }
                }
            }
        }

        $options = get_option('cttm_options');
        $input['posttypes'] = $options['posttypes'];
        $input['tileurl'] = $options['tileurl'];
        $input['subdomains'] = $options['subdomains'];
        $input['attribution'] = $options['attribution'];
        $input['popup_style'] = $options['popup_style'];
        $input['popup_css'] = $options['popup_css'];
        $input['search_field'] = $options['search_field'];
        $input['fullscreen_button'] = $options['fullscreen_button'];
        $input['onefinger'] = $options['onefinger'];
        return $input;
    }
    //If WPML sync is clicked
    else if (isset($_POST['wpmlsync'])) {

        //Get options
        $options = get_option('cttm_options');
        $settings_posttypes = $options['posttypes'];
        //transform post types string to array
        $settings_posttypes = explode(',', $settings_posttypes);
        //Get default wpml language
        if (has_filter('wpml_default_language')) {
            $default_lang = apply_filters('wpml_default_language', null); // return string of 2 char like : 'fr'
        }

        //Change global language to default language for next query
        global $sitepress;
        $sitepress->switch_lang($default_lang);

        //Check if WPML is activated
        if (has_filter('wpml_active_languages')) {
            //Get all active languages on the website
            $activ_lang_array = apply_filters('wpml_active_languages', null, 'skip_missing=1');
            //remove default language from that array
            unset($activ_lang_array[$default_lang]);

            // Detect every post with marker in default language
            $cttm_options_args = array(
                'post_type' => $settings_posttypes,
                'posts_per_page' => -1,
                'tax_query' => array(
                    array(
                        'taxonomy' => 'cttm-markers-tax',
                        'terms' => 'hasmarker',
                    ),
                ),
            );
            $cttm_query = new WP_Query($cttm_options_args);

            if (($cttm_query->have_posts())) {

                $cttm_posts = $cttm_query->posts;
                // For each post, find if a translation is set
                foreach ($cttm_posts as $cttm_post) {
                    // LOOP

                    // Get marker data to copy to translations
                    $marker_to_copy = get_post_meta($cttm_post->ID, '_latlngmarker', true);
                    $translations_array = [];
                    //Loop through each language (other than default) to find translations
                    foreach ($activ_lang_array as $activ_lang => $value) {
                        //find a translation of this post/page on the current active language
                        $temp_translated_post = apply_filters('wpml_object_id', $cttm_post->ID, $cttm_post->post_type, false, $activ_lang);
                        if (!is_null($temp_translated_post)) {
                            $translations_array[] = $temp_translated_post;
                        }
                    }

                    // Get marker data to copy to translations
                    $marker_to_copy = get_post_meta($cttm_post->ID, '_latlngmarker', true);
                    // Loop through every translations
                    foreach ($translations_array as $translation_ID) {

                        // Copy marker information from default language and add private taxonomy
                        update_post_meta($translation_ID, '_latlngmarker', $marker_to_copy);
                        wp_set_post_terms($translation_ID, 'hasmarker', 'cttm-markers-tax', false);
                    }
                }
            }
        }

        $options = get_option('cttm_options');
        $input['posttypes'] = $options['posttypes'];
        $input['tileurl'] = $options['tileurl'];
        $input['subdomains'] = $options['subdomains'];
        $input['attribution'] = $options['attribution'];
        $input['popup_style'] = $options['popup_style'];
        $input['popup_css'] = $options['popup_css'];
        $input['search_field'] = $options['search_field'];
        $input['fullscreen_button'] = $options['fullscreen_button'];
        $input['onefinger'] = $options['onefinger'];
        return $input;
    }
}

/*
Function to sanitize post types by checking if every post_type is registered.
Return string of existing post types only, separated by comma.
If empty, return 'post'.
 */
function cttm_sanitize_post_types($posttypes)
{

    //get all public registered post types
    $registered_posttypes = get_post_types(['public' => true]);

    //transform post_types string into array
    $posttypes = explode(',', $posttypes);

    $sanitized_posttypes = array();

    // loop through every post types to sanitize, compare them to existing post types.
    // If it exist, push the post type to the returning array.
    foreach ($posttypes as $posttype) {
        if (in_array($posttype, $registered_posttypes)) {
            array_push($sanitized_posttypes, $posttype);
        }
    }
    // array to string
    $sanitized_posttypes = implode(',', $sanitized_posttypes);

    //If the array is empty, return default value 'post' to avoid errors.
    if (empty($sanitized_posttypes)) {
        $sanitized_posttypes = 'post';
    }
    return $sanitized_posttypes;
}
