setTimeout(function() {
var carbon = document.querySelector('.carbonad');

if (carbon) {

  var adblock_enabled = window
    .getComputedStyle(carbon, null)
    .getPropertyValue('display');

  if (adblock_enabled === 'none') {
    $(".m").show();
    $(".m img").attr("src", $(".m img").attr("data-src"));

  }
  
  if($('.vm_featured>li').length)
    $('.vm_featured>li').wookmark({offset: 20, itemWidth: 230, autoResize: true, container: $("#container_featured")});

}
}, 1000);