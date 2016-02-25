// ==UserScript==
// @name        Highlight.js
// @namespace   Facenapalm
// @description Script highlights rows in standings in CMC MSU ejudge (unicorn.ejudge.ru, cmc.ejudge.ru).
// @include     https://unicorn.ejudge.ru/ej/client/standings/*
// @include     https://cmc.ejudge.ru/ej/client/standings/*
// @author      Listov Anton
// @license     WTFPL (http://www.wtfpl.net/about/). 
// @version     2.2b
// @grant       none
// ==/UserScript==

(function() {
	"use strict";

	//customization: undefined values will be ignored
	var colorDefault = "#fbffbd";
	var colorCompleted = "#b9ffa7";
	var colorTried = "#ffac4e";
	var colorSkipped = "#ff5e3b";

	var needToAttachNameLinks = true;
	var needToAttachTaskLinks = true;
	var needToShowStatistic = true;
	var needToHideEmptyCols = true;
	var needToHideAllCols = false;

	/* highlight function will be automatically called for each of these arguments, where:
	 * highlight(undefined), same to highlight() - highlights you
	 * highlight(3) - highlights third row
	 * highlight("Иван") - highlights first row which name contains "Иван"
	 */
	var autocall = [
		undefined
	];

	//implemetation
	if (document.getElementsByClassName("standings").length === 0) {
		return; //wrong page
	}

	var names = document.getElementsByClassName("st_team");
	var firstRow = 1; //except header
	var lastRow = names.length - 3; //except "total", "success" and "%" rows
	var rows = [];
	for (var i = 0; i < names.length; i++) {
		rows[i] = names[i].parentElement;
	}

	var header = rows[0].childNodes;
	var firstCol = 2; //except "place" and "user" columns
	var lastCol = header.length - 2; //except "solved problems" and "score" columns

	var rowBackups = {};

	var getRowNumber = function(row) {
		if (typeof row === "undefined") {
			var titleText = document.getElementsByClassName("main_phrase")[0].innerHTML;
			row = /[^ ]* [^ ]*/.exec(titleText)[0]; //get first two words
		}

		if (typeof row === "string") {
			for (var i = firstRow; i < lastRow; i++) {
				if (names[i].innerHTML.indexOf(row) !== -1) {
					return i;
				}
			}
			return undefined;
		} else if (typeof row === "number") {
			return row >= firstRow && row < lastRow ? row : undefined;
		} else {
			return undefined;
		}
	};

	var isColSolvable = function(index) {
		return header[index].innerHTML.search(/(ku|up)\d\d-\d/) !== -1;
	};

	var isCellDone = function(cellText) {
		return cellText.indexOf("<b>") !== -1;
	};

	var isCellSkipped = function(cellText) {
		return cellText === "&nbsp;";
	};

	var changeColor = function(elem, color) {
		if (color !== undefined || color !== "") {
			elem.style.background = color;
		}
	};

	var highlight = function(row) {
		var rowNumber = getRowNumber(row);
		if (rowNumber === undefined) {
			return;
		}
		row = rows[rowNumber];

		if (rowBackups[rowNumber] !== undefined) {
			//previous condition restoring
			row.style = null;
			row.innerHTML = rowBackups[rowNumber];
			names[rowNumber].childNodes[0].onclick = highlight.bind(this, rowNumber);

			delete rowBackups[rowNumber];
			return;
		} else {
			rowBackups[rowNumber] = row.innerHTML;
		}

		changeColor(row, colorDefault);

		row = row.childNodes;
		for (var i = firstCol; i < lastCol; i++) {
			var cell = row[i].innerHTML;
			if (isColSolvable(i)) {
				if (isCellDone(cell)) {
					changeColor(row[i], colorCompleted);
				} else if (isCellSkipped(cell)) {
					changeColor(row[i], colorSkipped);
				} else {
					changeColor(row[i], colorTried);
				}
			}
		}
	};

	var calcPercentage = function(done, needed) {
		var percentage = done === needed ? 100 : Math.round(100 * done / needed);
		return done + " / " + needed + " (" + percentage + "%)";
	};

	var showStatistic = function() {
		rows[0].innerHTML += "<th class=\"st_score\">%</th>";
		var fullDone = 0;
		var fullNeeded = 0;
		var curDone, curNeeded;
		for (var j = firstRow; j < lastRow; j++) {
			var row = rows[j].childNodes;

			curDone = 0;
			curNeeded = 0;
			for (var i = firstCol; i < lastCol; i++) {
				if (isColSolvable(i)) {
					curNeeded ++;
					curDone += isCellDone(row[i].innerHTML);
				}
			}
			rows[j].innerHTML += "<td class=\"st_score\">" + calcPercentage(curDone, curNeeded) + "</td>";

			fullDone += curDone;
			fullNeeded += curNeeded;
		}
		rows[lastRow].innerHTML += "<td class=\"st_score\">" + calcPercentage(fullDone, fullNeeded) + "</td>";
		for (var j = lastRow + 1; j < rows.length; j++) {
			rows[j].innerHTML += "<td class=\"st_score\">&nbsp;</td>";
		}
	};

	var hideCols = function(hideAll) {
		var lastToHide = 0;
		for (var i = lastCol - 1; i >= firstCol; i--) {
			if (isColSolvable(i)) {
				lastToHide = i;
				break;
			}
		}
		//to prevent hidding current tasks

		var successRow = rows[lastRow + 1].childNodes;
		for (var i = firstCol; i < lastToHide; i++) {
			if (isColSolvable(i)) {
				continue;
			}
			if (successRow[i].innerHTML !== "0" && !hideAll) {
				continue;
			}
			for (var j = 0; j < rows.length; j++) {
				rows[j].childNodes[i].style.display = "none";
			}
		}
	};

	var attachTaskLinks = function() {
		var linkPrefix = window.location.href.replace("standings", "view-problem-submit") + "?prob_id=";
		for (var i = firstCol; i < lastCol; i++) {
			header[i].innerHTML = "<a href=\"" + linkPrefix + (i - 1) + "\">" + header[i].innerHTML + "</a>";

			var newElem = header[i].childNodes[0];
			newElem.style.textDecoration = "none";
			newElem.style.color = "black";
		}
	};

	var attachNameLinks = function() {
		for (var i = firstRow; i < lastRow; i++) {
			names[i].innerHTML = "<a>" + names[i].innerHTML + "</a>";

			var newElem = names[i].childNodes[0];
			newElem.style.cursor = "pointer";
			newElem.onclick = highlight.bind(this, i);
		}
	};

	if (needToHideEmptyCols || needToHideAllCols) {
		hideCols(needToHideAllCols);
	}

	if (needToShowStatistic) {
		showStatistic();
	}

	if (needToAttachTaskLinks) {
		attachTaskLinks();
	}

	if (needToAttachNameLinks) {
		attachNameLinks();
	}

	for (var i = 0; i < autocall.length; i++) {
		if (rowBackups[getRowNumber(autocall[i])] === undefined) {
			//^ to prevent collisions in autocall list
			highlight(autocall[i]);
		}
	}
})();
