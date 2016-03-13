// ==UserScript==
// @name        Direct Link To Messages List
// @version     0.1
// @namespace   EjudgeFE
// @description Скрипт делает текст «n непрочитанных сообщений» ссылкой на страницу с сообщениями.
// @include     https://unicorn.ejudge.ru/ej/client/*
// @include     https://cmc.ejudge.ru/ej/client/*
// @author      Mashkoff Tony
// @license     WTFPL (http://www.wtfpl.net/about/).
// ==/UserScript==

(function() {
    var a = document.querySelectorAll('a');

    var clarsHref;
    for (var i in a) {
        var linkText = a[i].innerHTML;
        if (linkText.indexOf('Сообщения') > -1 || linkText.indexOf('Clars') > -1) {
            clarsHref = a[i].href;
            break;
        }
    }

    var b = document.querySelectorAll('b');
    for (var j in b) {
        var text = b[j].innerHTML;
        if (/\d+ непрочитанных сообщений/.test(text) ||
            /\d+ unread message\(s\)/.test(text)) {
            b[j].innerHTML = '<a href=' + clarsHref + '>' + text + '</a>';
            break;
        }
    }
})();