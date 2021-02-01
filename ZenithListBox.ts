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

///<reference path='ZenithList.ts'/>
///<reference path='ZenithControlBase.ts'/>

module Zenith
{
    export class ListBox extends Zenith.ControlBase
    {
        // ===============  Attributes  ==================================================

		// NumColumns is the number of columns you want in the listbox.
        public NumColumns: number = 1;

		//ColumnSpace is the amount of space in pixels you would like between columns.
        public ColumnSpace: number = 10;

        public SelectedValue: string = null;
        public SelectedText: string = null;

        public ItemList = new Zenith.List();
        private tagList: Array<any> = null;

        // ===============  Constructor  ====================================================
        constructor (baseDivElementId: string)
        {
        	super(baseDivElementId);
        }

        // ===============  Public Methods  ====================================================

        public AddItem(value: string, text: string)
        {
            this.ItemList.Add(new ListItem(value, text));
        }
  
        public RemoveItem(value: string)
        {
			for (var index = 0; index < this.ItemList.Count(); index++)
				if (this.ItemList.ElementAt(index).Value == value)
					this.ItemList.Remove(this.ItemList.ElementAt(index));
        }
		             
		public GetValues(): string[]
		{
        	var selectedValues: string[] = [];

			for (var index = 0; index < this.ItemList.Count(); index++)
				selectedValues.push(this.ItemList.ElementAt(index).Value);

			return selectedValues;
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
            this.Clear();

            var table: HTMLTableElement = <HTMLTableElement>document.createElement('table');
            this.BaseElement.appendChild(table);
            table.className = 'ZenithListBoxTable';

            var tbody: HTMLElement = document.createElement('tbody');
            table.appendChild(tbody);

			var trow: HTMLTableRowElement, tcell: HTMLTableCellElement;
            var colIndex: number = 0;

            for (var index = 0; index < this.ItemList.Count(); index++)
            {
                if (!trow || colIndex >= this.NumColumns)
                {
                    trow = <HTMLTableRowElement>document.createElement('tr');
					trow.className = 'ZenithListBoxRow';
                    tbody.appendChild(trow);
                    colIndex = 0;
                }

                tcell = <HTMLTableCellElement>document.createElement('td');
                trow.appendChild(tcell);
                if (colIndex > 0)
                    tcell.style.paddingLeft = this.ColumnSpace + "px";

                this.addEventListener(tcell, 'click', (event) => { this.selectedEventHandler(event); });

                var label:HTMLLabelElement = <HTMLLabelElement>document.createElement('label');
                label.id = 'listItem_' + this.ItemList.ElementAt(index).Value;
                label.setAttribute('value', this.ItemList.ElementAt(index).Value);
                label.textContent = this.ItemList.ElementAt(index).Text;
                label.innerHTML = this.ItemList.ElementAt(index).Text;
                label.className = 'ZenithListBoxLabel_Unselected';
                tcell.appendChild(label);

                colIndex++;
            }

			if (this.IsPopup())
                super.SetPopup();

			this.ParentElement = table;

			super.Build();
        }

        public SetSelected(selectedValue: string): string
        {
        	var selectedText: string = '';
			
        	var items: NodeList = this.BaseElement.getElementsByTagName('label');     	
        	for (var index = 0; index < items.length; index++)
			{
        		if (items[index] instanceof HTMLLabelElement)
        		{
        			var label: HTMLLabelElement = <HTMLLabelElement>items[index];
        			label.removeAttribute('selected');
					label.className = 'ZenithListBoxLabel_Unselected';

					if (label.getAttribute('value') == selectedValue)
					{
						label.setAttribute('selected', 'true');
						label.className = 'ZenithListBoxLabel_Selected';

						selectedText = label.textContent;
						this.SelectedValue = selectedValue;
						this.SelectedText = selectedText;
					}
					else if (this.tagList && this.tagList.indexOf(parseInt(label.getAttribute('value'))) >= 0)
						label.className = 'ZenithListBoxLabel_Tagged';
				}
			}

        	return selectedText;
        }

        public Tag(tagValues: Array<any>, noSelect: boolean): void
        {
        	this.tagList = tagValues;

        	var items: NodeList = this.BaseElement.getElementsByTagName('label');     	
        	for (var index = 0; index < items.length; index++)
			{
        		if (items[index] instanceof HTMLLabelElement)
        		{
        			var label: HTMLLabelElement = <HTMLLabelElement>items[index];
        			label.className = 'ZenithListBoxLabel_Unselected';
					if (!noSelect && label.getAttribute('value') == this.SelectedValue)
							label.className = 'ZenithListBoxLabel_Selected';
        			for (var valuesIndex = 0; valuesIndex < this.tagList.length; valuesIndex++)
        				if (this.tagList[valuesIndex] == label.getAttribute('value'))
        					label.className = 'ZenithListBoxLabel_Tagged';
				}
			}
        }

        // ===============  Event Handlers  ====================================================

        private selectedEventHandler(event)
        {
            var targetElement: HTMLElement = <HTMLElement>event.srcElement;
			if (!targetElement)
				targetElement = <HTMLElement>event.target;		// For FireFox

			if (targetElement)
			{
				var label: HTMLLabelElement = null;
				if (targetElement instanceof HTMLLabelElement)
					label = <HTMLLabelElement>targetElement;
				else if (targetElement.childElementCount > 0)
					label = <HTMLLabelElement>targetElement.childNodes[0];

				if (label)
				{
					var value: string = label.getAttribute('value');
					if (value)
					{
						var selectedText: string = this.SetSelected(value);
						this.SetOutput(value);

						super.ExecuteEvent(ZenithEvent.EventType.Selected, [value, selectedText]);
					}
				}
			}
        }

	}

}
