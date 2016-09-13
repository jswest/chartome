( function () {



	var utilities = {


		/**
		 * Gets a translate string for a transform.
		 *
		 * @public
		 * @function _getTranslateString
		 * @param {number} x The x value of the transform.
		 * @param {number} y The y value of the transform.
		 * @returns {string} A d3-friendly string for translating an element.
		 */
		getTranslateString: function ( x, y ) {

			return 'translate(' + x + ',' + y + ')';

		},



		/**
		 * Sets a computed style of an element as the actual style.
		 * Thanks to the NYTimes for their excellent SVG Crowbar tool!
		 * I copied their appraoch.
		 *
		 * @protected
		 * @function _setComputedStyle
		 * @param {object} element An element.
		 */
		_setComputedStyle: function ( element ) {

			var computedStyles = window.getComputedStyle( element );
			var computedStylesString = '';
			_.each( computedStyles, function ( property, key ) {
				if ( !( element.tagName === 'rect' && ( property === 'width' || property === 'height' ) )  ) {
					computedStylesString += property + ':' + computedStyles.getPropertyValue( property ) + ';';
				}
			} );

			element.setAttribute( 'style', computedStylesString );

		},



		/**
		 * Recruses through a node's children.
		 * Thanks to the NYTimes for their excellent SVG Crowbar tool!
		 * I copied their appraoch.
		 *
		 * @protected
		 * @function _traverseNodes
		 * @param {object} node Any node.
		 */
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
		 * Thanks to the NYTimes for their excellent SVG Crowbar tool!
		 * I copied their appraoch.
		 *
		 * @public
		 * @function setInlineStyles
		 * @param {object} node The node.
		 */
		setInlineStyles( node ) {

			var elements = this._traverseNodes( node );

			_.each( elements, function ( element ) {
				this._setComputedStyle( element );
			}.bind( this ) );

		},



		/**
		 * Linebreak text.
		 * Thanks to Mike Bostock
		 *
		 * @public
		 * @function linebreakText
		 * @param {object} d3el The d3 element. 
		 * @param {string} text The text to linebreak.
		 * @param {number} width The width you want to break before.
		 */
		linebreakText: function ( textEl, width ) {

			var words = textEl.text().split( /\s+/ ).reverse();
			var word;
			var line = [];
			var lineNumber = 0;
			var lineHeight = 1.2; // ems.

			textEl.text( null )
			var tspan = textEl.append( 'tspan' )
				.attr( 'x', 0 )
				.attr( 'y', 0 )
				.attr( 'dy', '0em' );

			while ( word = words.pop() ) {
				line.push( word );
				tspan.text( line.join( ' ' ) );
				if ( tspan.node().getComputedTextLength() > width ) {
					line.pop();
					tspan.text( line.join( ' ' ) );
					line = [ word ];
					lineNumber++;
					tspan = textEl.append( 'tspan' )
						.attr( 'x', 0 )
						.attr( 'y', 0 )
						.attr( 'dy', ( lineNumber * lineHeight ) + 'em' )
						.text( word );
				}
			}

		},



		/**
		 * Gets the index of an element inside its parent.
		 * http://stackoverflow.com/questions/28229564/jquery-index-equivalant-in-vanilla-js
		 *
		 * @public
		 * @function getIndexInParent
		 * @param {object} el The element.
		 * @returns {number} The index.
		 */
		getIndexInParent: function ( el ) {
			return [].slice.call( el.parentNode.children ).indexOf( el );
		},



		/**
		 * Adds a doubleclick handler to an element.
		 *
		 * @public
		 * @function doubleclick
		 * @param {object} el The element you want to attach
		 * @param {function} handler What you want to do once you've got a doubleclick.
		 */
		doubleclick: function ( el, handler ) {

			var first = function ( e ) {
				var target = e.originalTarget || e.target;
				target.addEventListener( 'click', handler );
				window.setTimeout( function () {
					target.removeEventListener( 'click', handler );
				}.bind( this ), 500 );
			};

			el.addEventListener( 'click', first );

		}



	};



	this.utilities = utilities;



} ).apply( window );