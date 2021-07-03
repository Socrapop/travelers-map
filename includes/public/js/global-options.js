export function getGlobalOptions(window) {
    let json_cttm_options = window.cttm_options_params.cttm_options;
    json_cttm_options = json_cttm_options.replace(/&quot;/g, '\\"');
    return JSON.parse(json_cttm_options);
}