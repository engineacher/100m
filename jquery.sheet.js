/*
 jQuery.sheet() The Web Based Spreadsheet
 $Id$
 http://code.google.com/p/jquerysheet/

 Copyright (C) 2010 Robert Plummer
 Dual licensed under the LGPL v2 and GPL v2 licenses.
 http://www.gnu.org/licenses/
 */

/*
 Dimensions Info:
 When dealing with size, it seems that outerHeight is generally the most stable cross browser
 attribute to use for bar sizing.  We try to use this as much as possible.  But because col's
 don't have boarders, we subtract or add jS.s.boxModelCorrection for those browsers.
 tr/td column and row Index VS cell/column/row index
 DOM elements are all 0 based (tr/td/table)
 Spreadsheet elements are all 1 based (A1, A1:B4, TABLE2:A1, TABLE2:A1:B4)
 Column/Row/Cell
 DOCTYPE:
 It is recommended to use STRICT doc types on the viewing page when using sheet to ensure that the heights/widths of bars and sheet rows show up correctly
 Example of recommended doc type: <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
 */

jQuery.fn.extend({
	sheet: function(settings) {
		jQuery(this).each( function() {
			var parent = jQuery(this);
			var set = jQuery.extend({
				urlGet: 			"sheets/developer.documentation.html", //local url, if you want to get a sheet from a url
				editable: 			true, 							//bool, Makes the jSheetControls_formula & jSheetControls_fx appear
				menu:				"",							//menu AS STRING!, overrides urlMenu
				newColumnWidth: 	40, 							//int, the width of new columns or columns that have no width assigned
				title: 				"100m calc", 							//html, general title of the sheet group
				parent: 			parent, 					//object, sheet's parent, DON'T CHANGE
				colMargin: 			30, 							//int, the height and the width of all bar items, and new rows
				//fn, called just before jQuery.sheet loads
				fnAfter: function() {
				},	 				//fn, called just after all sheets load
				fnClose: function() {
				}, 					//fn, default clase function, more of a proof of concept
				fnAfterCellEdit: function() {
				},					//fn, called just after someone edits a cell
				fnSwitchSheet: function() {
				},					//fn, called when a spreadsheet is switched inside of an instance of sheet
				fnPaneScroll: function() {
				},					//fn, called when a spreadsheet is scrolled
				boxModelCorrection: 2, 								//int, attempts to correct the differences found in heights and widths of different browsers, if you mess with this, get ready for the must upsetting and delacate js ever
				calculations: {},								//object, used to extend the standard functions that come with sheet
				cellSelectModel: 	'excel',						//string, 'excel' || 'oo' || 'gdocs' Excel sets the first cell onmousedown active, openoffice sets the last, now you can choose how you want it to be ;)
				resizable: 			false,							//bool, makes the $(obj).sheet(); object resizeable, also adds a resizable formula textarea at top of sheet
				autoFiller: 		false,							//bool, the little guy that hangs out to the bottom right of a selected cell, users can click and drag the value to other cells
				minSize: {
					rows: 10,
					cols: 10
				},			//object - {rows: int, cols: int}, Makes the sheet stay at a certain size when loaded in edit mode, to make modification more productive
				forceColWidthsOnStartup:false,						//bool, makes cell widths load from pre-made colgroup/col objects, use this if you plan on making the col items, makes widths more stable on startup
			}, settings);

			if (jQuery.sheet.instance) {
			} else {
				parent.sheetInstance = jQuery.sheet.createInstance(set, 0, parent);
				jQuery.sheet.instance = [parent.sheetInstance];
			}

		});
		return this;
	},
	getSheet: function() {
		var I = parseInt(jQuery(this).attr('sheetInstance'));
		if (!isNaN(I)) {
			return jQuery.sheet.instance[I];
		}
		return false;
	}
});

jQuery.sheet = {
	createInstance: function(s, I, origParent) { //s = jQuery.sheet settings, I = jQuery.sheet Instance Integer
		var jS = {
			version: '2.0.0 trunk',
			i: 0,
			I: I,
			sheetCount: 0,
			spreadsheets: [], //the actual spreadsheets are going to be populated here
			obj: {//obj = object references
				//Please note, class references use the tag name because it's about 4 times faster

				barCorner: function() {
					return jQuery('#' + jS.id.barCorner + jS.i);
				},
				barCornerAll: function() {
					return s.parent.find('div.' + jS.cl.barCorner);
				},
				barCornerParent: function() {
					return jQuery('#' + jS.id.barCornerParent + jS.i);
				},
				barCornerParentAll: function() {
					return s.parent.find('td.' + jS.cl.barCornerParent);
				},
				barHelper: function() {
					return jQuery('div.' + jS.cl.barHelper);
				},
				barLeft: function() {
					return jQuery('#' + jS.id.barLeft + jS.i);
				},
				barLeftAll: function() {
					return s.parent.find('div.' + jS.cl.barLeft);
				},
				barLeftParent: function() {
					return jQuery('#' + jS.id.barLeftParent + jS.i);
				},
				barLeftParentAll: function() {
					return s.parent.find('div.' + jS.cl.barLeftParent);
				},
				barLeftHandle: function() {
					return jQuery('#' + jS.id.barLeftHandle);
				},
				barTop: function() {
					return jQuery('#' + jS.id.barTop + jS.i);
				},
				barTopAll: function() {
					return s.parent.find('div.' + jS.cl.barTop);
				},
				barTopParent: function() {
					return jQuery('#' + jS.id.barTopParent + jS.i);
				},
				barTopParentAll: function() {
					return s.parent.find('div.' + jS.cl.barTopParent);
				},
				barTopHandle: function() {
					return jQuery('#' + jS.id.barTopHandle);
				},
				cellActive: function() {
					return jQuery(jS.cellLast.td);
				},
				cellHighlighted: function() {
					return jQuery(jS.highlightedLast.td);
				},
				chart: function() {
					return jQuery('div.' + jS.cl.chart);
				},
				controls: function() {
					return jQuery('#' + jS.id.controls);
				},
				formula: function() {
					return jQuery('#' + jS.id.formula);
				},
				fullScreen: function() {
					return jQuery('div.' + jS.cl.fullScreen);
				},

				inPlaceEdit: function() {
					return jQuery('#' + jS.id.inPlaceEdit);
				},
				label: function() {
					return jQuery('#' + jS.id.label);
				},
				menu: function() {
					return jQuery('#' + jS.id.menu);
				},
				pane: function() {
					return jQuery('#' + jS.id.pane + jS.i);
				},
				paneAll: function() {
					return s.parent.find('div.' + jS.cl.pane);
				},
				parent: function() {
					return s.parent;
				},
				sheet: function() {
					return jQuery('#' + jS.id.sheet + jS.i);
				},
				sheetAll: function() {
					return s.parent.find('table.' + jS.cl.sheet);
				},
				tab: function() {
					return jQuery('#' + jS.id.tab + jS.i);
				},
				tabAll: function() {
					return this.tabContainer().find('a.' + jS.cl.tab);
				},
				tabContainer: function() {
					return jQuery('#' + jS.id.tabContainer);
				},
				tableBody: function() {
					return document.getElementById(jS.id.sheet + jS.i);
				},
				tableControl: function() {
					return jQuery('#' + jS.id.tableControl + jS.i);
				},
				tableControlAll: function() {
					return s.parent.find('table.' + jS.cl.tableControl);
				},
				title: function() {
					return jQuery('#' + jS.id.title);
				},
				ui: function() {
					return jQuery('#' + jS.id.ui);
				},
				uiActive: function() {
					return s.parent.find('div.' + jS.cl.uiActive);
				}
			},
			id: {
				/*
				 id = id's references
				 Note that these are all dynamically set
				 */
				barCorner:			'jSheetBarCorner_' + I + '_',
				barCornerParent:	'jSheetBarCornerParent_' + I + '_',
				barLeft: 			'jSheetBarLeft_' + I + '_',
				barLeftParent: 		'jSheetBarLeftParent_' + I + '_',
				barLeftHandle:		'jSheetBarLeftHandle_' + I,
				barTop: 			'jSheetBarTop_' + I + '_',
				barTopParent: 		'jSheetBarTopParent_' + I + '_',
				barTopHandle:		'jSheetBarTopHandle',
				controls:			'jSheetControls_' + I,
				formula: 			'jSheetControls_formula_' + I,
				inPlaceEdit:		'jSheetInPlaceEdit_' + I,
				label: 				'jSheetControls_loc_' + I,
				menu:				'jSheetMenu_' + I,
				pane: 				'jSheetEditPane_' + I + '_',
				sheet: 				'jSheet_' + I + '_',
				tableControl:		'tableControl_' + I + '_',
				title:				'jSheetTitle_' + I,
				ui:					'jSheetUI_' + I
			},
			cl: {
				/*
				 cl = class references
				 */
				autoFillerHandle:		'jSheetAutoFillerHandle',
				autoFillerConver:		'jSheetAutoFillerCover',
				barCorner:				'jSheetBarCorner',
				barCornerParent:		'jSheetBarCornerParent',
				barHelper:				'jSheetBarHelper',
				barLeftTd:				'jSheetBarLeftTd',
				barLeft: 				'jSheetBarLeft',
				barLeftHandle:			'jSheetBarLeftHandle',
				barLeftParent: 			'jSheetBarLeftParent',
				barTop: 				'jSheetBarTop',
				barTopHandle:			'jSheetBarTopHandle',
				barTopParent: 			'jSheetBarTopParent',
				barTopTd:				'jSheetBarTopTd',
				cellActive:				'jSheetCellActive',
				cellHighlighted: 		'jSheetCellHighighted',
				chart:					'jSheetChart',
				controls:				'jSheetControls',
				error:					'jSheetError',
				formula: 				'jSheetControls_formula',
				formulaParent:			'jSheetControls_formulaParent',
				fullScreen:				'jSheetFullScreen',
				inPlaceEdit:			'jSheetInPlaceEdit',
				menu:					'jSheetMenu',
				parent:					'jSheetParent',
				sheet: 					'jSheet',
				sheetPaneTd:			'sheetPane',
				label: 					'jSheetControls_loc',
				pane: 					'jSheetEditPane',
				tabContainerFullScreen: 'jSheetFullScreenTabContainer',
				tableControl:			'tableControl',
				title:					'jSheetTitle',
				ui:						'jSheetUI',
				uiAutoFiller:			'ui-state-active',
				uiActive:				'ui-state-active',
				uiBar: 					'ui-widget-header',
				uiBarHighlight: 		'ui-state-highlight',
				uiBarLeftHandle:		'ui-state-default',
				uiBarTopHandle:			'ui-state-default',
				uiCellActive:			'ui-state-active',
				uiCellHighlighted: 		'ui-state-highlight',
				uiControl: 				'ui-widget-header ui-corner-top',
				uiControlTextBox:		'ui-widget-content',
				uiError:				'ui-state-error',
				uiFullScreen:			'ui-widget-content ui-corner-all',
				uiInPlaceEdit:			'ui-state-active',
				uiPane: 				'ui-widget-content',
				uiParent: 				'ui-widget-content ui-corner-all',
				uiSheet:				'ui-widget-content',
				uiTab:					'ui-widget-header',
				uiTabActive:			'ui-state-highlight'
			},
			msg: { /*msg = messages used throught sheet, for easy access to change them for other languages*/
				addRowMulti: 			"How many rows would you like to add?",
				addColumnMulti: 		"How many columns would you like to add?",
				newSheet: 				"What size would you like to make your spreadsheet? Example: '5x10' creates a sheet that is 5 columns by 10 rows.",
				openSheet: 				"Are you sure you want to open a different sheet?  All unsaved changes will be lost.",
				toggleHideRow:			"No row selected.",
				toggleHideColumn: 		"Now column selected.",
			},

			createCell: function(sheet, row, col, value, formula, calcCount, calcLast) {
				if (!jS.spreadsheets[sheet])
					jS.spreadsheets[sheet] = [];
				if (!jS.spreadsheets[sheet][row])
					jS.spreadsheets[sheet][row] = [];

				jS.spreadsheets[sheet][row][col] = {
					formula: formula,
					value: value,
					calcCount: (calcCount ? calcCount : 0),
					calcLast: (calcLast ? calcLast : -1)
				};

				return jS.spreadsheets[sheet][row][col];
			},
			nav: false,
			setNav: function(nav) {
				jQuery(jQuery.sheet.instance).each( function() {
					this.nav = false;
				});
				jS.nav = nav;
			},
			controlFactory: { /* controlFactory creates the different objects requied by sheet */
				addRowMulti: function(qty, isBefore, skipFormulaReparse) { /* creates multi rows
					 qty: int, the number of cells you'd like to add, if not specified, a dialog will ask;
					 isBefore: bool, places cells before the selected cell if set to true, otherwise they will go after, or at end
					 skipFormulaReparse: bool, re-parses formulas if needed
					 */
					if (!qty) {
						qty = prompt(jS.msg.addRowMulti);
					}
					if (qty) {
						if (!isNaN(qty))
							jS.controlFactory.addCells(null, isBefore, null, parseInt(qty), 'row', skipFormulaReparse);
					}
				},
				addColumnMulti: function(qty, isBefore, skipFormulaReparse) { /* creates multi columns
					 qty: int, the number of cells you'd like to add, if not specified, a dialog will ask;
					 isBefore: bool, places cells before the selected cell if set to true, otherwise they will go after, or at end
					 skipFormulaReparse: bool, re-parses formulas if needed
					 */
					if (!qty) {
						qty = prompt(jS.msg.addColumnMulti);
					}
					if (qty) {
						if (!isNaN(qty))
							jS.controlFactory.addCells(null, isBefore, null, parseInt(qty), 'col', skipFormulaReparse);
					}
				},
				addCells: function(eq, isBefore, eqO, qty, type, skipFormulaReparse) { /*creates cells for sheet and the bars that go along with them
					eq: int, position where cells should be added;
					isBefore: bool, places cells before the selected cell if set to true, otherwise they will go after, or at end;
					eq0: no longer used, kept for legacy;
					qty: int, how many rows/columsn to add;
					type: string - "col" || "row", determans the type of cells to add;
					skipFormulaReparse: bool, re-parses formulas if needed
					*/

					jS.setDirty(true);
					jS.obj.barHelper().remove();

					var sheet = jS.obj.sheet();
					var sheetWidth = sheet.width();

					jS.evt.cellEditAbandon();

					qty = (qty ? qty : 1);
					type = (type ? type : 'col');

					//var barLast = (type == 'row' ? jS.rowLast : jS.colLast);
					var cellLastBar = (type == 'row' ? jS.cellLast.row : jS.cellLast.col);

					if (!eq) {
						if (cellLastBar == -1) {
							eq = ':last';
						} else {
							eq = ':eq(' + cellLastBar + ')';
						}
					} else if (!isNaN(eq)) {
						eq = ':eq(' + (eq) + ')';
					}

					var o;
					switch (type) {
						case "row":
							o = {
								bar: jS.obj.barLeft().children('div' + eq),
								barParent: jS.obj.barLeft(),
								cells: function() {
									return sheet.find('tr' + eq);
								},
								col: function() {
									return '';
								},
								newBar: '<div class="' + jS.cl.uiBar + '" style="height: ' + (s.colMargin - s.boxModelCorrection) + 'px;" />',
								size: function() {
									return jS.getTdLocation(o.cells().find('td:last'));
								},
								loc: function() {
									return jS.getTdLocation(o.cells().find('td:first'));
								},
								newCells: function() {
									var j = o.size().col;
									var newCells = '';

									for (var i = 0; i <= j; i++) {
										newCells += '<td />';
									}

									return '<tr style="height: ' + s.colMargin + 'px;">' + newCells + '</tr>';
								},
								newCol: '',
//Here!
								reLabel: function() {
									$.get("/CGI-Executables/CGI.pl?pref=row",function(data){
										$("#debug").text(data);
										var rowNum = data.split(",");
										o.barParent.children().each( function(i) {
											jQuery(this).text(rowNum[i]);
										});
									});
								},
								dimensions: function(bar, cell, col) {
									bar.height(cell.height(s.colMargin).outerHeight() - s.boxModelCorrection);
								},
								offset: {
									row: qty,
									col: 0
								}
							};
							break;
						case "col":
							o = {
								bar: jS.obj.barTop().children('div' + eq),
								barParent: jS.obj.barTop(),
								cells: function() {
									var cellStart = sheet.find('tr:first').children(eq);
									var cellEnd = sheet.find('td:last');
									var loc1 = jS.getTdLocation(cellStart);
									var loc2 = jS.getTdLocation(cellEnd);

									//we get the first cell then get all the other cells directly... faster ;)
									var cells = jQuery(jS.getTd(jS.i, loc1.row, loc1.col));
									var cell;
									for (var i = 1; i <= loc2.row; i++) {
										cells.push(jS.getTd(jS.i, i, loc1.col));
									}

									return cells;
								},
								col: function() {
									return sheet.find('col' + eq);
								},
								newBar: '<div class="' + jS.cl.uiBar + '"/>',
								newCol: '<col />',
								loc: function(cells) {
									cells = (cells ? cells : o.cells());
									return jS.getTdLocation(cells.first());
								},
								newCells: function() {
									return '<td />';
								},
								reLabel: function() {
									$.get("/CGI-Executables/CGI.pl?pref=col",function(data){
//										$("#debug").text(data);
										var rowNum = data.split(",");
										o.barParent.children().each( function(i) {
											jQuery(this).text(rowNum[i]);
										});
									});
								},
								dimensions: function(bar, cell, col) {
									var w = s.newColumnWidth;
									col
									.width(w)
									.css('width', w + 'px')
									.attr('width', w + 'px');

									bar
									.width(w - s.boxModelCorrection);

									sheet.width(sheetWidth + (w * qty));
								},
								offset: {
									row: 0,
									col: qty
								}
							};
							break;
					}

					var cells = o.cells();
					var loc = o.loc(cells);
					var col = o.col();

					var newBar = o.newBar;
					var newCell = o.newCells();
					var newCol = o.newCol;

					var newCols = '';
					var newBars = '';
					var newCells = '';

					for (var i = 0; i < qty; i++) { //by keeping these variables strings temporarily, we cut down on using system resources
						newCols += newCol;
						newBars += newBar;
						newCells += newCell;
					}

					newCols = jQuery(newCols);
					newBars = jQuery(newBars);
					newCells = jQuery(newCells);

					if (isBefore) {
						cells.before(newCells);
						o.bar.before(newBars);
						jQuery(col).before(newCols);
					} else {
						cells.after(newCells);
						o.bar.after(newBars);
						jQuery(col).after(newCols);
					}

					jS.setTdIds(sheet, jS.i);

					o.dimensions(newBars, newCells, newCols);
					o.reLabel();

					jS.obj.pane().scroll();


					//Because the line numbers get bigger, it is possible that the bars have changed in size, lets sync them
					jS.sheetSyncSize();

				},
				barLeft: function(reloadHeights, o) { /* creates all the bars to the left of the spreadsheet
					 reloadHeights: bool, reloads all the heights of each bar from the cells of the sheet;
					 o: object, the table/spreadsheeet object
					 */
					jS.obj.barLeft().remove();
					var barLeft = jQuery('<div border="0px" id="' + jS.id.barLeft + jS.i + '" class="' + jS.cl.barLeft + '" />');
					var heightFn;
					if (reloadHeights) { //This is our standard way of detecting height when a sheet loads from a url
						heightFn = function(i, objSource, objBar) {
							objBar.height(parseInt(objSource.outerHeight()) - s.boxModelCorrection);
						};
					} else { //This way of detecting height is used becuase the object has some problems getting
						//height because both tr and td have height set
						//This corrects the problem
						//This is only used when a sheet is already loaded in the pane
						heightFn = function(i, objSource, objBar) {
							objBar.height(parseInt(objSource.css('height').replace('px','')) - s.boxModelCorrection);
						};
					}

					o.find('tr').each( function(i) {
						var child = jQuery('<div>' + (i + 1) + '</div>');
						barLeft.append(child);
						heightFn(i, jQuery(this), child);
					});
					jS.evt.barMouseDown.height(
					jS.obj.barLeftParent().append(barLeft)
					);
				},
				barTop: function(reloadWidths, o) { /* creates all the bars to the top of the spreadsheet
					 reloadWidths: bool, reloads all the widths of each bar from the cells of the sheet;
					 o: object, the table/spreadsheeet object
					 */
					jS.obj.barTop().remove();
					var barTop = jQuery('<div id="' + jS.id.barTop + jS.i + '" class="' + jS.cl.barTop + '" />');
					barTop.height(s.colMargin);

					var parents;
					var widthFn;

					if (reloadWidths) {
						parents = o.find('tr:first').children();
						widthFn = function(obj) {
							return jS.attrH.width(obj);
						};
					} else {
						parents = o.find('col');
						widthFn = function(obj) {

							return parseInt(jQuery(obj).css('width').replace('px','')) - s.boxModelCorrection;
						};
					}

					parents.each( function(i) {
						var v = jSE.columnLabelString(i);
						var w = widthFn(this);

						var child = jQuery("<div>" + v + "</div>")
						.width(w)
						.height(s.colMargin);
						barTop.append(child);
					});
					jS.evt.barMouseDown.width(
					jS.obj.barTopParent().append(barTop)
					);
				},
				barTopHandle: function(bar, i) {
					if (jS.busy)
						return false;
					if (i != 0)
						return false;
					jS.obj.barHelper().remove();

					var target = jS.obj.barTop().children().eq(i);

					var pos = target.position();

					var barTopHandle = jQuery('<div id="' + jS.id.barTopHandle + '" class="' + jS.cl.uiBarTopHandle + ' ' + jS.cl.barHelper + ' ' + jS.cl.barTopHandle + '" />')
					.height(s.colMargin - 2)
					.css('left', pos.left + 'px')
					.appendTo(bar);

				},
				barLeftHandle: function(bar, i) {
					if (jS.busy)
						return false;
					if (i != 0)
						return false;
					jS.obj.barHelper().remove();

					var target = jS.obj.barLeft().children().eq(i);

					var pos = target.position();

					var barLeftHandle = jQuery('<div id="' + jS.id.barLeftHandle + '" class="' + jS.cl.uiBarLeftHandle + ' ' + jS.cl.barHelper + ' ' + jS.cl.barLeftHandle + '" />')
					.width(s.colMargin - 6)
					.height(s.colMargin / 3)
					.css('top', pos.top + 'px')
					.appendTo(bar);

				},
				
				
				header: function() { /* creates the control/container for everything above the spreadsheet */
//	console.log("Call header");
					jS.obj.controls().remove();
					jS.obj.tabContainer().remove();

					var header = jQuery('<div id="' + jS.id.controls + '" class="' + jS.cl.controls + '"></div>');

					//var firstRow = jQuery('<table cellpadding="0" cellspacing="0" border="0"><tr /></table>').prependTo(header);
					var firstRowTr = jQuery('<tr />');

					if (s.title) {
						var title;
						if (jQuery.isFunction(s.title)) {
							title = jS.title(jS);
						} else {
							title = s.title;
						}
						//firstRowTr.append(jQuery('<td id="' + jS.id.title + '" class="' + jS.cl.title + '" />').html(title));
					}

					if (jS.isSheetEditable()) {
						//Sheet Menu Control
						//Edit box menu
						var secondRow = jQuery(
						'<table cellpadding="0" cellspacing="0" border="0px">' +
							'<tr>' +
								'<td class="' + jS.cl.formulaParent + '">' +
									'<textarea  maxlength="2" id="' + jS.id.formula + '" class="' + jS.cl.formula + '"></textarea>' +
								'</td>' +
							'</tr>' +							
						'</table>')

						.appendTo(header)
						.find('textarea')
						.keyup( function() {
							jS.obj.inPlaceEdit().val(jS.obj.formula().val());
//	console.log("Call header keyup");
						})
						.change( function() {
							jS.obj.inPlaceEdit().val(jS.obj.formula().val());
						})
						.focus( function() {
							jS.setNav(false);
						})
						.focusout( function() {
							jS.setNav(true);
						})
						.blur( function() {
							jS.setNav(true);
						});
						jQuery(jQuery.sheet.instance).each( function() {
							this.nav = false;
						});
						jS.setNav(true);

						jQuery(document)
							.unbind('keydown')
							.keydown(jS.evt.keyDownHandler.documentKeydown);
					}


					var tabParent = jQuery('<div id="' + jS.id.tabContainer + '" class="' + jS.cl.tabContainer + '" />')
					if (jS.isSheetEditable()) {
						var addSheet = jQuery('<span class="' + jS.cl.uiTab + ' ui-corner-bottom" title="Add a spreadsheet" i="-1">+</span>').appendTo(tabParent);

						if (jQuery.fn.sortable) {
							var startPosition;

							tabParent.sortable({
								placeholder: 'ui-state-highlight',
								axis: 'x',
								forceHelperSize: true,
								forcePlaceholderSize: true,
								opacity: 0.6,
								cancel: 'span[i="-1"]',
								start: function(e, ui) {
									startPosition = ui.item.index();
									origParent.trigger('tabSortstart', [e, ui]);
								},
								update: function(e, ui) {
									origParent.trigger('tabSortupdate', [e, ui, startPosition]);
								}
							});
						}
					} else {
						jQuery('<span />').appendTo(tabParent);
					}

					s.parent
					.html('')
					.append(header) //add controls header
					.append('<div id="' + jS.id.ui + '" class="' + jS.cl.ui + '">') //add spreadsheet control
					//						.after(tabParent)
					;
				},
				sheetUI: function(o, i, fn, reloadBars) { /* creates the spreadsheet user interface
					 o: object, table object to be used as a spreadsheet;
					 i: int, the new count for spreadsheets in this instance;
					 fn: function, called after the spreadsheet is created and tuned for use;
					 reloadBars: bool, if set to true reloads id bars on top and left;
					 */
					if (!i) {
						jS.sheetCount = 0;
						jS.i = 0;
					} else {
						jS.sheetCount = parseInt(i);
						jS.i = jS.sheetCount;
						i = jS.i;
					}

					o = jS.tuneTableForSheetUse(o);

					jS.readOnly[i] = o.attr('readonly');

					var objContainer = jS.controlFactory.table().appendTo(jS.obj.ui());
					var pane = jS.obj.pane().html(o);

					jS.formatSheet(o);

					jS.controlFactory.barTop(reloadBars, o);
					jS.controlFactory.barLeft(reloadBars, o);

					if (jS.isSheetEditable()) {
						var formula = jS.obj.formula();
						pane
						.mousedown( function(e) {
							if (jS.isTd(e.target)) {
								jS.evt.cellOnMouseDown(e);
								return false;
							}
						})
						.dblclick(jS.evt.cellOnDblClick);
					}

					jS.themeRoller.start(i);
					jS.setTdIds(o, jS.i);

					jS.checkMinSize(o);

					if (fn) {
						fn(objContainer, pane);
					}

					return objContainer;
				},
				table: function() { /* creates the table control the will contain all the other controls for this instance */
					return jQuery('<table cellpadding="0" cellspacing="0" border="0px" id="' + jS.id.tableControl + jS.i + '" class="' + jS.cl.tableControl + '">' +
					'<tbody>' +
					'<tr>' +
					'<td id="' + jS.id.barCornerParent + jS.i + '" class="' + jS.cl.barCornerParent + '">' + //corner
					'<div style="height: ' + s.colMargin + '; width: ' + s.colMargin + ';" id="' + jS.id.barCorner + jS.i + '" class="' + jS.cl.barCorner +'"' + (jS.isSheetEditable() ? ' onClick="jQuery.sheet.instance[' + I + '].cellSetActiveBar(\'all\');"' : '') + ' title="Select All">&nbsp;</div>' +
					'</td>' +
					'<td class="' + jS.cl.barTopTd + '">' + //barTop
					'<div id="' + jS.id.barTopParent + jS.i + '" class="' + jS.cl.barTopParent + '"></div>' +
					'</td>' +
					'</tr>' +
					'<tr>' +
					'<td class="' + jS.cl.barLeftTd + '">' + //barLeft
//dugajin
					'<div style="width: ' + s.colMargin + ';" id="' + jS.id.barLeftParent + jS.i + '" class="' + jS.cl.barLeftParent + '"></div>' +
					'</td>' +
					'<td class="' + jS.cl.sheetPaneTd + '">' + //pane
					'<div id="' + jS.id.pane + jS.i + '" class="' + jS.cl.pane + '"></div>' +
					'</td>' +
					'</tr>' +
					'</tbody>' +
					'</table>');
				},

				inPlaceEdit: function(td) { /* creates a teaxtarea for a user to put a value in that floats on top of the current selected cell
					 td: object, the cell to be edited
					 */

					jS.setNav(false);
//	console.log("setNav: "+jS.Nav);
//	console.log("Call inPlaceEdit");
//	console.log("inPlaceEdit().val(): "+jS.obj.inPlaceEdit().val());
					
					var v = jS.obj.inPlaceEdit().val();
//	console.log("v: "+v);
//	console.dir("textarea: "+textarea);			
		
					jS.obj.inPlaceEdit().remove();
					var formula = jS.obj.formula();
					var offset = td.offset();
					var style = td.attr('style');
					var w = td.width();
					var h = td.height();
					var textarea = jQuery('<input  maxlength="2" id="' + jS.id.inPlaceEdit + '" class="' + jS.cl.inPlaceEdit + ' ' + jS.cl.uiInPlaceEdit + '"   WRAP="hard"/>')

					//var textarea = jQuery('<textarea id="' + jS.id.inPlaceEdit + '" class="' + jS.cl.inPlaceEdit + ' ' + jS.cl.uiInPlaceEdit + '"   WRAP="hard"/>')
					.css('left', offset.left)
					.css('top', offset.top)
					.width(w)
					.height(h)
					.keydown(jS.evt.inPlaceEditOnKeyDown)
					.keyup( function() {
						formula.val(textarea.val());
					})
					.change( function() {
						formula.val(textarea.val());
					})
					.focus( function() {
						jS.setNav(false);
					})
					.focusout( function() {
						jS.setNav(true);
					})
					.blur( function() {
						jS.setNav(true);
					})
					.appendTo('body')
					.val(formula.val()) //F2 click
					.focus()
					.select();
//	console.log("l_textarea.val(): "+textarea.val());
//	console.log("l_inPlaceEdit().val(): "+jS.obj.inPlaceEdit().val());
//	console.log("l_formula.val(): "+formula.val());	
	
					//Make the textarrea resizable automatically
					if (jQuery.fn.elastic) {
						textarea.elastic();
					}
				},
			},
			autoFillerNotGroup: true,
			evt: { /* event handlers for sheet; e = event */
				
				keyDownHandler: {
					enter: function(e) {
						return jS.evt.cellSetFocusFromKeyCode(e);
					},
					tab: function(e) {
						return jS.evt.cellSetFocusFromKeyCode(e);
					},
					escape: function(e) {
						return jS.evt.cellSetFocusFromKeyCode(e);
					},
					up: function(e) {
						return jS.evt.cellSetFocusFromKeyCode(e);
					},
					down: function(e) {
						return jS.evt.cellSetFocusFromKeyCode(e);
					},	
					left: function(e) {
						return jS.evt.cellSetFocusFromKeyCode(e);
					},
					right: function(e) {
						return jS.evt.cellSetFocusFromKeyCode(e);
					},																		
					documentKeydown: function(e) {
						if (jS.nav) {
							
							switch (e.keyCode) {
								case key.TAB:
									jS.evt.keyDownHandler.tab(e);
									break;
								case key.ENTER:
									jS.evt.keyDownHandler.enter(e);
									break;			
								case key.ESCAPE:
									jS.evt.keyDownHandler.escape(e);
									break;								
								case key.LEFT:
									jS.evt.keyDownHandler.left(e);
									break;		
								case key.UP:
									jS.evt.keyDownHandler.up(e);
									break;
								case key.RIGHT:
									jS.evt.keyDownHandler.right(e);
									break;
								case key.DOWN:
									jS.evt.keyDownHandler.down(e);
									break;
//									(e.shiftKey ? jS.evt.cellSetHighlightFromKeyCode(e) : jS.evt.cellSetFocusFromKeyCode(e));
//									break;
								case key.PAGE_UP:
									jS.evt.keyDownHandler.pageUpDown(true);
									break;
								case key.PAGE_DOWN:
									jS.evt.keyDownHandler.pageUpDown();
									break;
								case key.HOME:
								case key.END:
									jS.evt.cellSetFocusFromKeyCode(e);
									break;
								case key.CONTROL:
								//we need to filter these to keep cell state
								case key.CAPS_LOCK:
								case key.SHIFT:
								case key.ALT:
									break;					
								default:
//		console.log("documentKeydown e.keyCode: "+e.keyCode);
		
									jS.obj.cellActive().dblclick();
//		console.log("return true;");
									return true;
							}
							return false;
						}
					}
				},

				inPlaceEditOnKeyDown: function(e) {
//	console.log("inPlaceEditOnKeyDown: "+e.keyCode);
//	console.log("jS.obj.formula().val():" +jS.obj.formula().val());
					switch (e.keyCode) {
						case key.ENTER:
							return jS.evt.keyDownHandler.enter(e);
							break;
						case key.TAB:
							return jS.evt.keyDownHandler.tab(e);
							break;
						case key.UP:
							return jS.evt.keyDownHandler.up(e);
							break;
						case key.DOWN:
							return jS.evt.keyDownHandler.down(e);
							break;
						case key.LEFT:
							return jS.evt.keyDownHandler.left(e);
							break;
						case key.RIGHT:
							return jS.evt.keyDownHandler.right(e);
							break;
													
						case key.ESCAPE:
							jS.evt.cellEditAbandon();
							jS.setNav(true);
							//return false;
							break;
					}
				},
			
				cellEditDone: function(forceCalc) { /* called to edit a cells value from jS.obj.formula(), afterward setting "fnAfterCellEdit" is called w/ params (td, row, col, spreadsheetIndex, sheetIndex)
					 forceCalc: bool, if set to true forces a calculation of the selected sheet
					 */
					switch (jS.cellLast.isEdit || forceCalc) {
						case true:
//	console.log("Call cellEditDone");
							jS.obj.inPlaceEdit().remove();
							var formula = jS.obj.formula();
							//formula.unbind('keydown'); //remove any lingering events from inPlaceEdit
							var td = jS.cellLast.td;
							switch(jS.isFormulaEditable(td)) {
								case true:
									//Lets ensure that the cell being edited is actually active
									if (td && jS.cellLast.row > -1 && jS.cellLast.col > -1) {
										//first, let's make it undoable before we edit it

										//This should return either a val from textbox or formula, but if fails it tries once more from formula.
										var v = formula.val();
										var prevVal = td.text();
										var cell = jS.spreadsheets[jS.i][jS.cellLast.row][jS.cellLast.col];

											td
											.removeAttr('formula')
											.html(v);
											cell.value = v;
											cell.formula = null;

										//reset the cell's value
										cell.calcCount = 0;

										if (v != prevVal || forceCalc) {
											jS.calc();
										}
														
										var collectVal = parseInt(jS.obj.barTop().children().eq(jS.colLast).text()) 
										  * parseInt(jS.obj.barLeft().children().eq(jS.rowLast).text())
										  
										if((jS.obj.formula().val() != '') && (jS.obj.formula().val() != collectVal)){
											td.css("background-color" ,"#ff0000");
										}
										else if(jS.obj.formula().val() == collectVal){
											td.css("background-color" ,"#00ff00");
										}
										else{
											td.css("background-color" ,"");
										}
										
										jS.attrH.setHeight(jS.cellLast.row, 'cell');

										//Save the newest version of that cell

										formula.focus().select();
										jS.cellLast.isEdit = false;

										jS.setDirty(true);

										//perform final function call
										s.fnAfterCellEdit({
											td: jS.cellLast.td,
											row: jS.cellLast.row,
											col: jS.cellLast.col,
											spreadsheetIndex: jS.i,
											sheetIndex: I
										});

									}
							}
							break;
						default:
							jS.attrH.setHeight(jS.cellLast.row, 'cell', false);
					}
				},
				cellEditAbandon: function(skipCalc) { /* removes focus of a selected cell and doesn't change it's value
					 skipCalc: bool, if set to true will skip sheet calculation;
					 */
					jS.obj.inPlaceEdit().remove();
					//jS.themeRoller.cell.clearActive();
					//jS.themeRoller.bar.clearActive();
					//jS.themeRoller.cell.clearHighlighted();
					

					jS.cellLast.td = jQuery('<td />');
					//jS.cellLast.row = -1;
					//jS.cellLast.col = -1;
					//jS.rowLast = -1;
					//jS.colLast = -1;

					jS.labelUpdate('', true);
					jS.obj.formula()
					.val('');
					jS.setNav(true);
					return false;
				},
				cellSetFocusFromXY: function(left, top, skipOffset) { /* a handy function the will set a cell active by it's location on the browser;
					 left: int, pixels left;
					 top: int, pixels top;
					 skipOffset: bool, skips offset;
					 */
//	console.log("Call cellSetFocusFromXY");
					var td = jS.getTdFromXY(left, top, skipOffset);

					if (jS.isTd(td)) {
						jS.themeRoller.cell.clearHighlighted();

						jS.cellEdit(td);
						return false;
					} else {
						return true;
					}
				},
				cellSetHighlightFromKeyCode: function(e) {
					var c = jS.highlightedLast.colLast;
					var r = jS.highlightedLast.rowLast;
					var size = jS.sheetSize();
					jQuery(jS.cellLast.td).mousedown();

					switch (e.keyCode) {
						case key.UP:
							r--;
							break;
						case key.DOWN:
							r++;
							break;
						case key.LEFT:
							c--;
							break;
						case key.RIGHT:
							c++;
							break;
					}

					function keepInSize(i, size) {
						if (i < 0)
							return 0;
						if (i > size)
							return size;
						return i;
					}

					r = keepInSize(r, size.height);
					c = keepInSize(c, size.width);

					td = jS.getTd(jS.i, r, c);
					jQuery(td).mousemove().mouseup();

					jS.highlightedLast.rowLast = r;
					jS.highlightedLast.colLast = c;
					return false;
				},
				cellSetFocusFromKeyCode: function(e) { /* invoke a click on next/prev cell */
//	console.log("cellSetFocusFromKeyCode "+e.keyCode);
					var c = jS.cellLast.col; //we don't set the cellLast.col here so that we never go into indexes that don't exist
					var r = jS.cellLast.row;
					var overrideIsEdit = false;
					switch (e.keyCode) {
						case key.UP:
							overrideIsEdit = true;
							jS.obj.formula().val(jS.obj.inPlaceEdit().val())
							if((jS.rowLast == 0) && (c != 0)){
								r=s.minSize.rows;c--;
							}
							r--;
							break;
						case key.DOWN:
							overrideIsEdit = true;
							jS.obj.formula().val(jS.obj.inPlaceEdit().val())
							if(jS.rowLast == (s.minSize.rows-1)){c++;r=r-10;}
							r++;
							break;
						case key.LEFT:
							overrideIsEdit = true;
							jS.obj.formula().val(jS.obj.inPlaceEdit().val())
							if((jS.colLast == 0) && (r != 0)){
								c=s.minSize.cols;r--;
							}
							c--;
							break;
						case key.RIGHT:
							overrideIsEdit = true;
							jS.obj.formula().val(jS.obj.inPlaceEdit().val())
							if(jS.colLast == (s.minSize.rows-1)){r++;c=c-10;}
							c++;
							break;
						case key.ENTER:
							overrideIsEdit = true;
							jS.obj.formula().val(jS.obj.inPlaceEdit().val())
							if (e.shiftKey) {
								if((jS.rowLast == 0) && (c != 0)){
									r=s.minSize.rows;c--;
								}
								r--;
							}else{
								if(jS.rowLast == (s.minSize.rows-1)){c++;r=r-10;}
								r++;
							}
							
							//jS.obj.formula().val(jS.obj.inPlaceEdit().val())
							
							if (jS.highlightedLast.td.length > 1) {
								var inPlaceEdit = jS.obj.inPlaceEdit();
								var v = inPlaceEdit.val();
								inPlaceEdit.remove();
								return true;
							}
							break;
						case key.TAB:
							overrideIsEdit = true;
							jS.obj.formula().val(jS.obj.inPlaceEdit().val())
							if (e.shiftKey) {
								if((jS.colLast == 0) && (r != 0)){
									c=s.minSize.cols;r--;
								}
								c--;
							} else {
								if(jS.colLast == (s.minSize.rows-1)){r++;c=c-10;}
								c++;
							}
							break;
						case key.HOME:
							c = 0;
							break;
						case key.END:
							c = jS.cellLast.td.parent().find('td').length - 1;
							break;
							
						case key.ESCAPE:
							overrideIsEdit = true;
					}

					//we check here and make sure all values are above -1, so that we get a selected cell
					c = (c < 0 ? 0 : c);
					r = (r < 0 ? 0 : r);

					//to get the td could possibly make keystrokes slow, we prevent it here so the user doesn't even know we are listening ;)
					if (!jS.cellLast.isEdit || overrideIsEdit) {
						//get the td that we want to go to
						var td = jS.getTd(jS.i, r, c);

						//if the td exists, lets go to it
						if (td) {
							jS.themeRoller.cell.clearHighlighted();
							td = jQuery(td);
							if (td.is(':hidden')) {
								function getNext(o, reverse) {
									if (reverse) {
										c++;
										o = o.next()
									} else {
										c--;
										o = o.prev();
									}

									if (o.is(':hidden') && o.length) {
										return getNext(o, reverse);
									}
									return o;
								}

								td = getNext(td, c > jS.cellLast.col);
							}
							jS.cellEdit(td);
							return false;
						}
					}

					//default, can be overridden above
					return true;
				},
				cellOnMouseDown: function(e) {

					jS.obj.formula().blur();
					jS.cellEdit(jQuery(e.target), true);
				},
				cellOnDblClick: function(e) {
//		console.log("Call cellOnDblClick");
		
					jS.cellLast.isEdit = jS.isSheetEdit = true;
					jS.controlFactory.inPlaceEdit(jS.cellLast.td);
				},
				barMouseDown: { /* handles bar events, including resizing */
					select: function(o, e, selectFn) {
						selectFn(e.target);
						o
						.unbind('mouseover')
						.mouseover( function(e) {
							selectFn(e.target);
						});
						jQuery(document)
						.one('mouseup', function() {
							o
							.unbind('mouseover')
							.unbind('mouseup');
						});
						return false;
					},
					first: 0,
					last: 0,
					height: function(o) {
						var selectRow = function () {
						};
						o //let any user resize
						.unbind('mousedown')
						.bind('contextmenu', function(e) {
							if (!jS.isSheetEditable())
								return false;

							var i = jS.getBarLeftIndex(e.target);
							if (i == -1)
								return false;

							o.parent()
							.mousedown()
							.mouseup();

							return false;
						})
						.parent()
						.mouseover( function(e) {
							if (jQuery(e.target).attr('id'))
								return false;
							var i = jS.getBarLeftIndex(e.target);
							if (i == -1)
								return false;

							if (jS.isSheetEditable())
								jS.controlFactory.barLeftHandle(o, i);
						});
						if (jS.isSheetEditable()) { //only let editable select
							selectRow = function(o) {
								if (!o)
									return false;
								if (jQuery(o).attr('id'))
									return false;
								var i = jS.getBarLeftIndex(o);
								if (i == -1)
									return false;
							};
						}
					},
					width: function(o) {
						var selectColumn = function() {
						};
						var w = 0;
						o //let any user resize
						.unbind('mousedown')
						.bind('contextmenu', function(e) {
							if (!jS.isSheetEditable())
								return false;

							var i = jS.getBarTopIndex(e.target);
							if (i == -1)
								return false;
							o.parent()
							.mousedown()
							.mouseup();

							return false;
						})
						.parent();
						if (jS.isSheetEditable()) { //only let editable select
							selectColumn = function(o) {
								if (!o)
									return false;
								if (jQuery(o).attr('id'))
									return false;
								var i = jS.getBarTopIndex(o);
								if (i == -1)
									return false;
							};
						}
					}
				}
			},
			isTd: function(o) { /* ensures the the object selected is actually a td that is in a sheet
				 o: object, cell object;
				 */
				o = (o[0] ? o[0] : [o]);
				if (o[0]) {
					if (!isNaN(o[0].cellIndex)) {
						return true;
					}
				}
				return false;
			},
			readOnly: [],
			isSheetEditable: function(i) {
				i = (i == null ? jS.i : i);
				return (
					s.editable == true && (
						jS.readOnly[i] != 'true' &&
						jS.readOnly[i] != true &&
						jS.readOnly[i] != 1
					)
				);
			},
			isFormulaEditable: function(o) { /* ensures that formula attribute of an object is editable
				 o: object, td object being used as cell
				 */
				return true;
			},
			tuneTableForSheetUse: function(o) { /* makes table object usable by sheet
				 o: object, table object;
				 */
				o
				.addClass(jS.cl.sheet)
				.attr('id', jS.id.sheet + jS.i)
				.attr('border', '0px')
				.attr('cellpadding', '0')
				.attr('cellspacing', '0');

				o.find('td.' + jS.cl.cellActive).removeClass(jS.cl.cellActive);

				return o;
			},
			attrH: {/* Attribute Helpers
				 I created this object so I could see, quickly, which attribute was most stable.
				 As it turns out, all browsers are different, thus this has evolved to a much uglier beast
				 */
				width: function(o, skipCorrection) {
					return jQuery(o).outerWidth() - (skipCorrection ? 0 : s.boxModelCorrection);
				},
				widthReverse: function(o, skipCorrection) {
					return jQuery(o).outerWidth() + (skipCorrection ? 0 : s.boxModelCorrection);
				},
				height: function(o, skipCorrection) {
					return jQuery(o).outerHeight() - (skipCorrection ? 0 : s.boxModelCorrection);
				},
				heightReverse: function(o, skipCorrection) {
					return jQuery(o).outerHeight() + (skipCorrection ? 0 : s.boxModelCorrection);
				},
				syncSheetWidthFromTds: function(o) {
					var w = 0;
					o = (o ? o : jS.obj.sheet());
					o.find('col').each( function() {
						w += jQuery(this).width();
					});
					o.width(w);
					return w;
				},
				setHeight: function(i, from, skipCorrection, o) {
					var correction = 0;
					var h = 0;
					var fn;

					switch(from) {
						case 'cell':
							o = (o ? o : jS.obj.barLeft().children().eq(i));
							h = jS.attrH.height(jQuery(jS.getTd(jS.i, i, 0)).parent().andSelf(), skipCorrection);
							break;
						case 'bar':
							if (!o) {
								var tr = jQuery(jS.getTd(jS.i, i, 0)).parent();
								var td = tr.children();
								o = tr.add(td);
							}
							h = jS.attrH.heightReverse(jS.obj.barLeft().children().eq(i), skipCorrection);
							break;
					}

					if (h) {
						jQuery(o)
						.height(h)
						.css('height', h + 'px')
						.attr('height', h + 'px');
					}

					return o;
				}
			},
			setTdIds: function(sheet, i) { /* cycles through all the td in a sheet and sets their id & virtual spreadsheet so it can be quickly referenced later
				 sheet: object, table object;
				 i: integer, sheet index
				 */
				if (!o || !sheet) {
					sheet = jS.obj.sheet();
					i = jS.i;
				}

				jS.spreadsheets[i] = []; //reset the sheet's spreadsheet

				sheet.find('tr').each( function(row) {
					jQuery(this).children().each( function(col) {
						var td = jQuery(this).attr('id', jS.getTdId(i, row, col));
						jS.createCell(i, row, col, td.text(), td.attr('formula'));
					});
				});
			},
			
			toggleHide: {//These are not ready for prime time
				row: function(i) {
					if (!i) {//If i is empty, lets get the current row
						i = jS.obj.cellActive().parent().attr('rowIndex');
					}
					if (i) {//Make sure that i equals something
						var o = jS.obj.barLeft().children().eq(i);
						if (o.is(':visible')) {//This hides the current row
							o.hide();
							jS.obj.sheet().find('tr').eq(i).hide();
						} else {//This unhides
							//This unhides the currently selected row
							o.show();
							jS.obj.sheet().find('tr').eq(i).show();
						}
					} else {
						alert(jS.msg.toggleHideRow);
					}
				},
				column: function(i) {
					if (!i) {
						i = jS.obj.cellActive().attr('cellIndex');
					}
					if (i) {
						//We need to hide both the col and td of the same i
						var o = jS.obj.barTop().children().eq(i);
						if (o.is(':visible')) {
							jS.obj.sheet().find('tbody tr').each( function() {
								jQuery(this).children().eq(i).hide();
							});
							o.hide();
							jS.obj.sheet().find('colgroup col').eq(i).hide();
						}
					}
				},
			},

			formatSheet: function(o) { /* adds tbody, colgroup, heights and widths to different parts of a spreadsheet
				 o: object, table object;
				 */
				var tableWidth = 0;
				if (o.find('tbody').length < 1) {
					o.wrapInner('<tbody />');
				}

				if (o.find('colgroup').length < 1 || o.find('col').length < 1) {
					o.remove('colgroup');
					var colgroup = jQuery('<colgroup />');
					o.find('tr:first').children().each( function() {
						var w = s.newColumnWidth;
						jQuery('<col />')
						.width(w)
						.css('width', (w) + 'px')
						.attr('width', (w) + 'px')
						.appendTo(colgroup);

						tableWidth += w;
					});
					o.find('tr').each( function() {
						jQuery(this)
						.height(s.colMargin)
						.css('height', s.colMargin + 'px')
						.attr('height', s.colMargin + 'px');
					});
					colgroup.prependTo(o);
				}

				o
				.removeAttr('width')
				.css('width', '')
				.width(tableWidth);
			},
			checkMinSize: function(o) { /* ensure sheet minimums have been met, if not add columns and rows
				 o: object, table object;
				 */
				var size = jS.sheetSize();

				var addRows = 0;
				var addCols = 0;

				if ((size.width) < s.minSize.cols) {
					addCols = s.minSize.cols - size.width - 1;
				}

				if (addCols) {
					jS.controlFactory.addColumnMulti(addCols, false, true);
				}

				if ((size.height) < s.minSize.rows) {
					addRows = s.minSize.rows - size.height - 1;
				}

				if (addRows) {
					jS.controlFactory.addRowMulti(addRows, false, true);
				}
			},
			themeRoller: { /* jQuery ui Themeroller integration	*/
				start: function() {
					//Style sheet
					s.parent.addClass(jS.cl.uiParent);
					jS.obj.sheet().addClass(jS.cl.uiSheet);
					//Style bars
					jS.obj.barLeft().children().addClass(jS.cl.uiBar);
					jS.obj.barTop().children().addClass(jS.cl.uiBar);
					jS.obj.barCornerParent().addClass(jS.cl.uiBar);

					jS.obj.controls().addClass(jS.cl.uiControl);
					jS.obj.label().addClass(jS.cl.uiControl);
					jS.obj.formula().addClass(jS.cl.uiControlTextBox);
				},
				cell: {
					setActive: function() {
//console.log("Call setActive");
						this.clearActive();
						this.setHighlighted(
						jS.cellLast.td
						.addClass(jS.cl.cellActive)
						);
					},
					setHighlighted: function(td) {
						jQuery(td)
						.addClass(jS.cl.cellHighlighted + ' ' + jS.cl.uiCellHighlighted);
					},
					clearActive: function() {
//console.log("Call clearActive");
						jS.obj.cellActive()
						.removeClass(jS.cl.cellActive);
					},
					isHighlighted: function() {
						return (jS.highlightedLast.td ? true : false);
					},
					clearHighlighted: function() {
						if (jS.themeRoller.cell.isHighlighted()) {
							jS.obj.cellHighlighted()
							.removeClass(jS.cl.cellHighlighted + ' ' + jS.cl.uiCellHighlighted);
						}

						jS.highlightedLast.rowStart = -1;
						jS.highlightedLast.colStart = -1;
						jS.highlightedLast.rowEnd = -1;

						jS.highlightedLast.colEnd = -1;
						jS.highlightedLast.td = jQuery('<td />');
					}
				},
				bar: {
					style: function(o) {
						jQuery(o).addClass(jS.cl.uiBar);
					},
					setActive: function(direction, i) {
						//We don't clear here because we can have multi active bars
						switch(direction) {
							case 'top':
								jS.obj.barTop().children().eq(i).addClass(jS.cl.uiActive);
								break;
							case 'left':
								jS.obj.barLeft().children().eq(i).addClass(jS.cl.uiActive);
								break;
						}
					},
					clearActive: function() {
						jS.obj.barTop().add(jS.obj.barLeft()).children('.' + jS.cl.uiActive)
						.removeClass(jS.cl.uiActive);
					}
				},
				tab: {
					setActive: function(o) {
						this.clearActive();
						jS.obj.tab().parent().addClass(jS.cl.uiTabActive);
					},
					clearActive: function () {
						jS.obj.tabContainer().find('span.' + jS.cl.uiTabActive)
						.removeClass(jS.cl.uiTabActive);
					}
				},
				resize: function() {// add resizable jquery.ui if available
					// resizable container div
					jS.resizable(s.parent, {
						minWidth: s.width * 0.5,
						minHeight: s.height * 0.5,

						start: function() {
							jS.obj.ui().hide();
						},
						stop: function() {
							jS.obj.ui().show();
							s.width = s.parent.width();
							s.height = s.parent.height();
							jS.sheetSyncSize();
						}
					});
					// resizable formula area - a bit hard to grab the handle but is there!
					var formulaResizeParent = jQuery('<span />');
					jS.resizable(jS.obj.formula().wrap(formulaResizeParent).parent(), {
						minHeight: jS.obj.formula().height(),
						maxHeight: 78,
						handles: 's',
						resize: function(e, ui) {
							jS.obj.formula().height(ui.size.height);
							jS.sheetSyncSize();
						}
					});
				}
			},
			resizable: function(o, settings) { /* jQuery ui resizeable integration
				 o: object, any object that neds resizing;
				 settings: object, the settings used with jQuery ui resizable;
				 */
				if (o.attr('resizable')) {
					o.resizable("destroy");
				}

				o
				.resizable(settings)
				.attr('resizable', true);
			},
			busy: false,
			
			labelUpdate: function(v, setDirect) { /* updates the label so that the user knows where they are currently positioned
				 v: string or array of ints, new location value;
				 setDirect: bool, converts the array of a1 or [0,0] to "A1";
				 */
				if (!setDirect) {
					jS.obj.label().html(jSE.parseCellName(v.col, v.row));
				} else {
					jS.obj.label().html(v);
				}
			},
			cellEdit: function(td, isDrag, skipFocus) { /* starts cell to be edited
				 td: object, td object;

				 isDrag: bool, should be determained by if the user is dragging their mouse around setting cells;
				 */
				jS.autoFillerNotGroup = true; //make autoFiller directional again.
				//This finished up the edit of the last cell
				jS.evt.cellEditDone();

//	console.log("Call cellEdit");
				//jS.obj.formula().val(jS.colLast + jS.rowLast);
								
				jS.followMe(td);
				jS.obj.pane().scroll();
				var loc = jS.getTdLocation(td);

				//Show where we are to the user
				jS.labelUpdate(loc);

				var v = td.attr('formula');
				if (!v) {
					v = td.text();
				}

				var formula = jS.obj.formula()
				.val(v)
				.blur();

				jS.cellSetActive(td, loc, isDrag);
			},
			cellSetActive: function(td, loc, isDrag, directional, fnDone) { /* cell cell active to sheet, and highlights it for the user, shouldn't be called directly, should use cellEdit
				 td: object, td object;
				 loc: array of ints - [col, row];
				 isDrag: bool, should be determained by if the user is dragging their mouse around setting cells;
				 directional: bool, makes highlighting directional, only left/right or only up/down;
				 fnDone: function, called after the cells are set active;
				 */
				if (typeof(loc.col) != 'undefined') {
					jS.cellLast.td = td; //save the current cell/td

					jS.cellLast.row = jS.rowLast = loc.row;
					jS.cellLast.col = jS.colLast = loc.col;

					jS.themeRoller.bar.clearActive();
					jS.themeRoller.cell.clearHighlighted();

					jS.highlightedLast.td = td;

					jS.themeRoller.cell.setActive(); //themeroll the cell and bars
					jS.themeRoller.bar.setActive('left', jS.cellLast.row);
					jS.themeRoller.bar.setActive('top', jS.cellLast.col);

					var selectModel;
					var clearHighlightedModel;

					jS.highlightedLast.rowStart = loc.row;
					jS.highlightedLast.colStart = loc.col;
					jS.highlightedLast.rowLast = loc.row;
					jS.highlightedLast.colLast = loc.col;

					switch (s.cellSelectModel) {
						case 'excel':
					}
				}
			},
			colLast: 0, /* the most recent used column */
			rowLast: 0, /* the most recent used row */
			cellLast: { /* the most recent used cell */
				td: jQuery('<td />'), //this is a dud td, so that we don't get errors
				row: -1,
				col: -1,
				isEdit: false
			}, /* the most recent highlighted cells */
			highlightedLast: {
				td: jQuery('<td />'),
				rowStart: -1,
				colStart: -1,
				rowEnd: -1,
				colEnd: -1
			},
			callStack: 0,
			updateCellValue: function(sheet, row, col) {
				//first detect if the cell exists if not return nothing
//	console.log("Call updateCellValue");
				if (!jS.spreadsheets[sheet])
					return 'Error: Sheet not found';
				if (!jS.spreadsheets[sheet][row])
					return 'Error: Row not found';
				if (!jS.spreadsheets[sheet][row][col])
					return 'Error: Column not found';

				var cell = jS.spreadsheets[sheet][row][col];
				cell.oldValue = cell.value; //we detect the last value, so that we don't have to update all cell, thus saving resources

				if (cell.state) throw("Error: Loop Detected");
				cell.state = "red";

				if (cell.calcCount < 1 && cell.calcLast != jS.calcLast) {
					cell.calcLast = jS.calcLast;
					cell.calcCount++;
					if (cell.formula) {
						var Parser;
						if (jS.callStack) { //we prevent parsers from overwriting each other
							if (!cell.parser) { //cut down on un-needed parser creation
								cell.parser = (new jS.parser);
							}
							Parser = cell.parser
						} else {//use the sheet's parser if there aren't many calls in the callStack
							Parser = jS.Parser;
						}

						jS.callStack++
						cell.value = Parser.parse(cell.formula, jS.cellIdHandlers, {
							sheet: sheet,
							row: row,
							col: col,
							cell: cell,
							s: s,
							editable: s.editable,
							jS: jS
						});

						jS.callStack--;
					}

					if (cell.html) { //if cell has an html front bring that to the value but preserve it's value
						jQuery(jS.getTd(sheet, row, col)).html(cell.html);
					} else {
						jQuery(jS.getTd(sheet, row, col)).html(cell.value);
					}
				}

				cell.state = null;

				return cell.value;
			},
			cellIdHandlers: {
				cellValue: function(id) { //Example: A1
					var loc = jSE.parseLocation(id);
					return jS.updateCellValue(this.sheet, loc.row, loc.col);
				},
				cellRangeValue: function(ids) {//Example: A1:B1
					ids = ids.split(':');
					var start = jSE.parseLocation(ids[0]);
					var end = jSE.parseLocation(ids[1]);
					var result = [];

					for (var i = start.row; i <= end.row; i++) {
						for (var j = start.col; j <= end.col; j++) {
							result.push(jS.updateCellValue(this.sheet, i, j));
						}
					}
					return [result];
				},
				fixedCellValue: function(id) {
					return jS.cellIdHandlers.cellValue.apply(this, [(id + '').replace(/[$]/g, '')]);
				},
				fixedCellRangeValue: function(ids) {
					return jS.cellIdHandlers.cellRangeValue.apply(this, [(ids + '').replace(/[$]/g, '')]);
				},
				remoteCellValue: function(id) {//Example: SHEET1:A1
					var sheet, loc;
					id = id.replace(jSE.regEx.remoteCell, function(ignored1, ignored2, I, col, row) {
						sheet = (I * 1) - 1;
						loc = jSE.parseLocation(col + row);
						return ignored1;
					});
					return jS.updateCellValue(sheet, loc.row, loc.col);
				},
				remoteCellRangeValue: function(ids) {//Example: SHEET1:A1:B2
					var sheet, start, end;
					ids = ids.replace(jSE.regEx.remoteCellRange, function(ignored1, ignored2, I, startCol, startRow, endCol, endRow) {
						sheet = (I * 1) - 1;
						start = jSE.parseLocation(startCol + startRow);
						end = jSE.parseLocation(endCol + endRow);
						return ignored1;
					});
					var result = [];

					for (var i = start.row; i <= end.row; i++) {
						for (var j = start.col; j <= end.col; j++) {
							result.push(jS.updateCellValue(sheet, i, j));
						}
					}

					return [result];
				},
				callFunction: function(fn, args, cell) {
					if (!args) {
						args = [''];
					} else if (jQuery.isArray(args)) {
						args = args.reverse();
					} else {
						args = [args];
					}

					return (jQuery.sheet.fn[fn] ? jQuery.sheet.fn[fn].apply(cell, args) : "Error: Function Not Found");
				}
			},

			context: {},
			calcLast: 0,
			calc: function(tableI) { /* harnesses calculations engine's calculation function
				 tableI: int, the current table integer;
				 fuel: variable holder, used to prevent memory leaks, and for calculations;
				 */

				tableI = (tableI ? tableI : jS.i);
				jS.calcLast = new Date();
				//jSE.calc(tableI, jS.spreadsheetsToArray()[tableI], jS.updateCellValue);
				origParent.trigger('calculation');
				jS.isSheetEdit = false;
			},
			refreshLabelsColumns: function() { /* reset values inside bars for columns */
				var w = 0;
				jS.obj.barTop().children().each( function(i) {
					jQuery(this).text(jSE.columnLabelString(i));
					w += jQuery(this).width();
				});
				return w;
			},
			refreshLabelsRows: function() { /* resets values inside bars for rows */
				jS.obj.barLeft().children().each( function(i) {
					jQuery(this).text((i + 1));
				});
			},
			addSheet: function(size) { /* adds a spreadsheet
				 size: string example "10x100" which means 10 columns by 100 rows;
				 */
				size = (size ? size : prompt(jS.msg.newSheet));
				if (size) {
					jS.evt.cellEditAbandon();
					jS.setDirty(true);
					var newSheetControl = jS.controlFactory.sheetUI(jQuery.sheet.makeTable.fromSize(size), jS.sheetCount + 1, function(o) {
						jS.setActiveSheet(jS.sheetCount);
					}, true);
				}
			},

			followMe: function(td) { /* scrolls the sheet to the selected cell
				 td: object, td object;
				 */
				td = (td ? td : jQuery(jS.cellLast.td));
				var pane = jS.obj.pane();
				var panePos = pane.offset();
				var paneWidth = pane.width();
				var paneHeight = pane.height();

				var tdPos = td.offset();
				var tdWidth = td.width();
				var tdHeight = td.height();

				var margin = 20;

				if ((tdPos.left + tdWidth + margin) > (panePos.left + paneWidth)) { //right
					pane.stop().scrollTo(td, {
						axis: 'x',
						duration: 50,
						offset: - ((paneWidth - tdWidth) - margin)
					});
				} else if (tdPos.left < panePos.left) { //left
					pane.stop().scrollTo(td, {
						axis: 'x',
						duration: 50
					});
				}

				if ((tdPos.top + tdHeight + margin) > (panePos.top + paneHeight)) { //bottom
					pane.stop().scrollTo(td, {
						axis: 'y',
						duration: 50,
						offset: - ((paneHeight - tdHeight) - margin)
					});
				} else if (tdPos.top < panePos.top) { //top
					pane.stop().scrollTo(td, {
						axis: 'y',
						duration: 50
					});
				}

				jS.autoFillerGoToTd(td, tdHeight, tdWidth);
			},
			autoFillerGoToTd: function(td, tdHeight, tdWidth) { /* moves autoFiller to a selected cell
				 td: object, td object;
				 tdHeight: height of a td object;
				 tdWidth: width of a td object;
				 */
				td = (td ? td : jQuery(jS.cellLast.td));
				tdHeight = (tdHeight ? tdHeight : td.height());
				tdWidth = (tdWidth ? tdWidth : td.width());
			},
			isRowHeightSync: [],
			setActiveSheet: function(i) { /* sets active a spreadsheet inside of a sheet instance
				 i: int, a sheet integer desired to show;
				 */
				i = (i ? i : 0);

				jS.obj.tableControlAll().hide().eq(i).show();
				jS.i = i;

				jS.themeRoller.tab.setActive();

				if (!jS.isRowHeightSync[i]) { //this makes it only run once, no need to have it run every time a user changes a sheet
					jS.isRowHeightSync[i] = true;
					jS.obj.sheet().find('tr').each( function(j) {
						jS.attrH.setHeight(j, 'cell');
						/*
						 fixes a wired bug with height in chrome and ie
						 It seems that at some point during the sheet's initializtion the height for each
						 row isn't yet clearly defined, this ensures that the heights for barLeft match
						 that of each row in the currently active sheet when a user uses a non strict doc type.
						 */
					});
				}

				jS.readOnly[i] = jS.obj.sheet().attr('readonly');

				jS.sheetSyncSize();
				//jS.replaceWithSafeImg();
			},
			openSheet: function(o, reloadBarsOverride) { /* opens a spreadsheet into the active sheet instance \
				 o: object, a table object;
				 reloadBarsOverride: if set to true, foces bars on left and top not be reloaded;
				 */
				if (!jS.isDirty ? true : confirm(jS.msg.openSheet)) {
					jS.controlFactory.header();

					var fnAfter = function(i, l) {
						if (i == (l - 1)) {
							jS.i = 0;
							jS.setActiveSheet();
							jS.themeRoller.resize();
							for (var i = 0; i <= jS.sheetCount; i++) {
								jS.calc(i);
							}

							s.fnAfter();
						}
					};
					if (!o) {
						jQuery('<div />').load(s.urlGet, function() {
							var sheets = jQuery(this).find('table');
							sheets.each( function(i) {
								jS.controlFactory.sheetUI(jQuery(this), i, function() {
									fnAfter(i, sheets.length);
								}, true);
							});
						});
					} else {
						var sheets = jQuery('<div />').html(o).children('table');
						sheets.show().each( function(i) {
							jS.controlFactory.sheetUI(jQuery(this), i, function() {
								fnAfter(i, sheets.length);
							}, (reloadBarsOverride ? true : false));
						});
					}

					jS.setDirty(false);

					return true;
				} else {
					return false;
				}
			},
			newSheet: function() { /* creates a new shet from size */
				var size = prompt(jS.msg.newSheet);
				if (size) {
					jS.openSheet(jQuery.sheet.makeTable.fromSize(size));
				}
			},
			sheetSyncSize: function() { /* syncs a sheet's size to that of the jQuery().sheet() caller object */
				var h = s.height;
				if (!h) {
					h = 400; //Height really needs to be set by the parent
				} else if (h < 200) {
					h = 200;
				}
				s.parent
				.height(h)
				.width(s.width);

				var w = s.width - jS.attrH.width(jS.obj.barLeftParent()) - (s.boxModelCorrection);

				h = h - jS.attrH.height(jS.obj.controls()) - jS.attrH.height(jS.obj.barTopParent()) - (s.boxModelCorrection * 2);

				jS.obj.pane()
				.height(h)
				.width(w)
				.parent()
				.width(w);

				jS.obj.ui()
				.width(w + jS.attrH.width(jS.obj.barLeftParent()));

				jS.obj.barLeftParent()
				.height(h);

				jS.obj.barTopParent()
				.width(w)
				.parent()
				.width(w);
			},

			cellSetActiveBar: function(type, start, end) { /* sets a bar active
				 type: string, "col" || "row" || "all";
				 start: int, int to start highlighting from;
				 start: int, int to end highlighting to;
				 */
				var size = jS.sheetSize(jQuery('#' + jS.id.sheet + jS.i));
				var first = (start < end ? start : end);
				var last = (start < end ? end : start);

				var setActive = function(td, rowStart, colStart, rowFollow, colFollow) {
					switch (s.cellSelectModel) {
						default:
							//stay at initial cell
							jS.cellEdit(jQuery(jS.getTd(jS.i, rowStart, colStart)));
							break;
					}

					setActive = function(td) { //save resources
						return td;
					};
					return td;
				};
				var cycleFn;

				var td = [];

				switch (type) {
					case 'all':
						cycleFn = function() {
							setActive = function(td) {
								jS.cellEdit(jQuery(td));
								setActive = function() {
								};
							};
							for (var i = 0; i <= size.height; i++) {
								for (var j = 0; j <= size.width; j++) {
									td.push(jS.getTd(jS.i, i, j));
									setActive(td[td.length - 1]);
									jS.themeRoller.cell.setHighlighted(td[td.length - 1]);
								}
							}
							first = {
								row: 0,
								col: 0
							};
							last = {
								row: size.height,
								col: size.width
							}
						};
						break;
				}

				cycleFn();

				jS.highlightedLast.td = td;
				jS.highlightedLast.rowStart = first.row;
				jS.highlightedLast.colStart = first.col;
				jS.highlightedLast.rowEnd = last.row;
				jS.highlightedLast.colEnd = last.col;
			},
			sheetClearActive: function() { /* clears formula and bars from being highlighted */
//	console.log("Call sheetClearActive!")
				jS.obj.formula().val('');
				jS.obj.barSelected().removeClass(jS.cl.barSelected);
			},
			
			getTdId: function(tableI, row, col) { /* makes a td if from values given
				 tableI: int, table integer;
				 row: int, row integer;
				 col: int, col integer;
				 */
				return I + '_table' + tableI + '_cell_c' + col + '_r' + row;
			},
			getTd: function(tableI, row, col) { /* gets a td
				 tableI: int, table integer;
				 row: int, row integer;
				 col: int, col integer;
				 */
				return document.getElementById(jS.getTdId(tableI, row, col));
			},
			getTdLocation: function(td) { /* gets td column and row int
				 td: object, td object;
				 */
				if (!td || !td[0])
					return {
						col: 0,
						row: 0
					};
				return {
					col: parseInt(td[0].cellIndex),
					row: parseInt(td[0].parentNode.rowIndex)
				}
			},
			getTdFromXY: function(left, top, skipOffset) { /* gets cell from point
				 left: int, pixels left;
				 top: int, pixels top;
				 skipOffset: bool, skips pane offset;
				 */
				var pane = jS.obj.pane();
				var paneOffset = (skipOffset ? {
						left: 0,
						top: 0
					} : pane.offset());

				top += paneOffset.top + 2;
				left += paneOffset.left + 2;

				//here we double check that the coordinates are inside that of the pane, if so then we can continue
				if ((top >= paneOffset.top && top <= paneOffset.top + pane.height()) &&
				(left >= paneOffset.left && left <= paneOffset.left + pane.width())) {
					var td = jQuery(document.elementFromPoint(left - $window.scrollLeft(), top - $window.scrollTop()));

					//I use this snippet to help me know where the point was positioned
					/*jQuery('<div class="ui-widget-content" style="position: absolute;">TESTING TESTING</div>')
					 .css('top', top + 'px')
					 .css('left', left + 'px')
					 .appendTo('body');
					 */

					if (jS.isTd(td)) {
						return td;
					}
					return false;
				}
			},
			getBarLeftIndex: function(o) { /* get's index from object */
				var i = jQuery.trim(jQuery(o).text());
				if (isNaN(i)) {
					return -1;
				} else {
					return i - 1;
				}
			},
			getBarTopIndex: function(o) { /* get's index from object */
				var v = jQuery.trim(jQuery(o).text());
				if (!v)
					return -1;

				var i = jSE.columnLabelIndex(v);
				i = parseInt(i);
				if (isNaN(i)) {
					return -1;
				} else {
					return i;
				}
			},
			EMPTY_VALUE: {},
			isDirty:  false,
			setDirty: function(dirty) {
				jS.isDirty = dirty;
			},

			sheetSize: function(o) {
				var loc = jS.getTdLocation((o ? o : jS.obj.sheet()).find('td:last'));
				return {
					width: loc.col,
					height: loc.row
				};
			},

		};

		var $window = jQuery(window);

		var o;
		var emptyFN = function() {
		};
		//ready the sheet's parser
		jS.lexer = function() {
		};
		jS.lexer.prototype = parser.lexer;
		jS.parser = function() {
			this.lexer = new jS.lexer();
			this.yy = {};
		};
		jS.parser.prototype = parser;

		jS.Parser = new jS.parser;

		//We need to take the sheet out of the parent in order to get an accurate reading of it's height and width
		//jQuery(this).html(s.loading);
		s.origParent = origParent;
		s.parent
		.html('')
		.addClass(jS.cl.parent);

		origParent;
		//Use the setting height/width if they are there, otherwise use parent's
		s.width = (s.width ? s.width : s.parent.width());
		s.height = (s.height ? s.height : s.parent.height());

		if (!jQuery.ui || !s.resizable) {
			jS.resizable = jS.draggable = emptyFN;
		}

		if (!jQuery.support.boxModel) {
			s.boxModelCorrection = 0;
		}

		if (!jQuery.scrollTo) {
			jS.followMe = emptyFN;
		}
		if (!s.freezableCells) { //this feature does not yet work
			jS.controlFactory.barTopHandle = jS.controlFactory.barLeftHandle = emptyFN;
		}

		$window
		.resize( function() {
			if (jS) { //We check because jS might have been killed
				s.width = s.parent.width();
				s.height = s.parent.height();
				jS.sheetSyncSize();
			}
		});
		if (jQuery.sheet.fn) { //If the new calculations engine is alive, fill it too, we will remove above when no longer needed.
			//Extend the calculation engine plugins
			jQuery.sheet.fn = jQuery.extend(jQuery.sheet.fn, s.calculations);

			//Extend the calculation engine with advanced functions
			if (jQuery.sheet.advancedfn) {
				jQuery.sheet.fn = jQuery.extend(jQuery.sheet.fn, jQuery.sheet.advancedfn);
			}

			//Extend the calculation engine with finance functions
			if (jQuery.sheet.financefn) {
				jQuery.sheet.fn = jQuery.extend(jQuery.sheet.fn, jQuery.sheet.financefn);
			}
		}

		jS.openSheet(o, s.forceColWidthsOnStartup);
		jS.s = s;

		return jS;
	},
	makeTable : {
		fromSize: function(size, h, w) { /* creates a spreadsheet object from a size given
			 size: string, example "10x100" which means 10 columns by 100 rows;
			 h: int, height for each new row;
			 w: int, width of each new column;
			 */
			if (!size) {
				size = "10x10";
			}
			size = size.toLowerCase().split('x');

			var columnsCount = parseInt(size[0]);
			var rowsCount = parseInt(size[1]);

			//Create elements before loop to make it faster.
			var newSheet = jQuery('<table border="0px" />');
			var standardTd = '<td></td>';
			var tds = '';

			//Using -- is many times faster than ++
			for (var i = columnsCount; i >= 1; i--) {
				tds += standardTd;
			}
			
			var standardTr = '<tr' + (h ? ' height="' + h + 'px" style="height: ' + h + 'px;"' : '') + '>' + tds + '</tr>';
			var trs = '';
			for (var i = rowsCount; i >= 1; i--) {
				trs += standardTr;
			}
			newSheet.html('<tbody>' + trs + '</tbody>');

			if (w) {
				newSheet.width(columnsCount * w);
			}
			return newSheet;
		}
	},
	I: function() {
		var I = 0;
		if ( this.instance ) {
			I = (this.instance.length === 0 ? 0 : this.instance.length - 1); //we use length here because we havent yet created sheet, it will append 1 to this number thus making this the effective instance number
		} else {
			this.instance = [];
		}
		return I;
	}
};

var jSE = jQuery.sheet.engine = { //Calculations Engine
	calc: function(tableI, spreadsheets, ignite, freshCalc) { //spreadsheets are array, [spreadsheet][row][cell], like A1 = o[0][0][0];
		for (var j = 0; j < spreadsheets.length; j++) {
			for (var k = 0; k < spreadsheets[j].length; k++) {
				spreadsheets[j][k].calcCount = 0;
			}
		}

		for (var j = 0; j < spreadsheets.length; j++) {
			for (var k = 0; k < spreadsheets[j].length; k++) {
				ignite(tableI, j, k);
			}
		}
	},
	parseLocation: function(locStr) { // With input of "A1", "B4", "F20", will return {row: 0,col: 0}, {row: 3,col: 1}, {row: 19,col: 5}.
		for (var firstNum = 0; firstNum < locStr.length; firstNum++) {
			if (locStr.charCodeAt(firstNum) <= 57) {// 57 == '9'
				break;
			}
		}
		return {
			row: parseInt(locStr.substring(firstNum)) - 1,
			col: this.columnLabelIndex(locStr.substring(0, firstNum))
		};
	},
	parseCellName: function(col, row) {
		return jSE.columnLabelString(col) + (row + 1);
	},
	columnLabelIndex: function(str) {
		// Converts A to 0, B to 1, Z to 25, AA to 26.
		var num = 0;
		for (var i = 0; i < str.length; i++) {
			var digit = str.toUpperCase().charCodeAt(i) - 65;	   // 65 == 'A'.
			num = (num * 26) + digit;
		}
		
		return (num >= 0 ? num : 0);
		//reutrn "?";
	},
	columnLabelString: function(index) {//0 = A, 1 = B
		var b = (index).toString(26).toUpperCase();   // Radix is 26.
		var c = [];
		for (var i = 0; i < b.length; i++) {
			var x = b.charCodeAt(i);
			if (i <= 0 && b.length > 1) {				   // Leftmost digit is special, where 1 is A.
				x = x - 1;
			}
			if (x <= 57) {								  // x <= '9'.
				c.push(String.fromCharCode(x - 48 + 65)); // x - '0' + 'A'.
			} else {
				c.push(String.fromCharCode(x + 10));
			}
		}
		return c.join("");
	},
	regEx: {
		n: 			/[\$,\s]/g,
		cell: 			/\$?([a-zA-Z]+)\$?([0-9]+)/gi, //a1
		range: 			/\$?([a-zA-Z]+)\$?([0-9]+):\$?([a-zA-Z]+)\$?([0-9]+)/gi, //a1:a4
		remoteCell:		/\$?(SHEET+)\$?([0-9]+)[:!]\$?([a-zA-Z]+)\$?([0-9]+)/gi, //sheet1:a1
		remoteCellRange: 	/\$?(SHEET+)\$?([0-9]+)[:!]\$?([a-zA-Z]+)\$?([0-9]+):\$?([a-zA-Z]+)\$?([0-9]+)/gi, //sheet1:a1:b4
		sheet:			/SHEET/i,
		amp: 			/&/g,
		gt: 			/</g,
		lt: 			/>/g,
		nbsp: 			/&nbsp;/g
	},
	str: {
		amp: 	'&amp;',
		lt: 	'&lt;',
		gt: 	'&gt;',
		nbsp: 	'&nbps;'
	}
};

var key = { /* key objects, makes it easier to develop */
	BACKSPACE: 			8,
	CAPS_LOCK: 			20,
	COMMA: 				188,
	CONTROL: 			17,
	ALT:				18,
	DELETE: 			46,
	DOWN: 				40,
	END: 				35,
	ENTER: 				13,
	ESCAPE: 			27,
	HOME: 				36,
	INSERT: 			45,
	LEFT: 				37,
	NUMPAD_ADD: 		107,
	NUMPAD_DECIMAL: 	110,
	NUMPAD_DIVIDE: 		111,
	NUMPAD_ENTER: 		108,
	NUMPAD_MULTIPLY: 	106,
	NUMPAD_SUBTRACT: 	109,
	PAGE_DOWN: 			34,
	PAGE_UP: 			33,
	PERIOD: 			190,
	RIGHT: 				39,
	SHIFT: 				16,
	SPACE: 				32,
	TAB: 				9,
	UP: 				38
};

