$(document).ready(function(){

	var TO = false;
	$(window).resize(function() {
		if(TO !== false)
			clearTimeout(TO);
		
		if($("#walkthrough_container").length > 0)
			TO = setTimeout(resizeStuff, 200); //200 is time in miliseconds
	});
	function resizeStuff() {
		//Time consuming resize stuff here
		if(!$save_timeline) elastic_editors();
		update_live_preview();
	}
	
	/*$(".editor_pane").hover(function(){
		$(".tabs").show();
	}, function(){
		$(".tabs").hide();
	});*/
	
	$(".toggle_description").click(function(){
		toggle_description();
		return false;
	});
	
	/*
	$(".show_comments").click(function(){
		$("#wt_comments").fadeToggle();
		$(this).toggleClass("active");
		return false;
	});
	*/
	
	$(".toggle_comments, .close_comments").click(function(){
		toggle_comments();
		return false;
	})
	
	$(".add_comment").click(function(){
		$("#comment_form").slideToggle();
		return false;
	});
	
	$(".view_code").click(function(){
		if($("#wt_comments").css("display") == "block")
		{
			$("#wt_comments").slideToggle(function(){
				toggle_description();
			});
		}
		else
		{
			toggle_description();
		}
		return false;
	});
	
	//play page
	$('.autoresize').autosize(); 
	$("#intro h1 textarea").focus();
	
	$(".show_related_wts").click(function(){
		toggle_related_wts();
		return false;
	});
		
	$(".start_coding, .breadcrumb_code").click(function(){
		if($("#intro").hasClass("visible"))
		{
			$("#intro").removeClass("visible");
			toggle_description();
		}
	});
	
	$(".breadcrumb_description, .breadcrumb_description+span:after").click(function(){
		if(!$("#intro").hasClass("visible"))
		{
			$("#intro").addClass("visible");
			toggle_description();
		}
	})
	
	$("span#tcp_name").click(function(e){
		if(e.which == "1") window.location = $(this).attr("data-href");
		else if(e.which == "2") window.open($(this).attr("data-href"), "_newtab");
	});
	
	$("#twitter").change(function(){
		var handle = $(this).val();
		var twitter_avatar_url = "https://api.twitter.com/1/users/profile_image/"+handle;
		$("#twitter_avatar").attr("src", twitter_avatar_url).show("slow");
	});
	
	$("#player_breadcrumb .breadcrumb_play").click(function(){
		if($(this).hasClass("inactive"))
		{
			alert("First code something to play");
			return false;
		}
	});
	
	$("#twitter").keydown(function(e){
		$this = $(this)[0];
		if(e.keyCode == 9)
		{
			setTimeout(function() {
				tinymce.execCommand('mceFocus',false,'description');
				tinymce_focus();
			
				$this.selectionStart = $this.selectionEnd = -1;
			}, 0);
			
			$("#twitter").trigger("change");
			return false;
		}
	});
	$("#intro_controls .start_coding").keydown(function(e){
		if(e.keyCode == 9)
		{
			setTimeout(function() {
				$("#intro h1 textarea").focus();
			}, 0);
			return false;
		}
	})
	
	
	$("#html").hover(function(){$(".code_html").addClass("focus");}, function(){$(".code_html").removeClass("focus");})
	$("#css").hover(function(){$(".code_css").addClass("focus");}, function(){$(".code_css").removeClass("focus");})
	$("#js").hover(function(){$(".code_js").addClass("focus");}, function(){$(".code_js").removeClass("focus");})
	
	$(".code_html").hover(function(){
		$(".code_html, #html").addClass("focus");
		$("#html").css("border-top-left-radius", "5px");
		if($("#css").is(":hidden") && $("#js").is(":hidden")) $("#html").css("border-bottom-left-radius", "5px");
	}, function(){
		$(".code_html, #html").removeClass("focus");
		$("#html").css("border-radius", "0");
	})
	$(".code_css").hover(function(){
		$(".code_css, #css").addClass("focus");
		if($("#html").is(":hidden")) $("#css").css("border-top-left-radius", "5px");
		if($("#js").is(":hidden")) $("#css").css("border-bottom-left-radius", "5px");
	}, function(){
		$(".code_css, #css").removeClass("focus");
		$("#css").css("border-radius", "0");
	})
	$(".code_js").hover(function(){
		$(".code_js, #js").addClass("focus");
		if($("#html").is(":hidden") && $("#css").is(":hidden")) $("#js").css("border-top-left-radius", "5px");
		$("#js").css("border-bottom-left-radius", "5px");
	}, function(){
		$(".code_js, #js").removeClass("focus");
		$("#js").css("border-radius", "0");
	});
	
	$("#customalert_close").click(function(){
		$("#customalert").hide();
		return false;
	});
	
	$('#media_uploader').change(function(){
		var file = this.files[0];
		name = file.name;
		size = file.size;
		type = file.type;
		//your validation
		//console.log(name+", "+size+", "+type);
		$('#media_form').trigger("submit");
	});
	
	$('#media_form').submit(function(){
		var formData = new FormData($('#media_form')[0]);
		$.ajax({
		    url: 'media',  //server script to process data
		    type: 'POST',
		    xhr: function() {  // custom xhr
		        myXhr = $.ajaxSettings.xhr();
		        if(myXhr.upload){ // check if upload property exists
		            myXhr.upload.addEventListener('progress',progressHandlingFunction, false); // for handling the progress of the upload
		        }
		        return myXhr;
		    },
		    //Ajax events
		    //beforeSend: beforeSendHandler,
		    success: function(data) {
		    	if(data.status == "1")
		    	{
		    		$("#media_form").after("<p>Last uploaded file: "+data.message+"</p>");
		    	}
		    	else
		    	{
		    		alert(data.message);
		    	}
		    },
		    //error: errorHandler,
		    // Form data
		    data: formData, 
		    //Options to tell JQuery not to process data or worry about content-type
		    cache: false,
		    contentType: false,
		    processData: false, 
		    dataType: "json", 
		});
		return false;
	});
	
	function progressHandlingFunction(e){
		if(e.lengthComputable){
			//console.log(e.loaded);
		    $('progress').attr({value:e.loaded,max:e.total});
		}
	}
	
	/*Home page transition effect*/
	/*
	$(".vm_featured li a").click(function(){
		$href = $(this).attr("href");
		$(this).parents("li").addClass("pulsating");
		
		//load entire content of WT
		$.get($href, function(data){
			start_miliseconds = new Date().getTime();
			
			var doc = document.createElement('html');
			doc.innerHTML = data;
			var $wt = $(doc).find("#walkthrough_container").html();
			
			$("#walkthrough_container").html($wt).css("z-index", "1");
			
			current_miliseconds = new Date().getTime();
			$wt_injection_time = (current_miliseconds-start_miliseconds)/1000;
			console.log($wt_injection_time);
			
			$(".pulsating").removeClass("pulsating");
			//$("body").css("overflow", "hidden");
			
			//console.log($wt);
			$("#content").animate({opacity: 0}, 750, function(){
				$("header").animate({top: "-50px"}, 750, function(){
					animaze();
				});
			});

		}, 'html');
					
		return false;
	});
	
	function animaze()
	{
		$("#player_controls").animate({bottom: "0", opacity: 1}, 1500, 'easeInOutQuint');
		$("#walkthrough").animate({opacity: 1}, 1000, 'easeInOutQuint');
		
		//window.history.pushState({home: "walkthrough"}, "Title", $href);
	}
	*/
	
	/*
	$("img").lazyload({
		 effect: "fadeIn", 
	});
	*/
});

function toggle_description()
{
	$(".toggle_description, .breadcrumb_description, .breadcrumb_code").toggleClass("active");
	$("#intro").fadeToggle(function(){
		//$(window).trigger("resize");
	});
}

function toggle_related_wts()
{
	$(".related_wts").toggleClass("in");
	$(".show_related_wts").toggleClass("active");
	$(".related_wts").fadeToggle();
}

function toggle_comments()
{
	$(".toggle_comments").toggleClass("active");
	$("#wt_comments").fadeToggle();
	
}

function hide_related_wts()
{
	if($(".related_wts").hasClass("in"))
	{
		$(".show_related_wts").removeClass("active");
		$(".related_wts").fadeOut();
		$(".related_wts").removeClass("in");
	}
}
function show_related_wts()
{
	if(!$(".related_wts").hasClass("in"))
	{
		$(".show_related_wts").addClass("active");
		$(".related_wts").fadeIn();
		$(".related_wts").addClass("in");
	}
}

function optional_scrollers()
{
	$(".CodeMirror-scroll, .related_wts").css({"overflow":"hidden"});
	$(".CodeMirror-scroll, .related_wts").hover(function(){
		$(this).css({"overflow":"auto"});
	}, function(){
		$(this).css({"overflow":"hidden"});
	});
}

function elastic_editors()
{
	var consumed_height = 0, leftover_height = 0;
	var available_height = $(".editor_pane").height();
	var expand_editors = [];
	if($(".code_canvas.enabled").length > 1)
	{
		$(".CodeMirror-lines").each(function(index){
			if($(this).parents(".code_canvas").hasClass("enabled"))
			{
				//editors which need to be shrinked
				if($(this).outerHeight() < $(this).parents(".code_canvas").outerHeight())
				{
					//console.log($(this).outerHeight());
					//console.log($(this).parents(".code_canvas").outerHeight());
					$(this).parents(".code_canvas").height($(this).outerHeight());
					//console.log($(this).parents(".code_canvas").outerHeight());
					consumed_height += $(this).outerHeight();
					//console.log($(this).outerHeight());
					//console.log("Consumed: " + consumed_height);
				}
				else
				{
					expand_editors.push($(this).parents(".code_canvas").attr("id"));
				}
			}
		})
		//space that becomes available after shrinking the height of possible editors
		leftover_height = available_height - consumed_height - ($(".code_canvas").filter(":visible").length - 1);
		
		//if atleast 1 editor has been shrinked
		if(consumed_height != 0)
		{
			if(expand_editors.length == 1)
			{
				$("#"+expand_editors[0]).height(leftover_height);
			}
			else if(expand_editors.length == 2)
			{
				var height1 = $("#"+expand_editors[0]).find(".CodeMirror-lines").outerHeight();
				var height2 = $("#"+expand_editors[1]).find(".CodeMirror-lines").outerHeight();
				if(height1 < leftover_height/2)
				{
					//$("#"+expand_editors[0]).css("border", "10px solid #000");
					$("#"+expand_editors[0]).height(height1);
					$("#"+expand_editors[1]).height(leftover_height - height1);
				}
				else if(height2 < leftover_height)
				{
					$("#"+expand_editors[1]).height(height2);
					$("#"+expand_editors[0]).height(leftover_height - height2);
				}
				else
				{
					//alert($("#"+expand_editors[0]).height()+leftover_height/2+", "+$("#"+expand_editors[1]).height()+leftover_height/2);
					$("#"+expand_editors[0]).height(leftover_height/2-1);
					$("#"+expand_editors[1]).height(leftover_height/2-1);
				}
			}
		}
	}
}

function customalert($title, $message)
{
	$("#customalert_title").html(htmlEntities($title));
	$("#customalert_message").html(htmlEntities($message)).trigger("click");
	$("#customalert").show();
	$("#customalert_close").focus();
}
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
