// ==UserScript==
// @name        Collect User Standings
// @version     0.1a
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
    for (var i in nameNodes) {
        var name;
        if (name = /[А-Яа-я]+\s+[А-Яа-я]+/.exec(nameNodes[i].innerHTML)) {
            names.push(name[0]);
        }
    }

    var totalNodes = [].slice.call(document.getElementsByClassName('st_total'), 1, names.length + 1); // 1 + n + 3 == n + 4
    var total = [];
    for (i in totalNodes) {
        var ttl;
        if (ttl = /\d+/.exec(totalNodes[i].innerHTML)) {
            total.push(ttl[0]);
        }
    }

    var score = [];
    for (i in scoreNodes) {
        var scr;
        if (scr = /^\d+$/.exec(scoreNodes[i].innerHTML)) {
            score.push(scr[0]);
        }
    }

    var senderInfo = document.title;
    var data = 'sender=' + encodeURI(/[А-Яа-я]+\s+[А-Яа-я]+/.exec(senderInfo)[0]) +
        '&group=' + /\d+/.exec(senderInfo)[0] +
        '&full_sender_info=' + encodeURI(senderInfo) +
        '&length=' + names.length;

    for (i in names) {
        data += '&name' + i + '=' + encodeURI(names[i]) +
                '&total' + i + '=' + total[i] +
                '&score' + i + '=' + score[i];
    }

    GM_xmlhttpRequest({
        method: 'POST',
        //url: 'http://ejstat.cloudapp.net',
        url: 'http://ubuntu14classic.cloudapp.net:7000',
        data: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
})();