$(document).ready(function(){
	$slides = $walkthrough['ncp'].length;
	//console.log("Slides: " + $slides);
	$slide = 0;
	$speed = 40;
	$mark_selection = [];
	generate_slides();
	//print_time();
	
	$old_scroll = new Object;
	$old_scroll['html'] = []; $old_scroll['css'] = []; $old_scroll['js'] = [];
	$old_me_top = 0;
	$old_me_left = 0;
	
	$old_outputh = 0;
	$old_outputw = 0;
	
	$difference = 0;

	//console.log($walkthrough);

	$("#slider").slider({
		range: "min",
		//value: 37,
		min: 1,
		max: 100,
		slide: function( event, ui ) {
			//$( "#amount" ).val( "$" + ui.value );
			$slide = Math.round(ui.value/100*$slides);
			set_slide_content($slide);
			pause();
			//clearInterval($loop);
		}, 
		stop: function(event, ui) {
			update_live_preview();
			play();
		}
	});
	
	$(".play").live("click", function(){
		switch_button("play");
		$("#intro_handle").addClass("show").html("&raquo;");
		//start_miliseconds = new Date().getTime();
		var $browser_width = $(window).width();
		if($("#intro").is(":visible"))
		{
			toggle_description();
		}
		if($("#wt_comments").is(":visible"))
		{
			toggle_comments();
			//$("#wt_comments").fadeOut(function(){
				//play();
				//$( "#amount" ).val( "$" + $( "#slider-range-min" ).slider( "value" ) );
			//});
		}
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
		
		if($(this).hasClass("2x")) $speed = 200; 
		else if($(this).hasClass("5x")) $speed = 80; 
		else if($(this).hasClass("10x")) $speed = 40; 
		else if($(this).hasClass("15x")) $speed = 30; 
		else if($(this).hasClass("20x")) $speed = 20; 
		else if($(this).hasClass("Ux")) $speed = 0; 
		
		if($loop != null) pauseplay(); 
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
});

function loop()
{
	//console.log($slide);
	if($slide > $walkthrough['cp'].length)
	{
		//console.log($slide + " is more then " + $walkthrough['cp'].length);
		clearInterval($loop);
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
	if(set_slide_content($slide))
	{
		set_slider($slide);
		//$loop = setInterval("loop()", $speed);
		//loop();
		$slide++;
	}
	//console.log($slide);
}

function set_slide_content($sl)
{
	//console.log($walkthrough['selected']);
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
		if($any_change[$sl] == "1")
		{
			if($walkthrough['selected'][$js_data_reference_index[$sl]] == 1 && !$select_from)
			{
				$select_from = get_cm_cursor_position($slide_content[$editor][$sl], $walkthrough['ncp'][$js_data_reference_index[$sl]-1]);
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
			
			if($walkthrough['editor'][$sl-1])
			{
				$("#tabs .enabled").trigger("click");
				$(".code_"+$editor).trigger("click");
			}
	
			code_mirror_html.setValue($slide_content['html'][$sl]);
			code_mirror_css.setValue($slide_content['css'][$sl]);
			code_mirror_js.setValue($slide_content['js'][$sl]);
			//console.log("Slide content: " + $sl_content['js'][$sl]);
			$("#code textarea").trigger("keyup");
	
			if($slide_content['html'][$sl] != $ohc || $slide_content['css'][$sl] != $occ || $slide_content['js'][$sl] != $ojc)
			{
				//update_live_preview();
			}
	
			$ohc = $slide_content['html'][$sl];
			$occ = $slide_content['css'][$sl];
			$ojc = $slide_content['js'][$sl];
	
			//console.log($editor);
			if($editor == "html")
			{
				code_mirror_html.focus();
				$codemirror_scroller = $(code_mirror_html.getScrollerElement())
				//$cp_object = {line: $html_cursor['line'][$sl], ch: $html_cursor['ch'][$sl]};
				$cp_object = get_cm_cursor_position($slide_content['html'][$sl], $html_cursor[$sl]);
			}
			if($editor == "css")
			{
				code_mirror_css.focus();
				$codemirror_scroller = $(code_mirror_css.getScrollerElement())
				//$cp_object = {line: $css_cursor['line'][$sl], ch: $css_cursor['ch'][$sl]};
				$cp_object = get_cm_cursor_position($slide_content['css'][$sl], $css_cursor[$sl]);
			}
			if($editor == "js")
			{
				code_mirror_js.focus();
				$codemirror_scroller = $(code_mirror_js.getScrollerElement())
				//$cp_object = {line: $js_cursor['line'][$sl], ch: $js_cursor['ch'][$sl]};
				$cp_object = get_cm_cursor_position($slide_content['js'][$sl], $js_cursor[$sl]);
			}
			//console.log($codemirror_scroller);
		
			code_mirror_html.setCursor(get_cm_cursor_position($slide_content['html'][$sl], $html_cursor[$sl]));
			code_mirror_css.setCursor(get_cm_cursor_position($slide_content['css'][$sl], $css_cursor[$sl]));
			code_mirror_js.setCursor(get_cm_cursor_position($slide_content['js'][$sl], $js_cursor[$sl]));
	
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
				//console.log($mark_from);
				//console.log($mark_to);
				//console.log("---------");
				//if($editor == "html" && ($html_cursor['line'][$sl] != $html_cursor['line'][$sl-1] || $html_cursor['ch'][$sl] != $html_cursor['ch'][$sl])) 
				if(typeof $marker != "undefined") $marker.clear();
				if($editor == "html") $marker = code_mirror_html.markText($mark_from, $mark_to, 'CodeMirror-selected');
				if($editor == "css") $marker = code_mirror_css.markText($mark_from, $mark_to, 'CodeMirror-selected');
				if($editor == "js") $marker = code_mirror_js.markText($mark_from, $mark_to, 'CodeMirror-selected');
		
				//console.log($marker);
			}
	
	
			code_mirror_save();
	
			adjust_scroller();
	
		}
		return true;
	}
}

function adjust_scroller()
{
	//console.log($difference);
	if(typeof $codemirror_scroller == "undefined") return false;
	//console.log($codemirror_scroller);
	$code_container_height = $codemirror_scroller.height();
	$code_container_scroll = $codemirror_scroller.scrollTop();
	//console.log($code_container_scroll);
	$code_height = $codemirror_scroller.children("div").height();
	$cursor_top = $codemirror_scroller.find(".CodeMirror-cursor").css("top");
	//console.log("Container height: "+ $code_container_height +"Height: " + $code_height + " Cursor: " + $cursor_top);
	
	$retain_old = false;
	if($code_container_height < $code_height && typeof $old_scroll[$editor] != "undefined" && typeof $old_cursor_top != "undefined") //If there is a scroller at all
	{
		$difference += parseInt($old_cursor_top) - parseInt($cursor_top);
		if($difference < $code_container_height-50 && $difference >= 0)
		{
			//console.log("Difference: " + $difference + " Container height: " + $code_container_height);
			//console.log("New: " + $code_container_scroll + " Old: " + $old_scroll[$editor]);
			$codemirror_scroller.scrollTop($old_scroll[$editor]);
			$retain_old = true;
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
	$oc = $old_content.split("");
	
	//$ncp = cm_to_linear_cursor($old_content, $walkthrough['cp'][$slide]);
	//if($walkthrough['ncp'][$slide-1]) $cp = $walkthrough['ncp'][$slide-1]);
	$ocp = $walkthrough['ocp'][$slide];
	$ncp = $walkthrough['ncp'][$slide];
	$cp = parseInt($ocp) <= parseInt($ncp) ? parseInt($ocp) : parseInt($ncp);
	//console.log("NCP: " + $ncp + " CP: " + $cp);
	//$cp = $ocp <= $ncp ? $ocp:$ncp;
	//console.log("CP: " + $cp);
	$r = $walkthrough['removed'][$slide];
	$a = $walkthrough['added'][$slide];
	$r_length = $r.length;
	//console.log("Removed: '" + $r + "'");
	//console.log("Added: " + $a);
	
	//Remove Characters from the REMOVED string
	for($i = 0; $i < $r.length; $i++)
	{
		$oc.splice($cp, 1);
		//console.log("$oc.splice("+$cp+", 1)");
	}
	//console.log("Old content: " + $old_content);
	$oc.splice($cp, 0, $a);
	$new_content = prepare_for_player($oc.join(""));
	
	/*if($r_length > 0)
	{
		//console.log($ocp);
		//console.log("1")
		console.log("'" + $old_content.substring($ocp, $ocp+$r_length) + "'");
		if($old_content.substring($ocp, $ocp+$r_length) == $r)
		{
			console.log("one")
			//console.log($old_content.substr(0, $ocp))
			//console.log($a)
			//console.log($old_content.substr($ocp+$r_length, $old_content.length))
			$oc = $old_content.substr(0, $ocp) + $a + $old_content.substr($ocp+$r_length, $old_content.length);
		}
		else if($old_content.substring($ocp-$r_length, $ocp) == $r)
		{
			console.log("two")
			//console.log($old_content.substr(0, $ocp-$r+1))
			//console.log($a)
			//console.log($old_content.substr($ocp, $old_content.length))
			$oc = $old_content.substr(0, $ocp-$r_length) + $a + $old_content.substr($ocp, $old_content.length);
		}
		else
		{
			console.log($r + "oh no");
		}
	}
	else
	{
		//console.log("3");
		$oc = $old_content.substr(0, $ocp) + $a + $old_content.substr($ocp, $old_content.length);
	}*/
	
	//console.log("Replace '"+$old_content+"' with '"+$new_content+"' at "+$ocp);
	//console.log($new_content+" at "+$ocp);
	//console.log("-------------------------------------------------------")
	//console.log($new_content);
	if($editor == "html") $html_old_content = $new_content;
	if($editor == "css") $css_old_content = $new_content;
	if($editor == "js") $js_old_content = $new_content;
	
	return $new_content;
}

function generate_slides()
{
	$slide_content = new Object;
	$slide_content['html'] = [];
	$slide_content['css'] = [];
	$slide_content['js'] = [];
	$index_content = {};
	$index_content['html'] = [];
	$index_content['css'] = [];
	$index_content['js'] = [];
	$js_data_reference_index = [];
	
	$html_cursor = new Object;
	$html_cursor = [];
	//$html_cursor['ch'] = [];
	
	$css_cursor = new Object;
	$css_cursor = [];
	//$css_cursor['ch'] = [];
	
	$js_cursor = new Object;
	$js_cursor = [];
	//$js_cursor['ch'] = [];
	
	$select_text = [];
	
	$hc = $jc = $cc = 0;
	
	for(var $slide = 0; $slide < $walkthrough['ncp'].length; $slide++)
	{
		$editor = $walkthrough['editor'][$slide];
		$new_content = get_slide_content($slide, $editor);
		$ncp = $walkthrough['ncp'][$slide];
		
		$cursor_position = $ncp;
		//console.log($new_content + " -> Position: " + $cursor_position);
		//console.log($cursor_position);

		$save_timeline = false;

		//$(".code_"+$editor).trigger("click");
		if($editor == "html")
		{
			$html_content = $new_content;
			//$html_line = $cursor_position['line'];
			//$html_ch = $cursor_position['ch'];
			$hc = $cursor_position;
		}
		else if($editor == "css")
		{
			$css_content = $new_content;
			//$css_line = $cursor_position['line'];
			//$css_ch = $cursor_position['ch'];
			$cc = $cursor_position;
		}
		else if($editor == "js"){
			$js_content = $new_content;
			//$js_line = $cursor_position['line'];
			//$js_ch = $cursor_position['ch'];
			$jc = $cursor_position;
		}
		
		$index_content['html'][$slide] = $html_content;
		$html_cursor[$slide] = $hc;
	
		$index_content['css'][$slide] = $css_content;
		$css_cursor[$slide] = $cc;
	
		$index_content['js'][$slide] = $js_content;
		$js_cursor[$slide] = $jc;
		
	}
	code_mirror_html.setValue($html_content);
	if(!$html_content) $(".code_html").trigger("click");
	code_mirror_css.setValue($css_content);
	if(!$css_content) $(".code_css").trigger("click");
	code_mirror_js.setValue($js_content);
	if(!$js_content) $(".code_js").trigger("click");
	
	code_mirror_save();
	
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
	/*$h_cursor['line'] = [];
	$h_cursor['ch'] = [];
	$c_cursor['line'] = [];
	$c_cursor['ch'] = [];
	$j_cursor['line'] = [];
	$j_cursor['ch'] = [];*/
	
	for(var $i = 0; $i < $index_content['html'].length; $i++)
	{
		$wait_time = $walkthrough['slide_wait_time'][$i];
		if($wait_time > 250 && $wait_time < 10000) //More than 0.25s and less than 10s
		{
			for(var $n = 1; $n <= $wait_time; $n=$n+250)
			{
				$h_content[$counter] = $index_content['html'][$i];
				$c_content[$counter] = $index_content['css'][$i];
				$j_content[$counter] = $index_content['js'][$i];
				//console.log("if " + $counter);
				$js_data_reference_index[$counter] = $i;
				$wcp[$counter] = $walkthrough['ncp'][$i];
				$weditor[$counter] = $walkthrough['editor'][$i];
				$h_cursor[$counter] = $html_cursor[$i];
				//$h_cursor['ch'][$counter] = $html_cursor['ch'][$i];
				$c_cursor[$counter] = $css_cursor[$i];
				//$c_cursor['ch'][$counter] = $css_cursor['ch'][$i];
				$j_cursor[$counter] = $js_cursor[$i];
				//$j_cursor['ch'][$counter] = $js_cursor['ch'][$i];
				
				$any_change[$counter] = "0";
				
				$counter++;
			}
		}
		$any_change[$counter] = "1";
		$h_content[$counter] = $index_content['html'][$i];
		$c_content[$counter] = $index_content['css'][$i];
		$j_content[$counter] = $index_content['js'][$i];
		//console.log("else " + $counter);
		$js_data_reference_index[$counter] = $i;
		$wcp[$counter] = $walkthrough['ncp'][$i];
		$weditor[$counter] = $walkthrough['editor'][$i];
		$h_cursor[$counter] = $html_cursor[$i];
		//$h_cursor['ch'][$counter] = $html_cursor['ch'][$i];
		$c_cursor[$counter] = $css_cursor[$i];
		//$c_cursor['ch'][$counter] = $css_cursor['ch'][$i];
		$j_cursor[$counter] = $js_cursor[$i];
		//$j_cursor['ch'][$counter] = $js_cursor['ch'][$i];
		
		$counter++;
	}
	//console.log($any_change);
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
	
	//console.log($walkthrough);
	
	$("#code textarea").trigger("keyup");
}

function get_codemirror_cursor_object($string)
{
	$array = $string.split(",");
	$object = {};
	$object['line'] = parseInt($array[0]);
	$object['ch'] = parseInt($array[1]);
	
	return $object;
}

pause = function()
{
	if(typeof $loop != "undefined")
	{
		clearInterval($loop);
	}
	switch_button("pause");
}
play = function()
{
	hide_related_wts();
	$loop = setInterval("loop()", $speed);
	switch_button("play");
}
pauseplay = function()
{
	clearInterval($loop);
	$loop = setInterval("loop()", $speed);
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
	$approx_time = $speed/1000 * $slides/60;
	
	$minutes = Math.round($approx_time*100)/100;
	$seconds = ($minutes - Math.floor($minutes))*60;
	$approx_time = Math.floor($minutes) + ":" + Math.round($seconds);
	$("#approx_time").html("Approx time: " + $approx_time + " mins");
}

function toggle_player_controls()
{

}

function get_cm_cursor_position($string, $cp)
{
	$substring = $string.substring(0, $cp);
	if($array = $substring.match(/\n/g))
	{
		$line = $array.length;
	}
	else
	{
		$line = 0;
	}
	//console.log($cp - $substring.lastIndexOf("\n"));
	$ch = $cp - $substring.lastIndexOf("\n") - 1;
	//console.log("Line: " + $line + " Ch: " + $ch);
	
	$cursor_position = new Object;
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
	$string_array = $string.split("");
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
	$value = Math.round(($slide+1)/$slides*100);
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
