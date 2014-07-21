"use strict";

var isDeleted = require("./is-deleted");

require("./identify-user");
require("./enable-link-clicking");
if (!isDeleted) {
	require("./paste");
    require("./paste-media")(document.getElementById("content"));
    require("./medium-editor");
    require("./editor-initialize")();
    require("./upload-attachments");
    require("./upload-images");
    require("./delete-image");
}
require("./highlight-code");
require("./cover-image-loader");
require("./language-switcher");
require("./page-actions");
require("./resize-iframe");
