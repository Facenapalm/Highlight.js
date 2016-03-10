// ==UserScript==
// @name         SubmissionsMod
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Enhancements for the ejudge submissions page.
// @author       Ivan Molodetskikh
// @match        https://cmc.ejudge.ru/ej/client/view-submissions/*
// @match        https://unicorn.ejudge.ru/ej/client/view-submissions/*
// @grant        none
// @updateURL    https://github.com/YaLTeR/Highlight.js/raw/master/SubmissionsMod.user.js
// ==/UserScript==
/* jshint -W097 */
'use strict';

(function() {
    var show_only_last = true;
    var sort_by_problem = true;
    var localized = {
        show_all: {
            ru: "Показать все",
            en: "Show all"
        },
        show_only_last: {
            ru: "Показать только последние",
            en: "Show only last"
        },
        sort_by_problem_name: {
            ru: " Сортировать по названию задачи",
            en: " Sort by problem name"
        },
        
        tests_passed: {
            ru: "Тесты",
            en: "Tests"
        },
        view_source: {
            ru: "Код",
            en: "Source"
        },
        view_report: {
            ru: "Протокол",
            en: "Report"
        }
    };
    
    var submissions = []; // Sorted by run ID.
    var submissions_by_problem = []; // Sorted by problem name, then by run ID.
    var problems = [];
    var table;
    var lang;
    
    var forEach = Array.prototype.forEach;
    
    // https://stackoverflow.com/questions/15995963/javascript-remove-array-element-on-condition
    // Must go through from first to last, otherwise the code below will break.
    Array.prototype.removeIf = function(callback) {
        var i = 0;
        while (i < this.length) {
            if (callback(this[i])) {
                this.splice(i, 1);
            } else {
                ++i;
            }
        }
    };
    
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
    if (!Array.prototype.includes) {
        Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
            var O = Object(this);
            var len = parseInt(O.length) || 0;
            if (len === 0) {
                return false;
            }
            var n = parseInt(arguments[1]) || 0;
            var k;
            if (n >= 0) {
                k = n;
            } else {
                k = len + n;
                if (k < 0) {k = 0;}
            }
            var currentElement;
            while (k < len) {
                currentElement = O[k];
                if (searchElement === currentElement ||
                     (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
                    return true;
                }
                k++;
            }
            return false;
        };
    }
    
    var getLang = function() {
        if (document.getElementsByClassName("menu")[0].innerHTML === "Настройки")
            return "ru";
        else
            return "en";
    };
    
    var renameColumns = function() {
        var row = table.getElementsByTagName("tr")[0];
        row.childNodes[0].innerHTML = "ID";
        row.childNodes[6].innerHTML = localized.tests_passed[lang];
        row.childNodes[8].innerHTML = localized.view_source[lang];
        row.childNodes[9].innerHTML = localized.view_report[lang];
    };
    
    var resizeTaskArea = function() {
        table.parentNode.style.width = "1000px";
    };
    
    var enumProblems = function() {
        var problems = [];
        forEach.call(document.getElementById("probNavRightList").childNodes, function(row) {
            problems.push(row.firstChild.innerHTML);
        });
        return problems;
    };
    
    var enumSubmissions = function() {
        var submissions = [];
        
        var first = true;
        forEach.call(table.getElementsByTagName("tr"), function(row) {
            if (first) {
                first = false;
                return;
            }
            
            var columns = row.getElementsByTagName("td");
            submissions.push({
                ID: columns[0].innerHTML,
                Time: columns[1].innerHTML,
                Size: columns[2].innerHTML,
                Problem: columns[3].innerHTML,
                Language: columns[4].innerHTML,
                Result: columns[5].innerHTML,
                Tests: columns[6].innerHTML,
                Score: columns[7].innerHTML,
                Source: columns[8].innerHTML,
                Report: columns[9].innerHTML
            });
        });
        
        return submissions;
    };
    
    var compareIDs = function(a, b) {
        var a_ID = parseInt(a.ID);
        var b_ID = parseInt(b.ID);
        if (a_ID > b_ID)
            return -1;
        else if (a_ID < b_ID)
            return 1;
        else
            return 0;
    };
    
    var sortedByRunID = function(submissions) {
        return submissions.slice().sort(compareIDs);
    };
    
    var sortedByProblem = function(submissions) {
        return submissions.slice().sort(function(a, b) {
            var a_prob = problems.indexOf(a.Problem);
            var b_prob = problems.indexOf(b.Problem);
            if (a_prob > b_prob)
                return -1;
            else if (a_prob < b_prob)
                return 1;
            else
                return compareIDs(a, b);
        });
    };
    
    var appendTd = function(element, text) {
        var td = document.createElement("td");
        td.class = "b1";
        td.innerHTML = text;
        element.appendChild(td);
    };
    
    var showOnlyLast = function() {
        var inserted = [];
        var last_submissions = submissions.slice();
        last_submissions.removeIf(function(item) {
            if (inserted.includes(item.Problem))
                return true;
            inserted.push(item.Problem);
            return false;
        });
        if (sort_by_problem)
            last_submissions = sortedByProblem(last_submissions);
        
        var firstRow = table.getElementsByTagName("tr")[0].cloneNode(true);
        table.innerHTML = "";
        table.appendChild(firstRow);
        
        var colored = true;
        var last_problem = "";
        last_submissions.forEach(function(submission) {
            var row = document.createElement("tr");
            
            if (sort_by_problem) {
                if (submission.Problem !== last_problem) {
                    last_problem = submission.Problem;
                    colored = !colored;
                }
                if (colored)
                    row.style.backgroundColor = "lightgray";
            }
            
            appendTd(row, submission.ID);
            appendTd(row, submission.Time);
            appendTd(row, submission.Size);
            appendTd(row, submission.Problem);
            appendTd(row, submission.Language);
            appendTd(row, submission.Result);
            appendTd(row, submission.Tests);
            appendTd(row, submission.Score);
            appendTd(row, submission.Source);
            appendTd(row, submission.Report);
            table.appendChild(row);
        });
    };
    
    var showAll = function() {
        var firstRow = table.getElementsByTagName("tr")[0].cloneNode(true);
        table.innerHTML = "";
        table.appendChild(firstRow);
        
        var colored = true;
        var last_problem = "";
        (sort_by_problem ? submissions_by_problem : submissions).forEach(function(submission) {
            var row = document.createElement("tr");
            
            if (sort_by_problem) {
                if (submission.Problem !== last_problem) {
                    last_problem = submission.Problem;
                    colored = !colored;
                }
                if (colored)
                    row.style.backgroundColor = "lightgray";
            }
            
            appendTd(row, submission.ID);
            appendTd(row, submission.Time);
            appendTd(row, submission.Size);
            appendTd(row, submission.Problem);
            appendTd(row, submission.Language);
            appendTd(row, submission.Result);
            appendTd(row, submission.Tests);
            appendTd(row, submission.Score);
            appendTd(row, submission.Source);
            appendTd(row, submission.Report);
            table.appendChild(row);
        });
    };
    
    var refresh = function() {
        if (show_only_last)
            showOnlyLast();
        else
            showAll();
    };
    
    var setButtonStyle = function(button) {
        button.style.padding = "1px 6px 1px 6px";
        button.style.fontSize = "13.333px";
    };
    
    var addControlButtons = function(parent) {
        var show_all_btn_td = document.createElement("td");
        var show_all_btn = document.createElement("button");
        var show_only_last_btn_td = document.createElement("td");
        var show_only_last_btn = document.createElement("button");
        
        show_all_btn.innerHTML = localized.show_all[lang];
        setButtonStyle(show_all_btn);
        show_all_btn.onclick = function() {
            show_all_btn.disabled = true;
            show_only_last_btn.disabled = false;
            show_only_last = false;
            refresh();
        };
        show_all_btn_td.style.border = "none";
        show_all_btn_td.appendChild(show_all_btn);
        
        show_only_last_btn.innerHTML = localized.show_only_last[lang];
        setButtonStyle(show_only_last_btn);
        show_only_last_btn.disabled = true;
        show_only_last_btn.onclick = function() {
            show_all_btn.disabled = false;
            show_only_last_btn.disabled = true;
            show_only_last = true;
            refresh();
        };
        show_only_last_btn_td.style.border = "none";
        show_only_last_btn_td.appendChild(show_only_last_btn);
        
        parent.appendChild(show_all_btn_td);
        parent.appendChild(show_only_last_btn_td);
    };
    
    var addControlCheckbox = function(parent) {
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.style.verticalAlign = "middle";
        checkbox.checked = true;
        checkbox.onchange = function() {
            sort_by_problem = this.checked;
            refresh();
        };
        
        var checkbox_text = document.createTextNode(localized.sort_by_problem_name[lang]);
        
        var td = document.createElement("td");
        td.colSpan = 2;
        td.style.border = "none";
        td.appendChild(checkbox);
        td.appendChild(checkbox_text);
        
        parent.appendChild(td);
    };
    
    var addControls = function() {
        var control_table = document.createElement("table");
        control_table.style.margin = "0px";
        
        var buttons_row = document.createElement("tr");
        addControlButtons(buttons_row);
        control_table.appendChild(buttons_row);
        
        var checkbox_row = document.createElement("tr");
        addControlCheckbox(checkbox_row);
        control_table.appendChild(checkbox_row);
        
        table.parentNode.insertBefore(control_table, table);
    };
    
    lang = getLang();
    table = document.getElementsByClassName("table")[0];
    problems = enumProblems();
    submissions = enumSubmissions();
    submissions_by_problem = sortedByProblem(submissions);
    
    renameColumns();
    resizeTaskArea();
    refresh();
    addControls();
})();
