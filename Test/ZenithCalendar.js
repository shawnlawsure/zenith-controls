var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Zenith;
(function (Zenith) {
    var Calendar = (function (_super) {
        __extends(Calendar, _super);
        function Calendar(baseDivElementId) {
                _super.call(this, baseDivElementId);
            this.SelectedDate = null;
            this.StartDate = new Date();
            this.DisplayOutputElementId = '';
            this.DisplayOutputFormat = 1;
            this.viewType = 0;
            this.viewYear = (new Date()).getFullYear();
            this.viewMonth = (new Date()).getMonth();
        }
        Calendar.DisplayDateFormat = {
            Long: 1,
            Short: 2
        };
        Calendar.ViewType = {
            Day: 0,
            Month: 1,
            Year: 2
        };
        Calendar.prototype.Build = function () {
            this.BuildInternal(Calendar.ViewType.Month, true);
        };
        Calendar.prototype.BuildInternal = function (viewType, firstTime) {
            if (typeof firstTime === "undefined") { firstTime = false; }
            var _this = this;
            this.viewType = viewType;
            this.Clear();
            var table = document.createElement('table');
            this.BaseElement.appendChild(table);
            table.className = 'ZenithCalendarTable';
            table.style.tableLayout = 'fixed';
            var tbody = document.createElement('tbody');
            table.appendChild(tbody);
            var row;
            var cell;
            var div;

            row = document.createElement('tr');
            tbody.appendChild(row);
            for(var index = 0; index < 9; index++) {
                cell = document.createElement('td');
                if(index == 0 || index == 8) {
                    cell.style.width = '0px';
                }
                cell.style.height = '0px';
                row.appendChild(cell);
            }
            row = document.createElement('tr');
            tbody.appendChild(row);
            row.className = 'ZenithCalendar_DateRows';
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
            switch(this.viewType) {
                case Calendar.ViewType.Year: {
                    cell.textContent = (this.viewYear - 6).toString() + ' - ' + (this.viewYear + 5).toString();
                    break;

                }
                case Calendar.ViewType.Month: {
                    cell.textContent = this.viewYear.toString();
                    break;

                }
                default: {
                    cell.textContent = DateHelper.MonthNames[this.viewMonth] + ', ' + this.viewYear.toString();
                    break;

                }
            }
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
            switch(this.viewType) {
                case Calendar.ViewType.Year: {
                    this.BuildYearView(tbody);
                    break;

                }
                case Calendar.ViewType.Month: {
                    this.BuildMonthView(tbody);
                    break;

                }
                default: {
                    this.BuildDayView(tbody);
                    break;

                }
            }
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
            if(firstTime && this.IsPopup()) {
                _super.prototype.SetPopup.call(this);
            }
            this.ParentElement = table;
            if(firstTime) {
                _super.prototype.Build.call(this);
            }
        };
        Calendar.prototype.BuildDayView = function (parentElement) {
            var _this = this;
            var row;
            var cell;

            row = document.createElement('tr');
            parentElement.appendChild(row);
            cell = document.createElement('td');
            row.appendChild(cell);
            cell.style.width = '0px';
            for(var index = 0; index < DateHelper.DayOfWeekShortNames.length; index++) {
                cell = document.createElement('td');
                row.appendChild(cell);
                cell.textContent = DateHelper.DayOfWeekShortNames[index];
                cell.className = 'ZenithCalendar_DayOfWeek';
                cell.style.textAlign = 'center';
            }
            cell = document.createElement('td');
            row.appendChild(cell);
            cell.style.width = '0px';
            var processDate = new Date(this.viewYear, this.viewMonth, 1);
            var daysInMonth = DateHelper.DaysInMonth(processDate.getMonth(), processDate.getFullYear());
            var day = 0;
            for(var rowIndex = 0; rowIndex < 6; rowIndex++) {
                row = document.createElement('tr');
                parentElement.appendChild(row);
                cell = document.createElement('td');
                row.appendChild(cell);
                cell.style.width = '0px';
                for(var dayOfWeekIndex = 0; dayOfWeekIndex < 7; dayOfWeekIndex++) {
                    if(day == 0 && processDate.getDay() == dayOfWeekIndex) {
                        day = 1;
                    } else {
                        if(day != -1 && day > daysInMonth) {
                            day = -1;
                        }
                    }
                    cell = document.createElement('td');
                    row.appendChild(cell);
                    if(day > 0) {
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
                cell = document.createElement('td');
                row.appendChild(cell);
                cell.style.width = '0px';
            }
        };
        Calendar.prototype.BuildMonthView = function (parentElement) {
            var _this = this;
            var row;
            var cell;

            for(var index = 0; index < 12; index++) {
                if(index % 3 == 0) {
                    if(index > 0) {
                        row = document.createElement('tr');
                        parentElement.appendChild(row);
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
            var row;
            var cell;

            var year = this.viewYear - 6;
            for(var index = 0; index < 12; index++ , year++) {
                if(index % 3 == 0) {
                    if(index > 0) {
                        row = document.createElement('tr');
                        parentElement.appendChild(row);
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
            switch(type) {
                case 'left': {
                    switch(this.viewType) {
                        case Calendar.ViewType.Day: {
                            if(this.viewMonth == 0) {
                                if(this.viewYear <= 1) {
                                    return;
                                }
                                this.viewMonth = 11;
                                this.viewYear--;
                            } else {
                                this.viewMonth--;
                            }
                            break;

                        }
                        case Calendar.ViewType.Month: {
                            if(this.viewYear <= 1) {
                                return;
                            }
                            this.viewYear--;
                            break;

                        }
                        case Calendar.ViewType.Year: {
                            if(this.viewYear <= 6) {
                                return;
                            }
                            this.viewYear -= 12;
                            break;

                        }
                    }
                    break;

                }
                case 'middle': {
                    switch(this.viewType) {
                        case Calendar.ViewType.Day: {
                            this.viewType = Calendar.ViewType.Month;
                            break;

                        }
                        case Calendar.ViewType.Month: {
                            this.viewType = Calendar.ViewType.Year;
                            break;

                        }
                    }
                    break;

                }
                case 'right': {
                    switch(this.viewType) {
                        case Calendar.ViewType.Day: {
                            if(this.viewMonth == 11) {
                                this.viewMonth = 0;
                                this.viewYear++;
                            } else {
                                this.viewMonth++;
                            }
                            break;

                        }
                        case Calendar.ViewType.Month: {
                            this.viewYear++;
                            break;

                        }
                        case Calendar.ViewType.Year: {
                            this.viewYear += 12;
                            break;

                        }
                    }
                    break;

                }
                case 'today': {
                    this.SelectedDate = new Date();
                    this.OutputDisplay();
                    _super.prototype.ExecuteEvent.call(this, Zenith.ZenithEvent.EventType.Selected, [
                        DateHelper.toShortDate(this.SelectedDate), 
                        this.GetDisplayDate()
                    ]);
                    if(this.IsPopup()) {
                        _super.prototype.Close.call(this);
                    }
                    break;

                }
                case 'day': {
                    this.SelectedDate = new Date(this.viewYear, this.viewMonth, Number((event.target).textContent));
                    this.OutputDisplay();
                    _super.prototype.ExecuteEvent.call(this, Zenith.ZenithEvent.EventType.Selected, [
                        DateHelper.toShortDate(this.SelectedDate), 
                        this.GetDisplayDate()
                    ]);
                    if(this.IsPopup()) {
                        _super.prototype.Close.call(this);
                    }
                    break;

                }
                case 'month': {
                    this.viewMonth = DateHelper.MonthShortNames.indexOf((event.target).textContent);
                    this.viewType = Calendar.ViewType.Day;
                    break;

                }
                case 'year': {
                    this.viewYear = Number((event.target).textContent);
                    this.viewType = Calendar.ViewType.Month;
                    break;

                }
            }
            this.BuildInternal(this.viewType);
        };
        Calendar.prototype.OutputDisplay = function () {
            _super.prototype.SetOutput.call(this, DateHelper.toShortDate(this.SelectedDate));
            if(this.DisplayOutputElementId && this.DisplayOutputElementId.length > 0) {
                _super.prototype.SetOutput.call(this, this.GetDisplayDate(), this.DisplayOutputElementId);
            }
        };
        Calendar.prototype.GetDisplayDate = function () {
            if(this.DisplayOutputFormat == Zenith.Calendar.DisplayDateFormat.Long) {
                return DateHelper.toLongDate(this.SelectedDate);
            } else {
                return DateHelper.toShortDisplayDate(this.SelectedDate);
            }
        };
        return Calendar;
    })(Zenith.ControlBase);
    Zenith.Calendar = Calendar;    
    var DateHelper = (function () {
        function DateHelper() { }
        DateHelper.MonthNames = [
            'January', 
            'February', 
            'March', 
            'April', 
            'May', 
            'June', 
            'July', 
            'August', 
            'September', 
            'October', 
            'November', 
            'December'
        ];
        DateHelper.MonthShortNames = [
            'Jan', 
            'Feb', 
            'Mar', 
            'Apr', 
            'May', 
            'Jun', 
            'Jul', 
            'Aug', 
            'Sep', 
            'Oct', 
            'Nov', 
            'Dec'
        ];
        DateHelper.DayOfWeekNames = [
            'Sunday', 
            'Monday', 
            'Tuesday', 
            'Wednesday', 
            'Thursday', 
            'Friday', 
            'Saturday'
        ];
        DateHelper.DayOfWeekShortNames = [
            'Su', 
            'Mo', 
            'Tu', 
            'We', 
            'Th', 
            'Fr', 
            'Sa'
        ];
        DateHelper.DaysInMonth = function DaysInMonth(iMonth, iYear) {
            return 32 - new Date(iYear, iMonth, 32).getDate();
        }
        DateHelper.toShortDate = function toShortDate(date) {
            if(!date) {
                return '';
            } else {
                return date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString() + '-' + date.getDate().toString();
            }
        }
        DateHelper.toLongDate = function toLongDate(date) {
            if(!date) {
                return '';
            } else {
                return DateHelper.MonthNames[date.getMonth()] + ' ' + date.getDate().toString() + ', ' + date.getFullYear().toString();
            }
        }
        DateHelper.toShortDisplayDate = function toShortDisplayDate(date) {
            if(!date) {
                return '';
            } else {
                return (date.getMonth() + 1).toString() + '/' + date.getDate().toString() + '/' + date.getFullYear().toString();
            }
        }
        DateHelper.formatJSONDate = function formatJSONDate(jsonDate) {
            if(!jsonDate) {
                return '';
            }
            var date = new Date(parseInt(jsonDate.substr(6, 13)));
        }
        DateHelper.formatJSONDateTime = function formatJSONDateTime(jsonDateTime) {
            if(!jsonDateTime) {
                return '';
            }
            var date = new Date(parseInt(jsonDateTime.substr(6, 13)));
            return Zenith.DateHelper.toShortDisplayDate(date) + ' ' + date.toLocaleTimeString();
        }
        DateHelper.translateJSONDate = function translateJSONDate(jsonDate) {
            if(!jsonDate) {
                return null;
            }
            return new Date(parseInt(jsonDate.substr(6, 13)));
        }
        DateHelper.daysBetweenDates = function daysBetweenDates(startDate, endDate) {
            return ((endDate.valueOf() - startDate.valueOf()) / (24 * 60 * 60 * 1000));
        }
        DateHelper.addDays = function addDays(date, days) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
        }
        DateHelper.addBusDays = function addBusDays(date, days) {
            var wks = Math.floor(days / 5);
            var dys = DateHelper.mod(days, 5);
            var dy = date.getDay();
            if(dy === 6 && dys > -1) {
                if(dys === 0) {
                    dys -= 2;
                    dy += 2;
                }
                dys++;
                dy -= 6;
            }
            if(dy === 0 && dys < 1) {
                if(dys === 0) {
                    dys += 2;
                    dy -= 2;
                }
                dys--;
                dy += 6;
            }
            if(dy + dys > 5) {
                dys += 2;
            }
            if(dy + dys < 1) {
                dys -= 2;
            }
            date.setDate(date.getDate() + wks * 7 + dys);
            return date;
        }
        DateHelper.businessDaysBetweenDates = function businessDaysBetweenDates(startDate, endDate) {
            var millisecondsPerDay = 86400 * 1000;
            startDate.setHours(0, 0, 0, 1);
            endDate.setHours(23, 59, 59, 999);
            var diff = endDate.valueOf() - startDate.valueOf();
            var days = Math.ceil(diff / millisecondsPerDay);
            var weeks = Math.floor(days / 7);
            var days = days - (weeks * 2);
            var startDay = startDate.getDay();
            var endDay = endDate.getDay();
            if(startDay - endDay > 1) {
                days = days - 2;
            }
            if(startDay == 0 && endDay != 6) {
                days = days - 1;
            }
            if(endDay == 6 && startDay != 0) {
                days = days - 1;
            }
            return days;
        }
        DateHelper.mod = function mod(num, val) {
            return ((num % val) + val) % val;
        }
        return DateHelper;
    })();
    Zenith.DateHelper = DateHelper;    
})(Zenith || (Zenith = {}));

