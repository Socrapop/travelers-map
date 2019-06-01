<?php 

// If uninstall not called from Wordpress, exit file.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}
//delete options only, all other data can be deleted in the option page. We don't want the user to lose hours of time setting markers after "accidentally" deleting the plugin.
delete_option( 'cttm_admin_options' );
?>