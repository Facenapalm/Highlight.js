// ==UserScript==
// @name        Fetch
// @version     1.1
// @namespace   EjudgeFE
// @description Собирает статистику по группам в сводную таблицу.
// @include     https://unicorn.ejudge.ru/ej/client/standings/*
// @include     https://cmc.ejudge.ru/ej/client/standings/*
// @author      Mashkoff Tony
// @license     WTFPL (http://www.wtfpl.net/about/).
// @grant       GM_xmlhttpRequest
// ==/UserScript==

(function() {
    var nameNodes = document.getElementsByClassName('st_team'); // 1 + n + 3 == n + 4
    // "Участник", "Всего:", "Успешных:", "%:"
    var scoreNodes = document.getElementsByClassName('st_score'); // 1 + n + 0 + 1 + n + 3 == 2n + 5 || 1 + n + 0 == n + 1

    var names = [];
    var n = nameNodes.length;
    for (var i = 0; i < n; i++) {
        var name;
        if (name = /[А-Яа-я]+\s+[А-Яа-я]+/.exec(nameNodes[i].innerHTML)) {
            names.push(name[0]);
        }
    }
    n = names.length;

    var totalNodes = [].slice.call(document.getElementsByClassName('st_total'), 1, n + 1); // 1 + n + 3 == n + 4
    var total = [];
    for (i = 0; i < n; i++) {
        var ttl;
        if (ttl = /\d+/.exec(totalNodes[i].innerHTML)) {
            total.push(ttl[0]);
        }
    }

    var score = [];
    for (i = 0; i < n; i++) {
        var scr;
        if (scr = /^\d+$/.exec(scoreNodes[i].innerHTML)) {
            score.push(scr[0]);
        }
    }

    var senderInfo = document.title;
    var nameRE = /[А-Яа-я]+/g;
    var senderSurname = nameRE.exec(senderInfo)[0], senderName = nameRE.exec(senderInfo)[0];
    var data = 'sender_first_name=' + encodeURI(senderName) +
        '&sender_last_name=' + encodeURI(senderSurname) +
        '&group=' + /\d+/.exec(senderInfo)[0] +
        '&length=' + names.length;

    n = names.length;
    for (i = 0; i < n; i++) {
        nameRE.lastIndex = 0;
        data += '&surname' + i + '=' + encodeURI(nameRE.exec(names[i])[0]) +
            '&name' + i + '=' + encodeURI(nameRE.exec(names[i])[0]) +
            '&total' + i + '=' + total[i] +
            '&score' + i + '=' + score[i];
    }

    GM_xmlhttpRequest({
        method: 'POST',
        url: 'http://ejstat.ru/load',
        data: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        onload: function(res) {
            console.log(res.responseText);
        }
    });
})();
