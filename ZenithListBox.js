/******************************************************************************************
* Developed by Shawn Lawsure - shawnl@maine.rr.com - http://www.linkedin.com/in/shawnlawsure
NOTE:  see ZenithControlBase.ts for documentation on the public members that are inherited by this control.
* Example of use:
var lstList = new Zenith.ListBox('baseElement');
lstList.BaseElement.style.border = "solid 1px #B6B8BA";
lstList.NumColumns = 2;
lstList.ColumnSpace = 15;
lstList.MaximumHeight = 100;
lstList.PopUpControlId = 'testPopup';
lstList.PopUpPosition = 'right';
lstList.PopUpDirection = 'down';
lstList.OutputElementId = 'output1';
lstList.addZenithEventListener(Zenith.ZenithEvent.EventType.Selected, function (value, text) { alert(text); });
lstList.addZenithEventListener(Zenith.ZenithEvent.EventType.Close, function () { });
// There are multiple ways to add the data to this control:
//		* Call AddItem for each item with a value and text.
//		* Call AddJSONData with a JSON object with 'Value' and 'Text' as item names.  Optionally, send the item names
//			you are using in the second and third parameters.
//		* Call AddArrayData with an array of arrays.  Pass in the value and text for each array item.
lstList.AddItem(1, "Blue");
lstList.AddItem(2, "Yellow");
lstList.AddItem(3, "Red");
lstList.AddItem(4, "Green");
lstList.AddItem(5, "Turqoise");
lstList.AddItem(6, "Orange");
lstList.AddItem(7, "Black");
lstList.AddItem(8, "White");
lstList.AddItem(9, "Aqua");
lstList.AddItem(10, "Gray");
lstList.AddItem(11, "Purple");
var testData = [
{ "Value": 1, "Text": "Blue" },
{ "Value": 2, "Text": "Yellow" },
{ "Value": 3, "Text": "Red" },
{ "Value": 4, "Text": "Green" },
{ "Value": 5, "Text": "Turqoise" },
{ "Value": 6, "Text": "Orange" },
{ "Value": 7, "Text": "Black" },
{ "Value": 8, "Text": "White" },
{ "Value": 9, "Text": "Aqua" },
{ "Value": 10, "Text": "Gray" },
{ "Value": 11, "Text": "Purple" }
];
//lstList.AddJSONData(testData);
var testData = [[1, 'Blue'],
[2, 'Yellow'],
[3, 'Red'],
[4, 'Green'],
[5, 'Turqoise'],
[6, 'Orange'],
[7, 'Black'],
[8, 'White'],
[9, 'Aqua'],
[10, 'Yellow'],
[11, 'Gray'],
[12, 'Purple']];
//lstList.AddArrayData(testData);
lstList.Build();
* CSS Class Names (hard-coded) - set these in your own CSS file:
> ZenithListBoxTable
> ZenithListBoxLabel_Selected
> ZenithListBoxLabel_Unselected
> ZenithListBoxLabel_Tagged
******************************************************************************************/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='ZenithList.ts'/>
///<reference path='ZenithControlBase.ts'/>
var Zenith;
(function (Zenith) {
    var ListBox = (function (_super) {
        __extends(ListBox, _super);
        // ===============  Constructor  ====================================================
        function ListBox(baseDivElementId) {
            _super.call(this, baseDivElementId);
            // ===============  Attributes  ==================================================
            // NumColumns is the number of columns you want in the listbox.
            this.NumColumns = 1;
            //ColumnSpace is the amount of space in pixels you would like between columns.
            this.ColumnSpace = 10;
            this.SelectedValue = null;
            this.SelectedText = null;
            this.ItemList = new Zenith.List();
            this.tagList = null;
        }
        // ===============  Public Methods  ====================================================
        ListBox.prototype.AddItem = function (value, text) {
            this.ItemList.Add(new Zenith.ListItem(value, text));
        };

        ListBox.prototype.RemoveItem = function (value) {
            for (var index = 0; index < this.ItemList.Count(); index++)
                if (this.ItemList.ElementAt(index).Value == value)
                    this.ItemList.Remove(this.ItemList.ElementAt(index));
        };

        ListBox.prototype.GetValues = function () {
            var selectedValues = [];

            for (var index = 0; index < this.ItemList.Count(); index++)
                selectedValues.push(this.ItemList.ElementAt(index).Value);

            return selectedValues;
        };

        ListBox.prototype.AddArrayData = function (data) {
            for (var index = 0; index < data.length; index++)
                this.AddItem(data[index][0], data[index][1]);
        };

        ListBox.prototype.AddJSONData = function (data, valueDataField, textDataField) {
            if (!valueDataField || valueDataField.length <= 0)
                valueDataField = 'Value';
            if (!textDataField || textDataField.length <= 0)
                textDataField = 'Text';

            for (var index = 0; index < data.length; index++)
                this.AddItem(data[index][valueDataField], data[index][textDataField]);
        };

        ListBox.prototype.Build = function () {
            var _this = this;
            this.Clear();

            var table = document.createElement('table');
            this.BaseElement.appendChild(table);
            table.className = 'ZenithListBoxTable';

            var tbody = document.createElement('tbody');
            table.appendChild(tbody);

            var trow, tcell;
            var colIndex = 0;

            for (var index = 0; index < this.ItemList.Count(); index++) {
                if (!trow || colIndex >= this.NumColumns) {
                    trow = document.createElement('tr');
                    trow.className = 'ZenithListBoxRow';
                    tbody.appendChild(trow);
                    colIndex = 0;
                }

                tcell = document.createElement('td');
                trow.appendChild(tcell);
                if (colIndex > 0)
                    tcell.style.paddingLeft = this.ColumnSpace + "px";

                this.addEventListener(tcell, 'click', function (event) {
                    _this.selectedEventHandler(event);
                });

                var label = document.createElement('label');
                label.id = 'listItem_' + this.ItemList.ElementAt(index).Value;
                label.setAttribute('value', this.ItemList.ElementAt(index).Value);
                label.textContent = this.ItemList.ElementAt(index).Text;
                label.innerHTML = this.ItemList.ElementAt(index).Text;
                label.className = 'ZenithListBoxLabel_Unselected';
                tcell.appendChild(label);

                colIndex++;
            }

            if (this.IsPopup())
                _super.prototype.SetPopup.call(this);

            this.ParentElement = table;

            _super.prototype.Build.call(this);
        };

        ListBox.prototype.SetSelected = function (selectedValue) {
            var selectedText = '';

            var items = this.BaseElement.getElementsByTagName('label');
            for (var index = 0; index < items.length; index++) {
                if (items[index] instanceof HTMLLabelElement) {
                    var label = items[index];
                    label.removeAttribute('selected');
                    label.className = 'ZenithListBoxLabel_Unselected';

                    if (label.getAttribute('value') == selectedValue) {
                        label.setAttribute('selected', 'true');
                        label.className = 'ZenithListBoxLabel_Selected';

                        selectedText = label.textContent;
                        this.SelectedValue = selectedValue;
                        this.SelectedText = selectedText;
                    } else if (this.tagList && this.tagList.indexOf(parseInt(label.getAttribute('value'))) >= 0)
                        label.className = 'ZenithListBoxLabel_Tagged';
                }
            }

            return selectedText;
        };

        ListBox.prototype.Tag = function (tagValues, noSelect) {
            this.tagList = tagValues;

            var items = this.BaseElement.getElementsByTagName('label');
            for (var index = 0; index < items.length; index++) {
                if (items[index] instanceof HTMLLabelElement) {
                    var label = items[index];
                    label.className = 'ZenithListBoxLabel_Unselected';
                    if (!noSelect && label.getAttribute('value') == this.SelectedValue)
                        label.className = 'ZenithListBoxLabel_Selected';
                    for (var valuesIndex = 0; valuesIndex < this.tagList.length; valuesIndex++)
                        if (this.tagList[valuesIndex] == label.getAttribute('value'))
                            label.className = 'ZenithListBoxLabel_Tagged';
                }
            }
        };

        // ===============  Event Handlers  ====================================================
        ListBox.prototype.selectedEventHandler = function (event) {
            var targetElement = event.srcElement;
            if (!targetElement)
                targetElement = event.target; // For FireFox

            if (targetElement) {
                var label = null;
                if (targetElement instanceof HTMLLabelElement)
                    label = targetElement;
                else if (targetElement.childElementCount > 0)
                    label = targetElement.childNodes[0];

                if (label) {
                    var value = label.getAttribute('value');
                    if (value) {
                        var selectedText = this.SetSelected(value);
                        this.SetOutput(value);

                        _super.prototype.ExecuteEvent.call(this, Zenith.ZenithEvent.EventType.Selected, [value, selectedText]);
                    }
                }
            }
        };
        return ListBox;
    })(Zenith.ControlBase);
    Zenith.ListBox = ListBox;
})(Zenith || (Zenith = {}));
