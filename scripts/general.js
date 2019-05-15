var methods = [
    'program',
    'method-minti',
    'method-ford-fulkerson'
];
var INDEX = 0;

var active_class = 'header-method-active';

$("#method-minti-button").click(function() {
    $("#method-minti").show();
    $("#method-ford-fulkerson").hide();
    INDEX = methods.findIndex(method => method === "method-minti");
    $(document).attr("title", "Лабораторна робота №1");
    $("#method-minti-button").addClass(active_class);
    $("#method-ford-fulkerson-button").removeClass(active_class);
});
$("#method-ford-fulkerson-button").click(function() {
    $("#method-minti").hide();
    $("#method-ford-fulkerson").show();
    INDEX = methods.findIndex(method => method === "method-ford-fulkerson");
    $(document).attr("title", "Лабораторна робота №1");
    $("#method-minti-button").removeClass(active_class);
    $("#method-ford-fulkerson-button").addClass(active_class);
});