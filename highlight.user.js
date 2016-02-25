// ==UserScript==
// @name        Highlight.js
// @namespace   Facenapalm
// @description Script highlights rows in CMC MSU ejudge (unicorn.ejudge.ru, cmc.ejudge.ru).
// @include     https://unicorn.ejudge.ru/ej/client/standings/*
// @include     https://cmc.ejudge.ru/ej/client/standings/*
// @author      Listov Anton
// @license     WTFPL (http://www.wtfpl.net/about/). 
// @version     2.1b
// @grant       none
// ==/UserScript==

(function() {
	"use strict";

	//customization: undefined values will be ignored
	var colorDefault = "#fbffbd";
	var colorCompleted = "#b9ffa7";
	var colorTried = "#ffac4e";
	var colorSkipped = "#ff5e3b";

	var needToAttachLinks = true;
	var needToShowStatistic = true;
	var needToHideEmptyCols = true;

	/* highlight function will be automatically called for each of these arguments, where:
	 * highlight(undefined), same to highlight() - highlights you
	 * highlight(3) - highlights third row
	 * highlight("Иван") - highlights first row which name contains "Иван"
	 */
	var autocall = [
		undefined
	];

	//implemetation
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
		return header[index].innerHTML.indexOf("u") !== -1;
	};

	var isCellDone = function(cellText) {
		return cellText.indexOf("<b>") !== -1;
	};

	var isCellSkipped = function(cellText) {
		return cellText === "&nbsp;";
	};

	var changeColor = function(elem, color) {
		if (color !== undefined || color === "") {
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

	var showStatistic = function() {
		rows[0].innerHTML += "<th class=\"st_score\">%</th>";
		for (var j = firstRow; j < lastRow; j++) {
			var row = rows[j].childNodes;

			var done = 0;
			var needed = 0;
			for (var i = firstCol; i < lastCol; i++) {
				if (isColSolvable(i)) {
					needed ++;
					done += isCellDone(row[i].innerHTML);
				}
			}
			var percentage = done === needed ? 100 : Math.round(100 * done / needed);
			rows[j].innerHTML += "<td class=\"st_score\">" + done + " / " + needed + " (" + percentage + "%)</td>";
		}
		for (var j = 0; j < 3; j++) {
			rows[lastRow + j].innerHTML += "<td class=\"st_score\"></td>";
		}
	};

	var hideEmptyCols = function() {
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
			if (successRow[i].innerHTML !== "0") {
				continue;
			}
			for (var j = 0; j < rows.length; j++) {
				rows[j].childNodes[i].style.display = "none";
			}
		}
	};

	if (needToHideEmptyCols) {
		hideEmptyCols();
	}

	if (needToShowStatistic) {
		showStatistic();
	}

	if (needToAttachLinks) {
		for (var i = firstRow; i < lastRow; i++) {
			names[i].innerHTML = "<a>" + names[i].innerHTML + "</a>";
			names[i].childNodes[0].onclick = highlight.bind(this, i);
		}
	}

	for (var i = 0; i < autocall.length; i++) {
		if (rowBackups[getRowNumber(autocall[i])] === undefined) {
			//^ to prevent collisions in autocall list
			highlight(autocall[i]);
		}
	}
})();
