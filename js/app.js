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

				// Loop each day to config each element added
				$($(".schedule-container").children()).each(function(){
				
					var eventsDay = $(this);

					Schedule.setEventsWidth(eventsDay);
					Schedule.setEventsLeft(eventsDay);

				});

			}).error(function(err){
				console.log(err);
			})
		},
		/**
		 * [addEvent This function append an event to the schedule]
		 * @param event [Has each event detailed information]
		 */
		addEvent: function(event){
			//Create element for an event
			var eventHtml = $("<div/>").css({
				top : event.top + "px",
				height : event.height + "px"
			});

			var column = $(".schedule-container .column-day:eq("+event.day+")");
			//Append the element created
			column.append(eventHtml);

		},
		/**
		 * [getEventTop Calculates the top position where an event will be added]
		 * @param  startDate [The start date of an event]
		 * @return [The top position]
		 */
		getEventTop: function(startDate){
			//Find and get the position of a div that has same time in attr 'data-hour' 
			var position = $("div[data-hour='"+startDate.format("HH:mm")+"']").position();

			return position.top;
		},
		/**
		 * [getEventHeight Calculates the height for an event]
		 * @param  startDate [The start date of an event]
		 * @param  endDate   [The end date of an event]
		 * @return [The event height]
		 */
		getEventHeight: function(startDate, endDate){
			//Find and get the top positions of a divs that has same time in attr 'data-hour'
			//Subtract each position
			var eventHeight = $("div[data-hour='"+endDate.format("HH:mm")+"']").position().top - Schedule.getEventTop(startDate);

			return eventHeight;
		},
		/**
		 * [setEventsWidth Sets width of each event]
		 * @param {eventsDay [A day to set each event up]
		 */
		setEventsWidth: function(eventsDay){
			// Loop each event to compare if it's in between anothers in the same day and position
			$(eventsDay.children()).each(function(index){

				var eventTop = $(this).position().top;
				var eventIndex = index;
				var inBetween = Schedule.getInBetweenRelated(eventsDay, eventTop, eventIndex);
				
				// How many are related. 
				// 0 means no related events(just the 'key event' = 1).
				// More than 0 means there are related events plus the 'key event'. 
				var relatedEvents = (inBetween.length > 0) ? inBetween.length + 1 : 1;

				// Divide a 100% width between related events
				var eventWidth = Math.floor(100 / relatedEvents)
				$(eventsDay.children()[eventIndex]).css({width : eventWidth + "%"});

				// Loop if there are related events so we remove the aboves an add a new one
				inBetween.forEach(function(related){
					$(eventsDay.children()[related]).css({width : eventWidth + "%"});

				});
			});			
		},
		/**
		 * [setEventsLeft Sets left of each event]
		 * @param eventsDay [A day to set each event up]
		 */
		setEventsLeft: function(eventsDay){

			// Loop each event to compare if it's in between anothers in the same day and position
			$(eventsDay.children()).each(function(index){
				var keyEvent = $(this);
				var keyEventIndex = index;
				if(keyEventIndex === 0) return keyEvent.css({left : 0});

				var lastEvent;
				// Loop each event to compare with the above(key event)
				$(eventsDay.children()).each(function(index){
					if(keyEventIndex == index) return false;

					// If it's between any
					if (Schedule.isInBetween(keyEvent.position().top, this)) {
						//Save with which ones it is related
						lastEvent = $(this);
						
					} else{
						if(lastEvent) return false;
					}

				});

				if(lastEvent){
					var eventLeft = lastEvent.position().left + lastEvent.outerWidth();
					keyEvent.css({left : eventLeft});
				}

			});			
		},
		/**
		 * [getInBetweenRelated Finds the related events that a 'key event' is in between.]
		 * @param  eventsDay  [Same day as 'key event' to compare with others events]
		 * @param  eventTop   [Top position of a 'key event']
		 * @param  eventIndex [A 'key event' index]
		 * @return [Return the related events that a 'key event' is in between.]
		 */
		getInBetweenRelated: function(eventsDay, eventTop, eventIndex){
			var inBetween = [];
			// Loop each event to compare with the above(key event)
			$(eventsDay.children()).each(function(index){

				// Compare everything but none the 'key event'
				if (index != eventIndex) {
					// If it's between any
					if (Schedule.isInBetween(eventTop, this)) {
						//Save with which ones it is related
						inBetween.push(index);
					} 
				}

			});

			return inBetween;
		},
		/**
		 * [isInBetween Find if the top position of a 'key event' is between compareEvent]
		 * @param  keyEventTop  [The top position of a 'key event']
		 * @param  compareEvent [The event to compare positions]
		 * @return [True: 'key event' is between compareEvent. False: 'key event' is not between compareEvent]
		 */
		isInBetween: function(keyEventTop, compareEvent){
			// If keyEventTop is between compareEvent
			var eventBottom = $(compareEvent).position().top + $(compareEvent).height();
			if ((keyEventTop >= $(compareEvent).position().top) && (keyEventTop < eventBottom)) {
				return true;
			} else{
				return false;
			}
		}
	}

	Schedule.initialize();

})(jQuery);