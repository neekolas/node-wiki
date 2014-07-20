"use strict"

//Enable link clicking if editor is not active
var clickingLink = false;

var openLink = function (el, e) {
    window.open(el.href);
};

var content = document.querySelector(".content.editable");
if (!content) return;

content.addEventListener("focus", function (e) {
    if (clickingLink) {
        e.stopImmediatePropagation();
        e.preventDefault();
        this.contentEditable = true;
        this.blur();
    }
}, true);

$(".content.editable")
    .on("mousedown", function (e) {
    var link = $(e.target).closest("a");
    if (link.length && !$(this)
        .hasClass("cke_focus")) {
        clickingLink = true;
        this.contentEditable = false;
        e.stopImmediatePropagation();
        openLink(link[0], e);
    }
}).on("click", function (e) {
    if (clickingLink) {
        e.preventDefault();
        clickingLink = false;
    }
});
