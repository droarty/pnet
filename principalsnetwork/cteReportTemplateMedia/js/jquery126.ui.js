/*
 * jQuery UI 1.5.3
 *
 * Copyright (c) 2008 Paul Bakaus (ui.jquery.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI
 */
;(function($) {

$.ui = {
	plugin: {
		add: function(module, option, set) {
			var proto = $.ui[module].prototype;
			for(var i in set) {
				proto.plugins[i] = proto.plugins[i] || [];
				proto.plugins[i].push([option, set[i]]);
			}
		},
		call: function(instance, name, args) {
			var set = instance.plugins[name];
			if(!set) { return; }
			
			for (var i = 0; i < set.length; i++) {
				if (instance.options[set[i][0]]) {
					set[i][1].apply(instance.element, args);
				}
			}
		}	
	},
	cssCache: {},
	css: function(name) {
		if ($.ui.cssCache[name]) { return $.ui.cssCache[name]; }
		var tmp = $('<div class="ui-gen">').addClass(name).css({position:'absolute', top:'-5000px', left:'-5000px', display:'block'}).appendTo('body');
		
		//if (!$.browser.safari)
			//tmp.appendTo('body'); 
		
		//Opera and Safari set width and height to 0px instead of auto
		//Safari returns rgba(0,0,0,0) when bgcolor is not set
		$.ui.cssCache[name] = !!(
			(!(/auto|default/).test(tmp.css('cursor')) || (/^[1-9]/).test(tmp.css('height')) || (/^[1-9]/).test(tmp.css('width')) || 
			!(/none/).test(tmp.css('backgroundImage')) || !(/transparent|rgba\(0, 0, 0, 0\)/).test(tmp.css('backgroundColor')))
		);
		try { $('body').get(0).removeChild(tmp.get(0));	} catch(e){}
		return $.ui.cssCache[name];
	},
	disableSelection: function(el) {
		$(el).attr('unselectable', 'on').css('MozUserSelect', 'none');
	},
	enableSelection: function(el) {
		$(el).attr('unselectable', 'off').css('MozUserSelect', '');
	},
	hasScroll: function(e, a) {
		var scroll = /top/.test(a||"top") ? 'scrollTop' : 'scrollLeft', has = false;
		if (e[scroll] > 0) return true; e[scroll] = 1;
		has = e[scroll] > 0 ? true : false; e[scroll] = 0;
		return has;
	}
};


/** jQuery core modifications and additions **/

var _remove = $.fn.remove;
$.fn.remove = function() {
	$("*", this).add(this).triggerHandler("remove");
	return _remove.apply(this, arguments );
};

// $.widget is a factory to create jQuery plugins
// taking some boilerplate code out of the plugin code
// created by Scott González and Jörn Zaefferer
function getter(namespace, plugin, method) {
	var methods = $[namespace][plugin].getter || [];
	methods = (typeof methods == "string" ? methods.split(/,?\s+/) : methods);
	return ($.inArray(method, methods) != -1);
}

$.widget = function(name, prototype) {
	var namespace = name.split(".")[0];
	name = name.split(".")[1];
	
	// create plugin method
	$.fn[name] = function(options) {
		var isMethodCall = (typeof options == 'string'),
			args = Array.prototype.slice.call(arguments, 1);
		
		if (isMethodCall && getter(namespace, name, options)) {
			var instance = $.data(this[0], name);
			return (instance ? instance[options].apply(instance, args)
				: undefined);
		}
		
		return this.each(function() {
			var instance = $.data(this, name);
			if (isMethodCall && instance && $.isFunction(instance[options])) {
				instance[options].apply(instance, args);
			} else if (!isMethodCall) {
				$.data(this, name, new $[namespace][name](this, options));
			}
		});
	};
	
	// create widget constructor
	$[namespace][name] = function(element, options) {
		var self = this;
		
		this.widgetName = name;
		this.widgetBaseClass = namespace + '-' + name;
		
		this.options = $.extend({}, $.widget.defaults, $[namespace][name].defaults, options);
		this.element = $(element)
			.bind('setData.' + name, function(e, key, value) {
				return self.setData(key, value);
			})
			.bind('getData.' + name, function(e, key) {
				return self.getData(key);
			})
			.bind('remove', function() {
				return self.destroy();
			});
		this.init();
	};
	
	// add widget prototype
	$[namespace][name].prototype = $.extend({}, $.widget.prototype, prototype);
};

$.widget.prototype = {
	init: function() {},
	destroy: function() {
		this.element.removeData(this.widgetName);
	},
	
	getData: function(key) {
		return this.options[key];
	},
	setData: function(key, value) {
		this.options[key] = value;
		
		if (key == 'disabled') {
			this.element[value ? 'addClass' : 'removeClass'](
				this.widgetBaseClass + '-disabled');
		}
	},
	
	enable: function() {
		this.setData('disabled', false);
	},
	disable: function() {
		this.setData('disabled', true);
	}
};

$.widget.defaults = {
	disabled: false
};


/** Mouse Interaction Plugin **/

$.ui.mouse = {
	mouseInit: function() {
		var self = this;
	
		this.element.bind('mousedown.'+this.widgetName, function(e) {
			return self.mouseDown(e);
		});
		
		// Prevent text selection in IE
		if ($.browser.msie) {
			this._mouseUnselectable = this.element.attr('unselectable');
			this.element.attr('unselectable', 'on');
		}
		
		this.started = false;
	},
	
	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	mouseDestroy: function() {
		this.element.unbind('.'+this.widgetName);
		
		// Restore text selection in IE
		($.browser.msie
			&& this.element.attr('unselectable', this._mouseUnselectable));
	},
	
	mouseDown: function(e) {
		// we may have missed mouseup (out of window)
		(this._mouseStarted && this.mouseUp(e));
		
		this._mouseDownEvent = e;
		
		var self = this,
			btnIsLeft = (e.which == 1),
			elIsCancel = (typeof this.options.cancel == "string" ? $(e.target).parents().add(e.target).filter(this.options.cancel).length : false);
		if (!btnIsLeft || elIsCancel || !this.mouseCapture(e)) {
			return true;
		}
		
		this._mouseDelayMet = !this.options.delay;
		if (!this._mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				self._mouseDelayMet = true;
			}, this.options.delay);
		}
		
		if (this.mouseDistanceMet(e) && this.mouseDelayMet(e)) {
			this._mouseStarted = (this.mouseStart(e) !== false);
			if (!this._mouseStarted) {
				e.preventDefault();
				return true;
			}
		}
		
		// these delegates are required to keep context
		this._mouseMoveDelegate = function(e) {
			return self.mouseMove(e);
		};
		this._mouseUpDelegate = function(e) {
			return self.mouseUp(e);
		};
		$(document)
			.bind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.bind('mouseup.'+this.widgetName, this._mouseUpDelegate);
		
		return false;
	},
	
	mouseMove: function(e) {
		// IE mouseup check - mouseup happened when mouse was out of window
		if ($.browser.msie && !e.button) {
			return this.mouseUp(e);
		}
		
		if (this._mouseStarted) {
			this.mouseDrag(e);
			return false;
		}
		
		if (this.mouseDistanceMet(e) && this.mouseDelayMet(e)) {
			this._mouseStarted =
				(this.mouseStart(this._mouseDownEvent, e) !== false);
			(this._mouseStarted ? this.mouseDrag(e) : this.mouseUp(e));
		}
		
		return !this._mouseStarted;
	},
	
	mouseUp: function(e) {
		$(document)
			.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);
		
		if (this._mouseStarted) {
			this._mouseStarted = false;
			this.mouseStop(e);
		}
		
		return false;
	},
	
	mouseDistanceMet: function(e) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - e.pageX),
				Math.abs(this._mouseDownEvent.pageY - e.pageY)
			) >= this.options.distance
		);
	},
	
	mouseDelayMet: function(e) {
		return this._mouseDelayMet;
	},
	
	// These are placeholder methods, to be overriden by extending plugin
	mouseStart: function(e) {},
	mouseDrag: function(e) {},
	mouseStop: function(e) {},
	mouseCapture: function(e) { return true; }
};

$.ui.mouse.defaults = {
	cancel: null,
	distance: 1,
	delay: 0
};

})(jQuery);
/*
 * jQuery UI Dialog
 *
 * Copyright (c) 2008 Richard D. Worth (rdworth.org)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 * 
 * http://docs.jquery.com/UI/Dialog
 *
 * Depends:
 *	ui.core.js
 *	ui.draggable.js
 *	ui.resizable.js
 */
(function($) {

var setDataSwitch = {
	dragStart: "start.draggable",
	drag: "drag.draggable",
	dragStop: "stop.draggable",
	maxHeight: "maxHeight.resizable",
	minHeight: "minHeight.resizable",
	maxWidth: "maxWidth.resizable",
	minWidth: "minWidth.resizable",
	resizeStart: "start.resizable",
	resize: "drag.resizable",
	resizeStop: "stop.resizable"
};

$.widget("ui.dialog", {
	init: function() {
		var self = this,
			options = this.options,
			resizeHandles = typeof options.resizable == 'string'
				? options.resizable
				: 'n,e,s,w,se,sw,ne,nw',
			
			uiDialogContent = this.element
				.addClass('ui-dialog-content')
				.wrap('<div/>')
				.wrap('<div/>'),
			
			uiDialogContainer = (this.uiDialogContainer = uiDialogContent.parent()
				.addClass('ui-dialog-container')
				.css({position: 'relative', width: '100%', height: '100%'})),
			
			title = options.title || uiDialogContent.attr('title') || '',
			uiDialogTitlebar = (this.uiDialogTitlebar =
				$('<div class="ui-dialog-titlebar"/>'))
				.append('<span class="ui-dialog-title">' + title + '</span>')
				.append('<a href="#" class="ui-dialog-titlebar-close"><span>X</span></a>')
				.prependTo(uiDialogContainer),
			
			uiDialog = (this.uiDialog = uiDialogContainer.parent())
				.appendTo(document.body)
				.hide()
				.addClass('ui-dialog')
				.addClass(options.dialogClass)
				// add content classes to dialog
				// to inherit theme at top level of element
				.addClass(uiDialogContent.attr('className'))
					.removeClass('ui-dialog-content')
				.css({
					position: 'absolute',
					width: options.width,
					height: options.height,
					overflow: 'hidden',
					zIndex: options.zIndex
				})
				// setting tabIndex makes the div focusable
				// setting outline to 0 prevents a border on focus in Mozilla
				.attr('tabIndex', -1).css('outline', 0).keydown(function(ev) {
					if (options.closeOnEscape) {
						var ESC = 27;
						(ev.keyCode && ev.keyCode == ESC && self.close());
					}
				})
				.mousedown(function() {
					self.moveToTop();
				}),
			
			uiDialogButtonPane = (this.uiDialogButtonPane = $('<div/>'))
				.addClass('ui-dialog-buttonpane').css({ position: 'absolute', bottom: 0 })
				.appendTo(uiDialog);
		
		this.uiDialogTitlebarClose = $('.ui-dialog-titlebar-close', uiDialogTitlebar)
			.hover(
				function() {
					$(this).addClass('ui-dialog-titlebar-close-hover');
				},
				function() {
					$(this).removeClass('ui-dialog-titlebar-close-hover');
				}
			)
			.mousedown(function(ev) {
				ev.stopPropagation();
			})
			.click(function() {
				self.close();
				return false;
			});

		this.uiDialogTitlebar.find("*").add(this.uiDialogTitlebar).each(function() {
			$.ui.disableSelection(this);
		});

		if ($.fn.draggable) {
			uiDialog.draggable({
				cancel: '.ui-dialog-content',
				helper: options.dragHelper,
				handle: '.ui-dialog-titlebar',
				start: function(e, ui) {
					self.moveToTop();
					(options.dragStart && options.dragStart.apply(self.element[0], arguments));
				},
				drag: function(e, ui) {
					(options.drag && options.drag.apply(self.element[0], arguments));
				},
				stop: function(e, ui) {
					(options.dragStop && options.dragStop.apply(self.element[0], arguments));
					$.ui.dialog.overlay.resize();
				}
			});
			(options.draggable || uiDialog.draggable('disable'));
		}
		
		if ($.fn.resizable) {
			uiDialog.resizable({
				cancel: '.ui-dialog-content',
				helper: options.resizeHelper,
				maxWidth: options.maxWidth,
				maxHeight: options.maxHeight,
				minWidth: options.minWidth,
				minHeight: options.minHeight,
				start: function() {
					(options.resizeStart && options.resizeStart.apply(self.element[0], arguments));
				},
				resize: function(e, ui) {
					(options.autoResize && self.size.apply(self));
					(options.resize && options.resize.apply(self.element[0], arguments));
				},
				handles: resizeHandles,
				stop: function(e, ui) {
					(options.autoResize && self.size.apply(self));
					(options.resizeStop && options.resizeStop.apply(self.element[0], arguments));
					$.ui.dialog.overlay.resize();
				}
			});
			(options.resizable || uiDialog.resizable('disable'));
		}
		
		this.createButtons(options.buttons);
		this.isOpen = false;
		
		(options.bgiframe && $.fn.bgiframe && uiDialog.bgiframe());
		(options.autoOpen && this.open());
	},
	
	setData: function(key, value){
		(setDataSwitch[key] && this.uiDialog.data(setDataSwitch[key], value));
		switch (key) {
			case "buttons":
				this.createButtons(value);
				break;
			case "draggable":
				this.uiDialog.draggable(value ? 'enable' : 'disable');
				break;
			case "height":
				this.uiDialog.height(value);
				break;
			case "position":
				this.position(value);
				break;
			case "resizable":
				(typeof value == 'string' && this.uiDialog.data('handles.resizable', value));
				this.uiDialog.resizable(value ? 'enable' : 'disable');
				break;
			case "title":
				$(".ui-dialog-title", this.uiDialogTitlebar).text(value);
				break;
			case "width":
				this.uiDialog.width(value);
				break;
		}
		
		$.widget.prototype.setData.apply(this, arguments);
	},
	
	position: function(pos) {
		var wnd = $(window), doc = $(document),
			pTop = doc.scrollTop(), pLeft = doc.scrollLeft(),
			minTop = pTop;
		
		if ($.inArray(pos, ['center','top','right','bottom','left']) >= 0) {
			pos = [
				pos == 'right' || pos == 'left' ? pos : 'center',
				pos == 'top' || pos == 'bottom' ? pos : 'middle'
			];
		}
		if (pos.constructor != Array) {
			pos = ['center', 'middle'];
		}
		if (pos[0].constructor == Number) {
			pLeft += pos[0];
		} else {
			switch (pos[0]) {
				case 'left':
					pLeft += 0;
					break;
				case 'right':
					pLeft += wnd.width() - this.uiDialog.width();
					break;
				default:
				case 'center':
					pLeft += (wnd.width() - this.uiDialog.width()) / 2;
			}
		}
		if (pos[1].constructor == Number) {
			pTop += pos[1];
		} else {
			switch (pos[1]) {
				case 'top':
					pTop += 0;
					break;
				case 'bottom':
					pTop += wnd.height() - this.uiDialog.height();
					break;
				default:
				case 'middle':
					pTop += (wnd.height() - this.uiDialog.height()) / 2;
			}
		}
		
		// prevent the dialog from being too high (make sure the titlebar
		// is accessible)
		pTop = Math.max(pTop, minTop);
		this.uiDialog.css({top: pTop, left: pLeft});
	},

	size: function() {
		var container = this.uiDialogContainer,
			titlebar = this.uiDialogTitlebar,
			content = this.element,
			tbMargin = parseInt(content.css('margin-top'),10) + parseInt(content.css('margin-bottom'),10),
			lrMargin = parseInt(content.css('margin-left'),10) + parseInt(content.css('margin-right'),10);
		content.height(container.height() - titlebar.outerHeight() - tbMargin);
		content.width(container.width() - lrMargin);
	},
	
	open: function() {
		if (this.isOpen) { return; }
		
		this.overlay = this.options.modal ? new $.ui.dialog.overlay(this) : null;
		(this.uiDialog.next().length > 0) && this.uiDialog.appendTo('body');
		this.position(this.options.position);
		this.uiDialog.show(this.options.show);
		this.options.autoResize && this.size();
		this.moveToTop(true);
		
		// CALLBACK: open
		var openEV = null;
		var openUI = {
			options: this.options
		};
		this.uiDialogTitlebarClose.focus();
		this.element.triggerHandler("dialogopen", [openEV, openUI], this.options.open);
		
		this.isOpen = true;
	},
	
	// the force parameter allows us to move modal dialogs to their correct
	// position on open
	moveToTop: function(force) {
		if ((this.options.modal && !force)
			|| (!this.options.stack && !this.options.modal)) { return this.element.triggerHandler("dialogfocus", [null, { options: this.options }], this.options.focus); }
		
		var maxZ = this.options.zIndex, options = this.options;
		$('.ui-dialog:visible').each(function() {
			maxZ = Math.max(maxZ, parseInt($(this).css('z-index'), 10) || options.zIndex);
		});
		(this.overlay && this.overlay.$el.css('z-index', ++maxZ));
		this.uiDialog.css('z-index', ++maxZ);
		
		this.element.triggerHandler("dialogfocus", [null, { options: this.options }], this.options.focus);
	},
	
	close: function() {
		(this.overlay && this.overlay.destroy());
		this.uiDialog.hide(this.options.hide);

		// CALLBACK: close
		var closeEV = null;
		var closeUI = {
			options: this.options
		};
		this.element.triggerHandler("dialogclose", [closeEV, closeUI], this.options.close);
		$.ui.dialog.overlay.resize();
		
		this.isOpen = false;
	},
	
	destroy: function() {
		(this.overlay && this.overlay.destroy());
		this.uiDialog.hide();
		this.element
			.unbind('.dialog')
			.removeData('dialog')
			.removeClass('ui-dialog-content')
			.hide().appendTo('body');
		this.uiDialog.remove();
	},
	
	createButtons: function(buttons) {
		var self = this,
			hasButtons = false,
			uiDialogButtonPane = this.uiDialogButtonPane;
		
		// remove any existing buttons
		uiDialogButtonPane.empty().hide();
		
		$.each(buttons, function() { return !(hasButtons = true); });
		if (hasButtons) {
			uiDialogButtonPane.show();
			$.each(buttons, function(name, fn) {
				$('<button/>')
					.text(name)
					.click(function() { fn.apply(self.element[0], arguments); })
					.appendTo(uiDialogButtonPane);
			});
		}
	}
});

$.extend($.ui.dialog, {
	defaults: {
		autoOpen: true,
		autoResize: true,
		bgiframe: false,
		buttons: {},
		closeOnEscape: true,
		draggable: true,
		height: 200,
		minHeight: 100,
		minWidth: 150,
		modal: false,
		overlay: {},
		position: 'center',
		resizable: true,
		stack: true,
		width: 300,
		zIndex: 1000
	},
	
	overlay: function(dialog) {
		this.$el = $.ui.dialog.overlay.create(dialog);
	}
});

$.extend($.ui.dialog.overlay, {
	instances: [],
	events: $.map('focus,mousedown,mouseup,keydown,keypress,click'.split(','),
		function(e) { return e + '.dialog-overlay'; }).join(' '),
	create: function(dialog) {
		if (this.instances.length === 0) {
			// prevent use of anchors and inputs
			// we use a setTimeout in case the overlay is created from an
			// event that we're going to be cancelling (see #2804)
			setTimeout(function() {
				$('a, :input').bind($.ui.dialog.overlay.events, function() {
					// allow use of the element if inside a dialog and
					// - there are no modal dialogs
					// - there are modal dialogs, but we are in front of the topmost modal
					var allow = false;
					var $dialog = $(this).parents('.ui-dialog');
					if ($dialog.length) {
						var $overlays = $('.ui-dialog-overlay');
						if ($overlays.length) {
							var maxZ = parseInt($overlays.css('z-index'), 10);
							$overlays.each(function() {
								maxZ = Math.max(maxZ, parseInt($(this).css('z-index'), 10));
							});
							allow = parseInt($dialog.css('z-index'), 10) > maxZ;
						} else {
							allow = true;
						}
					}
					return allow;
				});
			}, 1);
			
			// allow closing by pressing the escape key
			$(document).bind('keydown.dialog-overlay', function(e) {
				var ESC = 27;
				(e.keyCode && e.keyCode == ESC && dialog.close()); 
			});
			
			// handle window resize
			$(window).bind('resize.dialog-overlay', $.ui.dialog.overlay.resize);
		}
		
		var $el = $('<div/>').appendTo(document.body)
			.addClass('ui-dialog-overlay').css($.extend({
				borderWidth: 0, margin: 0, padding: 0,
				position: 'absolute', top: 0, left: 0,
				width: this.width(),
				height: this.height()
			}, dialog.options.overlay));
		
		(dialog.options.bgiframe && $.fn.bgiframe && $el.bgiframe());
		
		this.instances.push($el);
		return $el;
	},
	
	destroy: function($el) {
		this.instances.splice($.inArray(this.instances, $el), 1);
		
		if (this.instances.length === 0) {
			$('a, :input').add([document, window]).unbind('.dialog-overlay');
		}
		
		$el.remove();
	},
	
	height: function() {
		if ($.browser.msie && $.browser.version < 7) {
			var scrollHeight = Math.max(
				document.documentElement.scrollHeight,
				document.body.scrollHeight
			);
			var offsetHeight = Math.max(
				document.documentElement.offsetHeight,
				document.body.offsetHeight
			);
			
			if (scrollHeight < offsetHeight) {
				return $(window).height() + 'px';
			} else {
				return scrollHeight + 'px';
			}
		} else {
			return $(document).height() + 'px';
		}
	},
	
	width: function() {
		if ($.browser.msie && $.browser.version < 7) {
			var scrollWidth = Math.max(
				document.documentElement.scrollWidth,
				document.body.scrollWidth
			);
			var offsetWidth = Math.max(
				document.documentElement.offsetWidth,
				document.body.offsetWidth
			);
			
			if (scrollWidth < offsetWidth) {
				return $(window).width() + 'px';
			} else {
				return scrollWidth + 'px';
			}
		} else {
			return $(document).width() + 'px';
		}
	},
	
	resize: function() {
		/* If the dialog is draggable and the user drags it past the
		 * right edge of the window, the document becomes wider so we
		 * need to stretch the overlay. If the user then drags the
		 * dialog back to the left, the document will become narrower,
		 * so we need to shrink the overlay to the appropriate size.
		 * This is handled by shrinking the overlay before setting it
		 * to the full document size.
		 */
		var $overlays = $([]);
		$.each($.ui.dialog.overlay.instances, function() {
			$overlays = $overlays.add(this);
		});
		
		$overlays.css({
			width: 0,
			height: 0
		}).css({
			width: $.ui.dialog.overlay.width(),
			height: $.ui.dialog.overlay.height()
		});
	}
});

$.extend($.ui.dialog.overlay.prototype, {
	destroy: function() {
		$.ui.dialog.overlay.destroy(this.$el);
	}
});

})(jQuery);
