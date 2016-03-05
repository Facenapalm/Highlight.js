// ==UserScript==
// @name
// @namespace   EjudgeFE
// @description
// @include     https://unicorn.ejudge.ru/ej/client/*
// @include     https://cmc.ejudge.ru/ej/client/*
// @author      Mashkoff Tony
// @license     WTFPL (http://www.wtfpl.net/about/).
// @version     0.1a
// @grant       none
// ==/UserScript==

var solved = document.querySelectorAll('.probOk, .probTrans');
var bad = document.querySelectorAll('.probBad');
var empty = document.querySelectorAll('.probEmpty');
var solvedPrNames = [], solvedKrNames = [];
var regexp = { 'mz' : /mz\d\d-*/, 'up' : /up\d\d-*/, 'kr' : /kr\d\d-*/, 'ku' : /ku\d\d-*/ };

var n = solved.length;
for(var i = 0; i < n; i++) {
    var name = solved[i].firstChild.innerHTML;
    if (regexp['mz'].test(name)) {
        solvedPrNames.push(name.substr(2));
    } else if (regexp['kr'].test(name)) {
        solvedKrNames.push(name.substr(2));
    }
    solved[i].style.display = 'none';
}

n = empty.length;
for(i = 0; i < n; i++) {
    name = empty[i].firstChild.innerHTML;
    if (regexp['mz'].test(name) || regexp['kr'].test(name)) {
        empty[i].style.display = 'none';
    } else if (regexp['up'].test(name)) {
        if (solvedPrNames.indexOf(name.substr(2)) > 0) {
            empty[i].style.display = 'none';
        }
    } else if (regexp['ku'].test(name)) {
        if (solvedKrNames.indexOf(name.substr(2)) > 0) {
            empty[i].style.display = 'none';
        }
    }
}

n = bad.length;
for(i = 0; i < n; i++) {
    name = bad[i].firstChild.innerHTML;
    if (regexp['mz'].test(name) || regexp['kr'].test(name)) {
        bad[i].style.display = 'none';
    }
}