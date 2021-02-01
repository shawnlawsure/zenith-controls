/******************************************************************************************
* Developed by Shawn Lawsure - shawnl@maine.rr.com - http://www.linkedin.com/in/shawnlawsure
NOTE:  see ZenithControlBase.ts for documentation on the public members that are inherited by this control.
* Example of use:
var calendar = new Zenith.Calendar('baseElement');
calendar.StartDate = new Date(2012, 11, 01);
calendar.PopUpControlId = 'testPopup';
calendar.PopUpPosition = 'right';
calendar.PopUpDirection = 'down';
calendar.OutputElementId = 'output1';
calendar.DisplayOutputElementId = 'output2';
calendar.DisplayOutputFormat = 1;
calendar.addZenithEventListener(Zenith.ZenithEvent.EventType.Selected, function (value, text) { alert(text); });
calendar.addZenithEventListener(Zenith.ZenithEvent.EventType.Close, function () {  });
calendar.Build();
* CSS Class Names (hard-coded) - set these in your own CSS file:
> ZenithCalendarTable			: the parent table of the control (<table>).
> ZenithCalendar_DateRows		: the rows of the table (<tr>)
> ZenithCalendar_ArrowLeft		: the left arrow at the top (<div>)
> ZenithCalendar_TopDate		: the date at the top (<td>)
> ZenithCalendar_ArrowRight		: the right arrow at the top (<div>)
> ZenithCalendar_TodaysDate		: the date at the bottom (<td>)
> ZenithCalendar_DayOfWeek		: the day title; e.g. Su, Mo, etc. (<td>)
> ZenithCalendar_CalendarDay	: each day of the month (<td>)
> ZenithCalendar_CalendarMonths	: each month name (<td>)
> ZenithCalendar_CalendarYears	: each year (<td>)
******************************************************************************************/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='ZenithControlBase.ts'/>
var Zenith;
(function (Zenith) {
    var Calendar = (function (_super) {
        __extends(Calendar, _super);
        // ===============  Constructor  ====================================================
        function Calendar(baseDivElementId) {
            _super.call(this, baseDivElementId);
            // ===============  Public Attributes  =================================================
            // SelectedDate is the date selected.
            this.SelectedDate = null;
            // StartDate is the initial date that is selected when the control is first opened.
            this.StartDate = new Date();
            // DisplayOutputElementId is the id of an HTML element where the date will be displayed
            // once selected.
            this.DisplayOutputElementId = '';
            // DisplayOutputFormat takes a value of type DisplayDateFormat to indicate which
            // format to use when displaying the date in the HTML element identified by
            // DisplayOutputElementId.
            this.DisplayOutputFormat = 1;
            this.viewType = 0;
            this.viewYear = (new Date).getFullYear();
            this.viewMonth = (new Date).getMonth();
        }
        // ===============  Public Methods  ====================================================
        Calendar.prototype.Build = function () {
            this.BuildInternal(Calendar.ViewType.Month, true);
        };

        // ===============  Private Methods  ====================================================
        Calendar.prototype.BuildInternal = function (viewType, firstTime) {
            var _this = this;
            if (typeof firstTime === "undefined") { firstTime = false; }
            this.viewType = viewType;

            this.Clear();

            var table = document.createElement('table');
            this.BaseElement.appendChild(table);

            table.className = 'ZenithCalendarTable';
            table.style.tableLayout = 'fixed';

            var tbody = document.createElement('tbody');
            table.appendChild(tbody);

            var row, cell, div;

            // In order to maintain a consistent UI (size, etc.) across the different views we will create an empty row
            // with the max number of cells needed across all views (9).
            row = document.createElement('tr');
            tbody.appendChild(row);
            for (var index = 0; index < 9; index++) {
                cell = document.createElement('td');
                if (index == 0 || index == 8)
                    cell.style.width = '0px';
                cell.style.height = '0px';
                row.appendChild(cell);
            }

            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Top Row
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            row = document.createElement('tr');
            tbody.appendChild(row);
            row.className = 'ZenithCalendar_DateRows';

            // Left arrow
            cell = document.createElement('td');
            row.appendChild(cell);
            cell.colSpan = 2;
            cell.style.cursor = 'pointer';
            cell.align = 'middle';
            cell.vAlign = 'top';
            this.addEventListener(cell, 'click', function (event) {
                _this.ClickHandler('left');
            });
            var div = document.createElement('div');
            cell.appendChild(div);
            div.className = 'ZenithCalendar_ArrowLeft';

            // Middle date information
            cell = document.createElement('td');
            row.appendChild(cell);
            cell.colSpan = 5;
            cell.className = 'ZenithCalendar_TopDate';
            cell.vAlign = 'top';
            cell.style.cursor = 'pointer';
            cell.style.textAlign = 'center';
            this.addEventListener(cell, 'click', function (event) {
                _this.ClickHandler('middle');
            });
            switch (this.viewType) {
                case Calendar.ViewType.Year:
                    cell.textContent = (this.viewYear - 6).toString() + ' - ' + (this.viewYear + 5).toString();
                    break;

                case Calendar.ViewType.Month:
                    cell.textContent = this.viewYear.toString();
                    break;

                default:
                    cell.textContent = DateHelper.MonthNames[this.viewMonth] + ', ' + this.viewYear.toString();
                    break;
            }

            // Right arrow
            cell = document.createElement('td');
            row.appendChild(cell);
            cell.colSpan = 2;
            cell.style.cursor = 'pointer';
            cell.align = 'middle';
            cell.vAlign = 'top';
            this.addEventListener(cell, 'click', function (event) {
                _this.ClickHandler('right');
            });
            div = document.createElement('div');
            cell.appendChild(div);
            div.className = 'ZenithCalendar_ArrowRight';

            switch (this.viewType) {
                case Calendar.ViewType.Year:
                    this.BuildYearView(tbody);
                    break;

                case Calendar.ViewType.Month:
                    this.BuildMonthView(tbody);
                    break;

                default:
                    this.BuildDayView(tbody);
                    break;
            }

            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Today's date row.
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            row = document.createElement('tr');
            tbody.appendChild(row);
            row.className = 'ZenithCalendar_DateRows';

            cell = document.createElement('td');
            row.appendChild(cell);
            cell.colSpan = 9;
            cell.align = 'middle';
            cell.vAlign = 'bottom';
            cell.style.cursor = 'pointer';
            cell.className = 'ZenithCalendar_TodaysDate';
            this.addEventListener(cell, 'click', function (event) {
                _this.ClickHandler('today');
            });
            var today = new Date();
            cell.textContent = DateHelper.MonthNames[today.getMonth()] + ' ' + today.getDate() + ', ' + today.getFullYear();

            if (firstTime && this.IsPopup())
                _super.prototype.SetPopup.call(this);

            this.ParentElement = table;

            if (firstTime)
                _super.prototype.Build.call(this);
        };

        Calendar.prototype.BuildDayView = function (parentElement) {
            var _this = this;
            var row, cell;

            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Day of week header
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            row = document.createElement('tr');
            parentElement.appendChild(row);

            // Blank cell
            cell = document.createElement('td');
            row.appendChild(cell);
            cell.style.width = '0px';

            for (var index = 0; index < DateHelper.DayOfWeekShortNames.length; index++) {
                cell = document.createElement('td');
                row.appendChild(cell);
                cell.textContent = DateHelper.DayOfWeekShortNames[index];
                cell.className = 'ZenithCalendar_DayOfWeek';
                cell.style.textAlign = 'center';
            }

            // Blank
            cell = document.createElement('td');
            row.appendChild(cell);
            cell.style.width = '0px';

            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Days
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            var processDate = new Date(this.viewYear, this.viewMonth, 1);
            var daysInMonth = DateHelper.DaysInMonth(processDate.getMonth(), processDate.getFullYear());
            var day = 0;
            for (var rowIndex = 0; rowIndex < 6; rowIndex++) {
                row = document.createElement('tr');
                parentElement.appendChild(row);

                // Blank
                cell = document.createElement('td');
                row.appendChild(cell);
                cell.style.width = '0px';

                for (var dayOfWeekIndex = 0; dayOfWeekIndex < 7; dayOfWeekIndex++) {
                    if (day == 0 && processDate.getDay() == dayOfWeekIndex)
                        day = 1;
                    else if (day != -1 && day > daysInMonth)
                        day = -1;

                    cell = document.createElement('td');
                    row.appendChild(cell);
                    if (day > 0) {
                        cell.innerHTML = day.toString();
                        cell.style.cursor = 'pointer';
                        cell.className = 'ZenithCalendar_CalendarDay';
                        cell.style.textAlign = 'center';
                        this.addEventListener(cell, 'click', function (event) {
                            _this.ClickHandler('day', event);
                        });
                        day++;
                    }
                }

                // Blank
                cell = document.createElement('td');
                row.appendChild(cell);
                cell.style.width = '0px';
            }
        };

        Calendar.prototype.BuildMonthView = function (parentElement) {
            var _this = this;
            var row, cell;

            for (var index = 0; index < 12; index++) {
                if (index % 3 == 0) {
                    if (index > 0) {
                        row = document.createElement('tr');
                        parentElement.appendChild(row);

                        // Add one cell for size consistency.
                        cell = document.createElement('td');
                        row.appendChild(cell);
                        cell.style.width = '0px';
                    }

                    row = document.createElement('tr');
                    parentElement.appendChild(row);
                }

                cell = document.createElement('td');
                row.appendChild(cell);
                cell.colSpan = 3;
                cell.className = 'ZenithCalendar_CalendarMonths';
                cell.style.cursor = 'pointer';
                cell.style.textAlign = 'center';
                this.addEventListener(cell, 'click', function (event) {
                    _this.ClickHandler('month', event);
                });
                cell.textContent = DateHelper.MonthShortNames[index];
            }
        };

        Calendar.prototype.BuildYearView = function (parentElement) {
            var _this = this;
            var row, cell;
            var year = this.viewYear - 6;

            for (var index = 0; index < 12; index++, year++) {
                if (index % 3 == 0) {
                    if (index > 0) {
                        row = document.createElement('tr');
                        parentElement.appendChild(row);

                        // Add one cell for size consistency.
                        cell = document.createElement('td');
                        row.appendChild(cell);
                        cell.style.width = '0px';
                    }

                    row = document.createElement('tr');
                    parentElement.appendChild(row);
                }

                cell = document.createElement('td');
                row.appendChild(cell);
                cell.colSpan = 3;
                cell.className = 'ZenithCalendar_CalendarYears';
                cell.style.cursor = 'pointer';
                cell.style.textAlign = 'center';
                this.addEventListener(cell, 'click', function (event) {
                    _this.ClickHandler('year', event);
                });
                cell.textContent = year.toString();
            }
        };

        Calendar.prototype.ClickHandler = function (type, event) {
            switch (type) {
                case 'left':
                    switch (this.viewType) {
                        case Calendar.ViewType.Day:
                            if (this.viewMonth == 0) {
                                if (this.viewYear <= 1)
                                    return;
                                this.viewMonth = 11;
                                this.viewYear--;
                            } else
                                this.viewMonth--;
                            break;

                        case Calendar.ViewType.Month:
                            if (this.viewYear <= 1)
                                return;
                            this.viewYear--;

                            break;

                        case Calendar.ViewType.Year:
                            if (this.viewYear <= 6)
                                return;
                            this.viewYear -= 12;
                            break;
                    }

                    break;

                case 'middle':
                    switch (this.viewType) {
                        case Calendar.ViewType.Day:
                            this.viewType = Calendar.ViewType.Month;
                            break;

                        case Calendar.ViewType.Month:
                            this.viewType = Calendar.ViewType.Year;
                            break;
                    }
                    break;

                case 'right':
                    switch (this.viewType) {
                        case Calendar.ViewType.Day:
                            if (this.viewMonth == 11) {
                                this.viewMonth = 0;
                                this.viewYear++;
                            } else
                                this.viewMonth++;
                            break;

                        case Calendar.ViewType.Month:
                            this.viewYear++;
                            break;

                        case Calendar.ViewType.Year:
                            this.viewYear += 12;
                            break;
                    }

                    break;

                case 'today':
                    this.SelectedDate = new Date();
                    this.OutputDisplay();
                    _super.prototype.ExecuteEvent.call(this, Zenith.ZenithEvent.EventType.Selected, [DateHelper.toShortDate(this.SelectedDate), this.GetDisplayDate()]);
                    if (this.IsPopup())
                        _super.prototype.Close.call(this);
                    break;

                case 'day':
                    this.SelectedDate = new Date(this.viewYear, this.viewMonth, Number(event.target.textContent));
                    this.OutputDisplay();
                    _super.prototype.ExecuteEvent.call(this, Zenith.ZenithEvent.EventType.Selected, [DateHelper.toShortDate(this.SelectedDate), this.GetDisplayDate()]);
                    if (this.IsPopup())
                        _super.prototype.Close.call(this);
                    break;

                case 'month':
                    this.viewMonth = DateHelper.MonthShortNames.indexOf(event.target.textContent);
                    this.viewType = Calendar.ViewType.Day;
                    break;

                case 'year':
                    this.viewYear = Number(event.target.textContent);
                    this.viewType = Calendar.ViewType.Month;
                    break;
            }

            this.BuildInternal(this.viewType);
        };

        Calendar.prototype.OutputDisplay = function () {
            _super.prototype.SetOutput.call(this, DateHelper.toShortDate(this.SelectedDate));
            if (this.DisplayOutputElementId && this.DisplayOutputElementId.length > 0)
                _super.prototype.SetOutput.call(this, this.GetDisplayDate(), this.DisplayOutputElementId);
        };

        Calendar.prototype.GetDisplayDate = function () {
            if (this.DisplayOutputFormat == Zenith.Calendar.DisplayDateFormat.Long)
                return DateHelper.toLongDate(this.SelectedDate);
            else
                return DateHelper.toShortDisplayDate(this.SelectedDate);
        };
        Calendar.DisplayDateFormat = { Long: 1, Short: 2 };

        Calendar.ViewType = { Day: 0, Month: 1, Year: 2 };
        return Calendar;
    })(Zenith.ControlBase);
    Zenith.Calendar = Calendar;

    /********************************************************************************************************
    /*	Internal Date class
    /********************************************************************************************************/
    var DateHelper = (function () {
        function DateHelper() {
        }
        DateHelper.DaysInMonth = function (iMonth, iYear) {
            return 32 - new Date(iYear, iMonth, 32).getDate();
        };

        DateHelper.toShortDate = function (date) {
            return date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString() + '-' + date.getDate().toString();
        };

        DateHelper.toLongDate = function (date) {
            return this.MonthNames[date.getMonth()] + ' ' + date.getDate().toString() + ', ' + date.getFullYear().toString();
        };

        DateHelper.toShortDisplayDate = function (date) {
            return (date.getMonth() + 1).toString() + '/' + date.getDate().toString() + '/' + date.getFullYear().toString();
        };
        DateHelper.MonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        DateHelper.MonthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        DateHelper.DayOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        DateHelper.DayOfWeekShortNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        return DateHelper;
    })();
})(Zenith || (Zenith = {}));
