export function getShortcodes(window) {
    const shortcodes = [];
    for (const property in window) {
        if (isShortcodeProperty(property)) {
            const shortcode = createShortcode(window[property]);
            shortcodes.push(shortcode);
        }
    }
    return shortcodes;
}

function isShortcodeProperty(property) {
    const shortcode_property_pattern = /^cttm_shortcode_/;
    return shortcode_property_pattern.test(property);
}

function createShortcode(window_shortcode) {
    let shortcode = {
        options: {
            attribution: "",
            centered_on_this: "",
            disable_clustering: "",
            id: "",
            init_maxzoom: 0,
            max_cluster_radius: 0,
            maxzoom: "",
            minzoom: "",
            open_link_in_new_tab: "",
            subdomains: "",
            this_post: "",
            tileurl: ""
        },
        metas: []
    }

    let json_cttm_shortcode = window_shortcode.cttm_shortcode_options;
    json_cttm_shortcode = json_cttm_shortcode.replace(/&quot;/g, '\\"');
    shortcode.options = { ...JSON.parse(json_cttm_shortcode) };

    let json_cttm_metas = window_shortcode.cttm_metas;
    json_cttm_metas = json_cttm_metas.replace(/&quot;/g, '\\"');
    shortcode.metas = JSON.parse(json_cttm_metas);

    if (shortcode.metas != 0) {
        for (let i = 0; i < shortcode.metas.length; i++) {
            if (shortcode.metas[i]) {
                const meta = createMeta(shortcode.metas[i]);
                shortcode.metas[i] = meta;
            }
        }
    }

    return shortcode;
}

function createMeta(window_meta) {
    let meta = {
        markerdatas: {
            customexcerpt: "",
            customthumbnail: "",
            customtitle: "",
            latitude: "",
            longitude: "",
            markerdata: []
        },
        postdatas: {
            date: "",
            excerpt: "",
            thetitle: "",
            thumb: "",
            url: "",
        }
    }

    //If current markerdata is not falsy:
    //Prevent bug with multilingual plugins, where metadatas are synced but not taxonomy:
    //If one remove a marker from a post, the other languages of this post will still appear in the query...
    if (window_meta.markerdatas) {
        meta.markerdatas = { ...JSON.parse(window_meta.markerdatas) };
    }

    meta.postdatas = { ...window_meta.postdatas };

    return meta;
}