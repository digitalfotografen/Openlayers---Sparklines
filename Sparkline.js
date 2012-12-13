/* Copyright (c) 2012 by Ulrik Södergren / DigitalFotografenOpenLayers
 * Based on code in OpenLayers.Marker and OpenLayers.Marker.Box
 * Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */


/**
 * @requires OpenLayers/BaseTypes/Class.js
 * @requires OpenLayers/Events.js
 * @requires OpenLayers/Marker.js
 */

/**
 * Class: OpenLayers.Sparkline
 * Instances of OpenLayers.Sparkline are a combination of a 
 * <OpenLayers.LonLat> and an <OpenLayers.Icon>.  
 *
 * Charts (Sparkline) are generally added to a special layer called
 * <OpenLayers.Layer.Sparklines>.
 *
 */
OpenLayers.Marker.Sparkline = OpenLayers.Class(OpenLayers.Marker, {
    
    /** 
     * Property: values 
     * {<Aarray>} The values to plot
     */
    values: null,

    /** 
     * Property: options 
     * {<Object>} The graph options
     */
    options: null,

    /** 
     * Property: lonlat 
     * {<OpenLayers.LonLat>} location of object
     */
    lonlat: null,
    
    /** 
     * Property: div 
     * {DOMElement} 
     */
    div: null,
    /** 
     * Property: events 
     * {<OpenLayers.Events>} the event handler.
     */
    events: null,
    
    /** 
     * Property: map 
     * {<OpenLayers.Map>} the map this marker is attached to
     */
    map: null,
    
    /** 
     * Constructor: OpenLayers.Marker
     *
     * Parameters:
     * lonlat - {<OpenLayers.LonLat>} the position of this marker
     * icon - {<OpenLayers.Icon>}  the icon for this marker
     */
    initialize: function(lonlat, values, options) {
        var defaultOptions = {
								offsetX: -10,
								offsetY: -10
				};
				
				this.lonlat = lonlat;
        
        this.div    = OpenLayers.Util.createDiv();
        //this.div.style.overflow = 'hidden';
				this.values = values; // dummy values
				this.options = OpenLayers.Util.applyDefaults(options, defaultOptions);
        this.events = new OpenLayers.Events(this, this.div);
    },
    
    /**
     * APIMethod: destroy
     * Destroy the marker. You must first remove the marker from any 
     * layer which it has been added to, or you will get buggy behavior.
     * (This can not be done within the marker since the marker does not
     * know which layer it is attached to.)
     */
    destroy: function() {
        // erase any drawn features
        this.bounds = null;
        this.div = null;
				this.values = null;
				this.options = null;

        OpenLayers.Marker.prototype.destroy.apply(this, arguments);
    },
    
    /** 
    * Method: draw
    * Updates and returns div
    * 
    * Parameters:
    * px - {<OpenLayers.Pixel>}
    * 
    * Returns:
    * {DOMElement} A new DOM div element at the location passed-in
    */
    draw: function(px) {
        var sz = new OpenLayers.Size(this.options.width,this.options.height);
				//px = px.offset({x:this.options.offsetX, y:this.options.offsetY});
				OpenLayers.Util.modifyDOMElement(this.div, null, px, sz);
				this.div.appendChild(document.createTextNode(' '));
				return this.div;
    }, 


    /** 
    * Method: render
    * Creates sparlkline chart
		* Called after draw (this is a workaround since Sparklines depends on Jquery)
    * 
    * Parameters:
    * 
    * Returns:
    * {JQuery object} A Jquery div with the chart
    */
		render: function(){
				var chart = $('#'+this.div.id);
				chart.sparkline(this.values, this.options );
				return chart;
		},

    /* Method: erase
    * Erases any drawn elements for this marker.
    */
    erase: function() {
        if (this.div != null) {
            this.div.remove();
        }
    }, 

    /**
     * Method: onScreen
     *
     * Returns:
     * {Boolean} Whether or not the marker is currently visible on screen.
     */
    onScreen:function() {
        
        var onScreen = false;
        if (this.map) {
            var screenBounds = this.map.getExtent();
            onScreen = screenBounds.containsLonLat(this.lonlat);
        }    
        return onScreen;
    },
    

		
    /** 
     * Method: setOpacity
     * Change the opacity of the marker by changin the opacity of 
     *   its div element
     * 
     * Parameters:
     * opacity - {float}  Specified as fraction (0.4, etc)
     */

    setOpacity: function(opacity) {
        this.div.style.opacity = opacity;
    },
	
	
	    /**
     * Method: display
     * Hide or show the icon
     * 
     * Parameters:
     * display - {Boolean} 
     */
    display: function(display) {
        this.div.style.display = (display) ? "" : "none";
    },

    CLASS_NAME: "OpenLayers.Marker.Sparkline"
});
