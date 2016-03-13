// ==UserScript==
// @name        Direct Link To Messages List
// @version     0.2
// @namespace   EjudgeFE
// @description Скрипт делает текст «n непрочитанных сообщений» ссылкой на страницу с сообщениями и устанавливает правильное склонение.
// @include     https://unicorn.ejudge.ru/ej/client/*
// @include     https://cmc.ejudge.ru/ej/client/*
// @author      Mashkoff Tony
// @license     WTFPL (http://www.wtfpl.net/about/).
// ==/UserScript==

(function() {
    var locales = {
        en : [ ' unread message', ' unread messages', ' unread messages' ],
        ru : [ ' непрочитанное сообщение', ' непрочитанных сообщения', ' непрочитанных сообщений' ]
    };

    var locale;

    if (document.getElementsByClassName('contest_actions_item')[0].innerHTML.indexOf('Настройки') > -1) {
        locale = locales.ru;
    } else {
        locale = locales.en;
    }

    function getStringWithCorrectEndings(n, locale) {
        n = n % 100;
        if (11 <= n && n <= 19) {
            return n + locale[2];
        }
        n = n % 10;
        if (n == 1) {
            return n + locale[0];
        }
        if (2 <= n && n <= 4) {
            return n + locale[1];
        }
        return n + locale[2];
    }

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
            var num = parseInt(/\d+/.exec(text)[0]);
            b[j].innerHTML = '<a href=' + clarsHref + '>' + getStringWithCorrectEndings(num, locale) + '</a>';
            break;
        }
    }
})();