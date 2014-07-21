"use strict"

var injectMedia = require("./inject-media");
var paste = require("./paste");

function pasteHtmlAtCaret(html, selectPastedContent) {
    var sel, range;
    if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();

            // Range.createContextualFragment() would be useful here but is
            // only relatively recently standardized and is not supported in
            // some browsers (IE9, for one)
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(), node, lastNode;
            while ( (node = el.firstChild) ) {
                lastNode = frag.appendChild(node);
            }
            var firstNode = frag.firstChild;
            range.insertNode(frag);

            // Preserve the selection
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                if (selectPastedContent) {
                    range.setStartBefore(firstNode);
                } else {
                    range.collapse(true);
                }
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if ( (sel = document.selection) && sel.type != "Control") {
        // IE < 9
        var originalRange = sel.createRange();
        originalRange.collapse(true);
        sel.createRange().pasteHTML(html);
        if (selectPastedContent) {
            range = sel.createRange();
            range.setEndPoint("StartToStart", originalRange);
            range.select();
        }
    }
}
module.exports = function (el) {

	var paste = (new $.paste()).appendTo('body')
        .on('pasteImage', function(ev, data){
            //insertAtCaret(el, '[image' + data.width + 'x' + data.height + '](' + data.dataURL.substring(0, 30) + '...)');
            injectMedia(data.dataURL, '#content')
        })
        .on('pasteText', function(ev, data){
            pasteHtmlAtCaret(data.text, false);
            injectMedia(data.text, '#content')
        });
    $(el).on('paste', function(ev){
        ev.preventDefault();
        paste.trigger(ev);
    });

    /*
    el.addEventListener("paste", function (e) {
    	console.log('Paste detected')
        injectMedia(e.clipboardData.getData("text/plain"), e.target);
    });
	*/
};
