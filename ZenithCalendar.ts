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

///<reference path='ZenithControlBase.ts'/>

module Zenith
{
	export class Calendar extends Zenith.ControlBase
	{
		// ===============  Public Attributes  =================================================
		
		// SelectedDate is the date selected.
		public SelectedDate: Date = null;

		// StartDate is the initial date that is selected when the control is first opened.
		public StartDate: Date = new Date();

		// DisplayOutputElementId is the id of an HTML element where the date will be displayed
		// once selected.
		public DisplayOutputElementId: string = '';
		// DisplayDateFormat is an 'enum' for the format that the date should be displayed in 
		// the HTML element identified by DisplayOutputElementId.
		public static DisplayDateFormat = { Long: 1, Short: 2 };
		// DisplayOutputFormat takes a value of type DisplayDateFormat to indicate which
		// format to use when displaying the date in the HTML element identified by
		// DisplayOutputElementId.
		public DisplayOutputFormat: number = 1;

		// ===============  Private Attributes  ================================================
		private static ViewType = { Day: 0, Month: 1, Year: 2 };
		private viewType: number = 0;
		private viewYear: number = (new Date).getFullYear();
		private viewMonth: number = (new Date).getMonth();
		
		// ===============  Constructor  ====================================================
		constructor (baseDivElementId: string)
		{
			super(baseDivElementId);
		}

		// ===============  Public Methods  ====================================================

		public Build(): void
		{
			this.BuildInternal(Calendar.ViewType.Month, true);
		}

		// ===============  Private Methods  ====================================================

		private BuildInternal(viewType: number, firstTime: boolean = false): void
		{
			this.viewType = viewType;

            this.Clear();

            var table: HTMLTableElement = <HTMLTableElement>document.createElement('table');
            this.BaseElement.appendChild(table);

			table.className = 'ZenithCalendarTable';
			table.style.tableLayout = 'fixed';

			var tbody: HTMLElement = document.createElement('tbody');
			table.appendChild(tbody);

			var row: HTMLTableRowElement, cell: HTMLTableCellElement, div: HTMLDivElement;

			// In order to maintain a consistent UI (size, etc.) across the different views we will create an empty row
			// with the max number of cells needed across all views (9).
			row = <HTMLTableRowElement>document.createElement('tr');
			tbody.appendChild(row);
			for (var index = 0; index < 9; index++)
			{
				cell = <HTMLTableCellElement>document.createElement('td');
				if (index == 0 || index == 8)
					cell.style.width = '0px';
				cell.style.height = '0px';
				row.appendChild(cell);
			}

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// Top Row 
			/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			row = <HTMLTableRowElement>document.createElement('tr');
			tbody.appendChild(row);
			row.className = 'ZenithCalendar_DateRows';

			// Left arrow
			cell = <HTMLTableCellElement>document.createElement('td');
			row.appendChild(cell);
			cell.colSpan = 2;
			cell.style.cursor = 'pointer';
			cell.align = 'middle';
			cell.vAlign = 'top';
			this.addEventListener(cell, 'click', (event) => { this.ClickHandler('left'); });
			var div:HTMLDivElement = <HTMLDivElement>document.createElement('div');
			cell.appendChild(div);
			div.className = 'ZenithCalendar_ArrowLeft';

			// Middle date information
			cell = <HTMLTableCellElement>document.createElement('td');
			row.appendChild(cell);
			cell.colSpan = 5;
			cell.className = 'ZenithCalendar_TopDate';
			cell.vAlign = 'top';
			cell.style.cursor = 'pointer';
			cell.style.textAlign = 'center';
			this.addEventListener(cell, 'click', (event) => { this.ClickHandler('middle'); });
			switch (this.viewType)
			{
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
			cell = <HTMLTableCellElement>document.createElement('td');
			row.appendChild(cell);
			cell.colSpan = 2;
			cell.style.cursor = 'pointer';
			cell.align = 'middle';
			cell.vAlign = 'top';
			this.addEventListener(cell, 'click', (event) => { this.ClickHandler('right'); });
			div = <HTMLDivElement>document.createElement('div');
			cell.appendChild(div);
			div.className = 'ZenithCalendar_ArrowRight';

			// Main view
			switch (this.viewType)
			{
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
			row = <HTMLTableRowElement>document.createElement('tr');
			tbody.appendChild(row);
			row.className = 'ZenithCalendar_DateRows';

			cell = <HTMLTableCellElement>document.createElement('td');
			row.appendChild(cell);
			cell.colSpan = 9;
			cell.align = 'middle';
			cell.vAlign = 'bottom';
			cell.style.cursor = 'pointer';
			cell.className = 'ZenithCalendar_TodaysDate';
			this.addEventListener(cell, 'click', (event) => { this.ClickHandler('today'); });
			var today: Date = new Date();
			cell.textContent =  DateHelper.MonthNames[today.getMonth()] + ' ' + today.getDate() + ', ' + today.getFullYear();

			if (firstTime && this.IsPopup())
				super.SetPopup();

			this.ParentElement = table;

			if (firstTime)
				super.Build();
		}

		private BuildDayView(parentElement: HTMLElement): void
		{
			var row: HTMLTableRowElement, cell: HTMLTableCellElement;
			
			/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// Day of week header
			/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			row = <HTMLTableRowElement>document.createElement('tr');
			parentElement.appendChild(row);			
			
			// Blank cell
			cell = <HTMLTableCellElement>document.createElement('td');
			row.appendChild(cell);
			cell.style.width = '0px';

			for (var index: number = 0; index < DateHelper.DayOfWeekShortNames.length; index++)
			{
				cell = <HTMLTableCellElement>document.createElement('td');
				row.appendChild(cell);
				cell.textContent = DateHelper.DayOfWeekShortNames[index];
				cell.className = 'ZenithCalendar_DayOfWeek';
				cell.style.textAlign = 'center';
			}

			// Blank
			cell = <HTMLTableCellElement>document.createElement('td');
			row.appendChild(cell);
			cell.style.width = '0px';

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// Days
			/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var processDate: Date = new Date(this.viewYear, this.viewMonth, 1);
			var daysInMonth: number = DateHelper.DaysInMonth(processDate.getMonth(), processDate.getFullYear());
			var day: number = 0;
			for (var rowIndex: number = 0; rowIndex < 6; rowIndex++)
			{
				row = <HTMLTableRowElement>document.createElement('tr');
				parentElement.appendChild(row);

				// Blank
				cell = <HTMLTableCellElement>document.createElement('td');
				row.appendChild(cell);
				cell.style.width = '0px';

				for (var dayOfWeekIndex: number = 0; dayOfWeekIndex < 7; dayOfWeekIndex++)
				{
					if (day == 0 && processDate.getDay() == dayOfWeekIndex)
						day = 1;
					else if (day != -1 && day > daysInMonth)
						day = -1;

					cell = <HTMLTableCellElement>document.createElement('td');
					row.appendChild(cell);
					if (day > 0)
					{
						cell.innerHTML = day.toString();
						cell.style.cursor = 'pointer';
						cell.className = 'ZenithCalendar_CalendarDay';
						cell.style.textAlign = 'center';
						this.addEventListener(cell, 'click', (event) => { this.ClickHandler('day', event); });
						day++;
					}
				}

				// Blank
				cell = <HTMLTableCellElement>document.createElement('td');
				row.appendChild(cell);
				cell.style.width = '0px';
			}
		}

		private BuildMonthView(parentElement: HTMLElement): void
		{
			var row: HTMLTableRowElement, cell: HTMLTableCellElement;

			for (var index = 0; index < 12; index++)
			{
				if (index % 3 == 0)
				{
					if (index > 0)
					{
						row = <HTMLTableRowElement>document.createElement('tr');
						parentElement.appendChild(row);
						// Add one cell for size consistency.
						cell = <HTMLTableCellElement>document.createElement('td');
						row.appendChild(cell);
						cell.style.width = '0px';
					}

					row = <HTMLTableRowElement>document.createElement('tr');
					parentElement.appendChild(row);
				}

				cell = <HTMLTableCellElement>document.createElement('td');
				row.appendChild(cell);
				cell.colSpan = 3;
				cell.className = 'ZenithCalendar_CalendarMonths';
				cell.style.cursor = 'pointer';
				cell.style.textAlign = 'center';
				this.addEventListener(cell, 'click', (event) => { this.ClickHandler('month', event); });
				cell.textContent = DateHelper.MonthShortNames[index];
			}
		}

		private BuildYearView(parentElement: HTMLElement): void
		{
			var row: HTMLTableRowElement, cell: HTMLTableCellElement;
			var year: number = this.viewYear - 6;

			for (var index = 0; index < 12; index++, year++)
			{
				if (index % 3 == 0)
				{
					if (index > 0)
					{
						row = <HTMLTableRowElement>document.createElement('tr');
						parentElement.appendChild(row);
						// Add one cell for size consistency.
						cell = <HTMLTableCellElement>document.createElement('td');
						row.appendChild(cell);
						cell.style.width = '0px';
					}

					row = <HTMLTableRowElement>document.createElement('tr');
					parentElement.appendChild(row);
				}

				cell = <HTMLTableCellElement>document.createElement('td');
				row.appendChild(cell);
				cell.colSpan = 3;
				cell.className = 'ZenithCalendar_CalendarYears';
				cell.style.cursor = 'pointer';
				cell.style.textAlign = 'center';
				this.addEventListener(cell, 'click', (event) => { this.ClickHandler('year', event); });
				cell.textContent = year.toString();
			}
		}

		private ClickHandler(type: string, event?: Event): void
		{
			switch (type)
			{
				case 'left':

					switch (this.viewType)
					{
						case Calendar.ViewType.Day:

							if (this.viewMonth == 0)
							{
								if (this.viewYear <= 1)
									return;
								this.viewMonth = 11;
								this.viewYear--;
							}
							else
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

					switch (this.viewType)
					{
						case Calendar.ViewType.Day:
							this.viewType = Calendar.ViewType.Month;
							break;

						case Calendar.ViewType.Month:
							this.viewType = Calendar.ViewType.Year;
							break;
					}
					break;

				case 'right':

					switch (this.viewType)
					{
						case Calendar.ViewType.Day:

							if (this.viewMonth == 11)
							{
								this.viewMonth = 0;
								this.viewYear++;
							}
							else
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
					super.ExecuteEvent(ZenithEvent.EventType.Selected, [DateHelper.toShortDate(this.SelectedDate), this.GetDisplayDate()]);
					if (this.IsPopup())
						super.Close();
					break;

				case 'day':
					this.SelectedDate = new Date(this.viewYear, this.viewMonth, Number((<HTMLTableCellElement>event.target).textContent));
					this.OutputDisplay();
					super.ExecuteEvent(ZenithEvent.EventType.Selected, [DateHelper.toShortDate(this.SelectedDate), this.GetDisplayDate()]);
					if (this.IsPopup())
						super.Close();
					break;

				case 'month':
					this.viewMonth = DateHelper.MonthShortNames.indexOf((<HTMLTableCellElement>event.target).textContent);
					this.viewType = Calendar.ViewType.Day;
					break;

				case 'year':
					this.viewYear = Number((<HTMLTableCellElement>event.target).textContent);
					this.viewType = Calendar.ViewType.Month;
					break;
			}

			this.BuildInternal(this.viewType);
		}

		private OutputDisplay(): void
		{
			super.SetOutput(DateHelper.toShortDate(this.SelectedDate));
			if (this.DisplayOutputElementId && this.DisplayOutputElementId.length > 0)
				super.SetOutput(this.GetDisplayDate(), this.DisplayOutputElementId);
		}

		private GetDisplayDate()
		{
			if (this.DisplayOutputFormat == Zenith.Calendar.DisplayDateFormat.Long)
				return DateHelper.toLongDate(this.SelectedDate);
			else
				return DateHelper.toShortDisplayDate(this.SelectedDate);
		}
    }

	/********************************************************************************************************
	/*	Internal Date class
	/********************************************************************************************************/
	class DateHelper
	{
		public static MonthNames: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		public static MonthShortNames: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		public static DayOfWeekNames: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		public static DayOfWeekShortNames: string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
		
		public static DaysInMonth(iMonth, iYear): number
		{
			return 32 - new Date(iYear, iMonth, 32).getDate();
		}

		public static toShortDate(date: Date): string
		{
			return date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString() + '-' + date.getDate().toString();
		}

		public static toLongDate(date: Date): string
		{
			return this.MonthNames[date.getMonth()] + ' ' + date.getDate().toString() + ', ' + date.getFullYear().toString();
		}

		public static toShortDisplayDate(date: Date): string
		{
			return (date.getMonth() + 1).toString() + '/' + date.getDate().toString() + '/' + date.getFullYear().toString();
		}
	}

}

