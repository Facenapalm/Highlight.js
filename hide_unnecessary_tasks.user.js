// ==UserScript==
// @name        Hide Unnecessary Problems
// @namespace   EjudgeFE
// @description Скрипт оставляет в списке задач в Ejudge видимыми только нерешенные задачи.
// @include     https://unicorn.ejudge.ru/ej/client/*
// @include     https://cmc.ejudge.ru/ej/client/*
// @exclude     https://cmc.ejudge.ru/ej/client/standings/*
// @author      Mashkoff Tony
// @license     WTFPL (http://www.wtfpl.net/about/).
// @version     1.5
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
var regexp = { mz : /mz\d\d-\d*/, up : /up\d\d-\d*/, kr : /kr\d\d-\d*/, ku : /ku\d\d-\d*/ };
testingInProgressMessage += ' СПОРИМ, НЕ ЗАЙДЕТ?';
testingCompleted += ' ЗАШЛА? ^_^';

(function(){
    "use strict";

    identifyLocale();

    var classes = {
        mz : [],
        kr : [],
        up : [],
        ku : [],
        other : []
    };

    var pool = document.querySelectorAll('.probOk, .probTrans, .probBad, .probEmpty');
    var n = pool.length;
    for (var i = 0; i < n; i++) {
        var name = pool[i].firstChild.innerHTML;
        var tmp = undefined;
        for (var type in regexp) {
            if (regexp[type].test(name)) {
                var j = parseInt(name.substr(2, 4));
                var k = parseInt(name.substr(5));
                tmp = type;
                break;
            }
        }
        if (tmp != undefined) {
            if (!classes[tmp].hasOwnProperty(j)) {
                classes[tmp][j] = [];
            }
            classes[tmp][j][k] = pool[i];
        } else {
            classes.other.push(pool[i]);
        }
    }

    for (var type in classes) {
        var pairedType = getPairedType(type);
        if (type != 'mz' && type != 'kr') {
            for (i in classes[type]) {
                if (type != 'other') {
                    for (var j in classes[type][i]) {
                        var elem = classes[type][i][j];
                        if ((elem.classList[0] == 'probOk' || elem.classList[0] == 'probTrans')) {
                            modify.push(elem);
                            if (classes[pairedType].hasOwnProperty(i) &&
                                classes[pairedType][i].hasOwnProperty(j)) {
                                modify.push(classes[pairedType][i][j]);
                            }
                        }
                    }
                } else {
                    var elem = classes[type][i];
                    if (elem.classList[0] == 'probOk' || elem.classList[0] == 'probTrans') {
                        modify.push(elem);
                    }
                }
            }
        } else {
            for (i in classes[type]) {
                for (var j in classes[type][i]) {
                    var elem = classes[type][i][j];
                    var nextContestExists = classes[type].hasOwnProperty( (parseInt(i) + 1).toString() );
                    if ((elem.classList[0] == 'probOk' || elem.classList[0] == 'probTrans') &&
                        classes[pairedType].hasOwnProperty(i) &&
                        classes[pairedType][i].hasOwnProperty(j)) {
                        modify.push(elem);
                        modify.push(classes[pairedType][i][j]);
                    }
                    if (classes[pairedType].hasOwnProperty(i) &&
                        classes[pairedType][i].hasOwnProperty(j) ||
                        nextContestExists || isUnavailable(elem)) {
                        modify.push(elem);
                    }
                }
            }
        }
    }

    var probList = document.getElementById('probNavRightList');
    probList.insertBefore(OptionElem(), probList.firstChild);

    hide();

    var copyright = document.createElement('p');
    copyright.classList.add('ejudge_copyright');
    copyright.innerHTML = 'Copyright © 2016 Антон Брызгалов';
    document.getElementById('footer').appendChild(copyright);
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
    if (document.getElementsByClassName('contest_actions_item')[0].innerHTML.indexOf('Настройки') > -1) {
        locale = locales.ru;
    } else {
        locale = locales.en;
    }
}

function getPairedType(type) {
    switch (type) {
        case 'mz':
            return 'up';
        case 'up':
            return 'mz';
        case 'kr':
            return 'ku';
        case 'ku':
            return 'kr';
        default:
            return type;
    }
}

function isUnavailable(node) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', node.firstChild.href);
    xhr.onreadystatechange = function() {
        if (xhr.status == 200 && xhr.responseText.indexOf('action_139', 4000) > 0) {
            modify.push(node);
            hide();
        }
    };
    node.appendChild(document.createTextNode('...'));
    xhr.send();
    return false;
}