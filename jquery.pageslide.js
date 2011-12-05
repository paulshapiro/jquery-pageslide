var kDefaultType = 'Asset';


function cssForSettings(settings) {
	
    // these are the minimum css requirements for the pageslide elements introduced in this plugin.
    var pageslide_slide_wrap_css = {
        position: 'absolute',
        width: '0',
        top: '0',
        height: '100%',
        zIndex: '999'
    };

    var pageslide_body_wrap_css = {
        position: 'relative',
        zIndex: '0'
    };

    var pageslide_blanket_css = {
        position: 'absolute',
        top: '0px',
        left: '0px',
        height: '100%',
        width: '100%',
        opacity: '0.0',
        backgroundColor: 'black',
        zIndex: '1',
        display: 'none'
    };

    if (settings.direction == "right") {
        pageslide_slide_wrap_css.left = "-" + settings.width + 'px';
        pageslide_body_wrap_css.left = '0px';
    }
    else {
        pageslide_slide_wrap_css.right = "-" + settings.width + 'px';
        pageslide_body_wrap_css.left = '0px';
    }

	return {
		pageslide_slide_wrap_css : pageslide_slide_wrap_css,
		pageslide_body_wrap_css : pageslide_body_wrap_css,
		pageslide_blanket_css : pageslide_blanket_css,
	};
}

function elsForPageSlide(settings) {
	var body_wrap = '.pageslide-body-wrap.'+settings.kind;
	var slide_wrap = '.pageslide-slide-wrap.'+settings.kind;
	var slide_content = ".pageslide-content."+settings.kind;
	var slide_blanket = ".pageslide-blanket."+settings.kind;

	return {
		body_wrap : body_wrap,
		slide_wrap : slide_wrap,
		slide_content : slide_content,
		slide_blanket : slide_blanket,
	};
}


(function($) {
    $.fn.pageSlide = function(options) {

		var self = this;

        var settings = $.extend({
            callback: function() {},
            //Function to be called after the ajax request loaded
            width: "300px",
            // Accepts fixed widths
            duration: "normal",
            // Accepts standard jQuery effects speeds (i.e. fast, normal or milliseconds)
            direction: "left",
            // default direction is left.
            modal: false,
            // if true, the only way to close the pageslide is to define an explicit close class.
            target: "body",
            html: null,
			click_target_to_close : true,
			kind : kDefaultType,
            _identifier: $(self)
        },
        options);

//		 console.log("Settings " , settings);

		var css = cssForSettings(settings);
		var pageslide_slide_wrap_css = css.pageslide_slide_wrap_css,
			pageslide_body_wrap_css = css.pageslide_body_wrap_css,
			pageslide_blanket_css = css.pageslide_blanket_css;

		var els = elsForPageSlide(settings);
		var body_wrap = els.body_wrap,
			slide_wrap = els.slide_wrap,
			slide_content = els.slide_content,
			slide_blanket = els.slide_blanket;
		
		
		
        function _initialize(anchor) {

            // Create and prepare elements for pageSlide
            if ($(body_wrap + ', ' + slide_content + ', ' + slide_wrap).size() == 0) {

                var psBodyWrap = document.createElement("div");
                $(psBodyWrap).css(pageslide_body_wrap_css);
                $(psBodyWrap).addClass("pageslide-body-wrap").addClass(settings.kind).attr('kind', settings.kind).width($(settings.target).width());
                $(settings.target).contents().wrapAll.(psBodyWrap);

                var psSlideContent = document.createElement("div");
                $(psSlideContent).addClass("pageslide-content").addClass(settings.kind).attr('kind', settings.kind).width(settings.width);

                var psSlideWrap = document.createElement("div");
                $(psSlideWrap).css(pageslide_slide_wrap_css);
                $(psSlideWrap).addClass("pageslide-slide-wrap").addClass(settings.kind).attr('kind', settings.kind).append(psSlideContent);
                $(settings.target).append(psSlideWrap);

            }

            // introduce the blanket if modal option is set to true.
            if ($(slide_blanket).size() == 0 && settings.modal == true) {
                var psSlideBlanket = document.createElement("div");
                $(psSlideBlanket).css(pageslide_blanket_css);
                $(psSlideBlanket).addClass("pageslide-blanket").attr('kind', settings.kind).addClass(settings.kind);
                $(settings.target).append(psSlideBlanket);
                $(slide_blanket).click(function() {
                    return false;
                });
            }

            // // Callback events for window resizing
            // $(window).resize(function(){
            //         $("#pageslide-body-wrap").width( $("body").width() );
            //       });
            // mark the anchor!
			if ( anchor && anchor.length )
            	$(anchor).attr("rel", "pageslide");

        };


        function _openSlide(elm) {
			// console.log("_openSlide with ", elm)
			// console.log('$("#pageslide-slide-wrap").width() ', $("#pageslide-slide-wrap").width());
			
            if ($(slide_wrap).width() != 0) return false;

			// console.log("going to show blanket ")

            _showBlanket();

			// console.log("going to do dir stuff ");
			
            // decide on a direction
            if (settings.direction == "right") {
                direction = {
                    right: "-" + settings.width
                };
                $(slide_wrap).css({
                    left: 0
                });
                _overflowFixAdd();
            }
            else {
                direction = {
                    left: "-" + settings.width
                };
                $(slide_wrap).css({
                    right: 0
                });
            }


			// console.log("going to define funcs ")

            var dataSuccess = function(data) {
				// console.log("Data success with ", data);
				
                $(slide_content).css("width", settings.width).html(data)

                .queue(function() {
                    $(this).dequeue();

                    // add hook for a close button
                    $(this).find('.pageslide-close').unbind('click').click(function(elm) {
                        _closeSlide(elm);
                        $(this).find('pageslide-close').unbind('click');
                    });

                    //Callback for initializations
                    settings.callback();
                });

                openWithCb(function() {
	
				});

            }

			function openWithCb(cb) {
				// console.log("open with cb " , cb);
				$(slide_wrap).animate({ width: settings.width }, settings.duration, cb);
//                $("#pageslide-body-wrap").animate(direction, settings.duration);
			}
			
			
			// console.log("here... settings.html ", settings.html);
			
            if (typeof settings.html !== 'undefined'
	            && settings.html != null
	            && settings.html != '') {
               	dataSuccess(settings.html);
            }
            else {
				if ( elm && elm.length ) 
                    $.ajax({
                        type: "GET",
                        url: $(elm).attr("href"),
                        success: dataSuccess
                    });
            }

        };

        function _closeSlide(event) {
            if ( ( !event || $(event)[0].button != 2 ) && $(slide_wrap).css('width') != "0px") {
                // if not right click.
				closePageSlide(settings.kind, function() {});
            }
        };

        // this is used to activate the modal blanket, if the modal setting is defined as true.
        function _showBlanket() {
            if (settings.modal == true) {
                $(slide_blanket).toggle().animate({
                    opacity: '0.8'
                },
                'fast', 'linear');
            }
        };

        // fixes an annoying horizontal scrollbar.
        function _overflowFixAdd() { ($.browser.msie) ? $(settings.target + ", html").css({
                overflowX: 'hidden'
            }) : $(settings.target).css({
                overflowX: 'hidden'
            });
        }

		function openSesame() {
			function _checkA(elm) {
			    for (; elm != null; elm = elm.parentElement) {
			        if (elm.tagName == 'A') return true;
			    }
			    return false;
			}
			
			_openSlide(self);
			
			$(slide_wrap).unbind('click').click(function(e) {
			    if ( !_checkA(e.target)) return false;
			});
			
			if (settings.modal != true && settings.click_target_to_close == true ) {
			    $(body_wrap).unbind('click').click(function(e) {
			        if ( !_checkA(e.target)) {
			            $(body_wrap).unbind('click');
			            _closeSlide(e);
			            return false
			        }
			    });
			}
			return false;
		}

        // Initalize pageslide, if it hasn't already been done.
        _initialize(self);

		if ( self && self.length ) {
			// console.log("self exists!! ", self);
	        return self.each(function() {
	            $(self).unbind("click").bind("click", openSesame);
	        });
		}
		else {
			openSesame();
		}

    };
})(jQuery);



// pageSlideClose allows the system to automatically close any pageslide that is currently open in the view.
 (function($) {
    $.fn.pageSlideClose = function(options) {
		var self = this;
		
        var settings = $.extend({
            width: "300px",
            // Accepts fixed widths
            duration: "normal",
            // Accepts standard jQuery effects speeds (i.e. fast, normal or milliseconds)
            direction: "left",
            // default direction is left.
            modal: false,
            // if true, the only way to close the pageslide is to define an explicit close class.
            _identifier: $(self),

			onclose : null,
			
			destroy : false,
			
			kind : kDefaultType
        },
        options);


		var css = cssForSettings(settings);
		var pageslide_slide_wrap_css = css.pageslide_slide_wrap_css,
			pageslide_body_wrap_css = css.pageslide_body_wrap_css,
			pageslide_blanket_css = css.pageslide_blanket_css;

		var els = elsForPageSlide(settings);
		var body_wrap = els.body_wrap,
			slide_wrap = els.slide_wrap,
			slide_content = els.slide_content,
			slide_blanket = els.slide_blanket;

        function _hideBlanket() {
            if (settings.modal == true && $(slide_blanket).is(":visible")) {
                $(slide_blanket).animate({
                    opacity: '0.0'
                },
                'fast', 'linear',
                function() {
                    $(this).hide();
                });
            }
        }

        function _overflowFixRemove() { ($.browser.msie) ? $(settings.target + ", html").css({
                overflowX: ''
            }) : $(settings.target).css({
                overflowX: ''
            });
        }

        _hideBlanket();
        direction = ($(slide_wrap).css("left") != "0px") ? {
            left: "0"
        }: {
            right: "0"
        };
//        $("#pageslide-body-wrap").animate(direction, settings.duration);
        $(slide_wrap).animate({
            width: "0"
        },
        settings.duration,
        function() {
            // clear bug
            $(slide_content).empty();

            $(slide_wrap).css(pageslide_slide_wrap_css);
            $(body_wrap).css(pageslide_body_wrap_css);


            _overflowFixRemove();

			if ( settings.onclose != null ) {
				settings.onclose();
			}
			
			if ( settings.destroy == true ) {
				
				$(body_wrap).contents().unwrap();
				$(slide_wrap).remove();
			}
			
        });

    }
})(jQuery);

// // this adds the ability to close pageSlide with the 'escape' key, if not modal.
//  (function($) {
//     $(document).ready(function() {
//         $(document).keyup(function(event) {
//             if (!$(".pageslide-blanket").is(":visible") && event.keyCode == 27) {
// 	
// 				var kind = $('.pageslide-body-wrap').parent().attr('kind');
// 				
// 				if ( !kind ) kind = MEDIAFILE_KIND;
// 				
// 				closePageSlide(kind, function() {});			
// 			}
//         });
//     });
// })(jQuery);