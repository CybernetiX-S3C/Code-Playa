$(document).ready(function(){
	
	$slides = $walkthrough['ncp'].length;
	$slide = 0;
	var $speed = 40;
	var $mark_selection = [];
	generate_slides();
	$loop = null;
	
	var $old_scroll = {};
	$old_scroll['html'] = []; $old_scroll['css'] = []; $old_scroll['js'] = [];
	var $old_me_top = 0;
	var $old_me_left = 0;
	
	var $old_outputh = 0;
	var $old_outputw = 0;
	
	var $difference = 0;

	$("#slider").slider({
		range: "min",
		//value: 37,
		min: 1,
		max: 1000,
		slide: function( event, ui ) {
			pause();
			//$( "#amount" ).val( "$" + ui.value );
			$slide = Math.round(ui.value/1000*$slides);
			set_slide_content($slide, "dump");
			//console.log("Sliding at " + $slide);
			//clearInterval($loop);
		}, 
		stop: function(event, ui) {
			//console.log("Stopped at " + $slide);
			set_slide_content($slide, "dump");
			$slide++;
			//update_live_preview();
			play();
		}
	});
	
	$(".play").live("click", function(){
		_gaq.push(['_trackEvent', 'WTs', 'Play']);
		switch_button("play");
		
		//second iframe should be included by JS so that it only appears when the WT is played. No need to maintain multiple iframes for just demo purposes.
		if($("#docCanvas2").length == 0)
		{
			$("#output").append('<iframe src="about:blank" id="docCanvas2" class="two"></iframe>');
		}
		
		start_miliseconds = new Date().getTime();
		var $browser_width = $(window).width();
		if($("#intro").is(":visible"))
		{
			toggle_description();
		}
		if($("#wt_comments").is(":visible"))
		{
			toggle_comments();
		}
		
		//Force dumping content for that slide so that user edits can be removed.
		set_slide_content($slide, "dump");
		$slide++;
		
		play();
		
		return false;
	});
	/*
	$(".play_walkthrough").click(function(){
		//$("#player_controls").animate({'bottom': '-26px'}, 'fast');
		
		//update_live_preview();
	});
	*/
	/*
	$("#player_controls").hover(function(){
		timer = null;
		if(timer) 
		{
	        clearTimeout(timer);
	        timer = null
	    }
	    timer = setTimeout(function(){
			$("#player_controls").animate({'bottom': '0px'}, 'fast');
		}, 500);
	}, function(){
		if(timer) 
		{
		    clearTimeout(timer);
		    timer = null
		}
		timer = setTimeout(function(){
			if(!$(".related_wts").hasClass("in"))
			{
				$("#player_controls").animate({'bottom': '-26px'}, 'fast');
			}
		}, 500);
	});
	*/
	var timer;
	$(".author_box").hover(function(){
		if($(window).width() <= 320) return false;
		
		if(timer) {
                clearTimeout(timer);
                timer = null
        }
        timer = setTimeout(
		    function() 
		    {
				$(".author_box .hidden_info").show("fast");
		    }, 250)
	}, function(){
		clearTimeout(timer);
		timer = null;
		$(".author_box .hidden_info").hide("fast");
	})
	
	$("#intro_handle").click(function(){
		$this = $(this);
		if($this.hasClass("show"))
		{
			$("#wt_name").hide("fast");
			$("#intro").animate({right:'60%', left:'0%'}, 'slow', function(){
				$this.removeClass("show").html("&laquo;");
			})
		}
		else
		{
			$("#wt_name").show("slow");
			$("#intro").animate({right:'100%', left:'-40%'}, 'slow', function(){
				$this.addClass("show").html("&raquo;");
			})
		}
		return false;
	});
	
	$(".pause").live("click", function(){
		pause();
		
		return false;
	});
	
	$(".speed_control").live("click", function(){
		$(".speed_control").removeClass("active");
		$(this).addClass("active");
		
		if($(this).hasClass("0x")) $speed = 1000; 
		else if($(this).hasClass("2x")) $speed = 200; 
		else if($(this).hasClass("5x")) $speed = 80; 
		else if($(this).hasClass("10x")) $speed = 40; 
		else if($(this).hasClass("15x")) $speed = 30; 
		else if($(this).hasClass("20x")) $speed = 20; 
		else if($(this).hasClass("Ux")) $speed = 0; 
		
		if($loop != null) pauseplay(); 
		//print_time(); 
		return false;
	});
	
	

	// Moar UI Code
	
	/* Comments */
	$('#post_comment').click(function() {
	  $("#comment_loader").remove();
	  $(this).after("<img id='comment_loader' src='images/loader2.gif' />");
	  var form = $(this).closest('form');
	
	  $.post( BASE_URL + '/comment/add', form.serialize(), function(data) {
	  
	    var comment_box = $('#comments .alert-message');
	    comment_box.css('display', 'block');
	    
	    $("#comment_loader").remove();
	    if( data['status'] == 'success' ) {
	      comment_box.addClass('success').find('p').html( data['msg'] );
	    }
	    else {
	      comment_box.addClass('error').find('p').html( data['msg'] );
	    }
	    
	  	if( data['redirect_to'] ) {
	  		if ( !data['reply_to'] ) location.reload();
	  		else location.href = data['redirect_to'];
	  		
	  		return false;
	  	}
	    
	  }, 'json');
	  
	  return false;
	});
	
	$(".related_wts li").hover(function(){
		$(this).find(".related_wt_label").show();
		//$(".related_wt_label").html($image.attr("alt")).show();
	}, function(){
		$(this).find(".related_wt_label").hide();
		//$(".related_wt_label").html("").hide();
	});
	
	optional_scrollers();
	elastic_editors();
	
	function loop()
	{
		//console.log($slide);
		if(typeof $walkthrough['cp'][$slide] == 'undefined')
		{
			clearInterval($loop);
			$loop = null;
			switch_button("pause");
			$slide = 0;
		
			setTimeout(function(){
				$("#player_controls").animate({'bottom': '0px'}, 'fast', function(){
					show_related_wts();
				});
			});
		
			//update_live_preview();
		
			return false;
		}
		if($slide == 0)
		{
			code_mirror_html.setValue("");
			code_mirror_css.setValue("");
			code_mirror_js.setValue("");
		}
		//console.log("Loop slide: " + $slide);
		if(set_slide_content($slide))
		{
			set_slider($slide);
			//$loop = setInterval("loop()", $speed);
			//loop();
			$slide++;
			
			
			current_miliseconds = new Date().getTime();
			$logs.elapsed_time = (current_miliseconds-start_miliseconds)/1000;
			//slide_ps = parseFloat($slide/(current_miliseconds-start_miliseconds)*1000);
			//slide_ps = Math.round(slide_ps*100)/100;
			//$("#slide_ps").html(slide_ps);
		}
		//console.log($slide);
	}

	function set_slide_content($sl, $set_type)
	{
		//console.log($walkthrough['selected'][$js_data_reference_index[$sl]]);
		//console.log("Slide: " + $js_data_reference_index[$sl]);
		if(
			$walkthrough['me_top'][$js_data_reference_index[$sl]] && $walkthrough['me_left'][$js_data_reference_index[$sl]] &&
			$walkthrough['me_top'][$js_data_reference_index[$sl]] != $old_me_top && $walkthrough['me_left'][$js_data_reference_index[$sl]] != $old_me_left
		)
		{
			//console.log($slide);
			pause();
			$(".output").css("width", "100%");
			$(".editor_pane").addClass("dockedout").animate({
				top: $walkthrough['me_top'][$js_data_reference_index[$sl]]+"px",
				left: $walkthrough['me_left'][$js_data_reference_index[$sl]]+"px",
			}, 500, function(){
				$editor_pane_left = parseFloat($(".editor_pane").css("left"));
				$editor_pane_top = parseFloat($(".editor_pane").css("top"));
				if($editor_pane_left == 0 && $editor_pane_top == 28)
				{
					$(".editor_pane").addClass("dockedin").removeClass("dockedout");
					$(".output").css("width", "60%");
				}
						
				$slide++;
				play();
			
				$old_me_top = $walkthrough['me_top'][$js_data_reference_index[$sl]];
				$old_me_left = $walkthrough['me_left'][$js_data_reference_index[$sl]];
			});
		
		}
		else if(
			$walkthrough['outputh'][$js_data_reference_index[$sl]] && $walkthrough['outputw'][$js_data_reference_index[$sl]] &&
			$walkthrough['outputh'][$js_data_reference_index[$sl]] != $old_outputh && $walkthrough['outputw'][$js_data_reference_index[$sl]] != $old_outputw &&
			$walkthrough['outputh'][$js_data_reference_index[$sl]] != 0 && $walkthrough['outputw'][$js_data_reference_index[$sl]] != 0
		)
		{
			//console.log($slide);
			pause();
			var $width = Math.min($walkthrough['outputw'][$js_data_reference_index[$sl]], $("#output").width()) + "px";
			var $height = Math.min($walkthrough['outputh'][$js_data_reference_index[$sl]], $("#output").height()) + "px";
			var $marginTop = ($("#output").height() - parseInt($height))/2 + "px";
		
			$("#docCanvas").animate({width: $width, height: $height, marginTop: $marginTop}, 500, function(){
				$slide++;
				play();
			
				$old_outputh = $walkthrough['outputh'][$js_data_reference_index[$sl]];
				$old_outputw = $walkthrough['outputw'][$js_data_reference_index[$sl]];
			});
		
		}
		else
		{
			var $editor = $walkthrough['editor'][$sl];
			//console.log($walkthrough['selected']);
			//console.log($sl +"->"+ $any_change[$sl] +"->"+ $walkthrough['added'][$js_data_reference_index[$sl]]);
			if($any_change[$sl] == "1")
			{
				if($walkthrough['selected'][$js_data_reference_index[$sl]] == 1 && !$select_from)
				{
					$select_from = get_cm_cursor_position($slide_content[$editor][$sl], $walkthrough['ocp'][$js_data_reference_index[$sl]]);
				}
				else if($walkthrough['selected'][$js_data_reference_index[$sl]] == 0)
				{
					$select_from = false;
					if(typeof $marker != "undefined") $marker.clear();
					//$(".CodeMirror-selected").removeClass("CodeMirror-selected");
				}
	
				if(typeof $ohc == 'undefined') $ohc = "";
				if(typeof $occ == 'undefined') $occ = "";
				if(typeof $ojc == 'undefined') $ojc = "";
				
				for($i = $sl-1; $i >= 0; $i--)
				{
					if($any_change[$i] == "1")
					{
						$ohc = $slide_content['html'][$i];
						$occ = $slide_content['css'][$i];
						$ojc = $slide_content['js'][$i];
						$old_editor = $walkthrough['editor'][$i];
						break;
					}
				}
				if(typeof $old_editor == "undefined") $old_editor = "";
			
				if($set_type == "dump")
				{
					code_mirror_html.setValue($slide_content['html'][$sl]);
					code_mirror_css.setValue($slide_content['css'][$sl]);
					code_mirror_js.setValue($slide_content['js'][$sl]);
				}
				else
				{
					var $add = $walkthrough['added'][$js_data_reference_index[$sl]];
					//console.log($add +" -> "+ $sl);
					var $remove = $walkthrough['removed'][$js_data_reference_index[$sl]];
					//$sl_previous = ($sl > 1) ? $sl-1:0;
					if($remove.length)
					{
						if($add.length)
						{
							var $cm_from_number = parseInt($walkthrough['ocp'][$js_data_reference_index[$sl]]);
							var $cm_to_number = parseInt($walkthrough['ncp'][$js_data_reference_index[$sl]]);
							
							if($add.length == $remove.length && $cm_from_number == $cm_to_number) $cm_from_number -= $remove.length
							if($add.length < $remove.length)
							{
								if($cm_from_number > $cm_to_number)
								{
									var $temp = $cm_from_number;
									$cm_from_number = $cm_to_number-$add.length;
									$cm_to_number = $temp;
								}
								else if($cm_from_number < $cm_to_number)
								{
									var $cm_to_number = $cm_from_number+$remove.length;
								}
							}
							else if($add.length > $remove.length)
							{
								$cm_to_number = $cm_from_number + $remove.length;
							}
							
							
							var $cm_from = get_cm_cursor_position($index_content[$editor][$js_data_reference_index[$sl]], $cm_from_number);
							var $cm_to = get_cm_cursor_position($index_content[$editor][$js_data_reference_index[$sl]-1], $cm_to_number);
						}
						else
						{
							var $cm_from_number = parseInt($walkthrough['ocp'][$js_data_reference_index[$sl]])
							var $cm_to_number = parseInt($walkthrough['ncp'][$js_data_reference_index[$sl]])
							
							//Backspace and select+backspace
							if($cm_from_number == $cm_to_number) $cm_to_number += $remove.length;
							else if($cm_from_number > $cm_to_number)
							{
								var $temp = $cm_from_number;
								$cm_from_number = $cm_to_number;
								$cm_to_number += $remove.length;
							}
							else if ($cm_from_number < $cm_to_number)
							{
								$cm_to_number = $cm_from_number+$remove.length;
							}
							
							var $cm_from = get_cm_cursor_position($index_content[$editor][$js_data_reference_index[$sl]], $cm_from_number);
							var $cm_to = get_cm_cursor_position($index_content[$editor][$js_data_reference_index[$sl]-1], $cm_to_number);
						}
						//console.log("Slide: "+$slide+". Add '"+$add+"' Remove '"+$remove+"' From: CP: "+$cm_from_number+" "+$cm_from.line+", "+$cm_from.ch+" To: CP: "+$cm_to_number+" "+$cm_to.line+", "+$cm_to.ch);
						
						if($editor == "html") code_mirror_html.replaceRange($add, $cm_from, $cm_to);
						else if($editor == "css") code_mirror_css.replaceRange($add, $cm_from, $cm_to);
						else if($editor == "js") code_mirror_js.replaceRange($add, $cm_from, $cm_to);
					}
					else if($add.length)
					{
						//console.log("adding " + $add + " at ");
						//console.log($cm_from);
						var $cm_from_number = $walkthrough['ocp'][$js_data_reference_index[$sl]];
						var $cm_from = get_cm_cursor_position($index_content[$editor][$js_data_reference_index[$sl]], $cm_from_number);
						//console.log("Slide: "+$slide+". Add '"+$add+"' From: "+$cm_from_number+", "+$cm_from.line+", "+$cm_from.ch);
						
						if($editor == "html")
						{
							code_mirror_html.setCursor($cm_from); //Hack to make old WTs work
							code_mirror_html.replaceRange($add, $cm_from);
						}
						if($editor == "css")
						{
							code_mirror_css.setCursor($cm_from); //Hack to make old WTs work
							code_mirror_css.replaceRange($add, $cm_from);
						}
						if($editor == "js")
						{
							code_mirror_js.setCursor($cm_from); //Hack to make old WTs work
							code_mirror_js.replaceRange($add, $cm_from);
						}
					}
					else
					{
						//console.log("Why did I land up here ?");
					}
				}
				//if($walkthrough['editor'][$sl])
				if($editor != $old_editor || $set_type == "dump")
				{
					$("#tabs .enabled").trigger("click");
					$(".code_"+$editor).trigger("click");
					update_live_preview();
				}
				//$("#code textarea").trigger("keyup");
	
				//console.log($editor);
				if($editor == "html")
				{
					code_mirror_html.focus();
					/*Deprecated on 25112012
					$codemirror_scroller = $(code_mirror_html.getScrollerElement())
					*/
					$cp_object = get_cm_cursor_position($index_content['html'][$js_data_reference_index[$sl]], $html_cursor[$sl]);
				}
				if($editor == "css")
				{
					code_mirror_css.focus();
					/*Deprecated on 25112012
					$codemirror_scroller = $(code_mirror_css.getScrollerElement())
					*/
					$cp_object = get_cm_cursor_position($index_content['css'][$js_data_reference_index[$sl]], $css_cursor[$sl]);
				}
				if($editor == "js")
				{
					code_mirror_js.focus();
					/*Deprecated on 25112012
					$codemirror_scroller = $(code_mirror_js.getScrollerElement())
					*/
					$cp_object = get_cm_cursor_position($index_content['js'][$js_data_reference_index[$sl]], $js_cursor[$sl]);
				}

				code_mirror_html.setCursor(get_cm_cursor_position($slide_content['html'][$sl], $html_cursor[$sl]));
				//console.log($html_cursor[$sl]);
				code_mirror_css.setCursor(get_cm_cursor_position($slide_content['css'][$sl], $css_cursor[$sl]));
				code_mirror_js.setCursor(get_cm_cursor_position($slide_content['js'][$sl], $js_cursor[$sl]));
				
				code_mirror_save();
				
				if($select_from)
				{
					$mark_from = $select_from; $mark_to = $cp_object;
					if(parseInt($select_from['line']) > parseInt($cp_object['line']))
					{
						$mark_from = $cp_object; $mark_to = $select_from;
					}
					else if(parseInt($select_from['line']) < parseInt($cp_object['line']))
					{
						$mark_from = $select_from; $mark_to = $cp_object;
					}
					else if(parseInt($select_from['line']) == parseInt($cp_object['line']))
					{
						if(parseInt($select_from['ch']) > parseInt($cp_object['ch']))
						{
							$mark_from = $cp_object; $mark_to = $select_from;
						}
						else if(parseInt($select_from['ch']) < parseInt($cp_object['ch']))
						{
							$mark_from = $select_from; $mark_to = $cp_object;
						}
					}
					//console.log("Selecting " + $mark_from.line+", "+$mark_from.ch + " TO " + $mark_to.line+", "+$mark_to.ch);
					
					if(typeof $marker != "undefined") $marker.clear();
					if($editor == "html") $marker = code_mirror_html.markText($mark_from, $mark_to, 'CodeMirror-selected');
					else if($editor == "css") $marker = code_mirror_css.markText($mark_from, $mark_to, 'CodeMirror-selected');
					else if($editor == "js")
					{
						$marker = code_mirror_js.markText($mark_from, $mark_to, 'CodeMirror-selected');
						//console.log($marker.find());
					}
				}
	
				//adjust_scroller($editor, $sl);
	
			}
			else
			{
				//dump is used while sliding or as a fallback for version 1 where editors value was set by replacing entire content.
				if($set_type == "dump") 
				{
					$previous_sl = $js_data_reference_index.indexOf($js_data_reference_index[$sl]-1)
					//console.log($previous_sl);
					code_mirror_html.setValue($slide_content['html'][$previous_sl]);
					code_mirror_css.setValue($slide_content['css'][$previous_sl]);
					code_mirror_js.setValue($slide_content['js'][$previous_sl]);
					
					$("#tabs .enabled").trigger("click");
					$(".code_"+$editor).trigger("click");
				}
			}
			return true;
		}
	}

	/* Deprecated on 25112012
	function adjust_scroller($editor, $sl)
	{
		//console.log($difference);
		if(typeof $codemirror_scroller == "undefined") return false;
		//console.log($codemirror_scroller);
		$code_container_height = $codemirror_scroller.height();
		$code_container_scroll = $codemirror_scroller.scrollTop();
		//console.log($code_container_scroll);
		$code_height = $codemirror_scroller.children("div").height();
		$cursor_top = $codemirror_scroller.find(".CodeMirror-cursor").css("top");
		//console.log("Container height: "+ $code_container_height +" Height: " + $code_height + " Cursor: " + $cursor_top);
	
		$retain_old = false;
		//If there is a scroller at all
		if($code_container_height < $code_height && typeof $old_scroll[$editor] != "undefined" && typeof $old_cursor_top != "undefined") 
		{
			//Difference is the amount of space from the last line of code to the line of code on which the cursor is present
			//It reduces if a person scrolls down.
			//console.log(parseInt($old_cursor_top)+" - "+parseInt($cursor_top)+" = "+$difference);
			$difference += parseInt($old_cursor_top) - parseInt($cursor_top);
			//console.log("Diff: " + $difference);
			if($difference >= 0)
			{
				if($difference < $code_container_height-50)
				{
					//console.log("Difference: " + $difference + " Container height: " + $code_container_height);
					//console.log("New: " + $code_container_scroll + " Old: " + $old_scroll[$editor]);
					$codemirror_scroller.scrollTop($old_scroll[$editor]);
					$retain_old = true;
				}
				else
				{
					$retain_old = true;
					//console.log("I did not scroll :(");
					//clearInterval($loop);
				}
			}
		}
	
		if(!$retain_old)
		{
			$old_scroll[$editor] = $code_container_scroll;
			//console.log($code_container_scroll);
			$difference = 0;
		}
		else
		{
			//console.log("kept old");
		}
		$old_cursor_top = $cursor_top;
	}
	
	function new_adjust_scroller($editor, $sl)
	{
		if(typeof $codemirror_scroller == "undefined") return false;
		
		$code_container_height = $codemirror_scroller.height();
		$code_container_scroll = $codemirror_scroller.scrollTop();
		$cursor_top = $codemirror_scroller.find(".CodeMirror-cursor").css("top");
		
		if($cursor_top < $code_container_scroll+$code_container_height)
		{
			//prevent scroll
			$codemirror_scroller.scrollTop($old_scroll[$editor]);
		}
		
		$old_scroll[$editor] = $code_container_scroll;
	}
	*/
	
	function get_slide_content($slide, $editor)
	{
		var $slide = $slide;
		if(typeof $html_old_content == 'undefined') $html_old_content = "";
		if(typeof $css_old_content == 'undefined') $css_old_content = "";
		if(typeof $js_old_content == 'undefined') $js_old_content = "";
	
		if($editor == "html") $old_content = $html_old_content;
		if($editor == "css") $old_content = $css_old_content;
		if($editor == "js") $old_content = $js_old_content;
	
		if(typeof $old_content == "undefined") $old_content = "";
		var $oc = $old_content.split("");
	
		var $r = $walkthrough['removed'][$slide];
		var $a = $walkthrough['added'][$slide];
		
		var $ocp = $walkthrough['ocp'][$slide];
		var $ncp = $walkthrough['ncp'][$slide];
		//var $cp = parseInt($ocp) <= parseInt($ncp) ? parseInt($ocp) : parseInt($ncp);
		if($ocp == $ncp && $r.length == $a.length)
		{
			var $cp = $ocp - $r.length;
			//console.log($cp);
		}
		else if($old_content.substr($ocp, $r.length) == $r)
		{
			var $cp = parseInt($ocp);
		}
		else if($old_content.substr($ncp, $r.length) == $r)
		{
			var $cp = parseInt($ncp);
		}
		else if($old_content.substr($ocp-$r.length, $r.length) == $r)
		{
			var $cp = parseInt($ocp-$r.length);
		}
		//var $cp = $ocp;
		//if(parseInt($ocp) == parseInt($ncp)) $cp -= $r.length;
	
		//Remove Characters from the REMOVED string
		for(var $i = 0; $i < $r.length; $i++)
		{
			$oc.splice($cp, 1);
		}
		$oc.splice($cp, 0, $a);
		$new_content = prepare_for_player($oc.join(""));
	
		if($editor == "html") $html_old_content = $new_content;
		else if($editor == "css") $css_old_content = $new_content;
		else if($editor == "js") $js_old_content = $new_content;
	
		return $new_content;
	}

	function generate_slides()
	{
		$slide_content = {};
		$slide_content['html'] = [];
		$slide_content['css'] = [];
		$slide_content['js'] = [];
		$index_content = {};
		$index_content['html'] = [];
		$index_content['css'] = [];
		$index_content['js'] = [];
		$js_data_reference_index = [];
	
		$html_cursor = {};
		$html_cursor = [];
		//$html_cursor['ch'] = [];
	
		$css_cursor = {};
		$css_cursor = [];
		//$css_cursor['ch'] = [];
	
		$js_cursor = {};
		$js_cursor = [];
		//$js_cursor['ch'] = [];
	
		$select_text = [];
	
		$hc = $jc = $cc = 0;
	
		for(var $slide = 0; $slide < $walkthrough['ncp'].length; $slide++)
		{
			var $editor = $walkthrough['editor'][$slide];
			$new_content = get_slide_content($slide, $editor);
			//console.log($new_content);
			$ncp = $walkthrough['ncp'][$slide];
		
			$cursor_position = $ncp;

			$save_timeline = false;

			if($editor == "html")
			{
				$html_content = $new_content;
				$hc = $cursor_position;
			}
			else if($editor == "css")
			{
				$css_content = $new_content;
				$cc = $cursor_position;
			}
			else if($editor == "js"){
				$js_content = $new_content;
				$jc = $cursor_position;
			}
		
			$index_content['html'][$slide] = $html_content;
			$html_cursor[$slide] = $hc;
		
			$index_content['css'][$slide] = $css_content;
			$css_cursor[$slide] = $cc;
		
			$index_content['js'][$slide] = $js_content;
			$js_cursor[$slide] = $jc;
		
		}
		//After looping over all slides, set the content in the editors for display.
		//Hide editors without any content
		//code_mirror_html.setValue($html_content);
		$dont_render = true;
		code_mirror_html.setValue($html_content);
		if(!$html_content) $(".code_html").trigger("click");
		code_mirror_css.setValue($css_content);
		if(!$css_content) $(".code_css").trigger("click");
		code_mirror_js.setValue($js_content);
		if(!$js_content) $(".code_js").trigger("click");
		$dont_render = false;
		update_live_preview();
	
		/*deprecated on 19 04 2013*/
		//code_mirror_save();
	
		var $counter = 0;
		$h_content = [];
		$c_content = [];
		$j_content = [];
		$wcp = [];
		$weditor = [];
		$wadded = [];
		$wremoved = [];
		$h_cursor = [];
		$c_cursor = [];
		$j_cursor = [];
		$any_change = [];
	
		for(var $i = 0; $i < $index_content['html'].length; $i++)
		{
			var $editor = $walkthrough['editor'][$i];
			$wait_time = $walkthrough['slide_wait_time'][$i];
			if($wait_time > 250 && $wait_time < 8000) //More than 0.25s and less than 8s
			{
				for(var $n = 1; $n <= $wait_time; $n=$n+250)
				{
					$h_content[$counter] = $index_content['html'][$i];
					$c_content[$counter] = $index_content['css'][$i];
					$j_content[$counter] = $index_content['js'][$i];
					
					$js_data_reference_index[$counter] = $i;
					$wcp[$counter] = $walkthrough['ncp'][$i];
					$weditor[$counter] = $walkthrough['editor'][$i];
					$h_cursor[$counter] = $html_cursor[$i];
					$c_cursor[$counter] = $css_cursor[$i];
					$j_cursor[$counter] = $js_cursor[$i];
				
					$any_change[$counter] = "0";
				
					$counter++;
				}
			}
			if(
				$index_content[$walkthrough['editor'][$i]][$i] != $index_content[$walkthrough['editor'][$i]][$i-1] || 
				($editor == "html" && $html_cursor[$i] != $html_cursor[$i-1]) || 
				($editor == "css" && $css_cursor[$i] != $css_cursor[$i-1]) || 
				($editor == "js" && $js_cursor[$i] != $js_cursor[$i-1])
			)
			{
				$any_change[$counter] = "1";
			}
			else
			{
				$any_change[$counter] = "0";
			}
			$h_content[$counter] = $index_content['html'][$i];
			$c_content[$counter] = $index_content['css'][$i];
			$j_content[$counter] = $index_content['js'][$i];
			//console.log("else " + $counter);
			$js_data_reference_index[$counter] = $i;
			$wcp[$counter] = $walkthrough['ncp'][$i];
			$weditor[$counter] = $walkthrough['editor'][$i];
			
			$h_cursor[$counter] = $html_cursor[$i];
			$c_cursor[$counter] = $css_cursor[$i];
			$j_cursor[$counter] = $js_cursor[$i];
		
			$counter++;
		}
		$slide_content['html'] = $h_content;
		//console.log($h_content.length);
		$slide_content['css'] = $c_content;
		$slide_content['js'] = $j_content;
		$walkthrough['cp'] = $wcp;
		$walkthrough['editor'] = $weditor;
		$html_cursor = $h_cursor;
		//$html_cursor['ch'] = $h_cursor['ch'];
		$css_cursor = $c_cursor;
		//console.log($css_cursor);
		//$css_cursor['ch'] = $c_cursor['ch'];
		$js_cursor = $j_cursor;
		//$js_cursor['ch'] = $j_cursor['ch'];
	
		$slides = $slide_content['css'].length;
		//console.log("Processed Slides: " + $slides);
		//console.log($walkthrough['added']);
		//console.log($any_change);
		$js_index_change = [];
		for(var i = 0; i < $js_data_reference_index.length; i++)
		{
			if($any_change[$js_data_reference_index[i]] == 1 && $walkthrough['added'][$js_data_reference_index[i]] != "")
			{
				$js_index_change.push("1");
			}
		}
		//console.log($js_index_change);
	
		//console.log($walkthrough);
		//console.log($slide_content['css'][714]);
		//$test_sl = $js_data_reference_index[714];
		//console.log($test_sl);
		//console.log($walkthrough['added'][$test_sl]);
		
	
		$("#code textarea").last().trigger("keyup");
	}

	function get_codemirror_cursor_object($string)
	{
		var $array = $string.split(",");
		var $object = {};
		$object['line'] = parseInt($array[0]);
		$object['ch'] = parseInt($array[1]);
	
		return $object;
	}

	pause = function()
	{
		if(typeof $loop != "undefined")
		{
			clearInterval($loop);
			$loop = null;
		}
		switch_button("pause");
	}
	play = function()
	{
		switch_button("play");
		//console.log("Playing from " + $slide);
		hide_related_wts();
		if($loop == null)
		{
			/*
			loop();
      		requestAnimFrame(play);
      		*/
			$loop = setInterval(loop, $speed);
		}
	}
	pauseplay = function()
	{
		clearInterval($loop);
		$loop = setInterval(loop, $speed);
	}

	switch_button = function($type)
	{
		if($type == "play")
		{
			$(".play").addClass("pause").removeClass("play");
		}
		else
		{
			$(".pause").addClass("play").removeClass("pause");
		}
	}

	function print_time()
	{
		var $approx_time = $speed/1000 * $slides/60;
	
		var $minutes = Math.round($approx_time*100)/100;
		var $seconds = ($minutes - Math.floor($minutes))*60;
		var $approx_time = Math.floor($minutes) + ":" + Math.round($seconds);
		$("#approx_time").html("Approx time: " + $approx_time + " mins");
	}

	function toggle_player_controls()
	{

	}

	

	function get_cm_cursor_position($string, $cp)
	{
		var $substring = $string.substring(0, $cp);
		if($array = $substring.match(/\n/g))
		{
			var $line = $array.length;
		}
		else
		{
			var $line = 0;
		}
		//console.log($cp - $substring.lastIndexOf("\n"));
		var $ch = $cp - $substring.lastIndexOf("\n") - 1;
		//console.log("Line: " + $line + " Ch: " + $ch);
	
		var $cursor_position = {};
		$cursor_position['line'] = $line;
		$cursor_position['ch'] = $ch;
	
		//console.log($cursor_position);
	
		return $cursor_position;
	}

	function cm_to_linear_cursor($string, $cp)
	{
		//$cp_object = get_codemirror_cursor_object($cp);
		var $line = parseInt($cp['line']);
		var $ch = parseInt($cp['ch']);
		var $count = 0;
		var $string_array = $string.split("");
		//console.log($string_array);
		var $line_characters = 0; var $remaining_characters = 0;
		for(var $i = 0; $i < $string_array.length; $i++)
		{
			if($string_array[$i] == "\n")
			{
				$count++;
				//console.log("Line: " + $line);
				if($count == $line)
				{
					//console.log("I: " + $i);
					$line_characters = $i+1;
					//$remaining_characters = $string.length-$i-1;
					//console.log("line characters: " + $line_characters + " Remaining characters: " + $ch);
					//console.log($i);
					break;
				}
			}
		}
		//$remaining_characters = $remaining_characters ? $remaining_characters : $ch;
		//console.log($line_characters +"+"+ $ch);
		//console.log($line_characters + $remaining_characters);
		return $line_characters + $ch;
	}

	function set_slider($slide)
	{
		//console.log($slide);
		$value = Math.round(($slide+1)/$slides*1000);
		//console.log("(" + $slide + "+1)/" + $slides + "*100");
		//$value = Math.round($el*$speed/$total_life*1000);
		//console.log($value);
		$("#slider").slider({ value: $value });
	}

	function prepare_for_player($string)
	{
		//$("#html_textarea").show();
		//console.log($string);
		return $string;
		//return unescape($string.replace(/\\\\/g, "\\"));
		//return unescape($string.replace(/\n/g, "\\n"));
	}

	function code_mirror_save(type) {
		switch (type) {
			case 'html': code_mirror_html.save(); break;
			case 'css': code_mirror_css.save();
			case 'js': code_mirror_js.save();
			default:
				code_mirror_html.save();
				code_mirror_css.save();
				code_mirror_js.save();
				break;
		}
	}
});
