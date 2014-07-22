/*jslint node: true */
"use strict";

var __ = require("./translate");
var message = require("./message");

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

var strategies = {
    "youtube.com/watch": function (uri, cb) {
        var match = uri.match(/v=(.*?)(?:$|&)/);
        if (!match[1]) return cb(null);
        cb('<iframe width="640" height="480" src="http://www.youtube.com/embed/' + match[1] + '" frameborder="0" allowfullscreen></iframe>');
    },
    "vimeo.com": function (uri, cb) {
        var match = uri.match(/vimeo.com\/(.*?)(?:$|\?)/);
        if (!match[1]) return;
        cb('<iframe src="http://player.vimeo.com/video/' + match[1] + '" width="900" height="506" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
    },
    "gist.github.com": function (uri, cb) {
        cb("<iframe class=\"gist\" seamless src=\"/gist-proxy/" + uri.replace("https://gist.github.com/", "") + "\"/>");
    },
    "slideshare.net": function (uri, cb) {
        $.getJSON("http://www.slideshare.net/api/oembed/2?url=" + uri + "&format=jsonp&callback=?", function (data) {
            cb(data.html);
        });
    },
    image: function (uri, cb) {
        return cb("<img class='polaroid' src='" + uri + "'/>");
    },
    video: function (uri, cb) {
        return cb("<video class='polaroid' width='640' height='480' src='" + uri + "'/>");
    },
    audio: function (uri, cb) {
        return cb("<audio controls src='" + uri + "'/>");
    },
    text: function (uri, cb) {
        return cb(uri);
    }
};

var inject = function (targetElement) {
    return function (htmlFragment) {
        if ($(targetElement).is(":focus")) {
            pasteHtmlAtCaret(htmlFragment);
        } else {
            $(targetElement).append(htmlFragment);
        }
        $("body").trigger("save");
    };
};

var strategyUrls = Object.keys(strategies).filter(function (k) {
    return k.indexOf(".") > 0;
});

var matcher = function (url) {
    var plainUrl = url.replace(/^.*?\/\/(?:www\.)?/, "");
    for (var i = 0; i < strategyUrls.length; i++) {
        if (plainUrl.substr(0, strategyUrls[i].length) === strategyUrls[i])  {
            return strategyUrls[i];
        }
    }
};

module.exports = function (uri, targetElement) {
    var localInject = inject(targetElement);
    var type = matcher(uri);

    if (type) {
        return strategies[type](uri, localInject);
    }

    $.get("/detect-content-type", {
            uri: uri
        }, function (data) {
            var type = data.replace(/\/.*/, "");
            if (strategies[type]) {
                strategies[type](uri, localInject);
            } else {
                message("warn", __("unsupported-drop"));
            }
        });
};
