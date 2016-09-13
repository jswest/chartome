( function () {

	// @todo Make custom color scales.
	var colors = {
		red: d3.rgb( '#af4b4b' ),
		orange: d3.rgb( d3.interpolateRgb( '#af4b4b', '#afaf00' )( 0.5 ) ),
		yellow: d3.rgb( '#afaf00' ) ,
		green: d3.rgb( '#4baf4b' ),
		blue: d3.rgb( '#4b4baf' ),
		violet: d3.rgb( d3.interpolateRgb( '#af4b4b', '#4b4baf' )( 0.5 ) )
	};

	var range = [
		colors.red,
		colors.green,
		colors.orange,
		colors.blue,
		colors.yellow,
		colors.violet,
		colors.red.brighter( 1 ),
		colors.green.brighter( 1 ),
		colors.orange.brighter( 1 ),
		colors.blue.brighter( 1 ),
		colors.yellow.brighter( 1 ),
		colors.violet.brighter( 1 ),
		colors.red.darker( 2 ),
		colors.green.darker( 2 ),
		colors.blue.darker( 2 ),
		colors.orange.darker( 2 ),
		colors.yellow.darker( 2 ),
		colors.violet.darker( 2 ),
		colors.red.darker( 1 ),
		colors.green.darker( 1 ),
		colors.blue.darker( 1 ),
		colors.orange.darker( 1 ),
		colors.yellow.darker( 1 ),
		colors.violet.darker( 1 )
	];

	var colorScale = d3.scaleOrdinal( range );

	var areaChartButton = document.getElementById( 'chart-type-chooser-area' );
	var lineChartButton = document.getElementById( 'chart-type-chooser-line' );
	var lineAndAreaCharterWrapper = document.getElementById( 'line-and-area-charter-wrapper' );
	var chartTypeChooser = document.getElementById( 'chart-type-chooser' );

	areaChartButton.addEventListener( 'click', function () {
		initialize( 'area' );
	} );
	lineChartButton.addEventListener( 'click', function () {
		initialize( 'line' );
	} );

	var initialize = function ( type ) {

		lineAndAreaCharterWrapper.classList.remove( 'inactive' );
		chartTypeChooser.classList.add( 'inactive' );

		window.chart.initialize( {
			colorScale: colorScale,
			type: type
		} );

		window.controls.initialize( {
			colorScale: colorScale,
			chartElId: '#chart'
		} );

	};

	this.colorMap = [
		colors.red,
		colors.green,
		colors.orange,
		colors.blue,
		colors.yellow,
		colors.violet,
		colors.red.brighter( 1 ),
		colors.green.brighter( 1 ),
		colors.orange.brighter( 1 ),
		colors.blue.brighter( 1 ),
		colors.yellow.brighter( 1 ),
		colors.violet.brighter( 1 ),
		colors.red.darker( 2 ),
		colors.green.darker( 2 ),
		colors.blue.darker( 2 ),
		colors.orange.darker( 2 ),
		colors.yellow.darker( 2 ),
		colors.violet.darker( 2 ),
		colors.red.darker( 1 ),
		colors.green.darker( 1 ),
		colors.blue.darker( 1 ),
		colors.orange.darker( 1 ),
		colors.yellow.darker( 1 ),
		colors.violet.darker( 1 )
	];

} )();