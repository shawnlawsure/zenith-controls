/******************************************************************************************
 * Developed by Shawn Lawsure - shawnl@maine.rr.com - http://www.linkedin.com/in/shawnlawsure

 * The Grid class supports the following functionality:
        -> Use JSON object as the data source.
        -> Row selection.
        -> Row identifier (i.e. data key name).
        -> Sorting by clicking on the column header (not applicable when grouping).
        -> Alternate row display.
        -> Scroll bars.
        -> Group/display by a given group field (see below).

 * Future potential enhancements:
        -> Paging
        -> Fixed-header when scrolling.

 * Example of use:

            // Use the following JSON object as the data source.
            var testData = [
                { "Id": 22, "make": "Honda", "model": "CR-V", "year": "1998" },
                { "Id": 23, "make": "Toyota", "model": "Sienna", "year": "2005" },
                { "Id": 24, "make": "Nissan", "model": "Sentra", "year": "2001" },
                { "Id": 25, "make": "Toyota", "model": "Corolla", "year": "2011" },
                { "Id": 26, "make": "Ford", "model": "Focus", "year": "2008" },
                { "Id": 27, "make": "Dodge", "model": "Charger", "year": "2004" },
                { "Id": 28, "make": "Ford", "model": "Fiesta", "year": "2013" },
                { "Id": 29, "make": "Toyota", "model": "Camry", "year": "2008" },
                { "Id": 30, "make": "Dodge", "model": "Durango", "year": "2004"}];

            // Call the constructor.            
            var myGrid = new Zenith.Grid('baseElement', testData);
not as much as one would think.
            // Now, set the rest of the public properties on the Grid object as necessary before
            // calling the Build function.

            myGrid.BindFields =
                [
                    { "FieldName": "make", "Header": "Make", "Width": 150 },
                    { "FieldName": "model", "Header": "Model", "Width": 150 },
                    { "FieldName": "year", "Header": "Year", "Width": 50 },
                    { "ActionText": "Details", "Action": function (dataRow){}, "Header":"Details", "Width":150, "DoubleClick": false }
                ];
            myGrid.DataKeyName = 'Id';

            myGrid.PopUpControlId = 'testPopup';
            myGrid.PopUpPosition = 'right';
            myGrid.PopUpDirection = 'down';

            myGrid.IsSelectable = true;
            myGrid.IsSortable = true;
            myGrid.GroupedByKeyName = 'make';
            myGrid.GroupExpandImage = true;
            myGrid.MaximumHeight = 100;
            myGrid.OutputElementId = 'output1';

            myGrid.addZenithEventListener(Zenith.ZenithEvent.EventType.Selected, function (row, rowValue, rowIndex) { alert('rowValue = ' + rowValue + ' : rowIndex = ' + rowIndex); });

            myGrid.Build();

            myGrid.ParentElement.className = 'gridJS';


		* CSS Class Names (hard-coded) - set these in your own CSS file:

			> ZenithGridTable
			> ZenithGrid_HeaderRow
			> ZenithGrid_SelectedRow
			> ZenithGrid_AltRow 
			> ZenithGrid_GroupRow
			> ZenithGrid_PagingFooter
			> ZenithGrid_PagingControls
			> ZenithGrid_PagingControlsDisabled
            > ZenithGrid_FilterRow

    });
******************************************************************************************/

///<reference path='ZenithControlBase.ts'/>

module Zenith
{
	export class Grid extends Zenith.ControlBase
	{
        // ===============  Public Attributes  ==================================================

		// DataSource is the JSON object that will act as the data source.  This is required.
		private DataSource: Array<any>;
        private origDataSource: Array<any>;

		// The BindFields property is required and must contain FieldName and Header values for each
		// column you want displayed in the grid where FieldName is the corresponding field in
		// the JSON object data source (above) and Header is the title you want displayed as the 
		// column header for that column.  The Width field is not necessary but it helps to lineup 
		// the columns when grouping rows (see below).
		public BindFields: Array<any>;

		// The dataKeyName property is the name of the field in the JSON object that contains the
		// identifying key for each row in the data source (e.g. primary key value).  This is
		// required if you want to be able to get the key for the selected row.
		public DataKeyName: string = '';

		// IsSelectable indicates that the user can select a row.  The row will be highlighted and
		// the 'selected' attribute will be set for that row.  Default is true;
		public IsSelectable: boolean = true;

		// IsSortable indicates that the rows can be sorted by clicking on the column headers (both
		// ascending and descending).  This is not applicable when grouping by rows (see below). 
		// Default is true.
        public IsSortable: boolean = true;
        public DefaultSortField: string = '';
        public DefaultSortOrder: string = '';
		public Paging: boolean = false;
		public RowsPerPage: number = 10;
        public MaxPages: number = 10;
        public Filters: boolean = false;

		// Set the GroupedByKeyName to have the grid be grouped by the given JSON object field from
		// the data source and allow the user to show and collapse the grouped rows.  When first
		// displaying the screen only the unique values for the GroupedByKeyName field will be
		// shown in the grid.  When the user clicks on one of these rows the grouped rows will be
		// displayed below the clicked row.
		public GroupedByKeyName: string = '';

		// When grouping set the GroupExpandImage to true if you want to display an collapse/expand image.
		public GroupExpandImage: boolean = false;
		public ExpandImage: string = '';
		public CollapseImage: string = '';

        // ===============  Private Attributes  ==================================================
        private sortOrder: string = '';
        private sortName: string = '';
		private groupedFieldCellIndex: number = 0;
		private pagingStartPage: number = 1;
		private pagingCurrentPage: number = 1;

        public SetMinWidth: boolean = false;

        // ===============  Constructor  =========================================================
        constructor (baseDivElementId: string, dataSource: Array<any>)
        {
        	super(baseDivElementId);
            this.DataSource = dataSource;

            // A copy of the original data needed for filtering.
            this.origDataSource = new Array<any>();
			if (this.DataSource && this.origDataSource)
				this.DataSource.forEach((value, index) => { this.origDataSource.push(value); });
        }

        // ===============  Public Methods  ====================================================

        public Build(filterList: Array<string> = null): void
        {
            this.Clear();

            if (filterList)
            {
                delete this.DataSource;
                this.DataSource = new Array<any>();
				if (this.DataSource && this.origDataSource)
					this.origDataSource.forEach((value, index) => { this.DataSource.push(value); });
                filterList.forEach((filterValue, item) =>
                {
                    for (var filterKey in <any>filterValue)
                    {
                        if (filterKey != 'dataType' && filterValue[filterKey] && filterValue[filterKey].trim().length > 0)
                        {
                            this.DataSource = this.DataSource.filter((element: any, elementIndex: number) =>
                            {
                                for (var dataKey in element)
                                {
                                    if (dataKey == filterKey)
                                    {
                                        if (element[dataKey]) 
                                        {
                                            if (filterValue['dataType'] && filterValue['dataType'].toUpperCase().indexOf('DATE') >= 0) 
                                            {
                                                var filterDate: Date = Zenith.DateHelper.ConvertStringToDate(filterValue[filterKey]);
                                                if (!DateHelper.isValidDate(filterDate))
                                                    return false;
                                                var dataDate: Date = Zenith.DateHelper.ConvertStringToDate(element[dataKey]);
                                                if (DateHelper.isValidDate(dataDate))
                                                    return filterDate >= dataDate && filterDate <= dataDate;
                                            }
                                            else
                                                return (<string>(element[dataKey].toString())).toLowerCase().indexOf(filterValue[filterKey].toLowerCase()) >= 0;
                                        }
                                        else
                                            return false;
                                    }
                                }
                            });
                        }
                    }
                });
            }

            /*var offscreendiv = document.createElement('div');
            offscreendiv.style.position = 'absolute';
            offscreendiv.style.left = '-100000px';
            offscreendiv.style.width = '90000px';
            var offscreenTable = document.createElement('table');
            offscreenTable.className = 'list';
            var offscreen = document.createElement('tr');
            offscreendiv.appendChild(offscreenTable);
            offscreenTable.appendChild(offscreen);
            var widths = [];
            var maxwidth = 0;
            document.body.appendChild(offscreendiv);*/

			var isGrouped: boolean = this.GroupedByKeyName && this.GroupedByKeyName.length > 0;

            if (isGrouped)
                Zenith_SortObjectsByKey(this.DataSource, this.GroupedByKeyName, "asc");
            else if (this.IsSortable)
            {
                if (this.sortName == '')
                    this.sortName = this.DefaultSortField;
                if (this.sortOrder == '')
                    this.sortOrder = this.DefaultSortOrder == '' ? 'asc' : this.DefaultSortOrder;

                if (this.sortName.length > 0)
                {
                    var sortFieldDataType: string = '';
                    for (var key in this.BindFields)
                        if (this.BindFields[key].FieldName == this.sortName)
                            if (this.BindFields[key].DataType)
                                sortFieldDataType = this.BindFields[key].DataType;
                    Zenith_SortObjectsByKey(this.DataSource, this.sortName, this.sortOrder, sortFieldDataType);
                }
            }

			var th: HTMLTableHeaderCellElement, td: HTMLTableCellElement, trow: HTMLTableRowElement;

            var table: HTMLTableElement = <HTMLTableElement>document.createElement('table');
            this.BaseElement.appendChild(table);
            table.className = 'ZenithGridTable';

            this.ParentElement = table;

			var thead: HTMLElement = document.createElement('thead');
            table.appendChild(thead);
			
			//==============================================================================================
			// Header row
			//==============================================================================================
			var headerRow: HTMLTableRowElement = <HTMLTableRowElement>document.createElement('tr');
            thead.appendChild(headerRow);
			thead.className = 'ZenithGrid_HeaderRow';
            //offscreen.className = "headerRow";
			// Collapse/expand column for grouping
			if (this.GroupExpandImage)
			{
				th = <HTMLTableHeaderCellElement>document.createElement('th');
				headerRow.appendChild(th);
				th.style.width = '17px';
			}

            //==============================================================================================
            // Filter row - we will create the filter input fields in the field loop below.
            //==============================================================================================
            var filterRow: HTMLTableRowElement = null;
            if (this.Filters)
            {
                filterRow = <HTMLTableRowElement>document.createElement('tr');
                super.addEventListener(filterRow, 'keydown', (event) => 
                { 
                    if ((<KeyboardEvent>event).keyCode == 13)
                    {
                        var filterList: Array<any> = new Array<any>();
                        for (var key in this.BindFields) 
                        {
                            if (!this.BindFields[key].Hidden)
                            {
                                for (var index = 0; index < filterRow.childElementCount; index++)
                                {
                                    if ((<HTMLTableCellElement>filterRow.childNodes[index]).getAttribute('key') == key)
                                    {
                                        var obj: Object = new Object();
                                        obj[this.BindFields[key].FieldName] = (<HTMLInputElement>filterRow.childNodes[index].childNodes[0]).value.trim();
                                        obj['dataType'] = this.BindFields[key].DataType;
                                        filterList.push(obj);
                                    }
                                }
                            }
                        }     
                        this.Build(filterList);
						(<KeyboardEvent>event).preventDefault();
						return false;
                    }
                });
            }

			for (var key in this.BindFields)
			{
                var fieldName: string = this.BindFields[key].FieldName;
                var ActionText: string = this.BindFields[key].ActionText;
				if (fieldName) 
                {
				    th = <HTMLTableHeaderCellElement>document.createElement('th');
                    th.id = fieldName;
				    //th.className = "zen-deemphasize";
				    th.innerHTML = this.BindFields[key].Header;
				    if (this.IsSortable)
				        th.style.cursor = 'pointer';
				    if (fieldName == this.DataKeyName || this.BindFields[key].Hidden)
				        th.style.display = 'none';
				    else 
                    {
				        if (this.IsSortable && !isGrouped)
                        {
                            super.addEventListener(th, 'click', (event: Event) =>
                            {
                                //if (this.sortName != (<HTMLElement>event.currentTarget).id)
                                if (this.sortName != super.getEventTarget(event).id)
                                    this.sortOrder = 'asc';
                                else
                                    this.sortOrder = this.sortOrder == 'asc' ? 'desc' : 'asc';
                                //this.sortName = (<HTMLElement>event.currentTarget).id;
                                this.sortName = super.getEventTarget(event).id;
                                this.Build();
                            });
                        }

                        //-------------- Filter ------------------------
                        //if (filterRow && (!this.BindFields[key].DataType || this.BindFields[key].DataType.toUpperCase().indexOf('DATE') < 0))
                        if (filterRow)
                        {
                            var filterTD = <HTMLTableHeaderCellElement>document.createElement('td');
                            filterRow.appendChild(filterTD);
                            var filterInput: HTMLInputElement = <HTMLInputElement>document.createElement('input');
                            filterInput.className = 'ZenithGrid_FilterInput';
                            if (filterList) 
                                filterInput.value = filterList[filterTD.cellIndex][this.BindFields[key].FieldName];
                            filterTD.appendChild(filterInput);
                            filterTD.setAttribute('key', key);
                            filterTD.style.textAlign = 'center';
                        }

				        if (this.BindFields[key].Width)
                            th.style.width = this.BindFields[key].Width + "px";
                    }
                    /*offscreen.appendChild(th);
                    if (!(widths[key] >= offscreenTable.clientWidth)) 
                        widths[key] = offscreenTable.clientWidth;
				    offscreen.removeChild(th);*/
                    headerRow.appendChild(th);			    
				} 
                else if (ActionText)
                {
                    th = <HTMLTableHeaderCellElement>document.createElement('th');
                    th.id = fieldName;
                    th.className = "actionColumn";
                    th.innerHTML = this.BindFields[key].Header;
                    if (fieldName == this.DataKeyName || this.BindFields[key].Hidden)
                        th.style.display = 'none';
                    if (this.BindFields[key].Width)
                        th.style.width = this.BindFields[key].Width + "px";

                    /*offscreen.appendChild(th);
                    if (!(widths[key] >= offscreenTable.clientWidth)) 
                        widths[key] = offscreenTable.clientWidth;
                    offscreen.removeChild(th);*/
                    headerRow.appendChild(th);
				}
			}

            /*offscreen.appendChild(headerRow);
            if (headerRow.clientWidth > maxwidth)
                maxwidth = headerRow.clientWidth;
            offscreen.removeChild(headerRow);*/
            thead.appendChild(headerRow);

			//==============================================================================================
			// Body
			//==============================================================================================
			var tbody: HTMLElement = document.createElement('tbody');
            table.appendChild(tbody);
            //offscreen.className = "dataRow";

            if (filterRow)
                tbody.appendChild(filterRow);

			var currenttbody: HTMLElement;
			var groupRowIndex: number = 0;
			var inGroup: boolean = false;
			var numColumns: number = 0;
			var startIndex: number = this.Paging ? (this.pagingCurrentPage - 1) * this.RowsPerPage : 0;
			for (var index = startIndex; this.Paging ? index < startIndex + this.RowsPerPage && index < this.DataSource.length : index < this.DataSource.length; index++)
			{
				// The following logic is used when grouping rows.
				if (isGrouped)
				{
					if (index == 0 || this.DataSource[index - 1][this.GroupedByKeyName].toUpperCase() != this.DataSource[index][this.GroupedByKeyName].toUpperCase())
					{
						groupRowIndex++;

						currenttbody = document.createElement('tbody');
						table.appendChild(currenttbody);

						if (index == this.DataSource.length - 1 || this.DataSource[index][this.GroupedByKeyName].toUpperCase() != this.DataSource[index + 1][this.GroupedByKeyName].toUpperCase())
							inGroup = false;
						else
						{
							inGroup = true;
                            var groupRow: HTMLTableRowElement = <HTMLTableRowElement>document.createElement('tr');
						    ((row: HTMLTableRowElement, data, fields) => 
                            {
                                super.addEventListener(row, 'dblclick', () =>
                                {
                                    for (var key in fields) 
                                    {
                                        var action = fields[key].Action;
                                        var dblclick = fields[key].DoubleClick;
                                        if (action && (dblclick || dblclick === undefined)) 
                                            action(data);
                                    }
                                });
						    })(groupRow, this.DataSource[index], this.BindFields);
							groupRow.setAttribute('groupRow', 'true');
							currenttbody.appendChild(groupRow);
                            super.addEventListener(groupRow, 'click', (event: Event) => 
                            {
                                if (super.getEventTarget(event) instanceof HTMLTableRowElement) 
                                {
                                    var groupRow: HTMLTableRowElement = <HTMLTableRowElement>super.getEventTarget(event);
                                    var expand: boolean = true;
                                    if (groupRow.parentElement && groupRow.parentElement.nextSibling) {
                                        var nextBody: HTMLTableElement = <HTMLTableElement>groupRow.parentElement.nextSibling;
                                        if (nextBody) {
                                            if (nextBody.style.display == 'none') 
                                            {
                                                expand = true;
                                                nextBody.style.display = '';
                                            }
                                            else 
                                            {
                                                expand = false;
                                                nextBody.style.display = 'none';
                                            }
                                            groupRow.setAttribute('expanded', expand ? 'true' : 'false');
                                            this.SetRowClass();
                                        }
                                    }
                                    if (this.GroupExpandImage) {
                                        var images: NodeList = groupRow.cells[0].getElementsByTagName('img');
                                        if (expand) 
                                        {
                                            (<HTMLImageElement>images[1]).style.display = 'inline';
                                            (<HTMLImageElement>images[0]).style.display = 'none';
                                        }
                                        else 
                                        {
                                            (<HTMLImageElement>images[1]).style.display = 'none';
                                            (<HTMLImageElement>images[0]).style.display = 'inline';
                                        }
                                    }
                                }
                            });
							groupRow.tabIndex = groupRowIndex;

							if (this.GroupExpandImage)
							{
								td = <HTMLTableCellElement>document.createElement('td');
								groupRow.appendChild(td);
								td.style.width = '17px'

								var expandImage: HTMLImageElement = <HTMLImageElement>document.createElement('img');
								td.appendChild(expandImage);
								expandImage.src = this.ExpandImage;

								var collapseImage: HTMLImageElement = <HTMLImageElement>document.createElement('img');
								td.appendChild(collapseImage);
								collapseImage.src = this.CollapseImage;
								collapseImage.style.display = 'none';
							}
							groupRow.style.cursor = 'pointer';

							for (var key in this.BindFields)
							{
                                var fieldName: string = this.BindFields[key].FieldName;
                                var ActionText: string = this.BindFields[key].ActionText;
								if (fieldName)
								{
									td = <HTMLTableCellElement>document.createElement('td');
									if (fieldName == this.GroupedByKeyName)
									{
                                        td.innerHTML = this.DataSource[index][fieldName];
										if (this.BindFields[key].Width)
                                            td.style.width = this.BindFields[key].Width + "px";
									}

									if (fieldName == this.DataKeyName || this.BindFields[key].Hidden)
                                        td.style.display = 'none';


                                    /*offscreen.appendChild(td);
                                    if (!(widths[key] >= offscreenTable.clientWidth))
                                        widths[key] = offscreenTable.clientWidth;
                                    offscreen.removeChild(td);*/
                                    groupRow.appendChild(td);
                                } 
                                else if (ActionText) 
                                {
								    ((row, field, data) => 
                                    {
                                        var td = <HTMLTableCellElement>document.createElement('td');
                                        var btn = <HTMLInputElement>document.createElement('input');
                                        btn.type = 'button';
                                        btn.value = field.ActionText;
                                        super.addEventListener(btn, 'click', () => field.Action(data));
                                        if (fieldName == this.DataKeyName || field.Hidden)
                                            td.style.display = 'none';
                                        if (this.BindFields[key].Width)
                                            td.style.width = this.BindFields[key].Width + "px";
                                        td.appendChild(btn);

                                        /*offscreen.appendChild(td);
                                        if (!(widths[key] >= offscreenTable.clientWidth))
                                            widths[key] = offscreenTable.clientWidth;
                                        offscreen.removeChild(td);*/
                                        row.appendChild(td);
                                    })(groupRow, this.BindFields[key], this.DataSource[index]);
                                    
                                    
								}
							}

							currenttbody = <HTMLElement>document.createElement('tbody');
							table.appendChild(currenttbody);
							currenttbody.style.display = "none";
						}
					}
				}
				else if (currenttbody == null)
				{
					currenttbody = <HTMLElement>document.createElement('tbody');
					table.appendChild(currenttbody);
				}

				// Item row
                trow = <HTMLTableRowElement>document.createElement('tr');
                ((row: HTMLTableRowElement, data, fields) => {
                    super.addEventListener(row, 'dblclick', () =>
                    {
                        for (var key in fields) 
                        {
                            var action = fields[key].Action;
                            var dblclick = fields[key].DoubleClick;
                            if (action && (dblclick || dblclick === undefined))
                                action(data);
                        }
                    });
                })(trow, this.DataSource[index], this.BindFields);
			    currenttbody.appendChild(trow);
				trow.tabIndex = groupRowIndex;
				if (inGroup)
					trow.setAttribute('inGroup', 'true');

				if (this.GroupExpandImage)
				{
					td = <HTMLTableCellElement>document.createElement('td');
					trow.appendChild(td);
					td.style.width = '17px';
				}

				for (var key in this.BindFields)
				{
                    var fieldName: string = this.BindFields[key].FieldName;
                    var ActionText: string = this.BindFields[key].ActionText;
					if (fieldName)
					{
                        td = <HTMLTableCellElement>document.createElement('td');
					    //td.className = 'dataCell';
						td.id = fieldName;
                        if (this.BindFields[key].DataType && this.BindFields[key].DataType.toUpperCase().indexOf('SHORTDATE') >= 0)
                            td.innerHTML = this.DataSource[index][fieldName] ? DateHelper.toShortDisplayDateS(this.DataSource[index][fieldName]) : '';
                        else
                            td.innerHTML = this.DataSource[index][fieldName] ? this.DataSource[index][fieldName] : '';

						if (fieldName == this.DataKeyName || this.BindFields[key].Hidden)
							td.style.display = 'none';
						else 
						{
							numColumns++;
							if (this.BindFields[key].Width)
								td.style.width = this.BindFields[key].Width + "px";
                        }

                        /*offscreen.appendChild(td);
                        if (!(widths[key] >= offscreenTable.clientWidth))
                            widths[key] = offscreenTable.clientWidth;
                        offscreen.removeChild(td);*/
                        trow.appendChild(td);
                    } 
                    else if (ActionText)
                     {
                        ((row, field, data) => 
                        {
                            var td = <HTMLTableCellElement>document.createElement('td');
                            td.className = 'actionColumn';
                            var btn = <HTMLInputElement>document.createElement('input');
                            btn.type = 'button';
                            btn.value = field.ActionText;
                            super.addEventListener(btn, 'click', () => field.Action(data));
                            if (fieldName == this.DataKeyName || field.Hidden)
                                td.style.display = 'none';
                            td.appendChild(btn);

                            /*offscreen.appendChild(td);
                            if (!(widths[key] >= offscreenTable.clientWidth))
                                widths[key] = offscreenTable.clientWidth;
                            offscreen.removeChild(td);*/
                            row.appendChild(td);
                        })(trow, this.BindFields[key], this.DataSource[index]);
                    }
				}

				if (this.IsSelectable) 
				{
				    ((data) => 
					{
				        super.addEventListener(trow, 'click', (event: Event) => { this.selectedEventHandler(event,data); });
				    })(this.DataSource[index]);
					trow.style.cursor = 'pointer';

					if (this.DataKeyName.length > 0)
						trow.setAttribute('keyValue', this.DataSource[index][this.DataKeyName]);
                }
                /*offscreen.appendChild(trow);
                if (trow.offsetWidth > maxwidth)
                    maxwidth = trow.clientWidth;
                offscreen.removeChild(trow);*/
                currenttbody.appendChild(trow);
			}

            // Paging (footer)
            var numberOfPages: number = Math.ceil(this.DataSource.length / this.RowsPerPage);
            if (this.Paging && numberOfPages > 1)
            {
                var tFoot = <HTMLTableSectionElement>document.createElement('tfoot');
                table.appendChild(tFoot);

                var tRow = <HTMLTableRowElement>document.createElement('tr');
                tFoot.appendChild(tRow);

                var td = <HTMLTableCellElement>document.createElement('td');
                tRow.appendChild(td);
                td.className = 'ZenithGrid_PagingFooter';
                td.colSpan = numColumns;

                var maxPages = Math.min(numberOfPages, this.MaxPages);

                // Previous page
                var label = <HTMLLabelElement>document.createElement('label');
                td.appendChild(label);
                label.innerHTML = "< Previous";
                if (this.pagingCurrentPage <= 1)
                    label.disabled = true;
                else
                {
                    label.style.cursor = 'pointer';
                    super.addEventListener(label, 'click', (event: Event) =>
                    {
                        this.pagingCurrentPage--;
                        //if (this.pagingCurrentPage < this.pagingStartPage)
                        //    this.pagingStartPage -= maxPages;
                        this.pagingStartPage = this.pagingCurrentPage - Math.floor(this.MaxPages / 2);
                        this.pagingStartPage = Math.max(this.pagingStartPage, 1);
                        this.Build();
                    });
                }
                
                label.className = label.disabled ? 'ZenithGrid_PagingControlsDisabled' : 'ZenithGrid_PagingControls';

                // First page.
                if (this.pagingStartPage > 1) 
                {
                    label = <HTMLLabelElement>document.createElement('label');
                    td.appendChild(label);
                    label.setAttribute('value', '1');
                    label.innerHTML = '1';
                    label.className = 'ZenithGrid_PagingControls';
                    super.addEventListener(label, 'click', (event: Event) =>
                    {
                        //this.pagingCurrentPage = +(<HTMLElement>event.currentTarget).getAttribute('value');
                        this.pagingCurrentPage = +(super.getEventTarget(event)).getAttribute('value');
                        this.pagingStartPage = 1;

                        this.Build();
                    });
                    label = <HTMLLabelElement>document.createElement('label');
                    td.appendChild(label);
                    label.innerHTML = '...';
                    label.style.marginLeft = "10px";
                }

                // Pages
                var pageIndex: number = this.pagingStartPage;
                for (; (pageIndex <= this.pagingStartPage + (maxPages - 1)) && pageIndex <= numberOfPages; pageIndex++)
                {
                    label = <HTMLLabelElement>document.createElement('label');
                    td.appendChild(label);
                    label.className = 'ZenithGrid_PagingControls';

                    if (pageIndex <= numberOfPages) 
                    {
                        label.setAttribute('value', pageIndex.toString());
                        label.innerHTML = pageIndex.toString();
                        if (pageIndex == this.pagingCurrentPage)
                            label.style.background = 'LightGray';
                        super.addEventListener(label, 'click', (event: Event) =>
                        {
                            //this.pagingCurrentPage = +(<HTMLElement>event.currentTarget).getAttribute('value');
                            this.pagingCurrentPage = +(super.getEventTarget(event)).getAttribute('value');
                            this.pagingStartPage = this.pagingCurrentPage - Math.floor(this.MaxPages / 2);
                            this.pagingStartPage = Math.max(this.pagingStartPage, 1);
                            this.pagingStartPage = Math.min(this.pagingStartPage, (numberOfPages - maxPages) + 1);
                            this.Build();
                        });
                    }
                }
                pageIndex--;

                // Last page.
                if (pageIndex < numberOfPages)
                {
                    label = <HTMLLabelElement>document.createElement('label');
                    td.appendChild(label);
                    label.innerHTML = '...';
                    label.style.marginLeft = "10px";

                    label = <HTMLLabelElement>document.createElement('label');
                    td.appendChild(label);
                    label.setAttribute('value', numberOfPages.toString());
                    label.innerHTML = numberOfPages.toString();
                    label.className = 'ZenithGrid_PagingControls';
                    super.addEventListener(label, 'click', (event: Event) =>
                    {
                        //this.pagingCurrentPage = +(<HTMLElement>event.currentTarget).getAttribute('value');
                        this.pagingCurrentPage = +(super.getEventTarget(event)).getAttribute('value');
                        if (this.pagingCurrentPage >= this.pagingStartPage + maxPages)
                            this.pagingStartPage = this.pagingCurrentPage;
                        this.pagingStartPage = Math.min(this.pagingStartPage, (numberOfPages - maxPages) + 1);
                        this.pagingStartPage = Math.max(this.pagingStartPage, 1);

                        this.Build();
                    });
                }

                // Next page
                label = <HTMLLabelElement>document.createElement('label');
                td.appendChild(label);
                label.innerHTML = "Next >";
                if (this.pagingCurrentPage >= numberOfPages)
                    label.disabled = true;
                else
                {
                    label.style.cursor = 'pointer';
                    super.addEventListener(label, 'click', (event: Event) =>
                    {
                        this.pagingCurrentPage++;
                        //if (this.pagingCurrentPage >= this.pagingStartPage + maxPages)
                        //    this.pagingStartPage = this.pagingCurrentPage;
                        this.pagingStartPage = this.pagingCurrentPage - Math.floor(this.MaxPages / 2);
                        this.pagingStartPage = Math.min(this.pagingStartPage, (numberOfPages - maxPages) + 1);
                        this.pagingStartPage = Math.max(this.pagingStartPage, 1);

                        this.Build();
                    });
                }
                label.className = label.disabled ? 'ZenithGrid_PagingControlsDisabled' : 'ZenithGrid_PagingControls';
            }
            /*document.body.removeChild(offscreendiv);
            if (this.SetMinWidth) 
                this.width = (widths.reduce((a, b) => a + b));*/

            this.SetRowClass();

			if (this.IsPopup())
				super.SetPopup();

			super.Build();
		}

        // ===============  Private Methods  ====================================================

		private SetRowClass(selectedRow?: HTMLTableRowElement): void
		{		
			var rows: NodeList = this.ParentElement.getElementsByTagName('tr');
			for (var index = 0; index < rows.length; index++)
			{
				var row: HTMLTableRowElement = <HTMLTableRowElement>rows[index];

				if (this.IsSelectable && selectedRow)
					row.setAttribute('selected', selectedRow == row ? 'true' : 'false');
                if (index == 0)
                    row.className = 'ZenithGrid_HeaderRow';            
                else if (this.IsSelectable && row.attributes['selected'] && row.attributes['selected'].value == 'true')
					row.className = 'ZenithGrid_SelectedRow';				
				else if ((row.attributes['inGroup'] && row.attributes['inGroup'].value == 'true') || (row.attributes['groupRow'] && row.attributes['groupRow'].value == 'true' && row.attributes['expanded'] && row.attributes['expanded'].value == 'true'))
					row.className = 'ZenithGrid_GroupRow';
				else if (index % 2 == 0)
					row.className = 'ZenithGrid_AltRow';
				else
					row.className = 'ZenithGrid_UnselectedRow';

				if (this.Paging && index == rows.length - 1)
					row.className = '';
			}
		}

        // ===============  Event Handlers  ====================================================

        private selectedEventHandler(event, data: any)
		{
            var trow: HTMLTableRowElement = <HTMLTableRowElement>super.getEventTarget(event);

			// The following two lines are an IE8 workaround!
			if (trow instanceof HTMLTableCellElement)
				trow = <HTMLTableRowElement>trow.parentElement;

			this.SetRowClass(trow);

			this.SetOutput(trow.getAttribute('keyValue'));

			if (this.IsSelectable)
                super.ExecuteEvent(ZenithEvent.EventType.Selected, [super.getEventTarget(event), trow.getAttribute('keyValue'), trow.rowIndex, data]);

			if (this.IsPopup())
				super.Close();
		}

	}
}
