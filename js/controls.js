( function () {



	var controls = {



		/**
		 * The empty _els element is a placeholder for the elements we need.
		 *
		 * @protected
		 */
		_els: {},



		initialize: function ( options ) {

			this._scales = { color: options.colorScale };

			this._d3els = {
				chart: d3.select( options.chartElId )
			};

			this._setEls();

			this._els.form.addEventListener( 'submit', function ( e ) {
				e.preventDefault();
			} );

			this._bindCsvUpload();
			this._bindTitleKeyup();
			this._bindYAxisLabelKeyup();
			this._bindYAxisMaxKeyup();
			this._bindAspectRatioKeyup();
			this._bindSaveChartClick();
			var interestPointInput = this._els.interestPointInputWrapper.getElementsByTagName( 'input' )[0];
			interestPointInput.addEventListener( 'keyup', function () {
				this._bindInterestPointKeyup( interestPointInput );
			}.bind( this ) );
			var interestPointAddon = this._els.interestPointInputWrapper.getElementsByClassName( 'chart-interest-point-handles-toggle' )[0];
			interestPointAddon.addEventListener( 'click', function () {
				this._bindInterestPointHandlesClick( interestPointAddon );
			}.bind( this ) );
			

		},



		_setEls: function () {

			this._els.form = document.getElementById( 'controls-form' );
			this._els.csvInput = document.getElementById( 'csv-upload-input' );
			this._els.csvLabel = document.getElementById( 'csv-upload-label' );
			this._els.titleInput = document.getElementById( 'chart-title-input' );
			this._els.keysList = document.getElementById( 'chart-keys-list' );
			this._els.yAxisLabelInput = document.getElementById( 'chart-y-axis-label-input' );
			this._els.yAxisMaxInput = document.getElementById( 'chart-y-axis-max-input' );
			this._els.saveChartButton = document.getElementById( 'save-chart-button' );
			this._els.aspectRatioInput = document.getElementById( 'chart-aspect-ratio-input' );
			this._els.chartWidthInput = document.getElementById( 'chart-width-input' );
			this._els.interestPointInputWrapper = document.getElementById( 'chart-interest-point-input-wrapper' );

			this._els.postUploadControls = document.getElementsByClassName( 'post-upload-controls' );

		},



		_bindCsvUpload: function () {

			this._els.csvInput.addEventListener( 'change', function ( e ) {

				// Note that we've started the process.
				this._els.csvLabel.innerHTML = 'Uploading...';

				// Disable the ability to upload more.
				this._els.csvLabel.classList.add( 'disabled' );
				this._els.csvInput.disabled = true;

				// Check that we have something.
				if ( e.target.files && e.target.files.length > 0 ) {

					this._els.csvLabel.innerHTML = 'Parsing...';

					// Make a file reader.
					var reader = new window.FileReader();

					// On load, have it actually parse the CSV.
					reader.addEventListener( 'load', function ( e ) {

						// Parse the data.
						this._data = d3.csvParse( e.target.result );

						// Note that we've done it!
						this._els.csvLabel.innerHTML = 'CSV uploaded.';

						var keys = this._extractKeys();

						this._createAndBindKeyElements( keys );

						window.chart.render( this._data, keys );

						_.each( this._els.postUploadControls, function ( el ) { el.disabled = false; } );
						this._els.saveChartButton.classList.remove( 'disabled' );

					}.bind( this ) );

					reader.readAsText( e.target.files[0] );

				}

			}.bind( this ) );

		},



		/**
		 * Exracts the keys from the data
		 *
		 * @protected
		 * @function _extractKeys
		 * @returns {array} An array of keys.
		 */
		_extractKeys: function () {

			var rawKeys = _.keys( this._data[0] );

			var filteredKeys = _.filter( rawKeys, function ( k ) { return k !== 'date' } );

			// Now, put the keys in the proper order.
			var totals = {};

			_.each( filteredKeys, function ( k ) {

				totals[k] = 0;

				_.each( this._data, function ( d ) {
					totals[k] += parseFloat( d[k] );
				} );

			}.bind( this ) );

			var sortedKeys = filteredKeys.sort( function ( a, b ) { return totals[a] > totals[b] ? -1 : 1 } );

			return sortedKeys;

		},



		/**
		 * Creates the key elements in the controls UI.
		 *
		 * @protected
		 * @function _createAndBindKeyElements
		 * @param {array} keys The keys.
		 */
		_createAndBindKeyElements: function ( keys ) {

			// Create the actual key elements.
			_.each( keys, function ( key, i ) {

				var li = document.createElement( 'li' );
				li.classList.add( 'input-group' );
				li.classList.add( 'chart-key-item' );
				li.classList.add( 'active' );
				li.dataset.key = key;

				var colorblock = document.createElement( 'div' );
				colorblock.classList.add( 'color-block' );
				colorblock.classList.add( 'input-group-addon' );
				colorblock.style.backgroundColor = this._scales.color( i );
				colorblock.innerHTML = '&nbsp;';
				li.appendChild( colorblock );

				var tagname = document.createElement( 'input' );
				tagname.classList.add( 'tag-name' );
				tagname.classList.add( 'form-control' );
				tagname.value = key;
				li.appendChild( tagname );

				var checkbox = document.createElement( 'div' );
				checkbox.classList.add( 'input-group-addon' );
				checkbox.classList.add( 'chart-key-item-check' );
				checkbox.innerHTML = '✕';
				li.appendChild( checkbox );

				this._els.keysList.appendChild( li );

			}.bind( this ) );

			// Now (in the darkness) bind them.
			var checkmarkEls = document.getElementsByClassName( 'chart-key-item-check' );

			_.each( checkmarkEls, function ( checkmarkEl ) {

				checkmarkEl.addEventListener( 'click', function ( e ) {

					checkmarkEl.parentNode.classList.toggle( 'active' );

					if ( checkmarkEl.parentNode.classList.contains( 'active' ) ) {
						checkmarkEl.innerHTML = '✕';
					} else {
						checkmarkEl.innerHTML = '✓';
					}

					var labels = _.map( document.getElementsByClassName( 'active chart-key-item' ), function ( ael ) {
						return { label: ael.getElementsByClassName( 'tag-name' )[0].value, key: ael.dataset.key };
					} );
					var activeKeys = _.map( labels, function ( l ) { return l.key } );

					window.chart.updateKeys( activeKeys, labels );

				}.bind( this ) );

				var liEl = checkmarkEl.parentNode;
				liEl.addEventListener( 'keyup', function ( e ) {

					window.chart.updateLabel( liEl.dataset.key, liEl.getElementsByClassName( 'tag-name' )[0].value );

				} );

				var colorEl = liEl.getElementsByClassName( 'color-block' )[0];
				colorEl.addEventListener( 'click', function ( e ) {

					var index = window.utilities.getIndexInParent( liEl );

					var pickerBackground = document.createElement( 'div' );
					pickerBackground.id = 'color-picker-background';

					var picker = document.createElement( 'div' );
					picker.id = 'color-picker';
					pickerBackground.appendChild( picker );

					_.each( window.colorMap, function ( color, i ) {
						var block = document.createElement( 'div' )
						block.classList.add( 'block' );
						block.style.backgroundColor = color;
						picker.appendChild( block );
						block.addEventListener( 'click', function ( e ) {
							document.body.removeChild( pickerBackground );
							document.getElementById( 'main-content' ).classList.remove( 'blur' );
							var range = this._scales.color.range();
							range.splice( index, 1, window.colorMap[i] );
							this._scales.color.range( range );
							window.chart.updateColorScale( this._scales.color );
							colorEl.style.backgroundColor = block.style.backgroundColor;
						}.bind( this ) );
					}.bind( this ) );

					var clearer = document.createElement( 'div' );
					clearer.classList.add( 'clear' );
					picker.appendChild( clearer )

					document.getElementById( 'main-content' ).classList.add( 'blur' );
					document.body.appendChild( pickerBackground );

				}.bind( this ) );

			}.bind( this ) );

		},



		/**
		 * Binds the keystrokes on the title to the chart.
		 *
		 * @protected
		 * @function _bindTitleKeyup
		 */
		_bindTitleKeyup: function () {

			this._els.titleInput.addEventListener( 'keyup', function ( e ) {

				if ( e.target.value.length < 3 ) {
					this._els.titleInput.parentNode.classList.add( 'has-danger' );
				} else {
					this._els.titleInput.parentNode.classList.remove( 'has-danger' );
				}

				window.chart.updateTitle( this._els.titleInput.value );

			}.bind( this ) );

		},



		/**
		 * Binds the keystrokes on the y-axis label to the chart.
		 *
		 * @protected
		 * @function _bindYAxisLabelKeyup
		 */
		_bindYAxisLabelKeyup: function () {

			this._els.yAxisLabelInput.addEventListener( 'keyup', function ( e ) {
				window.chart.updateYAxisLabel( e.target.value );
			} );

		},



		/**
		 * Binds the keystorkes on the y-axis max input to the chart.
		 *
		 * @protected
		 * @function _bindYAxisMaxKeyup
		 */
		_bindYAxisMaxKeyup: function () {

			this._els.yAxisMaxInput.addEventListener( 'keyup', function ( e ) {

				// Get the percent.
				var percent = parseFloat( this._els.yAxisMaxInput.value );

				// If it's in range, reset the value. Else, set the default.
				if ( percent <= 100 && percent >= 0 ) {
					var value = percent / 100;
					this._els.yAxisMaxInput.parentNode.classList.remove( 'has-danger' );
				} else {
					var value = 1;
					this._els.yAxisMaxInput.parentNode.classList.add( 'has-danger' );
				}

				var activeKeys = _.map( document.getElementsByClassName( 'active chart-key-item' ), function ( ael ) {
					return ael.getElementsByClassName( 'tag-name' )[0].value;
				} );

				window.chart.updateYMax( value, this._data, activeKeys );

			}.bind( this ) );

		},



		/**
		 * Binds the keystrokes on the aspect ratio input to the chart.
		 *
		 * @protected
		 * @function _bindAspectRatioKeyup
		 */
		_bindAspectRatioKeyup: function () {

			this._els.aspectRatioInput.addEventListener( 'keyup', function ( e ) {

				var value = this._els.aspectRatioInput.value.split( ':' );

				if ( value.length < 2 || value.length > 2 ) {
					this._els.aspectRatioInput.parentNode.classList.add( 'has-danger' );

				} else {

					this._els.aspectRatioInput.parentNode.classList.remove( 'has-danger' );

					var activeKeys = _.map( document.getElementsByClassName( 'active chart-key-item' ), function ( ael ) {
						return ael.getElementsByClassName( 'tag-name' )[0].innerHTML;
					} );

					window.chart.updateAspectRatio( value, this._data, activeKeys );

				}

			}.bind( this ) );

		},



		/**
		 * Binds the save chart click to save the chart.
		 *
		 * @protected
		 * @function _bindSaveChartClick
		 */
		_bindSaveChartClick: function () {

			this._els.saveChartButton.addEventListener( 'click', function ( e ) {

				var chartWidth = parseFloat( this._d3els.chart.attr( 'width' ) );
				var chartHeight = parseFloat( this._d3els.chart.attr( 'height' ) );

				var width = parseFloat( this._els.chartWidthInput.value ) || 1600;
				var modifier = width / chartWidth;

				this._d3els.chart
					.attr( 'viewBox', '0 0 ' + chartWidth + ' ' + chartHeight )
					.style( 'width', chartWidth * modifier )
					.style( 'height', chartHeight * modifier )
					.attr( 'width', chartWidth * modifier )
					.attr( 'height', chartHeight * modifier );

				window.utilities.setInlineStyles( this._d3els.chart.node() );

				var html = d3.select( '#chart' )
					.attr( 'version', 1.1 )
					.attr( 'xmlns', 'http://www.w3.org/2000/svg' )
					.attr( 'viewbox', '0 0 ' + chartWidth + ' ' + chartHeight )
					.attr( 'preserveAspectRatio', 'xMidYMid meet' )
					.node().parentNode.innerHTML;

				this._d3els.chart
					.style( 'width', chartWidth )
					.style( 'height', chartHeight )
					.attr( 'width', chartWidth )
					.attr( 'height', chartHeight );


				var src = 'data:image/svg+xml;base64,'+ window.btoa( html );

				var image = new Image();
				image.width = chartWidth * modifier;
				image.height = chartHeight * modifier;
				image.src = src;
				image.id = 'saving-image';
				this._d3els.chart.node().parentNode.appendChild( image );
				image.onload = function ( e ) {

					var canvas = document.getElementById( 'saving-canvas' );
					canvas.width = chartWidth * modifier;
					canvas.height = chartHeight * modifier;
					var context = canvas.getContext( '2d' );

					context.drawImage( image, 0, 0 );

					var anchor = document.createElement("a");
					var title = this._els.titleInput.value;
					title = title ? title.split( ' ' ).join( '-' ) + '.png' : 'unknown.png';
					anchor.download = title;
					anchor.href = canvas.toDataURL( 'image/png' );
					anchor.click();

				}.bind( this );


			}.bind( this ) );

		},



		_bindInterestPointKeyup: function ( el ) {

			var index = window.utilities.getIndexInParent( el.parentNode.parentNode );

			if ( !el.classList.contains( 'started' ) ) {
				el.classList.add( 'started' )
				this._createInterestPointInput();
				window.chart.createInterestPoint( el.value, index )
			}

			window.chart.updateInterestPoint( el.value, index );

		},



		_bindInterestPointHandlesClick: function ( el ) {

			var index = window.utilities.getIndexInParent( el.parentNode.parentNode );

			el.classList.toggle( 'toggled' );

			window.chart.toggleInputPointHandles( index );

		},



		_createInterestPointInput: function () {

			var div = document.createElement( 'div' );
			div.classList.add( 'form-group' );

			var label = document.createElement( 'label' );
			label.innerHTML = 'Add interest point.';
			div.appendChild( label );

			var inputGroup = document.createElement( 'div' );
			inputGroup.classList.add( 'input-group' );
			div.appendChild( inputGroup );

			var input = document.createElement( 'input' );
			input.type = 'text';
			input.classList.add( 'chart-interest-point-input' );
			input.classList.add( 'form-control' );
			input.classList.add( 'post-upload-controls' );
			inputGroup.appendChild( input );

			var addon = document.createElement( 'div' )
			addon.classList.add( 'chart-interest-point-handles-toggle' );
			addon.classList.add( 'input-group-addon' );
			addon.innerHTML = '●';
			inputGroup.appendChild( addon );

			this._els.interestPointInputWrapper.appendChild( div );

			div.addEventListener( 'keyup', function ( e ) {
				this._bindInterestPointKeyup( input );
			}.bind( this ) );

			addon.addEventListener( 'click', function ( e ) {
				this._bindInterestPointHandlesClick( addon );
			}.bind( this ) );

		}




	};



	// Set on the window object.
	this.controls = controls;



} ).apply( window );