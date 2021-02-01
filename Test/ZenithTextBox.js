//// <reference path="Test/Save.js" />
/*************************************************************************************************************
* Developed by Shawn Lawsure - shawnl@maine.rr.com - http://www.linkedin.com/in/shawnlawsure
NOTE:  see ZenithControlBase.ts for documentation on the public members that are inherited by this control.
**************************************************************************************************************/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='ZenithControlBase.ts'/>
var Zenith;
(function (Zenith) {
    var TextBox = (function (_super) {
        __extends(TextBox, _super);
        // ===============  Constructor  ====================================================
        function TextBox(baseDivElementId) {
            _super.call(this, baseDivElementId);
            // ===============  Attributes  ==================================================
            this.NumValue = null;
            this.Text = '';
            this.type = Zenith.TextBox.Type.Text;
            this.DecimalPlaces = 2;
            this.Width = 95;
            this.CssClass = '';
            this.ResultHiddenFieldId = null;
            this.MaxLength = 0;
            this.Disabled = false;
            this.Multiline = false;
            this.textBox = null;
            this.resultHiddenField = null;
        }
        // ===============  Public Methods  ====================================================
        TextBox.prototype.Build = function () {
            var _this = this;
            this.textBox = document.createElement('input');
            this.textBox.disabled = this.Disabled;

            //this.textBox.Multiline = this.Multiline;
            this.textBox.id = "zenithText";
            this.textBox.className = this.CssClass;
            if (this.MaxLength > 0) {
                this.textBox.maxLength = this.MaxLength;
                this.Width = Math.min(this.MaxLength * 12, 300);
            }

            this.BaseElement.appendChild(this.textBox);

            if (this.type == Zenith.TextBox.Type.Currency)
                this.DecimalPlaces = 2;
            if (this.type == Zenith.TextBox.Type.Currency || this.type == Zenith.TextBox.Type.Numeric) {
                this.addEventListener(this.textBox, 'keydown', function (event) {
                    _this.KeyHandler(event);
                });
                this.addEventListener(this.textBox, 'focus', function (event) {
                    _this.FocusHandler(event);
                });
            }
            this.addEventListener(this.textBox, 'blur', function (event) {
                _this.BlurHandler(event);
            });

            if (this.IsPopup())
                _super.prototype.SetPopup.call(this);

            this.ParentElement = this.textBox;

            _super.prototype.Build.call(this);

            this.textBox.style.borderStyle = 'none';
            this.BaseElement.style.width = this.Width + "px";

            if (this.ResultHiddenFieldId)
                this.resultHiddenField = document.getElementById(this.ResultHiddenFieldId);

            if (this.resultHiddenField)
                this.Text = this.resultHiddenField.value;
            else if ((this.type == Zenith.TextBox.Type.Numeric || this.type == Zenith.TextBox.Type.Currency) && this.NumValue != null)
                this.Text = this.NumValue.toString();
            this.setValue(this.Text);
        };

        TextBox.prototype.KeyHandler = function (event) {
            var keyEvent = event;
            if ((!keyEvent.shiftKey && ((keyEvent.keyCode >= 48 && keyEvent.keyCode <= 57) || (keyEvent.keyCode >= 96 && keyEvent.keyCode <= 105)) || keyEvent.keyCode == 190) || keyEvent.keyCode == 16 || keyEvent.keyCode == 20 || keyEvent.keyCode == 8 || keyEvent.keyCode == 46 || keyEvent.keyCode == 37 || keyEvent.keyCode == 39 || keyEvent.keyCode == 13 || keyEvent.keyCode == 110 || keyEvent.keyCode == 9 || keyEvent.keyCode == 18) {
                // Can't have more than 1 decimal point or no decimal point at all if DecimalPlaces = 0.
                if (!keyEvent.shiftKey && (keyEvent.keyCode == 190 || keyEvent.keyCode == 16))
                    if (this.DecimalPlaces <= 0 || this.textBox.value.indexOf('.') >= 0)
                        event.preventDefault();

                // If currency can't have more than 2 decimal places and allow based on DecimalPlaces.
                if (((keyEvent.keyCode >= 48 && keyEvent.keyCode <= 57) || (keyEvent.keyCode >= 96 && keyEvent.keyCode <= 105)) && this.textBox.selectionStart == this.textBox.selectionEnd) {
                    var decimalPosition = this.textBox.value.indexOf('.');
                    if (decimalPosition >= 0 && this.doGetCaretPosition() > decimalPosition && this.textBox.value.split('.')[1].length >= this.DecimalPlaces)
                        event.preventDefault();
                }
            } else {
                //alert(keyEvent.keyCode.toString());
                event.preventDefault();
            }
        };

        TextBox.prototype.setValue = function (value) {
            if (value == null || value.length <= 0) {
                this.Text = '';
                this.NumValue = null;
            } else {
                switch (this.type) {
                    case Zenith.TextBox.Type.Text:
                        this.Text = value.trim();
                        this.NumValue = null;

                        if (this.resultHiddenField)
                            this.resultHiddenField.value = this.Text;

                        break;

                    default:
                        var temp = value;
                        while (temp.indexOf('$') >= 0)
                            temp = temp.replace('$', '');
                        while (temp.indexOf(',') >= 0)
                            temp = temp.replace(',', '');

                        if (this.resultHiddenField)
                            this.resultHiddenField.value = temp;

                        this.NumValue = parseFloat(temp);
                        if (isNaN(this.NumValue)) {
                            this.NumValue = null;
                            this.Text = '';
                        } else
                            this.Text = (this.type == Zenith.TextBox.Type.Currency ? '$' : '') + this.NumValue.toFixed(this.DecimalPlaces).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');

                        break;
                }
            }

            this.textBox.value = this.Text;
            this.textBox.setAttribute('value', this.textBox.value); // So the value shows in the outerHTML property - for printing.
        };

        // ===============  Private Methods  ====================================================
        TextBox.prototype.FocusHandler = function (event) {
            while (this.textBox.value.indexOf('$') >= 0)
                this.textBox.value = this.textBox.value.replace('$', '');
            while (this.textBox.value.indexOf(',') >= 0)
                this.textBox.value = this.textBox.value.replace(',', '');
            this.textBox.select();
        };

        TextBox.prototype.BlurHandler = function (event) {
            this.setValue(this.textBox.value);

            var value = null;
            if (this.type == Zenith.TextBox.Type.Currency || this.type == Zenith.TextBox.Type.Numeric)
                value = this.NumValue;
            else
                value = this.textBox.value;

            this.SetOutput(value);

            this.ExecuteEvent(Zenith.ZenithEvent.EventType.Changed, [this.textBox, value]);
        };

        TextBox.prototype.doGetCaretPosition = function () {
            var CaretPos = 0;

            // IE Support
            if (document.selection) {
                this.ParentElement.focus();
                var Sel = document.selection.createRange();
                Sel.moveStart('character', -this.textBox.value.length);
                CaretPos = Sel.text.length;
            } else if (this.textBox.selectionStart || this.textBox.selectionStart == 0)
                CaretPos = this.textBox.selectionStart;

            return (CaretPos);
        };

        TextBox.prototype.toString = function () {
            if (this.type == Zenith.TextBox.Type.Text)
                return this.Text == null ? '' : this.Text;
            else
                return this.NumValue == null ? '' : this.NumValue.toString();
        };
        TextBox.Type = { Text: 1, Numeric: 2, Currency: 3 };
        return TextBox;
    })(Zenith.ControlBase);
    Zenith.TextBox = TextBox;
})(Zenith || (Zenith = {}));
