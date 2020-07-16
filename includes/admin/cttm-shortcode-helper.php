<?php
// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Add the shortcode Helper page
 */

//Add the page
add_action('admin_menu', 'cttm_add_shortcodehelper');
function cttm_add_shortcodehelper()
{
    add_submenu_page("cttm_travelersmap", __('Travelers\' Map - Shortcode Helper', 'travelers-map'), __('Shortcode Helper', 'travelers-map'), "manage_options", "cttm_travelersmap_shortcode", 'cttm_shortcodehelper_page');
}

//Draw the options page
function cttm_shortcodehelper_page()
{
?>
    <div class="wrap wrap-shortcode-helper">
        <h1>Travelers' Map <small>| <?php _e('Shortcode Helper', 'travelers-map'); ?> </small></h1>
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
        <div class="row">
            <div class="col-lg helper-bloc">
                <h2><?php _e('Your shortcode', 'travelers-map'); ?></h2>
                <p class="description"><?php _e('Copy and paste this shortcode into the content of a Post or a Page to add a dynamic map:', 'travelers-map'); ?></p>
                <div id="cttm-shortcode-helper">[travelers-map]</div>
            </div>
        </div>
        <hr>

        <h2><?php _e('Shortcode settings', 'travelers-map'); ?></h2>
        <p><?php _e('The above shortcode is automatically updated when you modify the settings below :', 'travelers-map'); ?></p>

        <div class="row">
            <div class="col-lg helper-bloc">
                <h3><?php _e('Map dimensions', 'travelers-map'); ?></h3>

                <div style="line-height: 2.2;">
                    <label for="width"><strong><?php _e('Width:', 'travelers-map'); ?> </strong></label><input id="width" type="text" placeholder="Default: 100%">
                    <br>
                    <span class="description"><?php printf(__(' Any <a href="%1$s" target="_blank">valid CSS unit</a> is accepted. Exemple: <code>780px</code> or <code>50%%</code> ', 'travelers-map'), 'https://www.w3schools.com/cssref/css_units.asp'); ?>
                    </span>
                </div>
                <br><br>
                <div style="line-height: 2.2;">
                    <label for="height"><strong><?php _e('Height:', 'travelers-map'); ?> </strong></label><input id="height" type="text" placeholder="Default: 600px">
                    <br>
                    <span class="description"><?php printf(__(' Any <a href="%1$s" target="_blank">valid CSS unit</a> is accepted, although <code>px</code> and <code>vh</code> are recommended. Exemple: <code>500px</code> or <code>25vh</code>', 'travelers-map'), 'https://www.w3schools.com/cssref/css_units.asp'); ?></span>
                </div>
                <br><br>
                <div style="line-height: 2.2;">
                    <label for="maxwidth"><strong><?php _e('Max width:', 'travelers-map'); ?> </strong></label><input id="maxwidth" type="text" placeholder="Default: none">
                    <br>
                    <span class="description">
                        <?php _e('Exemple:', 'travelers-map'); ?> <code>1200px</code>.</span>
                </div>
                <br><br>
                <div style="line-height: 2.2;">
                    <label for="maxheight"><strong><?php _e('Max height:', 'travelers-map'); ?> </strong></label><input id="maxheight" type="text" placeholder="Default: none">
                    <br>
                    <span class="description"><?php _e('Exemple:', 'travelers-map'); ?> <code>800px</code>.</span>
                </div>
            </div>

            <div class="col-lg helper-bloc">
                <h3><?php _e('Zoom settings', 'travelers-map'); ?></h3>
                <div>
                    <label><input type="checkbox" id="centered_on_this" style="margin-right: 10px;" name="centered_on_this" value="true"><strong><?php _e('Initially zoom on current post\'s marker', 'travelers-map'); ?></strong></label><br>
                    <p class="description"><?php _e('Check this box to show a map zoomed on the current post\'s marker, moreover other posts are also displayed on the map.', 'travelers-map'); ?></p>
                    <label></label>

                </div>
                <br>
                <div style="line-height: 2.2;">
                    <label for="minzoom"><strong><?php _e('Min zoom:', 'travelers-map'); ?> </strong></label><input id="minzoom" type="number" step="1" min="0" max="18" placeholder="Default: 0">
                    <br>
                    <span class="description"><?php _e('The minimum zoom level of the map. Default: <code>0</code>', 'travelers-map'); ?></span>
                </div>
                <br>
                <div style="line-height: 2.2;">
                    <label for="maxzoom"><strong><?php _e('Max zoom:', 'travelers-map'); ?> </strong></label><input id="maxzoom" type="number" step="1" min="0" max="18" placeholder="Default: 18">
                    <br>
                    <span class="description"><?php _e('The maximum zoom level of the map. Default: <code>18</code>', 'travelers-map'); ?></span>
                </div>
                <br>

                <div style="line-height: 2.2;">
                    <label for="init-maxzoom"><strong><?php _e('Initialization max zoom:', 'travelers-map'); ?> </strong></label><input id="init-maxzoom" type="number" step="1" min="0" max="18" placeholder="Default: 16">
                    <br>
                    <span class="description"><?php _e('On initialization, the map is zoomed to fit all the markers inside it. <br>This setting is useful to unzoom when only one marker is displayed. <code>18</code> is zoomed at the maximum, <code>1</code> is a world view.', 'travelers-map'); ?></span>
                </div>

                <br>
            </div>
        </div>
        <div class="row">
            <div class="col-lg helper-bloc">

                <h3><?php _e('Filter markers', 'travelers-map'); ?></h3>
                <div class="row">
                    <div class="col-lg">


                        <div>
                            <label><input type="checkbox" id="thispostsmarker" style="margin-right: 10px;" name="thispost" value="true"><strong><?php _e('Show current post\'s marker only', 'travelers-map'); ?></strong></label><br>
                            <p class="description"><?php _e('Check this box to show a map with the current post\'s marker only.', 'travelers-map'); ?></p>


                        </div>

                        <br>

                        <div style="line-height: 2.2;">
                            <label for="post_id"><strong><?php _e('Show only this post (ID):', 'travelers-map'); ?> </strong></label><input id="post_id" type="number" step="1" min="1" placeholder="">
                            <br>
                            <span class="description"><?php _e('Show a map with this ID\'s marker only. This can be combined with "Initially zoom on current post\'s marker" setting to zoom on this ID\'s marker but keep the others showing.', 'travelers-map'); ?></span>
                        </div>
                        <br>
                    </div>
                </div>
                <h3 style="font-size: 1.2em;"><?php _e('Filter by Wordpress taxonomies:', 'travelers-map'); ?></h3>
                <div class="row">
                    <div class="col-xl helper-bloc-inner categories">
                        <strong><?php _e('Categories:', 'travelers-map'); ?></strong><br>
                        <p class="description"> <?php _e('Select the categories you want to show on the map. Default: All categories.', 'travelers-map'); ?></p>

                        <div class="checkbox-container">
                            <?php
                            $cttm_allcategories = get_categories(array(
                                'orderby' => 'name',
                                'hide_empty' => false,
                            ));

                            foreach ($cttm_allcategories as $cttm_cat) {

                                echo '<label><input type="checkbox" class="cttm-cat-checkbox" name="' . $cttm_cat->name . '" value="' . $cttm_cat->slug . '">' . $cttm_cat->name . '</label>';
                            }
                            ?>
                        </div>

                    </div>

                    <div class="col-xl helper-bloc-inner tags">
                        <strong><?php _e('Tags:', 'travelers-map'); ?></strong><br>
                        <p class="description"><?php _e('Select the tags you want to show on the map. Default: All tags.', 'travelers-map'); ?></p>
                        <div class="checkbox-container">

                            <?php
                            $cttm_alltags = get_tags(array(
                                'orderby' => 'name',
                                'hide_empty' => false,
                            ));

                            foreach ($cttm_alltags as $cttm_tag) {

                                echo '<label><input type="checkbox" class="cttm-tag-checkbox" name="' . $cttm_tag->name . '" value="' . $cttm_tag->slug . '">' . $cttm_tag->name . '</label>';
                            }
                            ?>

                        </div>

                    </div>

                    <div class="col-xl helper-bloc-inner posttypes">
                        <strong><?php _e('Post types:', 'travelers-map'); ?></strong><br>
                        <p class="description"> <?php _e('Select the post types you want to show on the map. Default: All post types selected in the plugin settings page.', 'travelers-map'); ?></p>

                        <div class="checkbox-container">
                            <?php
                            //get all public registered post types
                            $registered_posttypes = get_post_types(['public' => true], 'objects');

                            //Add a checkbox for each registered post type, and check it if already checked in options.
                            foreach ($registered_posttypes as $registered_posttype) {
                                if ($registered_posttype->name != 'attachment') {

                                    echo '<label><input type="checkbox" class="cttm-posttype-checkbox" name="' . $registered_posttype->name . '" value="' . $registered_posttype->name . '">' . $registered_posttype->labels->singular_name . '</label>';
                                }
                            }

                            ?>
                        </div>
                    </div>
                </div>
                <h3 style="font-size: 1.2em;"><?php _e('Filter by custom taxonomies:', 'travelers-map'); ?></h3>
                <div class="row">
                    <?php

                    $args = array(
                        'public' => true,
                        '_builtin' => false,

                    );
                    $taxonomies = get_taxonomies($args, 'objects', 'and');

                    if (!empty($taxonomies)) {
                        $custom_tax_count = 1; // To add div.rows every 3 custom tax.
                        foreach ($taxonomies as $taxonomy) {
                            //get this taxonomy's terms.
                            $taxonomy_terms = get_terms(array(
                                'taxonomy' => $taxonomy->name,
                                'orderby' => 'name',
                                'hide_empty' => false,
                            ));
                            //Show the taxonomy block only if it's not empty
                            if (empty($taxonomy_terms) == false) {
                    ?>
                                <div class="col-xl helper-bloc-inner customtaxonomy" data-taxonomy-name="<?php echo $taxonomy->name; ?>">
                                    <strong><?php echo $taxonomy->label; ?></strong><br>
                                    <p class="description"> <?php _e('Select the terms you want to show on the map. Default: All terms.', 'travelers-map'); ?></p>

                                    <div class="checkbox-container">
                                        <?php


                                        //Add a checkbox for each registered custom taxonomy term.
                                        foreach ($taxonomy_terms as $taxonomy_term) {
                                            echo '<label><input type="checkbox" class="cttm-' . $taxonomy->name . '-checkbox" name="' . $taxonomy_term->name . '" value="' . $taxonomy_term->slug . '">' . $taxonomy_term->name . '</label>';
                                        }

                                        ?>
                                    </div>
                                </div>
                        <?php if ($custom_tax_count % 3 == 0) {
                                    // Add a row every 3 custom taxonomy block.
                                    echo '</div><div class="row">';
                                }
                                $custom_tax_count++;
                            }
                        } // END FOREACH
                    } else { ?>
                        <div class="col-lg">
                            <p class="description"> <?php _e('No custom taxonomy found, if you have one, make sure at least one term is set', 'travelers-map'); ?></p>
                        </div>
                    <?php }
                    ?>

                </div>
            </div>

        </div>
        <div class="row helper-bloc-row">
            <h3 style="margin-bottom:0; display:block; width:100%"><?php _e('Advanced settings', 'travelers-map'); ?></h3>
            <p style="color: #913232;"><?php _e('These settings are meant for experienced users only. Please read carefully the descriptions as these settings can cause performance issues and other problems.', 'travelers-map'); ?></p>
            <div class="row">
                <div class="col-xl" style="margin-bottom:10px">

                    <div>
                        <label><input type="checkbox" id="disableclustering" style="margin-right: 10px;" name="disableclustering" value="true"><strong><?php _e('Disable marker clustering', 'travelers-map'); ?></strong></label><br>
                        <p class="description"><?php _e('Prevent the markers from regrouping when too close to each other. Warning: Don\'t use on a map with a lot of markers as it can cause performance issues.', 'travelers-map'); ?></p>
                    </div>
                    <br>

                    <div>
                        <label for="max_cluster_radius"><strong><?php _e('Max cluster radius:', 'travelers-map'); ?> </strong></label><input id="max_cluster_radius" type="number" step="1" min="1" placeholder="Default: 45" style="margin-bottom:10px">
                        <br>
                        <span class="description"><?php _e('Define the maximum radius that a cluster will cover from the central marker (in pixels). Default is 45. Decreasing will make more, smaller clusters.', 'travelers-map'); ?></span>
                    </div>
                    <br>
                    <div>
                        <label><input type="checkbox" id="open_link_in_new_tab" style="margin-right: 10px;" name="open_link_in_new_tab" value="true"><strong><?php _e('Open links in a new tab', 'travelers-map'); ?></strong></label><br>
                        <p class="description"><?php _e('Force popover links to open in a new tab. Warning: This is not recommended as it changes the default browser behaviour. You should let the users decide how they want to open links.', 'travelers-map'); ?></p>
                    </div>
                </div>

                <div class="col-xl helper-tile-container">
                    <h3 style="font-size: 1.2em;"><?php _e('Tile provider settings', 'travelers-map'); ?></h3>
                    <p> <?php _e('If you change your tile provider, you must fill all the fields below in order to avoid your map from not showing or having some tiles missing.', 'travelers-map'); ?><br>
                        <?php _e('By default, the map will use the tile provider set in Travelers\' Map settings.', 'travelers-map'); ?></p>
                    <div style="line-height: 2.2;">
                        <label for="tileurl"><strong><?php _e('Tiles Server URL', 'travelers-map'); ?> </strong></label><br><input id="tileurl" type="text" style="width: 95%;max-width:600px; margin: 5px 0 15px 10px" placeholder="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png">
                        <br>

                    </div>
                    <div style="line-height: 2.2;">
                        <label for="subdomains"><strong><?php _e('Tiles Server sub-domains', 'travelers-map'); ?> </strong></label><br><input id="subdomains" type="text" style="width: 95%;max-width:200px; margin: 5px 0 15px 10px" placeholder="abcd">
                        <br>

                    </div>
                    <div style="line-height: 2.2;">
                        <label for="attribution"><strong><?php _e('Attribution', 'travelers-map'); ?> </strong></label><br><textarea id="attribution" type="text" cols="100" style="max-width:95%; margin: 5px 0 15px 10px" placeholder='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors and © <a href="https://carto.com/attributions">CARTO</a>'></textarea>
                        <br>
                    </div>
                </div>
            </div>
        </div>
    </div>
<?php
}
