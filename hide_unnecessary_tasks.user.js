// ==UserScript==
// @name        Hide Unnecessary Problems
// @namespace   EjudgeFE
// @description Скрипт оставляет в списке задач в Ejudge видимыми только нерешенные задачи.
// @include     https://unicorn.ejudge.ru/ej/client/*
// @include     https://cmc.ejudge.ru/ej/client/*
// @author      Mashkoff Tony
// @license     WTFPL (http://www.wtfpl.net/about/).
// @version     1.1
// @grant       none
// ==/UserScript==

var modify = [];
var locales = {
    ru : {
        mode : 'Отображать',
        all : 'все',
        necessary : 'нужные'
    },
    en : {
        mode : 'View',
        all : 'all',
        necessary : 'necessary'
    }
};
var locale;

(function init(){
    "use strict";

    identifyLocale();

    var solved = document.querySelectorAll('.probOk, .probTrans');
    var bad = document.querySelectorAll('.probBad');
    var empty = document.querySelectorAll('.probEmpty');
    var solvedPrNames = [], solvedKrNames = [];
    var regexp = { mz : /mz\d\d-\d*/, up : /up\d\d-\d*/, kr : /kr\d\d-\d*/, ku : /ku\d\d-\d*/ };

    var n = solved.length;
    for (var i = 0; i < n; i++) {
        var name = solved[i].firstChild.innerHTML;
        if (regexp.mz.test(name)) {
            solvedPrNames.push(name.substr(2));
        } else if (regexp.kr.test(name)) {
            solvedKrNames.push(name.substr(2));
        }
        modify.push(solved[i]);
    }

    n = empty.length;
    for (i = 0; i < n; i++) {
        name = empty[i].firstChild.innerHTML;
        if (regexp.mz.test(name) || regexp.kr.test(name)) {
            modify.push(empty[i]);
        } else if (regexp.up.test(name)) {
            if (solvedPrNames.indexOf(name.substr(2)) > -1) {
                modify.push(empty[i]);
            }
        } else if (regexp.ku.test(name)) {
            if (solvedKrNames.indexOf(name.substr(2)) > -1) {
                modify.push(empty[i]);
            }
        }
    }

    n = bad.length;
    for (i = 0; i < n; i++) {
        name = bad[i].firstChild.innerHTML;
        if (regexp.mz.test(name) || regexp.kr.test(name)) {
            modify.push(bad[i]);
        }
    }

    var probList = document.getElementById('probNavRightList');
    probList.insertBefore(OptionElem(), probList.firstChild);

    hide();
})();

function hide() {
    var n = modify.length;
    for (i = 0; i < n; i++) {
        modify[i].style.display = 'none';
    }
}

function show() {
    var n = modify.length;
    for (i = 0; i < n; i++) {
        modify[i].style.display = 'block';
    }
}

function MyBtn(title, action) {
    var btn = document.createElement('a');
    btn.href = '#';
    btn.onclick = action;
    btn.innerHTML = title;
    btn.style.color = 'rgb(25, 88, 33)';
    return btn;
}

function OptionElem() {
    var elem = document.createElement('div');
    elem.style.padding = '10px 0';
    elem.style.fontSize = '14px';
    elem.style.textAlign = 'center';
    elem.appendChild(document.createTextNode(locale.mode));
    elem.appendChild(document.createElement('br'));
    elem.appendChild(MyBtn(locale.all, show));
    elem.appendChild(document.createTextNode(' / '));
    elem.appendChild(MyBtn(locale.necessary, hide));
    return elem;
}

function identifyLocale() {
    if (document.getElementsByClassName('contest_actions_item')[0].firstChild.innerHTML.indexOf('Настройки') > -1) {
        locale = locales.ru;
    } else {
        locale = locales.en;
    }
}