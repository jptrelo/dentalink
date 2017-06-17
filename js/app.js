(function($){

	var Schedule = {
		variables: {
			step: 30, //minutes
			step_height: 50, // Px
			start: '2016-05-16 00:00:00',
		},
		initialize: function() {
			// Render week headers
			for (var i = 0;i<7;i++) {
				var day = moment(this.variables.start).add(i,'days');
				$(".week-header .column-day:eq("+i+")").html(day.format("ddd DD"));
			}
			// Render schedule
			for (var i = 0;i<24*60/this.variables.step;i++) {
				var time = moment(this.variables.start).add(i*this.variables.step,'minutes');
				var step_element = $("<div class='step' data-hour='"+time.format("HH:mm")+"'>"+time.format("HH:mm")+"</div>");
				step_element.css({height: this.variables.step_height+"px"});
				$(".steps").append(step_element);
			}
			$(".schedule-container").css({
				height: $(".steps").height()+"px"
			});

			// Fetch data
			$.getJSON("js/data.json",function(r){

				r.data.forEach(function(event){
					//Get each event details
					var startDate = moment(event.start_at);
					var endDate = moment(event.due_at); 

					//Build an object 'detailedEvent', which has each event detailed information
					var detailedEvent = {
						startDate : startDate,
						endDate : endDate,
						day : startDate.day() - 1,
						top : Schedule.getEventTop(startDate),
						height : Schedule.getEventHeight(startDate, endDate)
						};
					Schedule.addEvent(detailedEvent);

				});

				Schedule.setEventsWidth();

			}).error(function(err){
				console.log(err);
			})
		},
		/**
		 * [addEvent This function append an event to the schedule]
		 * @param {event [Has each event detailed information]
		 */
		addEvent: function(event){
			//Create element for an event
			var eventHtml = $("<div/>").css({
				position : "absolute",
				//left : 0,
				top : event.top + "px",
				height : event.height + "px"
			});

			var column = $(".schedule-container .column-day:eq("+event.day+")");
			//Append the element created
			column.append(eventHtml);

		},
		/**
		 * [getEventTop Calculates the top position where an event will be added]
		 * @param  {startDate [The start date of an event]
		 * @return {[The top position]
		 */
		getEventTop: function(startDate){
			//Find and get the position of a div that has same time in attr 'data-hour' 
			var position = $("div[data-hour='"+startDate.format("HH:mm")+"']").position();

			return position.top;
		},
		/**
		 * [getEventHeight Calculates the height for an event]
		 * @param  {startDate [The start date of an event]
		 * @param  {endDate   [The end date of an event]
		 * @return {[The event height]
		 */
		getEventHeight: function(startDate, endDate){
			//Find and get the top positions of a divs that has same time in attr 'data-hour'
			//Subtract each position
			var eventHeight = $("div[data-hour='"+endDate.format("HH:mm")+"']").position().top - Schedule.getEventTop(startDate);

			return eventHeight;
		},
		/**
		 * [setEventsWidth Sets every width of each events]
		 */
		setEventsWidth: function(){
			// Loop each day
			$($(".schedule-container").children()).each(function(){
				
				var column = $(this);
				var columnEvents = column.children().length;

				// Loop each event to compare if it's in between anothers in the same day and position
				$(column.children()).each(function(index){

					var eventTop = $(this).position().top;
					var eventIndex = index;
					var inBetween = [];

					// Loop each event to compare with the above(key event)
					$(column.children()).each(function(index){

						// Compare everything but none the 'key event'
						if (index != eventIndex) {
							// If it's between any
							var eventBottom = $(this).position().top + $(this).height();
							if ((eventTop >= $(this).position().top) && (eventTop < eventBottom)) {
								//Save with which ones is related
								inBetween.push(index);
							} 
						}

					});
					// How many are related. 
					// 0 means no related events(just the 'key event' = 1).
					// More than 0 means there are related events plus the 'key event'. 
					var quantity = (inBetween.length > 0) ? inBetween.length + 1 : 1;

					// Add a Bootstraps class to set the width up
					var widthClass = 'col-xs-' + 12/quantity;
					$(column.children()[index]).addClass(widthClass);

					// Loop if there are related events so we remove the aboves an add a new one
					inBetween.forEach(function(child){
						$(column.children()[child]).removeClass();
						$(column.children()[child]).addClass(widthClass);

					});
				});

			});
		}
	}

	Schedule.initialize();

})(jQuery);