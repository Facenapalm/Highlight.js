// ==UserScript==
// @name        Hide Unnecessary Problems
// @namespace   EjudgeFE
// @description Скрипт оставляет в списке задач в Ejudge видимыми только те, которые необходимо решить.
// @include     https://unicorn.ejudge.ru/ej/client/*
// @include     https://cmc.ejudge.ru/ej/client/*
// @author      Mashkoff Tony
// @license     WTFPL (http://www.wtfpl.net/about/).
// @version     0.2a
// @grant       none
// ==/UserScript==

(function(){
var modify = [];
var solved = document.querySelectorAll('.probOk, .probTrans');
var bad = document.querySelectorAll('.probBad');
var empty = document.querySelectorAll('.probEmpty');
var solvedPrNames = [], solvedKrNames = [];
var regexp = { 'mz' : /mz\d\d-*/, 'up' : /up\d\d-*/, 'kr' : /kr\d\d-*/, 'ku' : /ku\d\d-*/ };

var n = solved.length;
for (var i = 0; i < n; i++) {
    var name = solved[i].firstChild.innerHTML;
    if (regexp['mz'].test(name)) {
        solvedPrNames.push(name.substr(2));
    } else if (regexp['kr'].test(name)) {
        solvedKrNames.push(name.substr(2));
    }
    modify.push(solved[i]);
}

n = empty.length;
for (i = 0; i < n; i++) {
    name = empty[i].firstChild.innerHTML;
    if (regexp['mz'].test(name) || regexp['kr'].test(name)) {
        modify.push(empty[i]);
    } else if (regexp['up'].test(name)) {
        if (solvedPrNames.indexOf(name.substr(2)) > 0) {
            modify.push(empty[i]);
        }
    } else if (regexp['ku'].test(name)) {
        if (solvedKrNames.indexOf(name.substr(2)) > 0) {
            modify.push(empty[i]);
        }
    }
}

n = bad.length;
for (i = 0; i < n; i++) {
    name = bad[i].firstChild.innerHTML;
    if (regexp['mz'].test(name) || regexp['kr'].test(name)) {
        modify.push(bad[i]);
    }
}

n = modify.length;
for (i = 0; i < n; i++) {
    modify[i].style.display = 'none';
}
})();