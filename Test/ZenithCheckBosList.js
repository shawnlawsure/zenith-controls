var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Zenith;
(function (Zenith) {
    var CheckBoxList = (function (_super) {
        __extends(CheckBoxList, _super);
        function CheckBoxList(baseDivElementId) {
                _super.call(this, baseDivElementId);
            this.NumColumns = 1;
            this.ColumnSpace = 10;
            this.ItemList = new Zenith.List();
        }
        CheckBoxList.prototype.AddItem = function (value, text) {
            this.ItemList.Add(new Zenith.ListItem(value, text));
        };
        CheckBoxList.prototype.AddArrayData = function (data) {
            for(var index = 0; index < data.length; index++) {
                this.AddItem(data[index][0], data[index][1]);
            }
        };
        CheckBoxList.prototype.AddJSONData = function (data, valueDataField, textDataField) {
            if(!valueDataField || valueDataField.length <= 0) {
                valueDataField = 'Value';
            }
            if(!textDataField || textDataField.length <= 0) {
                textDataField = 'Text';
            }
            for(var index = 0; index < data.length; index++) {
                this.AddItem(data[index][valueDataField], data[index][textDataField]);
            }
        };
        CheckBoxList.prototype.Build = function () {
            var _this = this;
            if(this.ItemList.Count() <= 0) {
                throw new Error("The item list is empty.");
            }
            this.Clear();
            var table = document.createElement('table');
            this.BaseElement.appendChild(table);
            table.className = 'ZenithCheckBoxTable';
            var tbody = document.createElement('tbody');
            table.appendChild(tbody);
            var trow;
            var tcell;

            var colIndex = 0;
            for(var index = 0; index < this.ItemList.Count(); index++) {
                if(!trow || colIndex >= this.NumColumns) {
                    trow = document.createElement('tr');
                    tbody.appendChild(trow);
                    colIndex = 0;
                }
                tcell = document.createElement('td');
                trow.appendChild(tcell);
                if(colIndex > 0) {
                    tcell.style.paddingLeft = this.ColumnSpace + "px";
                }
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
                label.style.width = "150px";
                tcell.appendChild(label);
                colIndex++;
            }
            this.ParentElement = table;
            if(this.IsPopup()) {
                _super.prototype.SetPopup.call(this);
            }
            _super.prototype.Build.call(this);
        };
        CheckBoxList.prototype.SelectedValues = function () {
            var selectedValues = [];
            var checkboxes = this.BaseElement.getElementsByTagName('input');
            for(var index = 0; index < checkboxes.length; index++) {
                if(checkboxes[index] instanceof HTMLInputElement) {
                    if((checkboxes[index]).checked) {
                        selectedValues.push((checkboxes[index]).value);
                    }
                }
            }
            return selectedValues;
        };
        CheckBoxList.prototype.SelectedNames = function () {
            var selectedValues = [];
            var checkboxes = this.BaseElement.getElementsByTagName('input');
            for(var index = 0; index < checkboxes.length; index++) {
                if(checkboxes[index] instanceof HTMLInputElement) {
                    if((checkboxes[index]).checked) {
                        selectedValues.push(((checkboxes[index]).nextSibling).textContent);
                    }
                }
            }
            return selectedValues;
        };
        CheckBoxList.prototype.SetChecked = function (selectedValues) {
            var checkboxes = this.BaseElement.getElementsByTagName('input');
            for(var index = 0; index < checkboxes.length; index++) {
                if(checkboxes[index] instanceof HTMLInputElement) {
                    var checkbox = checkboxes[index];
                    checkbox.checked = false;
                    if(checkbox.nextElementSibling) {
                        var label = checkbox.nextElementSibling;
                        if(label) {
                            for(var valuesIndex = 0; valuesIndex < selectedValues.length; valuesIndex++) {
                                if(selectedValues[valuesIndex] == checkbox.value) {
                                    label.className = 'ZenithCheckBoxLabel_Selected';
                                    checkbox.checked = true;
                                } else {
                                    label.className = 'ZenithCheckBoxLabel_Unselected';
                                }
                            }
                        }
                    }
                }
            }
        };
        CheckBoxList.prototype.selectedEventHandler = function (event) {
            var targetElement = event.srcElement;
            if(!targetElement) {
                targetElement = event.target;
            }
            if(targetElement) {
                var checkbox = null;
                if(targetElement instanceof HTMLInputElement) {
                    checkbox = targetElement;
                } else {
                    if(targetElement.childElementCount > 0) {
                        checkbox = targetElement.childNodes[0];
                        checkbox.checked = !checkbox.checked;
                    }
                }
                this.SetOutput(this.SelectedValues());
                if(checkbox) {
                    if(checkbox instanceof HTMLInputElement) {
                        if(checkbox.nextElementSibling) {
                            var label = checkbox.nextElementSibling;
                            label.className = 'ZenithCheckBoxLabel_Selected';
                            _super.prototype.ExecuteEvent.call(this, Zenith.ZenithEvent.EventType.Selected, [
                                checkbox.value, 
                                checkbox.nextElementSibling.textContent, 
                                checkbox.checked
                            ]);
                        }
                    }
                }
            }
        };
        return CheckBoxList;
    })(Zenith.ControlBase);
    Zenith.CheckBoxList = CheckBoxList;    
})(Zenith || (Zenith = {}));

