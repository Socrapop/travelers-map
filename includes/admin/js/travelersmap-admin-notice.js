jQuery(document).on( 'click', '.cttm-notice .notice-dismiss', function() {

    jQuery.ajax({
        url: ajaxurl,
        data: {
            action: 'dismiss_cttm_notice'
        }
    })

})