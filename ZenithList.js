/*******************************************************************************************
Title:  Javascript Collections Implementation
Description:  An implementation of a Generic Collections with LINQ support (based on .NET).
Author:  Shawn Lawsure
Usage Example:
function Car(make, model)
{
this.make = make;
this.model = model;
}
var myList = new List();
myList.Add(new Car("Honda", "CR-V"));
myList.Add(new Car("Nissan", "Sentra"));
myList.Add(new Car("Honda", "Civic"));
var selList = myList.Where("make == 'Honda'").OrderByDescending("model");
*********************************************************************************************/
var Zenith;
(function (Zenith) {
    var List = (function () {
        function List() {
            this.listArray = new Array();
        }
        // ===============  Public Methods  ====================================================
        // Method:  Add
        // Description:  Add an element to the end of the list.
        List.prototype.Add = function (object) {
            this.oType = typeof (object);

            this.validate(object);

            this.listArray.push(object);
        };

        List.prototype.Remove = function (item) {
            var index = this.listArray.indexOf(item);
            if (index >= 0)
                this.listArray.splice(index, 1);
        };

        // Method:  Count
        // Description:  Return the number of elements in the list.
        List.prototype.Count = function () {
            return this.listArray.length;
        };

        // Method:  Data
        // Description:  Set the list data using the passed in array.
        List.prototype.Data = function (dataArray) {
            this.listArray = dataArray;
        };

        // Method:  ElementAt
        // Description:  Get the element at a specific index in the list.
        List.prototype.ElementAt = function (index) {
            if (index >= this.Count() || index < 0)
                throw "Invalid index parameter in call to List.ElementAt";
            return this.listArray[index];
        };

        // Method:  Where
        // Description:  Return a copy of this List object with only the elements that meet the criteria
        //               as defined by the 'query' parameter.
        List.prototype.Where = function (query) {
            return this.select(query);
        };

        // Method:  FirstOrDefault
        // Description:  Return the first object in the list that meets the 'query' criteria or null if
        //               no objects are found.
        List.prototype.FirstOrDefault = function (query) {
            var list = this.select(query);
            return list ? list.ElementAt(0) : null;
        };

        // Method:  OrderBy
        // Description:  Order (ascending) the objects in the list by the given object property name.
        List.prototype.OrderBy = function (property) {
            return this.copy(this.listArray.slice(0).sort(this.genericSort(property)));
        };

        // Method:  OrderByDescending
        // Description:  Order (descending) the objects in the list by the given object property name.
        List.prototype.OrderByDescending = function (property) {
            return this.copy(this.listArray.slice(0).sort(this.genericSort(property)).reverse());
        };

        List.prototype.ForEach = function (query, callback) {
            this.select(query).listArray.forEach(function (value, index, array1) {
                callback.call(value);
            });
        };

        List.prototype.Each = function (from, callback) {
            this.listArray.forEach(function (value, index, array1) {
                callback.call(from, value);
            });
        };

        // ===============  Private Methods  ====================================================
        // Method:  copy
        // Description:  Create a copy of this List object using the passed in array of data.
        List.prototype.copy = function (array) {
            var newList = new List();
            for (var property in this)
                newList[property] = this[property];

            newList.Data(array);

            return newList;
        };

        // Method:  validate
        // Description:  Make sure that all objects added to the List are of the same type.
        List.prototype.validate = function (object) {
            if (typeof (object) != this.oType)
                throw "Only one object type is allowed in a list";
        };

        // Method:  select
        // Description:  Return a copy of this List object with only the elements that meet the criteria
        //               as defined by the 'query' parameter.
        // Usage Example:
        //              var selList = select("make == 'Honda'").
        List.prototype.select = function (query) {
            var selectList = this.copy([]);

            for (var arrIndex = 0; arrIndex < this.listArray.length; arrIndex++)
                if (eval('this.listArray[arrIndex].' + query))
                    selectList.Add(this.listArray[arrIndex]);

            return selectList;
        };

        // Method:  genericSort
        // Description:  Sort comparison function using an object property name.  Pass this function to
        //               the Javascript sort function to sort the list by a given property name.
        // Usage Example:
        //              var sortedList = listArray.sort(genericSort('model'));
        List.prototype.genericSort = function (property) {
            return function (a, b) {
                return (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            };
        };
        return List;
    })();
    Zenith.List = List;
})(Zenith || (Zenith = {}));
