/******************************************************************************************
* Developed by Shawn Lawsure - shawnl@maine.rr.com - http://www.linkedin.com/in/shawnlawsure
NOTE:  see ZenithControlBase.ts for documentation on the public members that are inherited by this control.
* Example of use:
var cbList = new Zenith.CheckBoxList('baseElement');
cbList.NumColumns = 2;
cbList.ColumnSpace = 15;
cbList.MaximumHeight = 100;
cbList.PopUpControlId = 'testPopup';
cbList.PopUpPosition = 'right';
cbList.PopUpDirection = 'down';
cbList.OutputElementId = 'output1';
cbList.addZenithEventListener(Zenith.ZenithEvent.EventType.Selected, function (value, text, checked) { alert(text + ' ' + (checked ? 'selected' : 'unselected')); });
cbList.addZenithEventListener(Zenith.ZenithEvent.EventType.Close, function () { });
// There are multiple ways to add the data to this control:
//		* Call AddItem for each item with a value and text.
//		* Call AddJSONData with a JSON object with 'Value' and 'Text' as item names.  Optionally, send the item names
//			you are using in the second and third parameters.
//		* Call AddArrayData with an array of arrays.  Pass in the value and text for each array item.
cbList.AddItem(1, "Blue");
cbList.AddItem(2, "Yellow");
cbList.AddItem(3, "Red");
cbList.AddItem(4, "Green");
cbList.AddItem(5, "Turqoise");
cbList.AddItem(6, "Orange");
cbList.AddItem(7, "Black");
cbList.AddItem(8, "White");
cbList.AddItem(9, "Aqua");
cbList.AddItem(10, "Gray");
cbList.AddItem(11, "Purple");
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
//cbList.AddJSONData(testData);
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
//cbList.AddArrayData(testData);
cbList.Build();
* CSS Class Names (hard-coded) - set these in your own CSS file:
> ZenithCheckBoxTable
> ZenithCheckBoxLabel_Selected
> ZenithCheckBoxLabel_Unselected
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
    var CheckBoxList = (function (_super) {
        __extends(CheckBoxList, _super);
        // ===============  Constructor  ====================================================
        // The id of a 'div' HTML element must be passed in when creating this object type.
        function CheckBoxList(baseDivElementId) {
            _super.call(this, baseDivElementId);
            // ===============  Attributes  ==================================================
            // NumColumns is the number of columns you want in the checkboxlist.
            this.NumColumns = 1;
            //ColumnSpace is the amount of space in pixels you would like between columns.
            this.ColumnSpace = 10;
            this.ItemList = new Zenith.List();
        }
        // ===============  Public Methods  ====================================================
        CheckBoxList.prototype.AddItem = function (value, text) {
            this.ItemList.Add(new Zenith.ListItem(value, text));
        };

        CheckBoxList.prototype.AddArrayData = function (data) {
            for (var index = 0; index < data.length; index++)
                this.AddItem(data[index][0], data[index][1]);
        };

        CheckBoxList.prototype.AddJSONData = function (data, valueDataField, textDataField) {
            if (!valueDataField || valueDataField.length <= 0)
                valueDataField = 'Value';
            if (!textDataField || textDataField.length <= 0)
                textDataField = 'Text';

            for (var index = 0; index < data.length; index++)
                this.AddItem(data[index][valueDataField], data[index][textDataField]);
        };

        CheckBoxList.prototype.Build = function () {
            var _this = this;
            if (this.ItemList.Count() <= 0)
                throw new Error("The item list is empty.");

            this.Clear();

            var table = document.createElement('table');
            this.BaseElement.appendChild(table);
            table.className = 'ZenithCheckBoxTable';

            var tbody = document.createElement('tbody');
            table.appendChild(tbody);

            var trow, tcell;
            var colIndex = 0;

            for (var index = 0; index < this.ItemList.Count(); index++) {
                if (!trow || colIndex >= this.NumColumns) {
                    trow = document.createElement('tr');
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

                var itemCheckbox = document.createElement('input');
                itemCheckbox.type = 'checkbox';
                itemCheckbox.name = 'ZenithControlCheckBox';
                itemCheckbox.value = this.ItemList.ElementAt(index).Value;
                itemCheckbox.id = 'chk_' + this.ItemList.ElementAt(index).Value;
                tcell.appendChild(itemCheckbox);

                var label = document.createElement('label');
                label.htmlFor = 'chk_' + this.ItemList.ElementAt(index).Value;
                label.className = 'ZenithCheckBoxLabel_Unselected';
                label.textContent = this.ItemList.ElementAt(index).Text;
                label.innerHTML = this.ItemList.ElementAt(index).Text;
                tcell.appendChild(label);

                colIndex++;
            }

            this.ParentElement = table;

            if (this.IsPopup())
                _super.prototype.SetPopup.call(this);

            _super.prototype.Build.call(this);
        };

        CheckBoxList.prototype.SelectedValues = function () {
            var selectedValues = [];

            var checkboxes = this.BaseElement.getElementsByTagName('input');
            for (var index = 0; index < checkboxes.length; index++)
                if (checkboxes[index] instanceof HTMLInputElement)
                    if (checkboxes[index].checked)
                        selectedValues.push(checkboxes[index].value);

            return selectedValues;
        };

        CheckBoxList.prototype.SetChecked = function (selectedValues) {
            var checkboxes = this.BaseElement.getElementsByTagName('input');
            for (var index = 0; index < checkboxes.length; index++) {
                if (checkboxes[index] instanceof HTMLInputElement) {
                    var checkbox = checkboxes[index];
                    if (checkbox.nextElementSibling) {
                        var label = checkbox.nextElementSibling;
                        if (label) {
                            for (var valuesIndex = 0; valuesIndex < selectedValues.length; valuesIndex++) {
                                if (selectedValues[valuesIndex] == checkbox.value)
                                    label.className = 'ZenithCheckBoxLabel_Selected';
                                else
                                    label.className = 'ZenithCheckBoxLabel_Unselected';
                            }
                        }
                    }
                }
            }
        };

        // ===============  Event Handlers  ====================================================
        CheckBoxList.prototype.selectedEventHandler = function (event) {
            var targetElement = event.srcElement;
            if (!targetElement)
                targetElement = event.target; // For FireFox

            if (targetElement) {
                var checkbox = null;
                if (targetElement instanceof HTMLInputElement)
                    checkbox = targetElement;
                else if (targetElement.childElementCount > 0) {
                    checkbox = targetElement.childNodes[0];
                    checkbox.checked = !checkbox.checked;
                }

                this.SetOutput(this.SelectedValues());

                if (checkbox) {
                    if (checkbox instanceof HTMLInputElement) {
                        if (checkbox.nextElementSibling) {
                            var label = checkbox.nextElementSibling;
                            label.className = 'ZenithCheckBoxLabel_Selected';
                            _super.prototype.ExecuteEvent.call(this, Zenith.ZenithEvent.EventType.Selected, [checkbox.value, checkbox.nextElementSibling.textContent, checkbox.checked]);
                        }
                    }
                }
            }
        };
        return CheckBoxList;
    })(Zenith.ControlBase);
    Zenith.CheckBoxList = CheckBoxList;
})(Zenith || (Zenith = {}));
