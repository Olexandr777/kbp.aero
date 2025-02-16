$(function() {

	var openedTable = 'out';
	var openedSortTable = 'today';

	var tabs = $('.tabs .tab');
    
    tabs.click(function () {
        var dataArrival = $(this).attr('data-arrival');
        if(dataArrival == openedTable) return false;
        openedTable = dataArrival;

        tabs.removeClass('active');
        $(this).addClass('active');

    	$('.table_wrp.out.' + openedSortTable).toggle();
    	$('.table_wrp.in.' + openedSortTable).toggle();
    });

    var buttons = $('.buttons .date-filter');
    var allTodayFilter = $('.alltoday');

    buttons.click(function(){
    	var dataArrival = $(this).attr('data-arrival');

        if(dataArrival == 'today'){
            allTodayFilter.show();
        }
        else{
            allTodayFilter.hide();
        }

    	buttons.removeClass('active');
    	$(this).addClass('active');

    	$('.table_wrp.' + openedTable + '.' + openedSortTable).hide();
    	$('.table_wrp.' + openedTable + '.' + dataArrival).show();

    	openedSortTable = dataArrival;
    });

	function finishRow(row, condition){
		if(condition){
			row = '<tr class="tr hidden">' + row;
		}
		else{
			row = '<tr class="tr">' + row;
		}
		return row;
	}



	var tableInYes = $('.table_wrp.in.yesterday tbody'),
		tableInTod = $('.table_wrp.in.today tbody'),
		tableInTom = $('.table_wrp.in.tomorrow tbody'),
		tableOutYes = $('.table_wrp.out.yesterday tbody'),
		tableOutTod = $('.table_wrp.out.today tbody'),
		tableOutTom = $('.table_wrp.out.tomorrow tbody');

	var languages = {
		'uk_UA': 0,
		'ru_RU': 1,
		'en_US': 2
	};
	if(language){
		kbp['lang'] = languages[language];
	}
	else {
		kbp['lang'] = 0;
	}

	var boardData = kbp['boardModel'],
		boardIn = {
			'yesterday': [],
			'today': [],
			'tomorrow': []
				},
		boardOut = {
			'yesterday': [],
			'today': [],
			'tomorrow': []
				};
	var inAlltodayCount = 0,
		outAlltodayCount = 0;


	for(var i=0, len=boardData.length; i<len; i++) {
		var current = boardData[i],
			curHTML = '',
			status = current['status_alias'],
			statusText = kbp['boardUI']['statuses'][kbp['lang']][status],
			direction = (current['direction'] == "0") ? 'in' : 'out',
			date = current['rel_day_f'],
			inprep;

		if(current['act_time_expected'] == ""){
			if(current['takeoff_time'] == ""){
				inprep = '';
			}
			else{
				inprep = kbp['boardUI']['inprep'][kbp['lang']];
			}
		}
		else{
			inprep = kbp['boardUI']['inprep'][kbp['lang']]
		}

		if(current['checkingates'] == 'undefined'){
			current['checkingates'] = '';
		}
		
		curHTML += '<td class="td">' + current['fltname'] + '</td>';
		curHTML += '<td class="td">' + current['dt_plan_f'] + '</td>';
		curHTML += '<td class="td">' + current['airport'+kbp['lang']] + '</td>';
		curHTML += '<td class="td">' + current['airline_name'] + '</td>';
		curHTML += '<td class="td">' + current['terminal'] + '</td>';

		if(direction == 'out') {
			curHTML += '<td class="td">' + current['gate'] + '</td>';
		}

		curHTML += '<td class="td">' + statusText + ' ';
		curHTML += current['checkingates'] + inprep + ' ';
		curHTML += current['act_time_expected'] + current['takeoff_time'];
		curHTML += '</td>';
		
		curHTML += '</tr>';

		if(direction == 'in'){

			if(date == "yesterday"){
				curHTML = finishRow(curHTML, boardIn['yesterday'][5]);
				boardIn['yesterday'].push(curHTML);
			}
			else if(date == 'today'){
				curHTML = '<tr class="tr alltoday__row alltoday__row_hid">' + curHTML;
				boardIn['today'].push(curHTML);
				inAlltodayCount++;
			}
			else if(date == "todayActiveOnly"){
				var condition = (boardIn['today'].length - inAlltodayCount) > 5;
				curHTML = finishRow(curHTML, condition);
				boardIn['today'].push(curHTML);
			}
			else if(date == 'tomorrow'){
				curHTML = finishRow(curHTML, boardIn['tomorrow'][5]);
				boardIn['tomorrow'].push(curHTML);
			}

		}
		else{

			if(date == "yesterday"){
				curHTML = finishRow(curHTML, boardOut['yesterday'][5]);
				boardOut['yesterday'].push(curHTML);
			}
			else if(date == 'today'){
				curHTML = '<tr class="tr alltoday__row alltoday__row_hid">' + curHTML;
				boardOut['today'].push(curHTML);
				outAlltodayCount++;
			}
			else if(date == "todayActiveOnly"){
				var condition = (boardOut['today'].length - outAlltodayCount) > 5;
				curHTML = finishRow(curHTML, condition);
				boardOut['today'].push(curHTML);
			}
			else if(date == 'tomorrow'){
				curHTML = finishRow(curHTML, boardOut['tomorrow'][5]);
				boardOut['tomorrow'].push(curHTML);
			}

		}
	}

	tableInTod.html(boardIn['today'].join(''));	
	tableInTom.html(boardIn['tomorrow'].join(''));	
	tableInYes.html(boardIn['yesterday'].join(''));	

	tableOutTod.html(boardOut['today'].join(''));	
	tableOutTom.html(boardOut['tomorrow'].join(''));	
	tableOutYes.html(boardOut['yesterday'].join(''));	


	var displayAllElem = $('.all_link'),
		searchInput = $('.search-flight .cleared'),
		searchButton = $('.search-flight button'),
		searchClear = $('.search-flight .clear');

	displayAllElem.click(function(e){
		e.preventDefault();
		$('tbody .hidden').removeClass('hidden');
		displayAllElem.hide();
	});

	$('.alltoday').click(function(){
        $(this).toggleClass('active');

        $('.alltoday__row').toggleClass('alltoday__row_hid');
    });


	if(!searchInput.val()){
        searchClear.hide();
    }else{
        searchClear.show();
    }

	searchInput.keyup(function(){
        var text = $(this).val().toLowerCase();
    	displayAllElem.hide();
    	
    	if(!text){
            searchClear.hide();
        }else{
            searchClear.show();
        }

        $('tbody tr').each(function(){
            var isContain = false;

            var td_s = this.cells;

            for(var i=0, len=td_s.length; i<len; i++){
            	var td = td_s[i].textContent;
            	td = td.split('').filter(function(e){ return e.charCodeAt(0) != 8203 }).join('');
            	var position = td.toLowerCase().indexOf(text);

            	if( position > -1){
	                 isContain = true;
	                 break;
	            }
            }		
            
            if(isContain) {
            	$(this).removeClass('hidden');
            }
            else {
            	$(this).addClass('hidden');
            }
		});
	});

	searchButton.click(function(e){
		e.preventDefault();
		searchInput.keyup();
	});

	searchClear.click(function () {
        searchInput.val('');
        searchInput.keyup();
        $(this).hide();
    });

});