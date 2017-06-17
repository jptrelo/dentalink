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
				//var events = r.data;
				r.data.forEach(function(event){
					//Get each event details
					var startDate = moment(event.start_at);
					var endDate = moment(event.due_at); 
					var positionTop = Schedule.getEventTop(startDate);
					var eventHeight = Schedule.getEventHeight(startDate, endDate);

					//Build an object 'detailedEvent', which has each event detailed information
					var detailedEvent = {
						startDate : startDate,
						endDate : endDate,
						day : startDate.day() - 1,
						top : positionTop,
						height : eventHeight
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
			//Create HTML for an event
			var eventHtml = $("<div/>").css({
				//position : "absolute",
				//left : 0,
				top : event.top + "px",
				height : event.height + "px"
			});

			var column = $(".schedule-container .column-day:eq("+event.day+")");
			//Append the element created
			column.append(eventHtml);

			//Schedule.setEventsWidth(column, event);

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
		setEventsWidth: function(){

			$($(".schedule-container").children()).each(function(){
				
				var column = $(this);
				var columnEvents = column.children().length;

					$(column.children()).each(function(){

						console.log(this);
					});

				column.children().removeClass();
				if (columnEvents <= 3) {
				
					column.children().addClass('col-xs-' + 12/columnEvents);
				} else {
					column.children().addClass('col-xs-4');
				}

			});
		}
	}

	Schedule.initialize();

})(jQuery);