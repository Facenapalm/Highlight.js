// ==UserScript==
// @name        Hide Unnecessary Problems
// @version     1.10
// @namespace   EjudgeFE
// @description Скрипт оставляет в списке задач в Ejudge видимыми только нерешенные задачи.
// @include     https://unicorn.ejudge.ru/ej/client/*
// @include     https://cmc.ejudge.ru/ej/client/*
// @exclude     https://cmc.ejudge.ru/ej/client/standings/*
// @exclude     https://cmc.ejudge.ru/ej/client/view-clar/*
// @exclude     https://cmc.ejudge.ru/ej/client/view-report/*
// @exclude     https://cmc.ejudge.ru/ej/client/view-source/*
// @author      Mashkoff Tony
// @license     WTFPL (http://www.wtfpl.net/about/).
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
if (testingInProgressMessage !== undefined && testingCompleted !== undefined) {
    testingInProgressMessage += ' СПОРИМ, НЕ ЗАЙДЕТ?';
    testingCompleted += ' ЗАШЛА? ^_^';
}

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
    var type, j;
    for (var i = 0; i < n; i++) {
        var name = pool[i].firstChild.innerHTML;
        var tmp = undefined;
        for (type in regexp) {
            if (!regexp.hasOwnProperty(type)) {
                break;
            }
            if (regexp[type].test(name)) {
                j = parseInt(name.substr(2, 4));
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

    var elem;
    for (type in classes) {
        if (!classes.hasOwnProperty(type)) {
            break;
        }
        var pairedType = getPairedType(type);
        if (type != 'mz' && type != 'kr') {
            for (i in classes[type]) {
                if (!classes[type].hasOwnProperty(i)) {
                    break;
                }
                if (type != 'other') {
                    for (j in classes[type][i]) {
                        if (!classes[type][i].hasOwnProperty(j)) {
                            break;
                        }
                        elem = classes[type][i][j];
                        if ((elem.classList[0] == 'probOk' || elem.classList[0] == 'probTrans')) {
                            modify.push(elem);
                            if (classes[pairedType].hasOwnProperty(i) &&
                                classes[pairedType][i].hasOwnProperty(j)) {
                                modify.push(classes[pairedType][i][j]);
                            }
                        }
                    }
                } else {
                    elem = classes[type][i];
                    if (elem.classList[0] == 'probOk' || elem.classList[0] == 'probTrans' || isUnavailable(elem)) {
                        modify.push(elem);
                    }
                }
            }
        } else {
            for (i in classes[type]) {
                if (!classes[type].hasOwnProperty(i)) {
                    break;
                }
                for (j in classes[type][i]) {
                    if (!classes[type][i].hasOwnProperty(j)) {
                        break;
                    }
                    elem = classes[type][i][j];
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
    var loadingIndicator = node.appendChild(document.createTextNode('...'));
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            node.removeChild(loadingIndicator);
        }
        if (xhr.status == 200 && xhr.responseText.indexOf('action_139', 4000) > 0) {
            modify.push(node);
            hide();
        }
    };
    xhr.send();
    return false;
}
