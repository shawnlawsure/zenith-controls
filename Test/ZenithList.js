var Zenith;
(function (Zenith) {
    var List = (function () {
        function List() {
            this.listArray = new Array();
        }
        List.prototype.Add = function (object, index) {
            this.oType = typeof (object);
            this.validate(object);
            if(index != undefined && index < this.Count()) {
                var first = this.listArray.splice(index);
                delete this.listArray;
                this.listArray = new Array();
                this.listArray.push(object);
                for(var firstIndex = 0; firstIndex < first.length; firstIndex++) {
                    this.listArray.push(first[firstIndex]);
                }
            } else {
                this.listArray.push(object);
            }
        };
        List.prototype.Count = function () {
            return this.listArray.length;
        };
        List.prototype.Data = function (dataArray) {
            this.listArray = dataArray;
        };
        List.prototype.ElementAt = function (index) {
            if(index >= this.Count() || index < 0) {
                throw "Invalid index parameter in call to List.ElementAt";
            }
            return this.listArray[index];
        };
        List.prototype.Where = function (query) {
            return this.select(query);
        };
        List.prototype.FirstOrDefault = function (query) {
            var list = this.select(query);
            return list ? list.ElementAt(0) : null;
        };
        List.prototype.OrderBy = function (property) {
            return this.copy(this.listArray.slice(0).sort(this.genericSort(property)));
        };
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
        List.prototype.copy = function (array) {
            var newList = new List();
            for(var property in this) {
                newList[property] = this[property];
            }
            newList.Data(array);
            return newList;
        };
        List.prototype.validate = function (object) {
            if(typeof (object) != this.oType) {
                throw "Only one object type is allowed in a list";
            }
        };
        List.prototype.select = function (query) {
            var selectList = this.copy([]);
            for(var arrIndex = 0; arrIndex < this.listArray.length; arrIndex++) {
                if(eval('this.listArray[arrIndex].' + query)) {
                    selectList.Add(this.listArray[arrIndex]);
                }
            }
            return selectList;
        };
        List.prototype.genericSort = function (property) {
            return function (a, b) {
                return (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            }
        };
        return List;
    })();
    Zenith.List = List;    
})(Zenith || (Zenith = {}));

