"use strict";

/**
 * @class app
 * Application base class implementation
 */
window.app = {

    dependencies: [

        // CKEditor plugin
        '/javascripts/ckeditor/nodewikilink.js',

        // Application sub-classes
        '/javascripts/app/cookie.js',
        '/javascripts/app/progressbar.js',
        '/javascripts/app/dropzone.js',

        // Controllers
        '/javascripts/controller/move-page.js',
        '/javascripts/controller/delete-page.js',
        '/javascripts/controller/delete-attachment.js',
        '/javascripts/controller/new-page.js',
        '/javascripts/controller/edit-navigation.js',

        // External modules auto-loading
        '/javascripts/modules.js'
    ],

    preloadImages: function ($) {

        // Load Images before show them - pages/covers
        // Fix cached images issues
        $(".img-polaroid").one("load",function () {
            $(".preview").each(function (index) {
                $(this).delay(100 * index).fadeIn(200);
            });
        }).each(function () {
                if (this.complete) {
                    $(this).load();
                }
            });
    },

    checkUserAuth: function ($) {

        if (app.cookie.read("username")) {
            return;
        }

        function handleSubmit(e) {
            e.preventDefault();
            var username = $("input[name=username]").val();
            if (!username.length) {
                return $("input[name=username]")
                    .parent()
                    .addClass("error");
            }
            app.cookie.create("username", username, 720);
            modal.modal("hide");

        }

        var modal = $('<form id="saveUsername" class="modal hide fade">\
                      <div class="modal-header">\
                          <h3>' + i18n["Identify yourself"] + '</h3>\
                          </div>\
                          <div class="modal-body">\
                          <p>' + i18n["Just type a username, node wiki ain\'t no high security vault."] + '</p>\
                      <p class="control-group"><input placeholder="Username" name="username" required/><br/><br/></p>\
                          </div>\
                          <div class="modal-footer">\
                          <button type="submit" class="btn btn-primary">' + i18n["Save changes"] + '</button>\
                          </div>\
                          </form>')
            .appendTo("body")
            .modal("show");

        $("#saveUsername")
            .on("submit", handleSubmit);
    },

    handleLinksNoEditor: function ($) {

        //Enable link clicking if editor is not active
        var clickingLink = false;
        $(".content.editable")
            .on("mousedown", function (e) {
                if (e.target.tagName == "A" && !$(this)
                    .hasClass("cke_focus")) {
                    clickingLink = true;
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            })
            .on("mouseup", function (e) {
                if (clickingLink) {
                    location.href = e.target.href;
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
                clickingLink = false;
            });
    },

    prepareMessageInterface: function ($) {

        //provide an interface to display a message to the user
        $.message = function (type, message, delay) {
            delay = delay || 5e3;
            var html = '<div class="alert alert-' + type + '"> \
            <button type="button" class="close" data-dismiss="alert">&times;</button> \
                ' + message + '\
                </div>';

            $(html)
                .appendTo('#messages')
                .delay(delay)
                .fadeOut(function () {
                    $(this).remove();
                });
        };
    },

    initCKEditor: function (CKEDITOR) {

        var me = this;

        //initize CK editor and page save events
        if ($(".content.editable")
            .length == 0) {
            return;
        }
        var getData = function () {
            return {
                content: $('.content.editable')
                    .html()
                    .replace(" class=\"aloha-link-text\"", ""),
                title: $('h1.title').html(),
                tags: $(".tags div").html()
            };
        };
        var data = getData();
        var save = function () {
            var newData = getData();

            // check for content to have been changed before saving
            var changed = ["content", "title", "tags"].some(function (key) {
                return data[key] != newData[key];
            });

            // update HTML document title
            document.title = $("h1.title").html();

            var tags = $(".tags div")[0].innerHTML.replace('<br>', '');

            // check that there is no dummy tag being
            // Firefox inserts a <br> when no text is there anymore when contenteditable
            if (tags === i18n["add tags as comma separated list"]) {
                tags = "";
            }

            app.insertTagsPlaceholderWhenEmpty(jQuery);

            if (changed) {
                data = newData;
                $.post(document.location.href, {
                    content: $(".content.editable").html(),
                    title: $("h1.title").html(),
                    tags: tags
                })
                    .success(saved)
                    .error(savingError);
            }
        };

        setInterval(save, 6e4);
        $("body")
            .bind("save", save);

        CKEDITOR.inline("content", {
            language: locale,
            format_tags: 'p;h1;h2;h3;pre',
            extraPlugins: 'nodewikilink,toolbar,sourcedialog',
            toolbar: [
                { name: 'clipboard', groups: [ 'clipboard', 'undo' ], items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
                { name: 'editing', groups: [ 'find', 'selection', 'spellchecker' ], items: [ 'Scayt' ] },
                { name: 'links', items: [ 'NodeWikiLink', 'Link', 'Unlink', 'Anchor' ] },
                { name: 'insert', items: [ 'Image', 'Table', 'HorizontalRule', 'SpecialChar' ] },
                { name: 'tools', items: [ 'Maximize' ] },
                { name: 'document', groups: [ 'mode', 'document', 'doctools' ], items: [ 'Sourcedialog' ] },
                { name: 'others', items: [ '-' ] },
                '/',
                { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Strike', 'Underline', 'Subscript', 'Superscript', '-', 'RemoveFormat' ] },
                { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote' ] },
                { name: 'styles', items: [ 'Styles', 'Format' ] }
            ],
            toolbarGroups: [
                { name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
                { name: 'editing', groups: [ 'find', 'selection', 'spellchecker' ] },
                { name: 'links' },
                { name: 'insert' },
                { name: 'forms' },
                { name: 'tools' },
                { name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
                { name: 'others' },
                '/',
                { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
                { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
                { name: 'styles' },
                { name: 'colors' }
            ],
            on: {
                blur: save
            }
        });

        $(".edit")
            .blur(save)
            .keydown(function (e) {
                if (e.keyCode == 13) {
                    e.preventDefault();
                    $(this)
                        .blur();
                }
            });

        var saved = function () {
            $.message("success", i18n["Page saved"], 2e3);
            $(".modified-by strong")
                .text(app.cookie.read("username"));
        };
        var savingError = function () {
            $.message("error", i18n["Page could not be saved, please try again later"], 2e3);
        };
    },

    highlightTextForReplacement: function ($) {

        //if not changed highlight text for easy replacement
        var getTextNodesIn = function (node) {
            var textNodes = [];
            if (node.nodeType == 3) {
                textNodes.push(node);
            } else {
                var children = node.childNodes;
                for (var i = 0, len = children.length; i < len; ++i) {
                    textNodes.push.apply(textNodes, getTextNodesIn(children[i]));
                }
            }
            return textNodes;
        };

        var setSelectionRange = function (el, start, end) {
            if (document.createRange && window.getSelection) {
                var range = document.createRange();
                range.selectNodeContents(el);
                var textNodes = getTextNodesIn(el);
                var foundStart = false;
                var charCount = 0,
                    endCharCount;

                for (var i = 0, textNode; textNode = textNodes[i++];) {
                    endCharCount = charCount + textNode.length;
                    if (!foundStart && start >= charCount &&
                        (start < endCharCount || (start == endCharCount && i < textNodes.length))) {
                        range.setStart(textNode, start - charCount);
                        foundStart = true;
                    }
                    if (foundStart && end <= endCharCount) {
                        range.setEnd(textNode, end - charCount);
                        break;
                    }
                    charCount = endCharCount;
                }

                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            } else if (document.selection && document.body.createTextRange) {
                var textRange = document.body.createTextRange();
                textRange.moveToElementText(el);
                textRange.collapse(true);
                textRange.moveEnd("character", end);
                textRange.moveStart("character", start);
                textRange.select();
            }
        };

        $(".tags .edit")
            .focus(function () {
                if (this.innerText == i18n["add tags as comma separated list"]) {
                    var el = this;
                    setTimeout(function () {
                        setSelectionRange(el, 0, el.innerText.length);
                    }, 30);
                }
            });

        $("h1.edit")
            .focus(function () {
                if (this.innerText == i18n["new page"]) {
                    var el = this;
                    setTimeout(function () {
                        setSelectionRange(el, 0, el.innerText.length);
                    }, 30);
                }
            });
    },

    initDropZoneDropping: function ($) {

        if ($(".drop-here").length == 0) {
            return;
        }

        $(function () {
            if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
                return $('.drop-here').hide();
            }

            // Setup the dnd listeners.
            new app.Dropzone({
                element: document.getElementById('drop-zone'),
                handleFileSelect: handleFileSelect
            });
        });

        function handleFileSelect(evt) {
            evt.stopPropagation();
            evt.preventDefault();

            uploadFiles(document.location.href, evt.dataTransfer.files);
        }

        function uploadFiles(url, files) {
            var formData = new FormData();
            var progressBar;

            for (var i = 0, file; file = files[i]; ++i) {
                formData.append("attachments", file);
            }

            var xhr = new XMLHttpRequest();
            var finished = false;
            xhr.open('POST', "/attachments", true);
            xhr.onload = function (e) {

                if (!finished && xhr.status == 200) {
                    finished = true;
                    handleResponse(xhr.responseText);
                    $.message("success", i18n["Successfully uploaded"]);
                    progressBar.remove();
                }

                if (xhr.status >= 500) {
                    $.message('error', i18n['Internal Server Error']);
                }

                if (xhr.status == 415) {
                    $.message('error', i18n['Unsupported media type']);
                }

                if (xhr.status == 400) {
                    $.message("error", i18n["I don't know"]);
                }
            };

            progressBar = new app.ProgressBar('#attachments', xhr.upload);

            xhr.send(formData); // multipart/form-data
        }

        var handleResponse = function (res) {
            var response = JSON.parse(res);
            response.attachments.forEach(function (attachment) {
                $('#attachments').append("<li><a href='/attachments/" + response.pageId + "/" + attachment + "' title='" + attachment + "'><i class='icon-file'></i>" + attachment + "</a><a href='#' class='icon-remove-sign'</li>");
            });
        };
    },

    initSyntaxHighlighting: function ($) {

        $('pre, code').each(function (i, e) {
            hljs.highlightBlock(e);
        });
    },

    decodeBreadcrumbComponents: function($) {
        $(".breadcrumb a").each(function(index, ele) {
            ele.innerHTML = decodeURIComponent(ele.innerHTML);
        });
    },

    insertTagsPlaceholderWhenEmpty: function($) {

        var tagsContent = $('.tags .edit')[0];

        if (tagsContent) {

            if (tagsContent.innerHTML.replace('<br>', '') == '') {
                tagsContent.innerHTML = i18n["add tags as comma separated list"];
            }
        }
    },

    /**
     * Calls static methods to be executed on app launch
     * when the DOM is ready.
     * @return void
     */
    launch: function () {

        this.preloadImages(jQuery);
        this.checkUserAuth(jQuery);
        this.handleLinksNoEditor(jQuery);
        this.prepareMessageInterface(jQuery);
        this.initCKEditor(CKEDITOR);
        this.highlightTextForReplacement(jQuery);
        this.initDropZoneDropping(jQuery);
        this.initSyntaxHighlighting(jQuery);
        this.decodeBreadcrumbComponents(jQuery);
        this.insertTagsPlaceholderWhenEmpty(jQuery);
    }
};

// Require libraries
require(app.dependencies, function () {

    // Call app's launch() method when DOM is ready
    $(document).ready(function () {
        window.app.launch();
    });
});
