/*jslint node: true */
"use strict";

var ProgressBar = require("./progress-bar");
var message = require("./message");
var Dropzone = require("./dropzone");
var handleErrors = require("./handle-xhr-errors");
var __ = require("./translate");
var injectMedia = require("./inject-media");

if ($("#content.editable").length === 0) return;

$(function () {
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        console.log('Drop zone hidden');
        return $(".drop-here").hide();
    }

    // Setup the dnd listeners.
    new Dropzone({
        element: document.getElementById("content").parentNode,
        handleFileSelect: handleDrop
    });

    new Dropzone({
        element: document.getElementById("drop-zone"),
        handleFileSelect: handleDrop
    });
});

function handleDrop(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    $("body").trigger("save");

    var target = document.getElementById("content");
    var uri = evt.dataTransfer.getData("text/uri-list");
    if (uri && !uri.match('^file:\/\//')) {
        console.log('No File detected')
        return injectMedia(uri, target);
    }

    uploadFiles(document.location.href, evt.dataTransfer.files, target);
}

function uploadFiles(url, files, targetElement) {
    var formData = new FormData();

    for (var i = 0, file; file = files[i]; ++i) {
        formData.append("images", file);
    }

    var xhr = new XMLHttpRequest();
    var finished = false;
    xhr.open('POST', "/images", true);
    xhr.onload = function (e) {
        if (!finished && xhr.status == 200) {
            finished = true;
            handleResponse.bind(targetElement)(xhr.responseText);
            message("success", __("successfully-uploaded"));
        } else if (!finished && xhr.status == 415) {
            console.log('Attachment found')
            uploadAttachments(url, files)
        }

        handleErrors(xhr);
    };


    var progressBar = new ProgressBar(".container", xhr.upload);

    xhr.send(formData); // multipart/form-data
}

function uploadAttachments (url, files) {
    var formData = new FormData();

    for (var i = 0, file; file = files[i]; ++i) {
        formData.append("attachments", file);
    }

    var xhr = new XMLHttpRequest();
    var finished = false;
    xhr.open('POST', "/attachments", true);
    xhr.onload = function (e) {
        if (!finished && xhr.status == 200) {
            finished = true;
            handleAttachmentResponse(xhr.responseText);
            message("success", __("successfully-uploaded"));
        }

        handleErrors(xhr);
    };

    //var progressBar = new ProgressBar('#content', xhr.upload);

    xhr.send(formData); // multipart/form-data
}

var handleResponse = function (res) {
    var targetElement = $(this);
    var response = JSON.parse(res);
    console.log(res);
    response.images.forEach(function (image) {
        targetElement.append("<img class='polaroid' src='/images/" + response.pageId + "/" + image + "'/>");
        //$('#images').append("<li><a href='/images/" + response.pageId + "/" + image + "' title='" + image + "'><i class='icon-file'></i>" + image + "</a><a href='#' class='icon-remove-sign'</li>");
    });
    $("h1:first").data().lastModified = response.lastModified;
    $("body").trigger("save");
};

var handleAttachmentResponse = function (res) {
    var response = JSON.parse(res);
    response.attachments.forEach(function (attachment) {
        $('#content').append("<li><a href='/attachments/" + response.pageId + "/" + attachment + "' title='" + attachment + "'><i class='icon-file'></i>" + attachment + "</a><a href='#' class='icon-remove-sign'</li>");
    });
}
