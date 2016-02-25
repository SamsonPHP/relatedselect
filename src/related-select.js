/**
 * Created by molodyko on 18.02.2016.
 */

/**
 * Init class
 * @param data array
 */
var RelatedSelect = function(options) {

    // Save prototype
    var self = this.constructor.prototype;

    // Data collection
    this.collection = options.data;

    // Group name
    this.group = options.group;

    // If set onload method
    this.onLoad = options.onLoad;

    // If set onload method
    this.onAdd = options.onAdd;

    // Sort collection
    this.sortCollectionHandler = options.sortCollectionHandler;

    // Init data
    this.initData = options.initData;

    // On render callback
    this.onRender = options.onRender || function(element) {
            // Set selectFx plugin
            new SelectFx(element.DOMElement, {
                onChange: function(value, old, el) {
                    var id = s(el).a('data-id');

                    // Change selected option
                    this.changeOption(id, value);
                    this.reDraw();
                }.bind(this)
            });
        };

    // Store all select with data
    this.elements = [];

    // Set name of select tag
    this.selectName = options.selectName || 'name';

    // Default class of select
    this.selectDefaulClass = options.cssClasses || '.select-group';

    /**
     * Count of data collection
     * @returns {*}
     */
    self.collectionCount = function() {
        return this.collection.length;
    };

    /**
     * Count of set select
     * @returns {Number}
     */
    self.count = function() {
        return Object.keys(this.elements).length;
    };

    /**
     * Remove select
     * @param id
     * @returns {boolean}
     */
    self.remove = function(id) {
        if (typeof this.elements[id] !== 'undefined') {
            delete this.elements[id];
            this.reDraw();
            return true;
        }
        return false;
    };

    /**
     * Redraw all select of such group
     */
    self.reDraw = function() {
        for (var id in this.sortSelects()) {
            var element = this.elements[id];
            this.addSelect(element.parent, element.selected, id);
        }
    };

    /**
     * Sort slect after redraw
     */
    self.sortSelects = function() {
        return this.elements.sort(function(a, b) {
            if (a.created > b.created) {
                return -1;
            }
            if (a.created < b.created) {
                return 1;
            }
            return 0;
        });
    };

    /**
     * Change selected option
     * @param id
     * @param value
     */
    self.changeOption = function(id, value) {
        var element = this.findElementById(id);
        element.selected = value;
    };

    /**
     * Add select to page
     */
    self.add = function() {
        this.addSelect.apply(this, arguments);
        this.reDraw();
    };

    /**
     * Add select to page
     * @param parent
     * @param selected
     * @param id
     */
    self.addSelect = function(parent, selected, id) {

        var selectedKeys = this.getSelectedOptions();

        // If it is new select and such selected value is passed then set another value
        if ((selectedKeys != null) && (id == null)) {
            // If keys exists in array or selected not passed then find first valid value from collection
            if (selectedKeys.indexOf(selected) !== -1 || selected === undefined) {
                for (var i in this.collection) {
                    var value = this.getFirstKey(this.collection[i]);
                    if (selectedKeys.indexOf(value) === -1) {
                        selected = value;
                        break;
                    }
                }
            }
        }

        var id = id || this.guid(),
            selectHtml = this.createSelectByData(id, selected),
            parentElement = parent.html('').append(selectHtml),
            selectElement = s(this.selectDefaulClass + '[data-id="' + id + '"]');

        // Call event handler
        this.onRender.call(this, selectElement);

        // Add element to class data
        this.addElement(parentElement, id, selected, selectElement);
    };

    /**
     * Add element to class data
     * @param parent
     * @param id
     * @param selected
     * @param element
     */
    self.addElement = function(parent, id, selected, element) {
        this.elements[id] = {
            parent: parent,
            selected: selected,
            element: element,
            created: (new Date()).getTime()
        };
    };

    /**
     * Find element by id
     * @param id
     * @returns {*}
     */
    self.findElementById = function(id) {
        return this.elements[id];
    };


    /**
     * Get html of select
     * @param id String id of element
     * @param selected
     */
    self.createSelectByData = function(id, selected) {
        var options = '',
            selectedKeys = this.getSelectedOptions();

        // Iterate all collection value
        this.sortCollection().forEach(function(item) {
            var value = this.getFirstKey(item),
                key = item[value];

            // If value already set then go next
            if (selectedKeys != null && selectedKeys.indexOf(value) !== -1) {
                var element = this.findElementById(id);
                if (element != null && element.selected != value) {
                    return;
                }
            }

            options += this.optionHtml(value, key, value == selected);
        }.bind(this));

        return this.selectHtml(options, this.group, id, this.selectDefaulClass.replace(/\./g, ' '), this.selectName);
    };

    /**
     * Sort collection
     */
    self.sortCollection = function() {
        return this.collection.sort(typeof this.sortCollectionHandler === 'function' || function (a, b) {
            if (this.getFirstKey(a) > this.getFirstKey(b)) {
                return 1;
            }
            if (this.getFirstKey(a) < this.getFirstKey(b)) {
                return -1;
            }
            return 0;
        }.bind(this));
    };

    /**
     * Get html of select tag
     * @param options
     * @param group
     * @param id
     * @param defaultClass
     * @returns {string}
     */
    self.selectHtml = function(options, group, id, defaultClass, name) {
        return '<select name="' + name + '" class="' + defaultClass + '" data-id="' + id + '" data-group="' + group + '">' + options + '</select>';
    };

    /**
     * Get html of option tag
     * @param value
     * @param name
     * @param selected
     * @returns {string}
     */
    self.optionHtml = function(value, name, selected) {
        var isSelected = selected ? 'selected="selected"' : '';
        return '<option value="' + value + '" ' + isSelected + '>' + name +'</option>';
    };

    /**
     * Get guid
     * @returns {string}
     */
    self.guid = function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };

    /**
     * Get first key of object
     * @param object
     * @returns {string}
     */
    self.getFirstKey = function(object) {
        for (var i in object) {
            return i;
        }
    };

    /**
     * Get selected options
     * @returns {Array}
     */
    self.getSelectedOptions = function() {
        var result = [];
        for (var id in this.elements) {
            result.push(this.elements[id].selected);
        }
        return result;
    };

    /**
     * Add selectors by data
     */
    self.initValues = function() {

        if (typeof this.initData !== 'undefined') {
            this.initData.forEach(function(value) {
                var value = typeof value === 'string' ? value : value.value;
                if (typeof this.onAdd === 'function') {
                    var selector = this.onAdd.call(this);
                }
                if (value) {
                    this.add(selector, value);
                }
            }.bind(this));
        }
    };

    if (typeof this.onLoad === 'function') {
        this.onLoad(this);
    }
};
