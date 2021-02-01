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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='ZenithControlBase.ts'/>
var Zenith;
(function (Zenith) {
    var Grid = (function (_super) {
        __extends(Grid, _super);
        // ===============  Constructor  =========================================================
        function Grid(baseDivElementId, dataSource) {
            var _this = this;
            _super.call(this, baseDivElementId);
            // The dataKeyName property is the name of the field in the JSON object that contains the
            // identifying key for each row in the data source (e.g. primary key value).  This is
            // required if you want to be able to get the key for the selected row.
            this.DataKeyName = '';
            // IsSelectable indicates that the user can select a row.  The row will be highlighted and
            // the 'selected' attribute will be set for that row.  Default is true;
            this.IsSelectable = true;
            // IsSortable indicates that the rows can be sorted by clicking on the column headers (both
            // ascending and descending).  This is not applicable when grouping by rows (see below).
            // Default is true.
            this.IsSortable = true;
            this.DefaultSortField = '';
            this.DefaultSortOrder = '';
            this.Paging = false;
            this.RowsPerPage = 10;
            this.MaxPages = 10;
            this.Filters = false;
            // Set the GroupedByKeyName to have the grid be grouped by the given JSON object field from
            // the data source and allow the user to show and collapse the grouped rows.  When first
            // displaying the screen only the unique values for the GroupedByKeyName field will be
            // shown in the grid.  When the user clicks on one of these rows the grouped rows will be
            // displayed below the clicked row.
            this.GroupedByKeyName = '';
            // When grouping set the GroupExpandImage to true if you want to display an collapse/expand image.
            this.GroupExpandImage = false;
            this.ExpandImage = '';
            this.CollapseImage = '';
            // ===============  Private Attributes  ==================================================
            this.sortOrder = '';
            this.sortName = '';
            this.groupedFieldCellIndex = 0;
            this.pagingStartPage = 1;
            this.pagingCurrentPage = 1;
            this.SetMinWidth = false;
            this.DataSource = dataSource;

            // A copy of the original data needed for filtering.
            this.origDataSource = new Array();
            if (this.DataSource && this.origDataSource)
                this.DataSource.forEach(function (value, index) {
                    _this.origDataSource.push(value);
                });
        }
        // ===============  Public Methods  ====================================================
        Grid.prototype.Build = function (filterList) {
            var _this = this;
            if (typeof filterList === "undefined") { filterList = null; }
            this.Clear();

            if (filterList) {
                delete this.DataSource;
                this.DataSource = new Array();
                if (this.DataSource && this.origDataSource)
                    this.origDataSource.forEach(function (value, index) {
                        _this.DataSource.push(value);
                    });
                filterList.forEach(function (filterValue, item) {
                    for (var filterKey in filterValue) {
                        if (filterKey != 'dataType' && filterValue[filterKey] && filterValue[filterKey].trim().length > 0) {
                            _this.DataSource = _this.DataSource.filter(function (element, elementIndex) {
                                for (var dataKey in element) {
                                    if (dataKey == filterKey) {
                                        if (element[dataKey]) {
                                            if (filterValue['dataType'] && filterValue['dataType'].toUpperCase().indexOf('DATE') >= 0) {
                                                var filterDate = Zenith.DateHelper.ConvertStringToDate(filterValue[filterKey]);
                                                if (!Zenith.DateHelper.isValidDate(filterDate))
                                                    return false;
                                                var dataDate = Zenith.DateHelper.ConvertStringToDate(element[dataKey]);
                                                if (Zenith.DateHelper.isValidDate(dataDate))
                                                    return filterDate >= dataDate && filterDate <= dataDate;
                                            } else
                                                return (element[dataKey].toString()).toLowerCase().indexOf(filterValue[filterKey].toLowerCase()) >= 0;
                                        } else
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
            var isGrouped = this.GroupedByKeyName && this.GroupedByKeyName.length > 0;

            if (isGrouped)
                Zenith.Zenith_SortObjectsByKey(this.DataSource, this.GroupedByKeyName, "asc");
            else if (this.IsSortable) {
                if (this.sortName == '')
                    this.sortName = this.DefaultSortField;
                if (this.sortOrder == '')
                    this.sortOrder = this.DefaultSortOrder == '' ? 'asc' : this.DefaultSortOrder;

                if (this.sortName.length > 0) {
                    var sortFieldDataType = '';
                    for (var key in this.BindFields)
                        if (this.BindFields[key].FieldName == this.sortName)
                            if (this.BindFields[key].DataType)
                                sortFieldDataType = this.BindFields[key].DataType;
                    Zenith.Zenith_SortObjectsByKey(this.DataSource, this.sortName, this.sortOrder, sortFieldDataType);
                }
            }

            var th, td, trow;

            var table = document.createElement('table');
            this.BaseElement.appendChild(table);
            table.className = 'ZenithGridTable';

            this.ParentElement = table;

            var thead = document.createElement('thead');
            table.appendChild(thead);

            //==============================================================================================
            // Header row
            //==============================================================================================
            var headerRow = document.createElement('tr');
            thead.appendChild(headerRow);
            thead.className = 'ZenithGrid_HeaderRow';

            //offscreen.className = "headerRow";
            // Collapse/expand column for grouping
            if (this.GroupExpandImage) {
                th = document.createElement('th');
                headerRow.appendChild(th);
                th.style.width = '17px';
            }

            //==============================================================================================
            // Filter row - we will create the filter input fields in the field loop below.
            //==============================================================================================
            var filterRow = null;
            if (this.Filters) {
                filterRow = document.createElement('tr');
                _super.prototype.addEventListener.call(this, filterRow, 'keydown', function (event) {
                    if (event.keyCode == 13) {
                        var filterList = new Array();
                        for (var key in _this.BindFields) {
                            if (!_this.BindFields[key].Hidden) {
                                for (var index = 0; index < filterRow.childElementCount; index++) {
                                    if (filterRow.childNodes[index].getAttribute('key') == key) {
                                        var obj = new Object();
                                        obj[_this.BindFields[key].FieldName] = filterRow.childNodes[index].childNodes[0].value.trim();
                                        obj['dataType'] = _this.BindFields[key].DataType;
                                        filterList.push(obj);
                                    }
                                }
                            }
                        }
                        _this.Build(filterList);
                        event.preventDefault();
                        return false;
                    }
                });
            }

            for (var key in this.BindFields) {
                var fieldName = this.BindFields[key].FieldName;
                var ActionText = this.BindFields[key].ActionText;
                if (fieldName) {
                    th = document.createElement('th');
                    th.id = fieldName;

                    //th.className = "zen-deemphasize";
                    th.innerHTML = this.BindFields[key].Header;
                    if (this.IsSortable)
                        th.style.cursor = 'pointer';
                    if (fieldName == this.DataKeyName || this.BindFields[key].Hidden)
                        th.style.display = 'none';
                    else {
                        if (this.IsSortable && !isGrouped) {
                            _super.prototype.addEventListener.call(this, th, 'click', function (event) {
                                //if (this.sortName != (<HTMLElement>event.currentTarget).id)
                                if (_this.sortName != _super.prototype.getEventTarget.call(_this, event).id)
                                    _this.sortOrder = 'asc';
                                else
                                    _this.sortOrder = _this.sortOrder == 'asc' ? 'desc' : 'asc';

                                //this.sortName = (<HTMLElement>event.currentTarget).id;
                                _this.sortName = _super.prototype.getEventTarget.call(_this, event).id;
                                _this.Build();
                            });
                        }

                        //-------------- Filter ------------------------
                        //if (filterRow && (!this.BindFields[key].DataType || this.BindFields[key].DataType.toUpperCase().indexOf('DATE') < 0))
                        if (filterRow) {
                            var filterTD = document.createElement('td');
                            filterRow.appendChild(filterTD);
                            var filterInput = document.createElement('input');
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
                } else if (ActionText) {
                    th = document.createElement('th');
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
            var tbody = document.createElement('tbody');
            table.appendChild(tbody);

            //offscreen.className = "dataRow";
            if (filterRow)
                tbody.appendChild(filterRow);

            var currenttbody;
            var groupRowIndex = 0;
            var inGroup = false;
            var numColumns = 0;
            var startIndex = this.Paging ? (this.pagingCurrentPage - 1) * this.RowsPerPage : 0;
            for (var index = startIndex; this.Paging ? index < startIndex + this.RowsPerPage && index < this.DataSource.length : index < this.DataSource.length; index++) {
                // The following logic is used when grouping rows.
                if (isGrouped) {
                    if (index == 0 || this.DataSource[index - 1][this.GroupedByKeyName].toUpperCase() != this.DataSource[index][this.GroupedByKeyName].toUpperCase()) {
                        groupRowIndex++;

                        currenttbody = document.createElement('tbody');
                        table.appendChild(currenttbody);

                        if (index == this.DataSource.length - 1 || this.DataSource[index][this.GroupedByKeyName].toUpperCase() != this.DataSource[index + 1][this.GroupedByKeyName].toUpperCase())
                            inGroup = false;
                        else {
                            inGroup = true;
                            var groupRow = document.createElement('tr');
                            (function (row, data, fields) {
                                _super.prototype.addEventListener.call(_this, row, 'dblclick', function () {
                                    for (var key in fields) {
                                        var action = fields[key].Action;
                                        var dblclick = fields[key].DoubleClick;
                                        if (action && (dblclick || dblclick === undefined))
                                            action(data);
                                    }
                                });
                            })(groupRow, this.DataSource[index], this.BindFields);
                            groupRow.setAttribute('groupRow', 'true');
                            currenttbody.appendChild(groupRow);
                            _super.prototype.addEventListener.call(this, groupRow, 'click', function (event) {
                                if (_super.prototype.getEventTarget.call(_this, event) instanceof HTMLTableRowElement) {
                                    var groupRow = _super.prototype.getEventTarget.call(_this, event);
                                    var expand = true;
                                    if (groupRow.parentElement && groupRow.parentElement.nextSibling) {
                                        var nextBody = groupRow.parentElement.nextSibling;
                                        if (nextBody) {
                                            if (nextBody.style.display == 'none') {
                                                expand = true;
                                                nextBody.style.display = '';
                                            } else {
                                                expand = false;
                                                nextBody.style.display = 'none';
                                            }
                                            groupRow.setAttribute('expanded', expand ? 'true' : 'false');
                                            _this.SetRowClass();
                                        }
                                    }
                                    if (_this.GroupExpandImage) {
                                        var images = groupRow.cells[0].getElementsByTagName('img');
                                        if (expand) {
                                            images[1].style.display = 'inline';
                                            images[0].style.display = 'none';
                                        } else {
                                            images[1].style.display = 'none';
                                            images[0].style.display = 'inline';
                                        }
                                    }
                                }
                            });
                            groupRow.tabIndex = groupRowIndex;

                            if (this.GroupExpandImage) {
                                td = document.createElement('td');
                                groupRow.appendChild(td);
                                td.style.width = '17px';

                                var expandImage = document.createElement('img');
                                td.appendChild(expandImage);
                                expandImage.src = this.ExpandImage;

                                var collapseImage = document.createElement('img');
                                td.appendChild(collapseImage);
                                collapseImage.src = this.CollapseImage;
                                collapseImage.style.display = 'none';
                            }
                            groupRow.style.cursor = 'pointer';

                            for (var key in this.BindFields) {
                                var fieldName = this.BindFields[key].FieldName;
                                var ActionText = this.BindFields[key].ActionText;
                                if (fieldName) {
                                    td = document.createElement('td');
                                    if (fieldName == this.GroupedByKeyName) {
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
                                } else if (ActionText) {
                                    (function (row, field, data) {
                                        var td = document.createElement('td');
                                        var btn = document.createElement('input');
                                        btn.type = 'button';
                                        btn.value = field.ActionText;
                                        _super.prototype.addEventListener.call(_this, btn, 'click', function () {
                                            return field.Action(data);
                                        });
                                        if (fieldName == _this.DataKeyName || field.Hidden)
                                            td.style.display = 'none';
                                        if (_this.BindFields[key].Width)
                                            td.style.width = _this.BindFields[key].Width + "px";
                                        td.appendChild(btn);

                                        /*offscreen.appendChild(td);
                                        if (!(widths[key] >= offscreenTable.clientWidth))
                                        widths[key] = offscreenTable.clientWidth;
                                        offscreen.removeChild(td);*/
                                        row.appendChild(td);
                                    })(groupRow, this.BindFields[key], this.DataSource[index]);
                                }
                            }

                            currenttbody = document.createElement('tbody');
                            table.appendChild(currenttbody);
                            currenttbody.style.display = "none";
                        }
                    }
                } else if (currenttbody == null) {
                    currenttbody = document.createElement('tbody');
                    table.appendChild(currenttbody);
                }

                // Item row
                trow = document.createElement('tr');
                (function (row, data, fields) {
                    _super.prototype.addEventListener.call(_this, row, 'dblclick', function () {
                        for (var key in fields) {
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

                if (this.GroupExpandImage) {
                    td = document.createElement('td');
                    trow.appendChild(td);
                    td.style.width = '17px';
                }

                for (var key in this.BindFields) {
                    var fieldName = this.BindFields[key].FieldName;
                    var ActionText = this.BindFields[key].ActionText;
                    if (fieldName) {
                        td = document.createElement('td');

                        //td.className = 'dataCell';
                        td.id = fieldName;
                        if (this.BindFields[key].DataType && this.BindFields[key].DataType.toUpperCase().indexOf('SHORTDATE') >= 0)
                            td.innerHTML = this.DataSource[index][fieldName] ? Zenith.DateHelper.toShortDisplayDateS(this.DataSource[index][fieldName]) : '';
                        else
                            td.innerHTML = this.DataSource[index][fieldName] ? this.DataSource[index][fieldName] : '';

                        if (fieldName == this.DataKeyName || this.BindFields[key].Hidden)
                            td.style.display = 'none';
                        else {
                            numColumns++;
                            if (this.BindFields[key].Width)
                                td.style.width = this.BindFields[key].Width + "px";
                        }

                        /*offscreen.appendChild(td);
                        if (!(widths[key] >= offscreenTable.clientWidth))
                        widths[key] = offscreenTable.clientWidth;
                        offscreen.removeChild(td);*/
                        trow.appendChild(td);
                    } else if (ActionText) {
                        (function (row, field, data) {
                            var td = document.createElement('td');
                            td.className = 'actionColumn';
                            var btn = document.createElement('input');
                            btn.type = 'button';
                            btn.value = field.ActionText;
                            _super.prototype.addEventListener.call(_this, btn, 'click', function () {
                                return field.Action(data);
                            });
                            if (fieldName == _this.DataKeyName || field.Hidden)
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

                if (this.IsSelectable) {
                    (function (data) {
                        _super.prototype.addEventListener.call(_this, trow, 'click', function (event) {
                            _this.selectedEventHandler(event, data);
                        });
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
            var numberOfPages = Math.ceil(this.DataSource.length / this.RowsPerPage);
            if (this.Paging && numberOfPages > 1) {
                var tFoot = document.createElement('tfoot');
                table.appendChild(tFoot);

                var tRow = document.createElement('tr');
                tFoot.appendChild(tRow);

                var td = document.createElement('td');
                tRow.appendChild(td);
                td.className = 'ZenithGrid_PagingFooter';
                td.colSpan = numColumns;

                var maxPages = Math.min(numberOfPages, this.MaxPages);

                // Previous page
                var label = document.createElement('label');
                td.appendChild(label);
                label.innerHTML = "< Previous";
                if (this.pagingCurrentPage <= 1)
                    label.disabled = true;
                else {
                    label.style.cursor = 'pointer';
                    _super.prototype.addEventListener.call(this, label, 'click', function (event) {
                        _this.pagingCurrentPage--;

                        //if (this.pagingCurrentPage < this.pagingStartPage)
                        //    this.pagingStartPage -= maxPages;
                        _this.pagingStartPage = _this.pagingCurrentPage - Math.floor(_this.MaxPages / 2);
                        _this.pagingStartPage = Math.max(_this.pagingStartPage, 1);
                        _this.Build();
                    });
                }

                label.className = label.disabled ? 'ZenithGrid_PagingControlsDisabled' : 'ZenithGrid_PagingControls';

                // First page.
                if (this.pagingStartPage > 1) {
                    label = document.createElement('label');
                    td.appendChild(label);
                    label.setAttribute('value', '1');
                    label.innerHTML = '1';
                    label.className = 'ZenithGrid_PagingControls';
                    _super.prototype.addEventListener.call(this, label, 'click', function (event) {
                        //this.pagingCurrentPage = +(<HTMLElement>event.currentTarget).getAttribute('value');
                        _this.pagingCurrentPage = +(_super.prototype.getEventTarget.call(_this, event)).getAttribute('value');
                        _this.pagingStartPage = 1;

                        _this.Build();
                    });
                    label = document.createElement('label');
                    td.appendChild(label);
                    label.innerHTML = '...';
                    label.style.marginLeft = "10px";
                }

                // Pages
                var pageIndex = this.pagingStartPage;
                for (; (pageIndex <= this.pagingStartPage + (maxPages - 1)) && pageIndex <= numberOfPages; pageIndex++) {
                    label = document.createElement('label');
                    td.appendChild(label);
                    label.className = 'ZenithGrid_PagingControls';

                    if (pageIndex <= numberOfPages) {
                        label.setAttribute('value', pageIndex.toString());
                        label.innerHTML = pageIndex.toString();
                        if (pageIndex == this.pagingCurrentPage)
                            label.style.background = 'LightGray';
                        _super.prototype.addEventListener.call(this, label, 'click', function (event) {
                            //this.pagingCurrentPage = +(<HTMLElement>event.currentTarget).getAttribute('value');
                            _this.pagingCurrentPage = +(_super.prototype.getEventTarget.call(_this, event)).getAttribute('value');
                            _this.pagingStartPage = _this.pagingCurrentPage - Math.floor(_this.MaxPages / 2);
                            _this.pagingStartPage = Math.max(_this.pagingStartPage, 1);
                            _this.pagingStartPage = Math.min(_this.pagingStartPage, (numberOfPages - maxPages) + 1);
                            _this.Build();
                        });
                    }
                }
                pageIndex--;

                // Last page.
                if (pageIndex < numberOfPages) {
                    label = document.createElement('label');
                    td.appendChild(label);
                    label.innerHTML = '...';
                    label.style.marginLeft = "10px";

                    label = document.createElement('label');
                    td.appendChild(label);
                    label.setAttribute('value', numberOfPages.toString());
                    label.innerHTML = numberOfPages.toString();
                    label.className = 'ZenithGrid_PagingControls';
                    _super.prototype.addEventListener.call(this, label, 'click', function (event) {
                        //this.pagingCurrentPage = +(<HTMLElement>event.currentTarget).getAttribute('value');
                        _this.pagingCurrentPage = +(_super.prototype.getEventTarget.call(_this, event)).getAttribute('value');
                        if (_this.pagingCurrentPage >= _this.pagingStartPage + maxPages)
                            _this.pagingStartPage = _this.pagingCurrentPage;
                        _this.pagingStartPage = Math.min(_this.pagingStartPage, (numberOfPages - maxPages) + 1);
                        _this.pagingStartPage = Math.max(_this.pagingStartPage, 1);

                        _this.Build();
                    });
                }

                // Next page
                label = document.createElement('label');
                td.appendChild(label);
                label.innerHTML = "Next >";
                if (this.pagingCurrentPage >= numberOfPages)
                    label.disabled = true;
                else {
                    label.style.cursor = 'pointer';
                    _super.prototype.addEventListener.call(this, label, 'click', function (event) {
                        _this.pagingCurrentPage++;

                        //if (this.pagingCurrentPage >= this.pagingStartPage + maxPages)
                        //    this.pagingStartPage = this.pagingCurrentPage;
                        _this.pagingStartPage = _this.pagingCurrentPage - Math.floor(_this.MaxPages / 2);
                        _this.pagingStartPage = Math.min(_this.pagingStartPage, (numberOfPages - maxPages) + 1);
                        _this.pagingStartPage = Math.max(_this.pagingStartPage, 1);

                        _this.Build();
                    });
                }
                label.className = label.disabled ? 'ZenithGrid_PagingControlsDisabled' : 'ZenithGrid_PagingControls';
            }

            /*document.body.removeChild(offscreendiv);
            if (this.SetMinWidth)
            this.width = (widths.reduce((a, b) => a + b));*/
            this.SetRowClass();

            if (this.IsPopup())
                _super.prototype.SetPopup.call(this);

            _super.prototype.Build.call(this);
        };

        // ===============  Private Methods  ====================================================
        Grid.prototype.SetRowClass = function (selectedRow) {
            var rows = this.ParentElement.getElementsByTagName('tr');
            for (var index = 0; index < rows.length; index++) {
                var row = rows[index];

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
        };

        // ===============  Event Handlers  ====================================================
        Grid.prototype.selectedEventHandler = function (event, data) {
            var trow = _super.prototype.getEventTarget.call(this, event);

            // The following two lines are an IE8 workaround!
            if (trow instanceof HTMLTableCellElement)
                trow = trow.parentElement;

            this.SetRowClass(trow);

            this.SetOutput(trow.getAttribute('keyValue'));

            if (this.IsSelectable)
                _super.prototype.ExecuteEvent.call(this, Zenith.ZenithEvent.EventType.Selected, [_super.prototype.getEventTarget.call(this, event), trow.getAttribute('keyValue'), trow.rowIndex, data]);

            if (this.IsPopup())
                _super.prototype.Close.call(this);
        };
        return Grid;
    })(Zenith.ControlBase);
    Zenith.Grid = Grid;
})(Zenith || (Zenith = {}));
