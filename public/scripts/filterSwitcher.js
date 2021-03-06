/**
 * @author Joshua Eddy 159029448
 * @since 2018-04-22
 */

/**
 * Changes the type of filter that is dsiplayed on the search page.
 * 
 * @returns undefined
 */
function changeFilter() {

	var filter = document.getElementById("filter").value;
	document.getElementById("value").innerHTML = '';

	if (filter === 'Date') {

		var dateFilter = '';

		dateFilter += '		<div class="col-sm-3">';
		dateFilter += '			<div class="form-group">';
		dateFilter += '				<label for="from">From:</label>';
		dateFilter += '				<input class="form-control" type="date" id="from" name="from" />';
		dateFilter += '			</div>';
		dateFilter += '		</div>';
		dateFilter += '		<div class="col-sm-3 pull-right">';
		dateFilter += '			<div class="form-group">';
		dateFilter += '				<label for="to">To:</label>';
		dateFilter += '				<input class="form-control" type="date" id="to" name="to"/>';
		dateFilter += '			</div>';
		dateFilter += '		</div>';

		document.getElementById("value").innerHTML = dateFilter;

	} else if (filter === 'Popularity') {

		var popFilter = '';

		popFilter += '	<div class="col-sm-6 pull-right">';
		popFilter += '		<div class="form-group">';
		popFilter += '			<label for="minimum">Minimum:</label> ';
		popFilter += '			<input class="form-control" type="number" id="minimum" name="minimum" />';
		popFilter += '		</div>';
		popFilter += '	</div>';

		document.getElementById("value").innerHTML = popFilter;

	} else if (filter === 'Type') {

		var typeFilter = '';

		typeFilter += '	<div class="col-sm-6 pull-left">';
		typeFilter += '		<div class="form-group">';
		typeFilter += '			<label for="minimum">Type:</label> ';
		typeFilter += '			<select class="form-control" id="type" name="type">';
		typeFilter += '				<option>sport</option>';
		typeFilter += '				<option>culture</option>';
		typeFilter += '				<option>other</option>';
		typeFilter += '			</select>';
		typeFilter += '		</div>';
		typeFilter += '	</div>';

		document.getElementById("value").innerHTML = typeFilter;

	}
}

/**
 * Validates the filter values that the user has selected.
 * 
 * @returns
 */
function validateFilter() {

	var filter = document.getElementById("filter").value;

	// If its a date filter chack that the 'from' and 'to' dates are not the
	// wrong way around.
	if (filter === 'Date') {

		var from = document.getElementById("from").value;
		var to = document.getElementById("to").value;

		if (from !== "" && to !== "") {

			var fromDate = new Date(from);
			var toDate = new Date(to);

			if (fromDate.getTime() > toDate.getTime()) {
				alert("'From' must be before or the same as 'To'.");
				return false;
			}
		}

		return true;

	}
	// If its a popularity filter chack the popularity is not less than zero.
	else if (filter === 'Popularity') {

		var min = document.getElementById("minimum").value;

		if (min !== "" && min < 0) {

			alert("'Minimum' popularity is zero, the value must be higher than zero.");
			return false;

		}

		return true;

	}
	// If its not a type filter then its invalid.
	else if (filter !== 'Type') {
		alert("Invalid filter value");
		return false;

	} else {

		// No need to check type filter because it has a value automatically.
		return true;
	}

}