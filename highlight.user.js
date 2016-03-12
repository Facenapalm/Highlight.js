// ==UserScript==
// @name        Highlight.js
// @namespace   Facenapalm
// @description Script highlights rows in standings in CMC MSU ejudge (unicorn.ejudge.ru, cmc.ejudge.ru).
// @include     https://unicorn.ejudge.ru/ej/client/standings/*
// @include     https://cmc.ejudge.ru/ej/client/standings/*
// @author      Listov Anton
// @license     WTFPL (http://www.wtfpl.net/about/). 
// @version     3.2
// @grant       none
// ==/UserScript==

(function() {
	"use strict";

	//customization: undefined values will be ignored
	var colorDefault = "#fbffbd";
	var colorCompleted = "#b9ffa7";
	var colorPreview = "#b9ffa7";
	var colorTried = "#ffac4e";
	var colorSkipped = "#ff5e3b";

	var needToHideEmptyCols = true;
	var needToHideAllCols = false;
	var needToAddHideButtons = true;

	var needToAttachNameLinks = true;
	var needToAttachTaskLinks = true;
	var needToAttachSortLinks = true;
	var needToShowStatistic = true;

	var alwaysLinkToUp = true;

	var enLocale = {
		"hide": "Hide",
		"all": "all",
		"empty": "empty",
		"nothing": "nothing"
	};

	var ruLocale = {
		"hide": "Скрыть",
		"all": "всё",
		"empty": "пустые",
		"nothing": "ничего"
	};

	/* highlight function will be automatically called for each of these arguments, where:
	 * highlight(undefined), same to highlight() - highlights you
	 * highlight(3) - highlights third row
	 * highlight("Иван") - highlights first row which name contains "Иван"
	 */
	var autocall = [
		undefined
	];



	/* IMPLEMENTATION */

	if (document.getElementsByClassName("standings").length === 0) {
		return; //wrong page
	}
	if (document.getElementById("highlight_copyright") !== null) {
		return; //script has already changed the page
	}

	var curLocale = enLocale;
	if (document.getElementsByTagName("h2")[0].innerHTML.indexOf("Положение участников") !== -1) {
		curLocale = ruLocale;
	}

	var names = document.getElementsByClassName("st_team");
	var tbody = names[0].parentElement.parentElement; //td -> tr -> tbody
	var rows = tbody.rows;
	var firstRow = 1; //except header
	var lastRow = names.length - 3; //except "total", "success" and "%" rows

	var header = rows[0].childNodes;
	var firstCol = 2; //except "place" and "user" columns
	var lastCol = header.length - 2; //except "solved problems" and "score" columns

	var highlighted = [];


	//common
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

	var getColNumber = function(searchText) {
		for (var i = firstCol; i < lastCol; i++) {
			if (header[i].innerHTML.indexOf(searchText) !== -1) {
				return i;
			}
		}
		return -1;
	};

	var getColPair = function(colNum) {
		if (colNum === -1) {
			return -1;
		}

		var matchTable = {
			"mz": "up",
			"kr": "ku",
			"up": "mz",
			"ku": "kr"
		};

		var colName = header[colNum].innerHTML;
		var parsed = /(mz|kr|up|ku)(\d\d-\d)/.exec(colName);
		if (parsed === null) {
			return -1;
		} else {
			return getColNumber(matchTable[parsed[1]] + parsed[2]);
		}
	};

	//highlight
	var isColSolvable = function(index) {
		return header[index].innerHTML.search(/(?:ku|up)\d\d-\d/) !== -1;
	};

	var isCellDone = function(cellText) {
		return cellText.indexOf("<b>") !== -1;
	};

	var isCellPreview = function(cell) {
		return cell.bgColor.toLowerCase() === "#99cc99";
	};

	var isCellSkipped = function(cellText) {
		return cellText === "&nbsp;";
	};

	var dehighlight = function(row) {
		row.style.background = "";

		row = row.childNodes;
		for (var i = 0; i < row.length; i++) {
			row[i].style.background = "";
		}
	};

	var highlight = function(row) {
		var rowNumber = getRowNumber(row);
		if (rowNumber === undefined) {
			return;
		}
		row = rows[rowNumber];

		var pos = highlighted.indexOf(rowNumber);
		if (pos !== -1) {
			dehighlight(row);
			highlighted.splice(pos, 1);
			return;
		} else {
			highlighted.push(rowNumber);
		}

		var changeColor = function(elem, color) {
			if (color !== undefined || color !== "") {
				elem.style.background = color;
			}
		};

		changeColor(row, colorDefault);

		row = row.childNodes;
		for (var i = firstCol; i < lastCol; i++) {
			var cell = row[i].innerHTML;
			if (isColSolvable(i)) {
				if (isCellPreview(row[i])) {
					changeColor(row[i], colorPreview);
				} else if (isCellDone(cell)) {
					changeColor(row[i], colorCompleted);
				} else if (isCellSkipped(cell)) {
					changeColor(row[i], colorSkipped);
				} else {
					changeColor(row[i], colorTried);
				}
			}
		}
	};

	//other
	var showStatistic = function() {
		var calcPercentage = function(done, needed) {
			var percentage = done === needed ? 100 : Math.round(100 * done / needed);
			return done + " / " + needed + " (" + percentage + "%)";
		};

		var curCell = document.createElement("th");
		curCell.style.fontSize = "11px";
		curCell.innerHTML = "%";
		rows[0].appendChild(curCell);

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
			fullDone += curDone;
			fullNeeded += curNeeded;

			curCell = document.createElement("td");
			curCell.style.fontSize = "11px";
			curCell.style.whiteSpace = "nowrap";
			curCell.innerHTML = calcPercentage(curDone, curNeeded).toString();
			rows[j].appendChild(curCell);
		}

		curCell = document.createElement("td");
		curCell.style.fontSize = "11px";
		curCell.style.whiteSpace = "nowrap";
		curCell.innerHTML = calcPercentage(fullDone, fullNeeded).toString();
		rows[lastRow].appendChild(curCell);

		for (j = lastRow + 1; j < rows.length; j++) {
			curCell = document.createElement("td");
			curCell.style.fontSize = "11px";
			curCell.innerHTML = "&nbsp";
			rows[j].appendChild(curCell);
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
		//^ to prevent hidding current tasks

		var successRow = rows[lastRow + 1].childNodes;
		for (i = firstCol; i < lastToHide; i++) {
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

	var showCols = function() {
		var cells = document.getElementsByClassName("st_prob");
		for (var i = 0; i < cells.length; i++) {
			cells[i].style.display = "";
		}
	};

	var sortTable = function(column, comparer, ascending) {
		var sortedAscending = true;
		var sortedDescending = true;
		var relation;
		for (var j = firstRow; j < lastRow - 1; j++) {
			relation = comparer(rows[j].childNodes[column].innerHTML,
			                    rows[j + 1].childNodes[column].innerHTML);
			sortedAscending = sortedAscending && relation <= 0;
			sortedDescending = sortedDescending && relation >= 0;
		}

		if (sortedAscending && sortedDescending) {
			return;
		}
		if (sortedAscending) {
			ascending = false;
		}
		if (sortedDescending) {
			ascending = true;
		}

		for (j = firstRow; j < lastRow - 1; j++) {
			var max = j;
			for (var i = j + 1; i < lastRow; i++) {
				relation = comparer(rows[i].childNodes[column].innerHTML,
				                    rows[max].childNodes[column].innerHTML);
				relation = ascending ? -relation : relation;
				if (relation > 0) {
					max = i;
				}
			}
			if (max === j) {
				continue;
			}

			tbody.insertBefore(rows[max], rows[j]);
			for (i = 0; i < highlighted.length; i++) {
				if (highlighted[i] >= j && highlighted[i] < max) {
					highlighted[i]++;
				} else if (highlighted[i] === max) {
					highlighted[i] = j;
				}
			}
		}
	};

	//interface improving
	var hideLinkDesign = function(element) {
		element.style.textDecoration = "none";
		element.style.color = "black";
	};

	var showLinkDesign = function(element) {
		element.style.textDecoration = "";
		element.style.color = "";
	};

	var wrapInLink = function(element, hideDesign) {
		element.innerHTML = "<a>" + element.innerHTML + "</a>";

		var newElem = element.childNodes[0];
		newElem.style.cursor = "pointer";
		if (hideDesign) {
			hideLinkDesign(newElem);
		}

		return newElem;
	};

	var addHideButtons = function() {
		var hideAllButton = document.createElement("a");
		hideAllButton.innerHTML = curLocale.all;
		hideAllButton.style.cursor = "pointer";
		hideAllButton.onclick = function() {
			hideCols(true);

			hideLinkDesign(hideAllButton);
			showLinkDesign(hideEmptyButton);
			showLinkDesign(hideNothingButton);
		};

		var hideEmptyButton = document.createElement("a");
		hideEmptyButton.innerHTML = curLocale.empty;
		hideEmptyButton.style.cursor = "pointer";
		hideEmptyButton.onclick = function() {
			showCols();
			hideCols(false);

			showLinkDesign(hideAllButton);
			hideLinkDesign(hideEmptyButton);
			showLinkDesign(hideNothingButton);
		};

		var hideNothingButton = document.createElement("a");
		hideNothingButton.innerHTML = curLocale.nothing;
		hideNothingButton.style.cursor = "pointer";
		hideNothingButton.onclick = function() {
			showCols();

			showLinkDesign(hideAllButton);
			showLinkDesign(hideEmptyButton);
			hideLinkDesign(hideNothingButton);
		};

		if (needToHideAllCols) {
			hideLinkDesign(hideAllButton);
		} else if (needToHideEmptyCols) {
			hideLinkDesign(hideEmptyButton);
		} else {
			hideLinkDesign(hideNothingButton);
		}

		var hideButtons = document.createElement("p");
		hideButtons.style.fontSize = "14px";
		hideButtons.appendChild(document.createTextNode(curLocale.hide + ": "));
		hideButtons.appendChild(hideAllButton);
		hideButtons.appendChild(document.createTextNode(" / "));
		hideButtons.appendChild(hideEmptyButton);
		hideButtons.appendChild(document.createTextNode(" / "));
		hideButtons.appendChild(hideNothingButton);

		var container = document.getElementsByClassName("l14")[0];
		container.appendChild(hideButtons);
	};

	var attachSortLinks = function() {
		var compareNumbers = function(cell1, cell2) {
			var numberGetter = /\d+/;
			var num1 = numberGetter.exec(cell1);
			var num2 = numberGetter.exec(cell2);
			if (num1 === null || num2 === null) {
				return 0;
			} else {
				return Number(num1[0]) - Number(num2[0]);
			}
		};
		var compareStrings = function(cell1, cell2) {
			return cell1.localeCompare(cell2);
		};

		var bindLink = function(column, comparer, ascending) {
			var link = wrapInLink(header[column], true);
			link.onclick = sortTable.bind(null, column, comparer, ascending);
		};

		bindLink(0, compareNumbers, true);
		bindLink(1, compareStrings, true);
		bindLink(lastCol, compareNumbers, false);
		bindLink(lastCol + 1, compareNumbers, false);
		if (needToShowStatistic) {
			bindLink(lastCol + 2, compareNumbers, false);
		}
	};

	var attachTaskLinks = function() {
		var linkPrefix = window.location.href.replace("standings", "view-problem-submit") + "?prob_id=";
		for (var i = firstCol; i < lastCol; i++) {
			var taskNum = -1;
			if (alwaysLinkToUp && !isColSolvable(i)) {
				taskNum = getColPair(i);
				taskNum = taskNum === -1 ? i : taskNum;
			} else {
				taskNum = i;
			}
			var link = wrapInLink(header[i], true);
			link.href = linkPrefix + (taskNum - 1);
		}
	};

	var attachNameLinks = function() {
		for (var i = firstRow; i < lastRow; i++) {
			var newElem = wrapInLink(names[i], false);
			newElem.onclick = highlight.bind(null, newElem.innerHTML);
			newElem.style.whiteSpace = "nowrap";
		}
	};

	var addCopyright = function() {
		var githubLink = "https://github.com/Facenapalm/Highlight.js/blob/master/highlight.user.js";

		var copyright = document.createElement("p");
		copyright.id = "highlight_copyright";
		copyright.classList.add("ejudge_copyright");
		copyright.innerHTML = "<a href=\"" + githubLink + "\">Highlight.js</a> &copy; 2015-2016 Anton Listov.";

		var footer = document.getElementById("footer");
		footer.appendChild(copyright);
	};


	if (needToAddHideButtons) {
		addHideButtons();
	}

	if (needToHideEmptyCols || needToHideAllCols) {
		hideCols(needToHideAllCols);
	}

	if (needToShowStatistic) {
		showStatistic();
	}

	if (needToAttachTaskLinks) {
		attachTaskLinks();
	}

	if (needToAttachSortLinks) {
		attachSortLinks();
	}

	if (needToAttachNameLinks) {
		attachNameLinks();
	}

	for (var i = 0; i < autocall.length; i++) {
		if (highlighted.indexOf(getRowNumber(autocall[i])) === -1) {
			//^ to prevent collisions in autocall list
			highlight(autocall[i]);
		}
	}

	addCopyright();
})();
