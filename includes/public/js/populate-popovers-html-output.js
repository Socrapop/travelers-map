/**
 *
 * Populate markers' popovers HTML output with data sent.
 * Erase unnecessary HTML tags from the output when no data is found.
 * @param {object} postdatas - the current marker data. (Yes, data can't be plural, but I've added an 's' for naming convention)
 * @param {string} popoverOutput - the popover html output to use.
 * @returns populated HTML output of current marker
 */
export function cttmPopulatePopoversHTMLOutput(
    postdatas,
    popoverOutput,
    cttm_options
) {
    let postThumb = postdatas.thumb;
    let posturl = postdatas.url;
    let postTitle = postdatas.thetitle;
    let postExcerpt = postdatas.excerpt;
    let postDate = new Date(postdatas.date.replace(/ /g, 'T') + 'Z');
    postDate = postDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    let popoverStyles = cttm_options['popup_style'].split(',');
    let postPopoverOutput = popoverOutput;

    if (postThumb) {
        postPopoverOutput = postPopoverOutput.replace(
            '<div class="nothumbplaceholder"></div>',
            '<img src="' + postThumb + '" alt="">'
        );
    }
    if (postExcerpt && popoverStyles.indexOf('excerpt') != -1) {
        postPopoverOutput = postPopoverOutput.replace('%s_excerpt', postExcerpt);
    } else {
        postPopoverOutput = postPopoverOutput.replace(
            '<div class="excerpt">%s_excerpt</div>',
            ''
        );
    }
    if (postTitle && popoverStyles.indexOf('title') != -1) {
        postPopoverOutput = postPopoverOutput.replace('%s_title', postTitle);
    } else {
        postPopoverOutput = postPopoverOutput.replace(
            '<div class="title">%s_title</div>',
            ''
        );
    }
    if (postDate && popoverStyles.indexOf('date') != -1) {
        postPopoverOutput = postPopoverOutput.replace('%s_date', postDate);
    } else {
        postPopoverOutput = postPopoverOutput.replace(
            '<div class="date">%s_date</div>',
            ''
        );
    }
    postPopoverOutput = postPopoverOutput.replace('%s_url', posturl);

    return postPopoverOutput;
}
