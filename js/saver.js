( function () {



	var saver = {


		// The gist of this was taken from the NYTimes's excellent
		// SVG Crowbar bookmarklet from Chrome.
		_setComputedStyle: function ( element ) {

			var computedStyles = window.getComputedStyle( element );
			var computedStylesString = '';
			_.each( computedStyles, function ( property, key ) {
				computedStylesString += property + ':' + computedStyles.getPropertyValue( property ) + ';';
			} );

			element.setAttribute( 'style', computedStylesString );

		},



		_traverseNodes: function ( node ) {

			var tree = [];
			tree.push( node );

			var visitNode = function ( node ) {
				if ( node && node.hasChildNodes() ) {
					var childNode = node.firstChild;
					while ( childNode ) {
						if ( childNode.nodeType === 1 ) {
							tree.push( childNode );
							visitNode( childNode )
						}
						childNode = childNode.nextSibling;
					}
				}
			};

			visitNode( node );

			return tree;

		},



		/**
		 * Given a node, it recurses through the children and assigns their computed styles explicity.
		 *
		 * @protected
		 * @function setInlineStyles
		 * @param {object} node The node.
		 */
		setInlineStyles( node ) {

			var elements = this._traverseNodes( node );

			_.each( elements, function ( element ) {
				this._setComputedStyle( element );
			}.bind( this ) );

		}



	}



} ).apply( window );