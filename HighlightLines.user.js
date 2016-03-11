// ==UserScript==
// @name         HighlightLines
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Подсветка строк, упомянутых в комментарии к решению в Ejudge.
// @author       Ivan Molodetskikh
// @match        https://cmc.ejudge.ru/ej/client/view-source/*
// @match        https://unicorn.ejudge.ru/ej/client/view-source/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/YaLTeR/Highlight.js/master/HighlightLines.user.js
// ==/UserScript==
/* jshint -W097 */
'use strict';

(function() {
    var getComment = function() {
        var td = document.getElementsByClassName("profile")[0];
        if (td !== undefined) {
            return td.parentNode.getElementsByTagName("td")[1].innerHTML;
        } else {
            return null;
        }
    };
    
    var highlightLine = function(line) {
        var line_span = document
            .getElementsByClassName("line-numbers-rows")[0]
            .getElementsByTagName("span")[line - 1];
        line_span.style.backgroundColor = "pink";
        line_span.style.textShadow = "none";
    };
    
    var comment = getComment();
    if (comment === null)
        return;
    
    var regexp = /строка\s+([0-9]+)/ig;
    var arr;
    while ((arr = regexp.exec(comment)) !== null) {
        highlightLine(parseInt(arr[1]));
    }
})();