document.addEventListener("DOMContentLoaded", function(event) { 
	
	
	/**
	 * Create leaflet map object "cttm_map"
	 */

	var cttm_map = L.map('travelersmap-container') ;
	
	//Change default leaflet icon options 
	L.Icon.Default.prototype.options.iconSize = [32, 45];
	L.Icon.Default.prototype.options.iconAnchor = [16, 45];
	L.Icon.Default.prototype.options.popupAnchor = [0, -42];
	L.Icon.Default.prototype.options.shadowSize = [0,0];
	
				    
	/**
	 * Disable Scrollwheel zoom when map is not in focus
	 */
	cttm_map.scrollWheelZoom.disable();
	//Enable Scrollwheel Zoom on focus
	cttm_map.on('focus', function () {
	    cttm_map.scrollWheelZoom.enable();
	  });

	

	/**
	 * Get options from database to assign a tile layer to the cttm_map
	 */
	
	//Get plugin options from the database, set in the setting page.
	var json_cttm_options = php_params.cttm_options;
	
	//Clean json string to be usable
	json_cttm_options = json_cttm_options.replace(/&quot;/g, '"');
	
	//Get an array of all the options
	cttm_options = JSON.parse(json_cttm_options);

	//Get Tiles server URL + API key + Attribution
	L.tileLayer(cttm_options['tileurl'], {
		subdomains: cttm_options['subdomains'],
		attribution: cttm_options['attribution']
	
		}).addTo(cttm_map);
	 

	/**
   	* Create all markers and popups, and add them to the leaflet map.
   	*/
   
	//Create a Leaftlet Cluster Group, so we can add our markers in it
		var markerscluster = L.markerClusterGroup({
			spiderfyOnMaxZoom: false,
			showCoverageOnHover: false,
			maxClusterRadius: 45
		});

	//Get markers metas and linked posts datas from shortcode
	var json_cttm_metas = php_params.cttm_metas;
	
	//Define popup class and create HMTL output for popups depending of style set in plugin settings
	switch(cttm_options['popup_style']){
			case "img_title_descr": 
				var popupOptions = { 'className' : 'thumb-title-exc-popup' };
				var popupOutput = '<a class="tooltip-link" href="%s_url">';
		        popupOutput += '<div class="nothumbplaceholder"></div>';
				popupOutput += '<div class="title">%s_title</div></a>';
				popupOutput += '<div class="excerpt">%s_excerpt</div>';
			break;


			case "title_descr":
				var popupOptions = { 'className' : 'title-exc-popup' };
		       
				var popupOutput = '<a class="tooltip-link" href="%s_url">';
				popupOutput += '<div class="title">%s_title</div>';
				popupOutput += '<div class="excerpt">%s_excerpt</div></a>';
			break;


			default:
				var popupOptions = { 'className' : 'default-popup' };
				
				var popupOutput = '<div class="img-mask">';
		        popupOutput += '<div class="nothumbplaceholder"></div>';
				popupOutput += '</div><a class="tooltip-link" href="%s_url">';
				popupOutput += '<div class="title">%s_title</div></a>';

		}
	//If css is disabled, change popup class
	if (cttm_options['popup_css']) {		
		popupOptions = { 'className' : 'custom-popup' };
	}

	



	//If posts with markers exist
	if (json_cttm_metas!=0){
		//Clean json string to be usable
		json_cttm_metas = json_cttm_metas.replace(/&quot;/g, '"');
		
		//Get an array of objects containing markerdatas and postdatas
		cttm_metas = JSON.parse(json_cttm_metas);
		
		//Loop through cttm_metas array, create all the markers and popups.
	    for (var i = 0; i < cttm_metas.length; i++) {
	    	
	    	//Get markerdatas object
	        var markerdatas = JSON.parse(cttm_metas[i].markerdatas);
			
	        //Initialize all markers variables
	        var markerlatitude = markerdatas.latitude;
	        var markerlongitude = markerdatas.longitude;
	        var markerURL = markerdatas.markerdata[0];
	        var markerwidth = markerdatas.markerdata[1];
	        var markerheight = markerdatas.markerdata[2];

	        //Get linked postdatas object
	        var postdatas = cttm_metas[i].postdatas;
	        
	        //Initialize all linked posts variables for popups
	        var postthumb = postdatas.thumb;

	        var posturl = postdatas.url;
	        var posttitle = postdatas.thetitle;

	        var postexcerpt = postdatas.excerpt;

	        var postpopupOutput = popupOutput;

	        // Create a leaflet icon object and add it to the map, use default
	        
	        if (markerURL!="d") {
	        	
	        	//Create custom icon
	        	var myIcon = L.icon({
				    iconUrl: markerURL,
				    iconSize: [markerwidth, markerheight],
				    iconAnchor: [markerwidth/2, markerheight],
				    popupAnchor: [0, -markerheight+3]
				});
				//Create marker object wih our icon
				var marker = L.marker( [markerlatitude, markerlongitude], {
					icon: myIcon
				});
				
	        }else{
	        	//Create marker object with default icon
				var marker = L.marker( [markerlatitude, markerlongitude]);
				
	        }

	        

	        //Replace output dynamic contents for this post
			if (postthumb) {
				postpopupOutput = postpopupOutput.replace('<div class="nothumbplaceholder"></div>', '<img src="'+postthumb+'" alt="">');
			}
			if (postexcerpt){
				postpopupOutput = postpopupOutput.replace('%s_excerpt', postexcerpt);
			}else{
				postpopupOutput = postpopupOutput.replace('%s_excerpt', "");
			}

	        postpopupOutput = postpopupOutput.replace('%s_title', posttitle);
	       postpopupOutput = postpopupOutput.replace('%s_url', posturl);

	       
			//Add the marker in our cluster group layer with its popup
	        markerscluster.addLayer(marker.bindPopup(postpopupOutput,popupOptions));

	    } //END For Loop through cttm_metas 

	   
	    //add markercluster layer to the map
	  	cttm_map.addLayer(markerscluster);

	  	cttm_map.fitBounds(markerscluster.getBounds(),{
	  		maxZoom:13,
	  		padding: [60,60]
	  	});
	  	//Get all markers on the map
	  

	} //END if (!json_cttm_metas)

	
	
	
});


