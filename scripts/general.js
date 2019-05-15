var methods = [
    'program',
    'method-minti',
    'method-ford-fulkerson'
];
var INDEX = 0;

var active_class = 'header-method-active';

document.getElementById("method-minti-button").addEventListener("click", function() {
    document.getElementById("method-minti").style.display = "block";
    document.getElementById("method-ford-fulkerson").style.display = "none";
    INDEX = methods.findIndex(method => method === "method-minti");
    document.title = "Лабораторна робота №1";

    document.getElementById("method-minti-button").className += ' ' + active_class;
    document.getElementById("method-ford-fulkerson-button").classList.remove(active_class);
});
document.getElementById("method-ford-fulkerson-button").addEventListener("click", function() {
    document.getElementById("method-minti").style.display = "none";
    document.getElementById("method-ford-fulkerson").style.display = "block";
    INDEX = methods.findIndex(method => method === "method-ford-fulkerson");
    document.title = "Лабораторна робота №2";

    document.getElementById("method-ford-fulkerson-button").className += ' ' + active_class;
    document.getElementById("method-minti-button").classList.remove(active_class);
});