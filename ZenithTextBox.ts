//// <reference path="Test/Save.js" />
/*************************************************************************************************************
 * Developed by Shawn Lawsure - shawnl@maine.rr.com - http://www.linkedin.com/in/shawnlawsure

  NOTE:  see ZenithControlBase.ts for documentation on the public members that are inherited by this control.

**************************************************************************************************************/

///<reference path='ZenithControlBase.ts'/>

module Zenith
{
	export class TextBox extends Zenith.ControlBase
	{
		// ===============  Attributes  ==================================================
		public NumValue: number = null;
		public Text: string = '';

		public static Type = { Text: 1, Numeric: 2, Currency: 3 };
		public type: number = Zenith.TextBox.Type.Text;
		public DecimalPlaces: number = 2;
		public Width: number = 95;
		public CssClass: string = '';
		public ResultHiddenFieldId: string = null;
		public MaxLength: number = 0;
		public Disabled: boolean = false;
		public Multiline: boolean = false;

		private textBox: HTMLInputElement = null;
		private resultHiddenField: HTMLInputElement = null;

		// ===============  Constructor  ====================================================
		constructor (baseDivElementId: string)
		{
			super(baseDivElementId);
		}

		// ===============  Public Methods  ====================================================

        public Build(): void
        {
        	this.textBox = <HTMLInputElement>document.createElement('input');
			this.textBox.disabled = this.Disabled;
			//this.textBox.Multiline = this.Multiline;
        	this.textBox.id = "zenithText";
        	this.textBox.className = this.CssClass;
			if (this.MaxLength > 0)
			{
				this.textBox.maxLength = this.MaxLength;
				this.Width = Math.min(this.MaxLength * 12, 300);
			}

            this.BaseElement.appendChild(this.textBox);

			if (this.type == Zenith.TextBox.Type.Currency)
				this.DecimalPlaces = 2;
            if (this.type == Zenith.TextBox.Type.Currency || this.type == Zenith.TextBox.Type.Numeric)
            {
            	this.addEventListener(this.textBox, 'keydown', (event) => { this.KeyHandler(event); });
            	this.addEventListener(this.textBox, 'focus', (event) => { this.FocusHandler(event); });
            }
			this.addEventListener(this.textBox, 'blur', (event) => { this.BlurHandler(event); });
			 
			if (this.IsPopup())
                super.SetPopup();

			this.ParentElement = this.textBox;

			super.Build();
			
			this.textBox.style.borderStyle = 'none';
        	this.BaseElement.style.width = this.Width + "px";

			if (this.ResultHiddenFieldId)
				this.resultHiddenField = <HTMLInputElement>document.getElementById(this.ResultHiddenFieldId);

			if (this.resultHiddenField)
				this.Text = this.resultHiddenField.value;
			else if ((this.type == Zenith.TextBox.Type.Numeric || this.type == Zenith.TextBox.Type.Currency) && this.NumValue != null)
        		this.Text = this.NumValue.toString();
        	this.setValue(this.Text);
        }

        private KeyHandler(event?: Event): void
        {
            var keyEvent: KeyboardEvent = <KeyboardEvent>event;
            if ((!keyEvent.shiftKey && ((keyEvent.keyCode >= 48 && keyEvent.keyCode <= 57) || (keyEvent.keyCode >= 96 && keyEvent.keyCode <= 105)) || keyEvent.keyCode == 190) || keyEvent.keyCode == 16 || keyEvent.keyCode == 20 || keyEvent.keyCode == 8 || keyEvent.keyCode == 46 || keyEvent.keyCode == 37 || keyEvent.keyCode == 39 || keyEvent.keyCode == 13 || keyEvent.keyCode == 110  || keyEvent.keyCode == 9  || keyEvent.keyCode == 18)
            {
				// Can't have more than 1 decimal point or no decimal point at all if DecimalPlaces = 0.
				if (!keyEvent.shiftKey && (keyEvent.keyCode == 190 || keyEvent.keyCode == 16))
					if (this.DecimalPlaces <= 0 || this.textBox.value.indexOf('.') >= 0)
						event.preventDefault();

				// If currency can't have more than 2 decimal places and allow based on DecimalPlaces.
				if (((keyEvent.keyCode >= 48 && keyEvent.keyCode <= 57) || (keyEvent.keyCode >= 96 && keyEvent.keyCode <= 105)) && this.textBox.selectionStart == this.textBox.selectionEnd)
				{
					var decimalPosition: number = this.textBox.value.indexOf('.');
					if (decimalPosition >= 0 && this.doGetCaretPosition() > decimalPosition && this.textBox.value.split('.')[1].length >= this.DecimalPlaces)
						event.preventDefault();
				}
            }
            else
            {
                //alert(keyEvent.keyCode.toString());
                event.preventDefault();
            }
        }

        public setValue(value: string): void
        {
        	if (value == null || value.length <= 0)
        	{
        		this.Text = '';
        		this.NumValue = null;
        	}
			else
			{
        		switch (this.type)
        		{
        			case Zenith.TextBox.Type.Text:

        				this.Text = value.trim();
        				this.NumValue = null;

        				if (this.resultHiddenField)
        					this.resultHiddenField.value = this.Text;

        				break;

        			default:

        				var temp: string = value;
        				while (temp.indexOf('$') >= 0)
        					temp = temp.replace('$', '');
        				while (temp.indexOf(',') >= 0)
        					temp = temp.replace(',', '');

        				if (this.resultHiddenField)
        					this.resultHiddenField.value = temp;

        				this.NumValue = parseFloat(temp);
        				if (isNaN(this.NumValue))
        				{
        					this.NumValue = null;
        					this.Text = '';
        				}
        				else
        					this.Text = (this.type == Zenith.TextBox.Type.Currency ? '$' : '') + this.NumValue.toFixed(this.DecimalPlaces).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');

        				break;
        		}
        	}

        	this.textBox.value = this.Text;
			this.textBox.setAttribute('value', this.textBox.value);		// So the value shows in the outerHTML property - for printing.
        }
		
		// ===============  Private Methods  ====================================================
        private FocusHandler(event?: Event): void
        {
			while (this.textBox.value.indexOf('$') >= 0)
				this.textBox.value = this.textBox.value.replace('$', '');
			while (this.textBox.value.indexOf(',') >= 0)
				this.textBox.value = this.textBox.value.replace(',', '');
			this.textBox.select();
        }

        private BlurHandler(event?: Event): void
        {
        	this.setValue(this.textBox.value);

        	var value = null;
			if (this.type == Zenith.TextBox.Type.Currency || this.type == Zenith.TextBox.Type.Numeric)
				value = this.NumValue;
			else
				value = this.textBox.value;
						
			this.SetOutput(value);

        	this.ExecuteEvent(Zenith.ZenithEvent.EventType.Changed, [this.textBox,  value]);
        }

		private doGetCaretPosition () : number 
		{
			var CaretPos : number = 0;   
			// IE Support
			if (document.selection)
			{
				this.ParentElement.focus();
				var Sel : TextRange = document.selection.createRange();
				Sel.moveStart ('character', -this.textBox.value.length);
				CaretPos = Sel.text.length;
			}
			// Firefox support 10.    
			else if (this.textBox.selectionStart || this.textBox.selectionStart == 0)
				CaretPos = this.textBox.selectionStart;

			return (CaretPos);
		} 

		private toString(): string
		{
			if (this.type == Zenith.TextBox.Type.Text)
				return this.Text == null ? '' : this.Text;
			else
				return this.NumValue == null ? '' : this.NumValue.toString();	
		}

	}
}

