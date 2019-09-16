jQuery(document).ready(function($) {
	"use strict";
	
	
	$(".filterDiscussions").on("click", function() {
		jQuery("#chat-dialog").css({
			'right':'0'
		});
	});
	
	$(".back-to-mesg").on("click", function() {
		jQuery("#chat-dialog").css({
			'right':'-100%'
		});
	});
	
	$(".menu a i").on("click", function() {
		$(".menu a i").removeClass("active"), $(this).addClass("active");
	}), 

	$("#contact, #recipient").on("click", function() {
		$(this).remove();
	}), 

	$(function() {
		$('[data-toggle="tooltip"]').tooltip();
	}),
	

    $(".filterMembers").not(".all").hide("3000"), 
		$(".filterMembers").not(".all").hide("3000"), 
		$(".filterMembersBtn").on("click", function() {
        	var t = $(this).attr("data-filter");
		
        $(".filterMembers").not("." + t).hide("3000"), 
		$(".filterMembers").filter("." + t).show("3000");
    }),

	
    $(".filterDiscussions").not(".all").hide("3000"), 
		$(".filterDiscussions").not(".all").hide("3000"), 
		$(".filterDiscussionsBtn").on("click", function() {
        	var t = $(this).attr("data-filter");
		
        $(".filterDiscussions").not("." + t).hide("3000"), 
		$(".filterDiscussions").filter("." + t).show("3000");
    }),


    $(".filterNotifications").not(".all").hide("3000"), 
		$(".filterNotifications").not(".all").hide("3000"), 
		$(".filterNotificationsBtn").on("click", function() {
        var t = $(this).attr("data-filter");
		
        $(".filterNotifications").not("." + t).hide("3000"), 
		$(".filterNotifications").filter("." + t).show("3000");
    }),

	
    $("#people").on("keyup", function() {
        var t = $(this).val().toLowerCase();
        $("#contacts a").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(t) > -1);
        });
    });

    $("#conversations").on("keyup", function() {
        var t = $(this).val().toLowerCase();
        $("#chats a").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(t) > -1);
        });
    });

    $("#notice").on("keyup", function() {
        var t = $(this).val().toLowerCase();
        $("#alerts a").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(t) > -1);
        });
    });
	
//user setting	
	$('.setting').on('click', function() {
		$('.navigation').toggleClass('active');
		$('.sidebar').toggleClass('slide');

		});
//------ scrollbar plugin
	if ($.isFunction($.fn.perfectScrollbar)) {
		$('.main .chat .content').perfectScrollbar();
	}
	
// emojies show on text area
	$('.add-smiles > span').on("click", function() {
	    $(this).parent().siblings(".smiles-bunch").toggleClass("active");
	  });
	
//audio video call	
	$('.audio-call, .video-call').on('click', function() {
		$('#chat1').css({
			'display':'none'
		});
		$('#call1').css({
			'opacity':'1',
			'visibility': 'visible',
			'transition': 'all 0.25s linear 0s'
		});

	});
	
	$('.call-end').on('click', function() {
		$('#chat1').css({
			'display':'block'
		});
		
		$('#call1').css({
			'opacity':'0',
			'visibility': 'hidden',
			'transition': 'all 0.25s linear 0s'
		});
	});
	
//-- switch dark theme
 $(".dark-theme").on("click", function() {
	 $("head").append('<link href="dist/css/dark.css" id="dark" type="text/css" rel="stylesheet">');
	 return false;
 });
	
var clicked;
    clicked = !0, $(".mode").on("click", function() {
        clicked ? ($("head").append('<link href="dist/css/dark.min.css" id="dark" type="text/css" rel="stylesheet">'), clicked = !1) : ($("#dark").remove(), clicked = !0)
    })


function scrollToBottom(el) { el.scrollTop = el.scrollHeight; }
			scrollToBottom(document.getElementById('content'));
	

	
});