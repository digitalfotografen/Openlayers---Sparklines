/* Copyright (c) 2012 by Ulrik Södergren / DigitalFotografenOpenLayers
 * Based on code in OpenLayers.Layer.Markers and OpenLayers.Layer.Boxes
 * Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */
/*
 * Example:
 * (code)
 * var sprarklines = new OpenLayers.Layer.Sparklines( "Sparklines" );
 * map.addLayer(aprarklines);
 *
 * var size = new OpenLayers.Size(21,25);
 * var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
 * sprarklines.addChart(new OpenLayers.Marker(new OpenLayers.LonLat(0,0),[1,5,2,3,6]));
 * sprarklines.addChart(new OpenLayers.Marker(new OpenLayers.LonLat(0,0),[7,2,2,3,6]));
 *
 * (end)
 *
*/

/**
 * @requires OpenLayers/Layer.js
 */

/**
 * Class: OpenLayers.Layer.Sparklines
 * 
 * Inherits from:
 *  - <OpenLayers.Layer> 
 */
OpenLayers.Layer.Sparklines = OpenLayers.Class(OpenLayers.Layer, {
    
    /** 
     * APIProperty: isBaseLayer 
     * {Boolean} Sparklines layer is never a base layer.  
     */
    isBaseLayer: false,
    
    /** 
     * APIProperty: charts 
     * {Array(<OpenLayers.Marker.Sparkline>)} internal marker list 
     */
    charts: null,


    /** 
     * Property: drawn 
     * {Boolean} internal state of drawing. This is a workaround for the fact
     * that the map does not call moveTo with a zoomChanged when the map is
     * first starting up. This lets us catch the case where we have *never*
     * drawn the layer, and draw it even if the zoom hasn't changed.
     */
    drawn: false,
    
    /**
     * Constructor: OpenLayers.Layer.Sparklines 
     * Create a Sparklines layer.
     *
     * Parameters:
     * name - {String} 
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(name, options) {
        OpenLayers.Layer.prototype.initialize.apply(this, arguments);
				var defaultOptions = {maxWidth: 100, maxHeight: 100, minWidth: 10, minHeight: 10}
				OpenLayers.Util.applyDefaults(this.options, defaultOptions);
				var defaultChartOptions = {};//chartOptions
				OpenLayers.Util.applyDefaults(this.options.chartOptions, defaultChartOptions);
        this.charts = [];
    },
    
    /**
     * APIMethod: destroy 
     */
    destroy: function() {
        this.clearCharts();
        this.charts = null;
        OpenLayers.Layer.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: setOpacity
     * Sets the opacity for all the markers.
     * 
     * Parameters:
     * opacity - {Float}
     */
    setOpacity: function(opacity) {
        if (opacity != this.opacity) {
            this.opacity = opacity;
            for (var i=0, len=this.charts.length; i<len; i++) {
                this.charts[i].setOpacity(this.opacity);
            }
        }
    },

    /** 
     * Method: moveTo
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>} 
     * zoomChanged - {Boolean} 
     * dragging - {Boolean} 
     */
    moveTo:function(bounds, zoomChanged, dragging) {
        OpenLayers.Layer.prototype.moveTo.apply(this, arguments);

        if (zoomChanged || !this.drawn) {
            for(var i=0, len=this.charts.length; i<len; i++) {
                this.drawChart(this.charts[i]);
            }
            this.drawn = true;
        }
    },

    /**
     * APIMethod: addChart
     *
     * Parameters:
     * marker - {<OpenLayers.Marker.Sparkline>} 
     */
    addChart: function(chart) {
        chart.options = OpenLayers.Util.applyDefaults(chart.options, this.options.chartOptions)
				this.charts.push(chart);

        if (this.opacity < 1) {
            marker.setOpacity(this.opacity);
        }

        if (this.map && this.map.getExtent()) {
            chart.map = this.map;
            this.drawChart(chart);
        }
    },

    /**
     * APIMethod: removeChart
     *
     * Parameters:
     * marker - {<OpenLayers.Marker.Sparkline>} 
     */
    removeChart: function(chart) {
        if (this.charts && this.charts.length) {
            OpenLayers.Util.removeItem(this.charts,chart);
            chart.erase();
        }
    },

    /**
     * Method: clearCharts
     * This method removes all markers from a layer. The markers are not
     * destroyed by this function, but are removed from the list of markers.
     */
    clearCharts: function() {
        if (this.charts != null) {
            while(this.charts.length > 0) {
                this.removeChart(this.charts[0]);
            }
        }
    },

    /** 
     * Method: drawChart
     * Calculate the pixel location for the marker, create it, and 
     *    add it to the layer's div
     *
     * Parameters:
     * marker - {<OpenLayers.Marker.Sparkline>} 
     */
    drawChart: function(chart) {
				// if bounds are defined, scale chart to bounds
				if (chart.bounds != null){
					var topleft = this.map.getLayerPxFromLonLat({
							lon: chart.bounds.left,
							lat: chart.bounds.top
					});
					var botright = this.map.getLayerPxFromLonLat({
							lon: chart.bounds.right,
							lat: chart.bounds.bottom
					});
					if (botright == null || topleft == null) {
							chart.display(false);
					} else {
							var width = Math.min( Math.max(this.options.minWidth, botright.x - topleft.x), this.options.maxWidth);
							var height = Math.min( Math.max(this.options.minHeight, botright.y - topleft.y), this.options.maxHeight);
							var sparkDiv = chart.draw(topleft, {
									w: width,
									h: height
							});
							this.div.appendChild(sparkDiv);
							chart.render();
							$.sparkline_display_visible();
					}
				} else {
					// use center coordinate and fixed size
					var px = this.map.getLayerPxFromLonLat(chart.lonlat);
					px.x = px.x - chart.options.width/2;
					px.y= px.y - chart.options.height/2;
					var sz = new OpenLayers.Size(chart.options.width,chart.options.height);
					if (px == null) {
							chart.display(false);
					} else {
						var sparkDiv = chart.draw(px, sz);
						this.div.appendChild(sparkDiv);
						chart.render();
						$.sparkline_display_visible();
					}
			}
			
    },
    
    /** 
     * APIMethod: getDataExtent
     * Calculates the max extent which includes all of the markers.
     * 
     * Returns:
     * {<OpenLayers.Bounds>}
     */
    getDataExtent: function () {
        var maxExtent = null;
        
        if ( this.charts && (this.charts.length > 0)) {
            var maxExtent = new OpenLayers.Bounds();
            for(var i=0, len=this.charts.length; i<len; i++) {
                var chart = this.charts[i];
                maxExtent.extend(chart.lonlat);
            }
        }

        return maxExtent;
    },

    CLASS_NAME: "OpenLayers.Layer.Sparklines"
});
