( function () {



	/**
	 * The chart object handles visualizing the chart.
	 * @global
	 */
	var chart = {



		/**
		 * The empty _d3els object--a home for all the d3 elements.
		 *
		 * @protected
		 */
		_d3els: {},



		/**
		 * The empty _els object--a home for all unwrapped elements.
		 *
		 * @protected
		 */
		_els: {},



		/**
		 * Aspect ratio as an array, like so: [ width, height ].
		 *
		 * @protected
		 */
		_aspectRatio: [ 2, 1 ],



		/**
		 * URL for branding image.
		 *
		 * @protected
		 * @todo Allow users to upload their own.
		 */
		_logoImageUrl: 'images/lsm-logo.png',



		/**
		 * Data source
		 *
		 * @protected
		 * @todo Allow users to change this.
		 */
		_dataSource: 'the Electome',



		/**
		 *
		 * @protected
		 * @todo Allow users to change this.
		 */
		_orgainizationName: 'Laboratory for Social Machines',



		_labelsRendered: false,



		/**
		 * Padding for the chart.
		 *
		 * @protected
		 */
		_padding: {
			top: 80,
			left: 40,
			right: 30,
			bottom: 70,
			title: 35,
			branding: {
				top: 40,
				left: 5
			} 
		},



		/**
		 * Sizes for the chart.
		 *
		 * @protected
		 */
		_sizes: {
			title: 25,
			branding: 12,
			label: 15,
			interestPoint: 15
		},



		/**
		 * The colors for the chart.
		 *
		 * @protected
		 * @todo Create multiple, customizable schemes.
		 */
		_colors: {
			background: '#fcfcfc',
			border: '#dddddd',
			branding: '#373a3c',
			black: '#373a3c',
			grey: '#aaaaaa',
			white: '#ffffff'
		},



		/**
		 * The yScaleMax, which can be changed later.
		 *
		 * @protected
		 */
		_yScaleMax: 1,



		/**
		 * Initializes the chart object.
		 * Must be called before rendering.
		 *
		 * @public
		 * @function initialize
		 */
		initialize: function ( options ) {

			var colorScale = options.colorScale;
			this._chartType = options.type || 'area';

			this._els.sizer = document.getElementById( 'chart-sizer' );

			this._setDimensions();

			this._buildSvgElements();
			this._buildScales( colorScale );
			this._buildAxes();

		},



		/**
		 * Renders the chart.
		 *
		 * @public
		 * @function render
		 * @param {array} data The data we're charting.
		 * @param {array} keys The keys for the data.
		 */
		render: function ( data, keys ) {

			this._data = !data && data !== [] ? this._data : data;
			this._keys = !keys && keys !== [] ? this._keys : keys;
			this._sortKeys = this._sortKeys || this._keys;

			this._setDimensions();

			this._setScales( this._data );
			this._positionAndSizeSvgElements();
			this._positionAndSizeAxes();

			this._addBranding();

			if ( this._chartType === 'line' ) {

				var lineData = this._getLineData( this._data, this._keys );

				if ( this._d3els.linesWrapper.selectAll( '.line' ).size() > 0 ) {
					this._updateLines( lineData, this._keys );
				} else {
					this._buildLines( lineData, this._keys );
				}

			} else if ( this._chartType === 'area' ) {

				if ( !this._stack ) {
					this._stack = d3.stack().keys( this._keys );
				}

				var series = this._getSeries( this._data, this._keys );

				if ( this._d3els.layers ) {
					this._updateLayers( series );
				} else {
					this._buildLayers( series );
				}

			}

			if ( this._labelsRendered === false ) {
				this._createLabels( this._data, this._keys );
			}

			

		},



		/**
		 * Updates the keys with the new text from the controls.
		 *
		 * @public
		 * @function updateLabel
		 * @param {array} data The data.
		 * @param {array} keys The keys in object form.
		 */
		updateLabel: function ( key, label ) {

			var labelEls = this._d3els.labelsWrapper.node().getElementsByTagName( 'text' );
			d3.select( _.find( labelEls, function ( el ) { return el.getAttribute( 'data-key' ) === key } ) )
				.text( label );

		},



		updateKeys: function ( activeKeys, labels ) {

			var keysToAdd = _.difference( activeKeys, this._keys );

			_.each( keysToAdd, function ( key ) {

				var label = _.find( labels, function ( l ) { return l.key === key } );

				var colorIndex = this._getSortedKeys( this._data ).indexOf( key );

				this._createLabel( key, label.label, colorIndex );

			}.bind( this ) );

			var keysToDelete = _.difference( this._keys, activeKeys );

			_.each( keysToDelete, function ( key ) {

				var labelEls = this._d3els.labelsWrapper.node().getElementsByTagName( 'text' );

				_.each( labelEls, function ( labelEl ) {
					if ( labelEl && labelEl.getAttribute( 'data-key' ) === key ) {
						d3.select( labelEl ).remove();
					}
				} );

			}.bind( this ) );

			this.render( false, activeKeys );

		},


		/**
		 * Updates the aspect ratio of the chart.
		 *
		 * @public
		 * @function _setAspectRatio
		 * @param {array} aspectRatio The aspect ratio as an array, like so: [ width, height ]
		 */
		updateAspectRatio: function ( aspectRatio, data, keys ) {

			// Check that the aspect ratio is being passed as an array and is correct.
			if ( !_.isArray( aspectRatio ) && aspectRatio.length === 2 ) {
				throw new Error( 'Aspect ratio must be an array, [width, height].' );
			}

			this._aspectRatio = aspectRatio;

			this._updateChartSizerSize();

			this.render( data, keys );

		},



		/**
		 * Updates the title of the chart.
		 *
		 * @public
		 * @function updateTitle
		 * @param {string} title The title to render.
		 */
		updateTitle: function ( title ) {

			this._d3els.title.html( title );

			window.utilities.linebreakText( this._d3els.title, this._sizes.cwidth );

			if ( this._d3els.title.selectAll( 'tspan' ).size() > 1 ) {
				this._padding.top = 90;
				this.render();
			} else if ( this._padding.top === 90 ) {
				this._padding.top = 60;
				this.render();
			}

		},



		/**
		 * Updates the y-axis label of the chart.
		 *
		 * @public
		 * @function updateYAxisLabel
		 * @param {string} label The label.
		 */
		updateYAxisLabel: function ( label ) {

			// Grab the current labels, and reset them.
			var labels = this._d3els.yAxis.selectAll( 'text' )
				.attr( 'text-anchor', 'end' )
				.attr( 'transform', window.utilities.getTranslateString( 0, 0 ) );

			labels.each( function ( d, i ) {

				// If this is the top-most label...
				if ( i === labels.size() - 1 ) {

					var labelEl = d3.select( this );
					var size;

					if ( !labelEl.classed( 'updated' ) ) {

						size = labelEl.node().getComputedTextLength();

						labelEl.classed( 'updated', true );
						labelEl.attr( 'data-offset', size );

					} else {
						size = labelEl.attr( 'data-offset' )
					}

					labelEl
						.attr( 'text-anchor', 'start' )
						.attr( 'transform', window.utilities.getTranslateString( -size, 0 ) )
						.text( function ( d ) {
							return ( d * 100 ) + label;
						} );

				}

			} );

		},



		updateColorScale: function ( scale ) {

			this._scales.color = scale;

			var lineKeys = this._getSortedKeys( this._data );

			if ( this._chartType === 'area' ) {

				_.each( lineKeys, function ( key, i ) {

					var path = _.find( document.querySelectorAll( '.layer .area-path' ), function ( el ) {
						return d3.select( el ).datum().key === key;
					}.bind( this ) );

					var colorIndex = this._getSortedKeys( this._data ).indexOf( key );

					d3.select( path ).style( 'fill', this._scales.color( colorIndex ) );

				}.bind( this ) );

			} else if ( this._chartType === 'line' ) {

				_.each( lineKeys, function ( key, i ) {

					var line = _.find( document.querySelectorAll( '.line' ), function ( el ) {
						return el.getAttribute( 'data-key' ) === key;
					}.bind( this ) );
					
					var colorIndex = this._getSortedKeys( this._data ).indexOf( key );

					d3.select( line ).style( 'stroke', this._scales.color( i ) );

				}.bind( this ) );

			}

			_.each( this._keys, function ( key ) {

				var label = _.find( this._d3els.labelsWrapper.node().getElementsByTagName( 'text' ), function ( el ) {
					return el.getAttribute( 'data-key' ) === key;
				} );

				var colorIndex = this._getSortedKeys( this._data ).indexOf( key );

				var d3label = d3.select( label );

				if ( d3label.style( 'fill' ) === 'rgb(255, 255, 255)' ) {
					d3label.attr( 'data-fill', this._scales.color( colorIndex ) );
				} else {
					d3label.style( 'fill', this._scales.color( colorIndex ) );
				}

			}.bind( this ) );

		},



		/**
		 * Update the y scale max value.
		 *
		 * @public
		 * @function updateYMax
		 * @params {number} value The max value.
		 */
		updateYMax: function ( value, data, keys ) {

			this._yScaleMax = value;
			this.render( data, keys );

		},



		/**
		 * Sets the dimensions (width, height, cwidth, and cheight).
		 *
		 * @protected
		 * @function _setDimensions
		 */
		_setDimensions: function () {

			this._sizes.width = this._els.sizer.offsetWidth;
			this._sizes.height = this._els.sizer.offsetHeight;

			// This is convenient for the viz. portion of the chart SVG.
			this._sizes.cwidth = this._sizes.width - this._padding.left - this._padding.right;
			this._sizes.cheight = this._sizes.height - this._padding.top - this._padding.bottom;

		},



		/**
		 * Builds the needed base SVG elements.
		 *
		 * @protected
		 * @function _buildSvgElements
		 */
		_buildSvgElements: function () {

			this._d3els.svg = d3.select( '#chart' )
				.attr( 'width', this._sizes.width )
				.attr( 'height', this._sizes.height );

			this._d3els.background = this._d3els.svg.append( 'rect' ).attr( 'id', 'chart-background' )
				.style( 'fill', this._colors.background )
				.style( 'stroke', this._colors.border )
				.style( 'stroke-width', 1 );

			this._d3els.title = this._d3els.svg.append( 'text' ).attr( 'id', 'chart-title' );

			this._d3els.guts = this._d3els.svg.append( 'g' ).attr( 'id', 'chart-guts' );

			this._d3els.layersWrapper = this._d3els.guts.append( 'g' ).attr( 'id', 'chart-layers' );

			this._d3els.linesWrapper = this._d3els.guts.append( 'g' ).attr( 'id', 'chart-lines' );

			this._d3els.axesWrapper = this._d3els.guts.append( 'g' ).attr( 'id', 'chart-axes' );

			this._d3els.labelsWrapper = this._d3els.svg.append( 'g' ).attr( 'id', 'chart-labels' );

			this._d3els.interestPointsWrapper = this._d3els.svg.append( 'g' ).attr( 'id', 'interest-points' );

			this._d3els.yAxis = this._d3els.axesWrapper.append( 'g' ).attr( 'id', 'chart-y-axis' )
				.classed( 'axis', true );

			this._d3els.xAxis = this._d3els.axesWrapper.append( 'g' ).attr( 'id', 'chart-x-axis' )
				.classed( 'axis', true );

			this._d3els.branding = this._d3els.svg.append( 'g' ).attr( 'id', 'chart-branding' );

			this._d3els.organization = this._d3els.branding.append( 'g' ).attr( 'id', 'chart-branding-organization' );

			this._d3els.organizationLogo = this._d3els.organization.append( 'rect' ).attr( 'id', 'chart-branding-organization-logo' );
			this._d3els.organizationName = this._d3els.organization.append( 'text' ).attr( 'id', 'chart-branding-organization-name' );

			this._d3els.dataSource = this._d3els.branding.append( 'text' ).attr( 'id', 'chart-branding-data-source' );

		},



		/**
		 * Builds the base scales so we have something to set later.
		 *
		 * @protected
		 * @function _buildScales
		 * @param {function} colorScale The color scale we generate for both chart and controls.
		 */
		_buildScales: function ( colorScale ) {

			this._scales = {
				x: d3.scaleTime(),
				y: d3.scaleLinear(),
				color: colorScale
			}

		},



		/**
		 * Actually sets the scale values.
		 *
		 * @protected
		 * @function _setScales
		 */
		_setScales: function ( data ) {

			var xMin = d3.min( data, function ( d ) {
				return new Date( d.date );
			} );

			var xMax = d3.max( data, function ( d ) {
				return new Date( d.date );
			} );

			this._scales.x
				.domain( [ xMin, xMax ] )
				.range( [ 0, this._sizes.cwidth ] );

			this._scales.y
				.domain( [ 0, this._yScaleMax ] )
				.range( [ this._sizes.cheight, 0 ] );

		},



		/**
		 * Positions and sizes the base SVG elements.
		 *
		 * @protected
		 * @function _positionAndSizeSvgElements
		 */
		_positionAndSizeSvgElements: function () {

			this._d3els.svg
				.attr( 'width', this._sizes.width )
				.attr( 'height', this._sizes.height );

			this._d3els.background
				.attr( 'width', this._sizes.width )
				.attr( 'height', this._sizes.height )
				.attr( 'x', 0 )
				.attr( 'y', 0 )
				.attr( 'rx', 4 )
				.attr( 'ry', 4 );

			this._d3els.guts.attr( 'transform', window.utilities.getTranslateString( this._padding.left, this._padding.top ) );

			this._d3els.title
				.style( 'font-size', this._sizes.title )
				.attr( 'transform', window.utilities.getTranslateString( this._padding.left, this._padding.title ) );

			this._d3els.xAxis.attr( 'transform', window.utilities.getTranslateString( 0, this._sizes.cheight ) );

		},



		/**
		 * Build Axes
		 *
		 * @protected
		 * @function _buildAxes
		 */
		_buildAxes: function () {

			this._xAxis = d3.axisBottom( this._scales.x )
				.tickFormat( d3.utcFormat( '%b %-d' ) )
				.tickPadding( 12 );

			this._yAxis = d3.axisLeft( this._scales.y )
				.tickFormat( function ( d, i ) {
					return '' + ( Math.round( d * 10000 ) / 100 );
				} );

		},



		/**
		 * Render Axes
		 *
		 * @protected
		 * @function _positionAndSizeAxes
		 */
		_positionAndSizeAxes: function () {

			this._xAxis.tickSize( -this._sizes.cheight );
			this._yAxis.tickSize( -this._sizes.cwidth );

			this._d3els.xAxis.call( this._xAxis );
			this._d3els.yAxis.call( this._yAxis );

			this._d3els.xAxis.selectAll( 'text' ).each( function () {
				var d3el = d3.select( this );
				window.utilities.doubleclick( d3el.node(), function ( e ) {
					var currentFill = d3el.style( 'fill' );
					var oldFill = d3el.attr( 'data-fill' ) || 'transparent';
					d3el.attr( 'data-fill', currentFill );
					d3el.style( 'fill', oldFill );
				} );
			} );

		},



		/**
		 * Sets the aspect ratio as a percent string on the chart sizer element.
		 *
		 * @protected
		 * @function _updateChartSizerSize
		 */
		_updateChartSizerSize: function () {

			var percent = Math.round( this._aspectRatio[1] / this._aspectRatio[0] * 10000 ) / 100;

			this._els.sizer.style.paddingBottom = percent + '%';

		},



		/**
		 * Gets the 'series' data--the form of data we need to pass to the area generator.
		 *
		 * @protected
		 * @function _getSeries
		 * @param {array} data The data object.
		 * @param {array} keys The keys that we want to represent in the chart.
		 * @returns {object} The series.
		 */
		_getSeries: function ( data, keys ) {

			// This is a tricky little mapping call.
			var stackData = _.map( data, function ( d ) {

				// Make a copy of the data so that we can manipulate
				// and still have a reference.
				var copy = _.clone( d );

				// Default every datum to zero.
				_.each( copy, function ( value, key ) { copy[key] = 0; } );

				// Then get the _real_ data and fill in.
				_.each( keys, function ( key ) { copy[key] = parseFloat( d[key] ) } );

				// Move the date over.
				copy.date = d.date;

				return copy;

			} );

			return this._stack( stackData );


		},



		/**
		 * Builds the layers for the area chart.
		 *
		 * @protected
		 * @function _buildLayers
		 */
		_buildLayers: function ( series ) {

			this._d3els.layers = this._d3els.layersWrapper.selectAll( 'g.layer' )
				.data( series )
				.enter()
				.append( 'g' )
				.classed( 'layer', true );

			this._d3els.areaPaths = this._d3els.layers.append( 'path' )
				.classed( 'area-path', true )
				.style( 'fill', function ( d, i ) {
					return this._scales.color( i );
				}.bind( this ) )
				.attr( 'd', this._getArea() );

		},



		/**
		 * Builds the lines for the chart.
		 *
		 * @protected
		 * @function _buildLines
		 */
		_buildLines: function ( data ) {

			var lineKeys = this._getSortedKeys( data );

			_.each( lineKeys, function ( key, i ) {

				this._d3els.linesWrapper.append( 'path' )
					.datum( data )
					.classed( 'line', true )
					.attr( 'data-key', key )
					.style( 'stroke', this._scales.color( i ) )
					.style( 'stroke-width', 2 )
					.attr( 'd', this._getLine( key ) );

			}.bind( this ) );

		},



		/**
		 * Updates already existing linds fo the chart.
		 *
		 * @protected
		 * @function _updateLines
		 */
		_updateLines: function ( data, keys ) {

			this._d3els.linesWrapper.selectAll( '.line' ).style( 'opacity', 1 );
			this._hideInactiveTagLines( data, keys );

			var lineKeys = this._getSortedKeys( data );

			_.each( lineKeys, function ( key, i ) {

				this._d3els.linesWrapper.select( '.line:nth-child(' + ( i + 1 ) + 'n)' )
					.datum( data )
					.attr( 'd', this._getLine( key ) );

			}.bind( this ) );

		},


		/**
		 * Updates already existing layers for the area chart.
		 *
		 * @protected
		 * @function _updateLayers
		 */
		_updateLayers: function ( series ) {

			this._d3els.layers.data( series );
			this._d3els.layers.select( 'path' ).attr( 'd', this._getArea() );

		},


		/**
		 * Gets the area for a layer. Used to get the 'd' property of a path.
		 *
		 * @protected
		 * @function _getArea
		 */
		_getArea: function () {
			return d3.area()
				.x( function ( d ) { return this._scales.x( new Date( d.data.date ) ); }.bind( this ) )
				.y0( function ( d ) { return this._scales.y( d[0] ); }.bind( this ) )
				.y1( function ( d ) { return this._scales.y( d[1] ); }.bind( this ) );
		},



		/**
		 * Gets the lines for the chart. Used to get the 'd' property of a path.
		 *
		 * @protected
		 * @function _getLine
		 * @param {string} key The key for the data we want.
		 */
		_getLine: function ( key ) {
			return d3.line()
				.x( function ( d ) { return this._scales.x( new Date( d.date ) ); }.bind( this ) )
				.y( function ( d ) { return this._scales.y( d[key] ); }.bind( this ) );
		},



		/**
		 * Adds branding to the bottom of the chart.
		 *
		 * @protected
		 * @function _addBranding
		 */
		_addBranding: function () {

			this._d3els.branding.attr( 'transform', window.utilities.getTranslateString( this._padding.left, ( this._padding.top + this._sizes.cheight + this._padding.branding.top + this._sizes.branding ) ) );

			this._d3els.dataSource
				.text( this._dataSource )
				.attr( 'text-anchor', 'end' )
				.attr( 'x', this._sizes.cwidth )
				.style( 'font-size', this._sizes.branding )
				.style( 'fill', this._colors.branding );

			this._d3els.organizationName
				.text( this._orgainizationName )
				.attr( 'x', this._padding.branding.left )
				.style( 'font-size', this._sizes.branding )
				.style( 'fill', this._colors.branding );

		},



		/**
		 * Cleans out the unnecessary data for the lines.
		 *
		 * @protected
		 * @function _getLineData
		 */
		_getLineData: function ( data, keys ) {

			// This is a tricky little mapping call.
			return _.map( data, function ( d ) {

				// Make a copy of the data so that we can manipulate
				// and still have a reference.
				var copy = _.clone( d );

				// Default every datum to zero.
				_.each( copy, function ( value, key ) { copy[key] = 0; } );

				// Then get the _real_ data and fill in.
				_.each( keys, function ( key ) { copy[key] = parseFloat( d[key] ) } );

				// Move the date over.
				copy.date = d.date;

				return copy;

			} );

		},



		/**
		 * Sorts the keys for lines.
		 *
		 * @protected
		 * @function _getSortedKeys
		 */
		_getSortedKeys: function ( data ) {

			return _.filter( _.keys( data[0] ), function ( d ) { return d !== 'date' } ).sort( function ( a, b ) {
				return this._sortKeys.indexOf( a ) > this._sortKeys.indexOf( b ) ? 1 : -1;
			}.bind( this ) );

		},


		/**
		 * Hides unchecked lines.
		 *
		 *
		 * @protected
		 * @function _hideInactiveTagLines
		 */
		_hideInactiveTagLines: function ( data, keys ) {

			var keysFromData = this._getSortedKeys( data );

			_.each( keysFromData, function ( key, i ) {

				if ( keys.indexOf( key ) === -1 ) {
					this._d3els.linesWrapper.select( '.line:nth-child(' + ( i + 1 ) + 'n)' )
						.style( 'opacity', 0 );
				}

			}.bind( this ) );

		},



		/**
		 * Creates labels for the chart.
		 *
		 *
		 * @protected
		 * @function _createLabels
		 */
		_createLabels: function ( data, keys ) {

			var labelKeys = this._getSortedKeys( data );

			_.each( labelKeys, function ( key, i ) {

				if ( keys.indexOf( key ) > -1 ) {

					this._createLabel( key, false, i );

				}

			}.bind( this ) );

			this._labelsRendered = true;

		},



		_createLabel: function ( key, label, colorIndex ) {

			if ( !label ) {
				label = key;
			}

			var x = this._padding.left;
			var y = this._padding.title + 10;

			var label = this._d3els.labelsWrapper.append( 'text' )
				.classed( 'label', true )
				.classed( 'draggable', true )
				.classed( 'label-text', true )
				.classed( 'is-undragged', true )
				.style( 'fill', function () { return this._scales.color( colorIndex ) }.bind( this ) )
				.attr( 'transform', window.utilities.getTranslateString( x, y ) )
				.text( label );

			label.node().setAttribute( 'data-key', key );

			this._bindLabel( label.node() );

		},



		_bindLabel: function ( el ) {

			var drag = d3.drag()
				.on( 'drag', function ( d ) {
					d3.select( this ).attr( 'transform', window.utilities.getTranslateString( d3.event.x, d3.event.y ) );
				} );
			d3.select( el ).call( drag );

			var secondClick = function ( e ) {
				var d3el = d3.select( e.target );
				var currentFill = d3el.style( 'fill' );
				var oldFill = d3el.attr( 'data-fill' ) || '#ffffff';
				d3el.attr( 'data-fill', currentFill );
				d3el.style( 'fill', oldFill );
			};

			var firstClick = function ( e ) {
				e.target.addEventListener( 'click', secondClick );
				window.setTimeout( function () {
					e.target.removeEventListener( 'click', secondClick );
				}.bind( this ), 500 );
			};

			el.addEventListener( 'click', firstClick );

		},



		toggleInputPointHandles: function ( index ) {

			var point = document.getElementById( 'interest-point-' + index );

			point.classList.toggle( 'handles-disabled' );

			var opacity = point.classList.contains( 'handles-disabled' ) ? 0 : 0.5;

			_.each( point.getElementsByClassName( 'interest-point-handle' ), function ( el ) {
				el.style.opacity = opacity
			} );

		},




		createInterestPoint: function ( text, index ) {

			var drag = d3.drag()
				.on( 'drag', function ( d ) {
					d3.select( this ).attr( 'transform', window.utilities.getTranslateString( d3.event.x, d3.event.y ) );
				} );

			var point = this._d3els.interestPointsWrapper.append( 'g' )
				.attr( 'id', 'interest-point-' + index )
				.attr( 'class', 'interest-point' );

			point.append( 'text' )
				.text( text )
				.attr( 'y', this._sizes.interestPoint )
				.attr( 'font-size', this._sizes.interestPoint )
				.style( 'fill', this._colors.black )
				.classed( 'draggable', true )
				.call( drag );

			var lineWrapper = point.append( 'g' )
				.classed( 'interets-point-line-wrapper', true );

			var line = lineWrapper.append( 'line' )
				.attr( 'id', 'interest-point-' + index + '-line' )
				.attr( 'x1', 10 )
				.attr( 'y1', 10 )
				.attr( 'x2', 20 )
				.attr( 'y2', 20 )
				.style( 'stroke', this._colors.black )
				.style( 'stroke-width', 2 );

			var line0Drag = d3.drag()
				.on( 'drag', function ( d ) {
					d3.select( this ).attr( 'transform', window.utilities.getTranslateString( d3.event.x, d3.event.y ) );
					line.attr( 'x1', d3.event.x )
					line.attr( 'y1', d3.event.y );
				} );

			var line0Handle = lineWrapper.append( 'circle' )
				.attr( 'cx', 0 )
				.attr( 'cy', 0 )
				.attr( 'r', 4 )
				.classed( 'interest-point-handle', true )
				.attr( 'transform', window.utilities.getTranslateString( 10, 10 ) )
				.style( 'opacity', 0.5 )
				.style( 'fill', this._colors.black )
				.call( line0Drag );

			var line1Drag = d3.drag()
				.on( 'drag', function ( d ) {
					d3.select( this ).attr( 'transform', window.utilities.getTranslateString( d3.event.x, d3.event.y ) );
					line.attr( 'x2', d3.event.x )
					line.attr( 'y2', d3.event.y );
				} );

			var line1Handle = lineWrapper.append( 'circle' )
				.attr( 'cx', 0 )
				.attr( 'cy', 0 )
				.attr( 'r', 4 )
				.classed( 'interest-point-handle', true )
				.attr( 'transform', window.utilities.getTranslateString( 20, 20 ) )
				.style( 'opacity', 0.5 )
				.style( 'fill', this._colors.black )
				.call( line1Drag );

			point.append( 'circle' )
				.attr( 'r', 10)
				.style( 'fill', 'transparent' )
				.style( 'stroke', this._colors.black )
				.style( 'stroke-width', '2px' )
				.attr( 'cx', 5 )
				.attr( 'cy', 5 )
				.classed( 'draggable', true )
				.classed( 'interest-point-circle', true )
				.call( drag );

			var changeColor = function ( e ) {
				var d3el = d3.select( e.target );
				var attribute = e.target.tagName === 'text' ? 'fill' : 'stroke';
				var currentFill = d3el.style( attribute );
				var penultimateFill = d3el.attr( 'data-penultimate-fill' ) || this._colors.grey;
				var ultimateFill = d3el.attr( 'data-ultimate-fill' ) || this._colors.white;
				d3el.attr( 'data-penultimate-fill', ultimateFill );
				d3el.attr( 'data-ultimate-fill', currentFill );
				d3el.style( attribute, penultimateFill );
				if ( e.target.tagName === 'text' ) {
					e.target.parentNode.getElementsByTagName( 'line' )[0].style.stroke = penultimateFill;
				}
			};

			window.utilities.doubleclick( point.select( 'text' ).node(), changeColor.bind( this ) );
			window.utilities.doubleclick( point.select( 'line' ).node(), changeColor.bind( this ) );
			window.utilities.doubleclick( point.select( '.interest-point-circle' ).node(), changeColor.bind( this ) );

		},



		updateInterestPoint: function ( text, index ) {
			d3.select( '#interest-point-' + index )
				.select( 'text' )
				.text( text );
		}



	};



	// Set on the window object.
	this.chart = chart;



} ).apply( window );