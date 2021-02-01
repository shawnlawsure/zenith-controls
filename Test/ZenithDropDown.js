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
ZenithDropDownTable
ZenithDropDownClass
ZenithDropDownItemClass
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
    var DropDown = (function (_super) {
        __extends(DropDown, _super);
        // ===============  Constructor  ====================================================
        function DropDown(baseDivElementId) {
            _super.call(this, baseDivElementId);
            // ===============  Attributes  ==================================================
            this.SelectedValue = null;
            this.AutoSelectDefaultValue = false;
            this.ItemList = new Zenith.List();
        }
        // ===============  Public Methods  ====================================================
        DropDown.prototype.AddItem = function (value, text, index) {
            this.ItemList.Add(new Zenith.ListItem(value, text)); //, index);
        };

        DropDown.prototype.ClearItems = function () {
            delete this.ItemList;
            this.ItemList = new Zenith.List();
        };

        DropDown.prototype.AddArrayData = function (data) {
            for (var index = 0; index < data.length; index++)
                this.AddItem(data[index][0], data[index][1]);
        };

        DropDown.prototype.AddJSONData = function (data, valueDataField, textDataField) {
            if (!valueDataField || valueDataField.length <= 0)
                valueDataField = 'Value';
            if (!textDataField || textDataField.length <= 0)
                textDataField = 'Text';

            for (var index = 0; index < data.length; index++)
                this.AddItem(data[index][valueDataField], data[index][textDataField]);
        };

        DropDown.prototype.Build = function () {
            var _this = this;
            if (this.ItemList.Count() <= 0)
                throw new Error("The item list is empty.");

            this.Clear();

            /*var table: HTMLTableElement = <HTMLTableElement>document.createElement('table');
            this.BaseElement.appendChild(table);
            table.className = 'ZenithDropDownTable';
            
            var tbody: HTMLElement = document.createElement('tbody');
            table.appendChild(tbody);
            
            var trow: HTMLTableRowElement = <HTMLTableRowElement>document.createElement('tr');
            tbody.appendChild(trow);
            var tcell: HTMLTableCellElement = <HTMLTableCellElement>document.createElement('td');
            trow.appendChild(tcell);*/
            var selectElement = document.createElement('select');
            this.BaseElement.appendChild(selectElement);
            selectElement.className = 'ZenithDropDownClass';

            for (var index = 0; index < this.ItemList.Count(); index++) {
                var option = document.createElement('option');
                option.label = this.ItemList.ElementAt(index).Text;
                option.id = 'dropDownItem_' + this.ItemList.ElementAt(index).Value;
                option.setAttribute('value', this.ItemList.ElementAt(index).Value);
                option.textContent = this.ItemList.ElementAt(index).Text;
                option.className = 'ZenithDropDownItemClass';
                selectElement.appendChild(option);
                //selectElement.options.add(option);
                /*var label:HTMLLabelElement = <HTMLLabelElement>document.createElement('label');
                label.id = 'listItem_' + this.ItemList.ElementAt(index).Value;
                label.setAttribute('value', this.ItemList.ElementAt(index).Value);
                label.textContent = this.ItemList.ElementAt(index).Text;
                label.innerHTML = this.ItemList.ElementAt(index).Text;
                label.className = 'ZenithListBoxLabel_Unselected';
                tcell.appendChild(label); */
            }

            this.addEventListener(selectElement, 'change', function (event) {
                _this.selectedEventHandler(event);
            });

            if (this.IsPopup())
                _super.prototype.SetPopup.call(this);

            this.ParentElement = selectElement;

            _super.prototype.Build.call(this);

            if (this.AutoSelectDefaultValue && this.ItemList.Count() == 2 && this.ItemList.ElementAt(0).Value == 0)
                this.SetSelected(this.ItemList.ElementAt(1).Value);
        };

        DropDown.prototype.SetSelected = function (selectedValue) {
            var oldSelectedValue = this.SelectedValue;

            if (selectedValue == null)
                selectedValue = '0';

            var selectedText = '';
            this.SelectedValue = '';

            var items = this.BaseElement.getElementsByTagName('option');
            for (var index = 0; index < items.length; index++) {
                if (items[index] instanceof HTMLOptionElement) {
                    var option = items[index];
                    if (option.getAttribute('value') == selectedValue) {
                        option.selected = true;
                        selectedText = option.textContent;
                        this.SelectedValue = selectedValue;

                        //super.ExecuteEvent(ZenithEvent.EventType.Selected, [this.SelectedValue, option.textContent, oldSelectedValue]);
                        //this.ParentElement.setAttribute('value', selectedValue);
                        option.setAttribute('selected', 'true'); // So the value shows in the outerHTML property - for printing.
                    }
                }
            }

            return selectedText;
        };

        // ===============  Event Handlers  ====================================================
        DropDown.prototype.selectedEventHandler = function (event) {
            var oldSelectedValue = this.SelectedValue;

            this.SelectedValue = '';

            var targetElement = event.srcElement;
            if (!targetElement)
                targetElement = event.target; // For FireFox

            if (targetElement && targetElement instanceof HTMLSelectElement) {
                var selectElement = targetElement;
                if (selectElement.selectedIndex <= selectElement.childElementCount - 1) {
                    var option = selectElement.childNodes[selectElement.selectedIndex];
                    if (option) {
                        this.SelectedValue = option.getAttribute('value');
                        this.SetOutput(this.SelectedValue);
                        this.SetSelected(this.SelectedValue);

                        _super.prototype.ExecuteEvent.call(this, Zenith.ZenithEvent.EventType.Selected, [this.SelectedValue, option.textContent, oldSelectedValue]);
                    }
                }
            }
        };
        return DropDown;
    })(Zenith.ControlBase);
    Zenith.DropDown = DropDown;
})(Zenith || (Zenith = {}));
