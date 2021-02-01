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

///<reference path='ZenithList.ts'/>
///<reference path='ZenithControlBase.ts'/>

module Zenith
{
    export class CheckBoxList extends Zenith.ControlBase
    {
        // ===============  Attributes  ==================================================

		// NumColumns is the number of columns you want in the checkboxlist.
        public NumColumns: number = 1;

		//ColumnSpace is the amount of space in pixels you would like between columns.
        public ColumnSpace: number = 10;

        private ItemList = new Zenith.List();

        // ===============  Constructor  ====================================================

		// The id of a 'div' HTML element must be passed in when creating this object type.
        constructor (baseDivElementId: string)
        {
        	super(baseDivElementId);
        }

        // ===============  Public Methods  ====================================================

        public AddItem(value: string, text: string)
        {
            this.ItemList.Add(new ListItem(value, text));
        }
               
        public AddArrayData(data: Array<any>)
        {
            for (var index = 0; index < data.length; index++)
                this.AddItem(data[index][0], data[index][1]);
        }

        public AddJSONData(data: Array<any>, valueDataField: string, textDataField: string)
        {
            if (!valueDataField || valueDataField.length <= 0)
            	valueDataField = 'Value';
            if (!textDataField || textDataField.length <= 0)
            	textDataField = 'Text';

            for (var index = 0; index < data.length; index++)
                this.AddItem(data[index][valueDataField], data[index][textDataField]);
        }

        public Build(): void
        {
            if (this.ItemList.Count() <= 0)
                throw new Error("The item list is empty.");

            this.Clear();

            var table: HTMLTableElement = <HTMLTableElement>document.createElement('table');
            this.BaseElement.appendChild(table);
            table.className = 'ZenithCheckBoxTable';

            var tbody: HTMLElement = document.createElement('tbody');
            table.appendChild(tbody);

			var trow: HTMLTableRowElement, tcell: HTMLTableCellElement;
            var colIndex: number = 0;

            for (var index = 0; index < this.ItemList.Count(); index++)
            {
                if (!trow || colIndex >= this.NumColumns)
                {
                    trow = <HTMLTableRowElement>document.createElement('tr');
                    tbody.appendChild(trow);
                    colIndex = 0;
                }

                tcell = <HTMLTableCellElement>document.createElement('td');
                trow.appendChild(tcell);
                if (colIndex > 0)
                    tcell.style.paddingLeft = this.ColumnSpace + "px";

                this.addEventListener(tcell, 'click', (event) => { this.selectedEventHandler(event); });

                var itemCheckbox: HTMLInputElement = <HTMLInputElement>document.createElement('input');
                itemCheckbox.type = 'checkbox';
                itemCheckbox.name = 'ZenithControlCheckBox';
                itemCheckbox.value = this.ItemList.ElementAt(index).Value;
                itemCheckbox.id = 'chk_' + this.ItemList.ElementAt(index).Value;
                tcell.appendChild(itemCheckbox);

                var label:HTMLLabelElement = <HTMLLabelElement>document.createElement('label');
                label.htmlFor = 'chk_' + this.ItemList.ElementAt(index).Value;
                label.className = 'ZenithCheckBoxLabel_Unselected';
                label.textContent = this.ItemList.ElementAt(index).Text;
                label.innerHTML = this.ItemList.ElementAt(index).Text;
                tcell.appendChild(label);

                colIndex++;
            }

            this.ParentElement = table;

			if (this.IsPopup())
                super.SetPopup();

			super.Build();
        }

        public SelectedValues(): string[]
        {
        	var selectedValues: string[] = [];

        	var checkboxes: NodeList = this.BaseElement.getElementsByTagName('input');     	
        	for (var index = 0; index < checkboxes.length; index++)
        		if (checkboxes[index] instanceof HTMLInputElement)
					if ((<HTMLInputElement>checkboxes[index]).checked)
						selectedValues.push((<HTMLInputElement>checkboxes[index]).value);
        	
			return selectedValues;
        }
    
        public SetChecked(selectedValues: Array<any>): void
        {
        	var checkboxes: NodeList = this.BaseElement.getElementsByTagName('input');     	
        	for (var index = 0; index < checkboxes.length; index++)
        	{
        		if (checkboxes[index] instanceof HTMLInputElement)
        		{
        			var checkbox: HTMLInputElement = <HTMLInputElement>checkboxes[index];
        			if (checkbox.nextElementSibling)
        			{
        				var label: HTMLLabelElement = <HTMLLabelElement>checkbox.nextElementSibling;
        				if (label)
        				{
        					for (var valuesIndex = 0; valuesIndex < selectedValues.length; valuesIndex++)
        					{
        						if (selectedValues[valuesIndex] == checkbox.value)
        							label.className = 'ZenithCheckBoxLabel_Selected';
        						else
        							label.className = 'ZenithCheckBoxLabel_Unselected';
        					}
        				}
        			}
        		}
        	}				
        }
	
        // ===============  Event Handlers  ====================================================

        private selectedEventHandler(event)
        {
            var targetElement: HTMLInputElement = <HTMLInputElement>event.srcElement;
			if (!targetElement)
				targetElement = <HTMLInputElement>event.target;		// For FireFox

			if (targetElement)
			{
				var checkbox: HTMLInputElement = null;
				if (targetElement instanceof HTMLInputElement)
					checkbox = <HTMLInputElement>targetElement;
				else if (targetElement.childElementCount > 0)
				{
					checkbox = <HTMLInputElement>targetElement.childNodes[0];
					checkbox.checked = !checkbox.checked;
				}

				this.SetOutput(this.SelectedValues());

				if (checkbox)
				{
					if (checkbox instanceof HTMLInputElement)
					{
						if (checkbox.nextElementSibling)
						{
							var label: HTMLLabelElement = <HTMLLabelElement>checkbox.nextElementSibling;
							label.className = 'ZenithCheckBoxLabel_Selected';
							super.ExecuteEvent(ZenithEvent.EventType.Selected, [checkbox.value, checkbox.nextElementSibling.textContent, checkbox.checked]);
						}
					}
				}
			}
        }
	
	}

}
