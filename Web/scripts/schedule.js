function Schedule(opts, resourceGroups) {
	var options = opts;
	var groupDiv = $('#resourceGroups');
	var scheduleId = $('#scheduleId');

	this.init = function () {
		this.initUserDefaultSchedule();
		this.initRotateSchedule();
		this.initReservations();
		this.initResourceFilter();

		var reservations = $('#reservations');

		reservations.delegate('.clickres:not(.reserved)', 'mouseenter', function () {
			$(this).siblings('.resourcename').toggleClass('hilite');
			var ref = $(this).attr('ref');
			reservations.find('td[ref="' + ref + '"]').addClass('hilite');
		});

		reservations.delegate('.clickres:not(.reserved)', 'mouseleave', function () {
			$(this).siblings('.resourcename').removeClass('hilite');
			var ref = $(this).attr('ref');
			reservations.find('td[ref="' + ref + '"]').removeClass('hilite');
			$(this).removeClass('hilite');
		});

		reservations.delegate('td.clickres', 'mousedown', function () {
			$(this).addClass('clicked');
		});

		reservations.delegate('td.clickres', 'mouseup', function () {
			$(this).removeClass('clicked');
		});

		reservations.delegate('.reservable', 'click', function () {
			var sd = '';
			var ed = '';

			var start = $(this).attr('data-start');
			if (start)
			{
				sd = start;
			}
			var end = $(this).attr('data-end');
			if (end)
			{
				ed = end;
			}

			var link = $(this).attr('data-href');
			window.location = link + "&sd=" + sd + "&ed=" + ed;
		});

		this.initResources();
		this.initNavigation();

		var today = $("tr.today");
		if (today && today.length > 0)
		{
			$('html, body').animate({
				scrollTop: today.offset().top - 50
			}, 500);
		}
	};

	this.initResources = function () {
		$('.resourceNameSelector').each(function () {
			$(this).bindResourceDetails($(this).attr('resourceId'));
		});
	};

	this.initNavigation = function () {
		$('.schedule_drop').hover(
				function () {
					$("#schedule_list").show()
				},
				function () {
					$("#schedule_list").hide()
				}
		);

		var datePicker = $("#datepicker");
		var expandCalendar = readCookie('schedule_calendar_toggle');

		function collapse() {
			$('#calendar_toggle_img').attr("src", "img/calendar.png");
			createCookie('schedule_calendar_toggle', false, 30, opts.scriptUrl);
			datePicker.hide();
		}

		function expand() {
			$('#calendar_toggle_img').attr("src", "img/calendar-minus.png");
			createCookie('schedule_calendar_toggle', true, 30, opts.scriptUrl);
			datePicker.show();
		}

		if (expandCalendar == "true")
		{
			expand();
		}
		else
		{
			collapse();
		}

		$("#calendar_toggle").click(function (event) {
			event.preventDefault();

			if (datePicker.css("display") == "none")
			{
				expand();
			}
			else
			{
				collapse();
			}
		});
	};

	this.initUserDefaultSchedule = function () {
		var makeDefaultButton = $('#make_default');
		makeDefaultButton.show();

		var defaultSetMessage = $('#defaultSetMessage');
		makeDefaultButton.click(function (e) {
			e.preventDefault();
			var scheduleId = $('#scheduleId').val();
			var changeDefaultUrl = options.setDefaultScheduleUrl.replace("[scheduleId]", scheduleId);
			$.ajax({
				url: changeDefaultUrl,
				success: function (data) {
					defaultSetMessage.show().delay(5000).fadeOut();
				}
			});

		});
	};

	this.initRotateSchedule = function () {
		$('#schedule-actions .schedule-style').click(function (e) {
			e.preventDefault();
			createCookie(opts.cookieName, $(this).attr('schedule-display'), 30, opts.scriptUrl);
			window.location.reload();
		});
	};

	this.initReservations = function () {
		var reservations = $('#reservations');

		this.makeSlotsSelectable(reservations);

		$('td.reserved', reservations).each(function () {
			var resid = $(this).attr('resid');
			var pattern = 'td[resid="' + resid + '"]';

			$(this).hover(
					function () {
						$(pattern, reservations).addClass('hilite');
					},
					function () {
						$(pattern, reservations).removeClass('hilite');
					}
			);

			$(this).click(function () {
				var reservationUrl = options.reservationUrlTemplate.replace("[referenceNumber]", resid);
				window.location = reservationUrl;
			});

			$(this).qtip({
				position: {
					my: 'bottom left',
					at: 'top left',
					viewport: $(window),
					effect: false
				},
				content: {
					text: 'Loading...',
					ajax: {
						url: options.summaryPopupUrl,
						type: 'GET',
						data: {id: resid},
						dataType: 'html'
					}
				},
				show: {
					delay: 700,
					event: 'mouseenter'
				},
				style: {},
				hide: {
					fixed: true
				},
				overwrite: false
			});
		});
	};

	this.makeSlotsSelectable = function (reservationsElement) {
		var startHref = '';
		var startDate = '';
		var endDate = '';
		var href = '';
		var select = function (element) {
			href = element.attr('data-href');
			if (startHref == '')
			{
				startDate = element.attr('data-start');
				startHref = href;
			}
			endDate = element.attr('data-end');
		};

		reservationsElement.selectable({
			filter: 'td.reservable',
			distance: 20,
			start: function (event, ui) {
				startHref = '';
			},
			selecting: function (event, ui) {
				select($(ui.selecting));
			},
			unselecting: function (event, ui) {
				select($(ui.unselecting));
			},
			stop: function (event, ui) {
				if (href != '' && startDate != '' && endDate != '')
				{
					var start = moment(decodeURIComponent(startDate));
					var end = moment(decodeURIComponent(endDate));

					// the user dragged right to left
					if (end < start)
					{
						window.location = href + "&sd=" + endDate + "&ed=" + startDate;
					}
					else
					{
						window.location = href + "&sd=" + startDate + "&ed=" + endDate;
					}
				}
			}
		});
	};

	this.initResourceFilter = function () {
		$('#show_all_resources').click(function (e) {
			e.preventDefault();

			groupDiv.tree('selectNode', null);

			eraseCookie('resource_filter' + scheduleId.val());
			ShowAllResources(options);
		});

		$('#resourceIdFilter').change(function (e) {
			var resourceId = $(this).val();
			if (resourceId == '')
			{
				RedirectToSelf('', '', '', function (url) {
					groupDiv.tree('selectNode', null);
					return RemoveResourceId(url);
				});
			}
			else
			{
				ChangeResource(resourceId);
			}
		});

		groupDiv.tree({
			data: resourceGroups,
			saveState: 'tree' + options.scheduleId,

			onCreateLi: function (node, $li) {
				var span = $li.find('span');
				var itemName = span.text();
				var label = $('<label><input type="checkbox" name="resourceId[]"/> ' + itemName + '</label>');

				var checkbox = label.find('input');

				if (node.type == 'resource')
				{
					//$li.addClass('group-resource')
					checkbox.attr('resource-id', node.resource_id);
					checkbox.attr('group-id', node.group_id);
					checkbox.val(node.resource_id);
					if (opts.selectedResources.indexOf(parseInt(node.resource_id)) !== -1)
					{
						checkbox.attr('checked', true);
						groupDiv.tree("openNode", node.parent);
					}
					$li.find('span').html(label);
				}
			}

		});

		groupDiv.bind(
				'tree.select',
				function (event) {
					if (event.node)
					{
						var node = event.node;
						if (node.type == 'resource')
						{
							//ChangeResource(node.resource_id);
						}
						else
						{
							//ChangeGroup(node.id);
						}
					}
				});
	};
}

function ShowAllResources(opts) {
	eraseCookie('resource_filter' + $('#scheduleId').val(), opts.scriptUrl);
	RedirectToSelf("", "", "", function (url) {
		var x = RemoveGroupId(url);
		x = RemoveResourceId(x);
		return x;
	});
}

function RemoveResourceId(url) {
	if (!url)
	{
		url = window.location.href;
	}
	return url.replace(/&*rid=\d+/i, "");
}

function RemoveGroupId(url) {
	return url.replace(/&*gid=\d+/i, "");
}

function ChangeGroup(groupId) {
	RedirectToSelf('gid', /gid=\d+/i, "gid=" + groupId, RemoveResourceId);
}

function ChangeResource(resourceId) {
	RedirectToSelf('rid', /rid=\d+/i, "rid=" + resourceId, RemoveGroupId);
}
function dpDateChanged(dateText, inst) {
	ChangeDate(inst.selectedYear, inst.selectedMonth + 1, inst.selectedDay);
}

function ChangeDate(year, month, day) {
	RedirectToSelf("sd", /sd=\d{4}-\d{1,2}-\d{1,2}/i, "sd=" + year + "-" + month + "-" + day);
}

function ChangeSchedule(scheduleId) {
	RedirectToSelf("sid", /sid=\d+/i, "sid=" + scheduleId, function (url) {
		var x = RemoveGroupId(url);
		x = RemoveResourceId(x);
		return x;
	});
}

function RedirectToSelf(queryStringParam, regexMatch, substitution, preProcess) {
	var url = window.location.href;
	var newUrl = window.location.href;

	if (preProcess)
	{
		newUrl = preProcess(url);
		newUrl = newUrl.replace(/&{2,}/i, "");
	}

	if (newUrl.indexOf(queryStringParam + "=") != -1)
	{
		newUrl = newUrl.replace(regexMatch, substitution);
	}
	else if (newUrl.indexOf("?") != -1)
	{
		newUrl = newUrl + "&" + substitution;
	}
	else
	{
		newUrl = newUrl + "?" + substitution;
	}

	newUrl = newUrl.replace("#", "");

	window.location = newUrl;
}