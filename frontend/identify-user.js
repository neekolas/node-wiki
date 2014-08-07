"use strict";

var cookies = require("./cookies");
var __ = require("./translate");
var modal = require("./modal");

//prompt user for a username if he has not already provided one

module.exports = function (callback) {

    if (cookies.read("username") || $('body').hasClass('modal-open')) return true;

    function handleSubmit(e) {
        e.preventDefault();
        var username = $("input[name=username]").val();
        if (!username.length) {
            return $("input[name=username]")
                .parent()
                .addClass("error");
        }
        cookies.set("username", username, 720);
        $(this).modal("hide");
        setTimeout(function() {
            $('.modal').remove();
            callback();
        },320);
        
    }

    modal({
            title: __('identify-yourself'),
            description: __('provide-username'),
            fields: [{
                    name: "username",
                    label: __("username"),
                    placeholder: __("username-placeholder")
                }
            ],
            cancle: false,
            confirm: __("save-changes")
        }).on("submit", handleSubmit);
    return false
}