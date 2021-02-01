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

module Zenith
{
    export class List
    {
        private oType: any;
        private listArray: Array<any> = new Array<any>();

        // ===============  Public Methods  ====================================================

        // Method:  Add
        // Description:  Add an element to the end of the list.
        public Add(object: any): void
        {
            this.oType = typeof (object);

            this.validate(object);

            this.listArray.push(object);      
        }

		public Remove(item: any): void
		{
			var index: number = this.listArray.indexOf(item);
			if (index >= 0)
				this.listArray.splice(index, 1);
		}

        // Method:  Count
        // Description:  Return the number of elements in the list.
        public Count(): number
        {
            return this.listArray.length;
        }

        // Method:  Data
        // Description:  Set the list data using the passed in array.
        public Data(dataArray): void
        {
            this.listArray = dataArray;
        }

        // Method:  ElementAt
        // Description:  Get the element at a specific index in the list.
        public ElementAt(index): any
        {
            if (index >= this.Count() || index < 0)
                throw "Invalid index parameter in call to List.ElementAt";
            return this.listArray[index];
        }

        // Method:  Where
        // Description:  Return a copy of this List object with only the elements that meet the criteria
        //               as defined by the 'query' parameter.
        public Where(query: string): List
        {
            return this.select(query);
        }

        // Method:  FirstOrDefault
        // Description:  Return the first object in the list that meets the 'query' criteria or null if
        //               no objects are found.
        public FirstOrDefault(query: string): any
        {
            var list = this.select(query);
            return list ? list.ElementAt(0) : null;
        }

        // Method:  OrderBy
        // Description:  Order (ascending) the objects in the list by the given object property name.
        public OrderBy(property: string): List
        {
            return this.copy(this.listArray.slice(0).sort(this.genericSort(property)));
        }

        // Method:  OrderByDescending
        // Description:  Order (descending) the objects in the list by the given object property name.
        public OrderByDescending(property: string)
        {
            return this.copy(this.listArray.slice(0).sort(this.genericSort(property)).reverse());
        }

        public ForEach(query: string, callback: (item: any) => void )
        {
            this.select(query).listArray.forEach(function (value, index, array1)
            {
                callback.call(value);
            });
        }

        public Each(from : any, callback: (item: any) => void )
        {
            this.listArray.forEach(function (value, index, array1) 
            {
                callback.call(from, value);
            });
        }

        // ===============  Private Methods  ====================================================
      
        // Method:  copy
        // Description:  Create a copy of this List object using the passed in array of data.
        public copy(array): List
        {
            var newList = new List();
            for (var property in this)
                newList[property] = this[property];

            newList.Data(array);

            return newList;
        } 

        // Method:  validate
        // Description:  Make sure that all objects added to the List are of the same type.
        private validate(object): void
        {
            if (typeof (object) != this.oType)
                throw "Only one object type is allowed in a list";
        }

        // Method:  select
        // Description:  Return a copy of this List object with only the elements that meet the criteria
        //               as defined by the 'query' parameter.
        // Usage Example:  
        //              var selList = select("make == 'Honda'").
        private select(query): List
        {
            var selectList = this.copy([]);

            /*for (var arrIndex = 0; arrIndex < this.listArray.length; arrIndex++)
                with (this.listArray[arrIndex])
                    if (eval(query))
                        selectList.Add(listArray[arrIndex]);*/

            for (var arrIndex = 0; arrIndex < this.listArray.length; arrIndex++)
                if (eval('this.listArray[arrIndex].' + query))
                    selectList.Add(this.listArray[arrIndex]);

            return selectList;
        }

        // Method:  genericSort
        // Description:  Sort comparison function using an object property name.  Pass this function to
        //               the Javascript sort function to sort the list by a given property name.
        // Usage Example:
        //              var sortedList = listArray.sort(genericSort('model'));
        private genericSort(property)
        {
            return function (a, b)
            {
                return (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            }
        }

    }
}
