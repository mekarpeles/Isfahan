
/*
                 ,...         ,,                             
`7MMF'         .d' ""       `7MM                             
  MM           dM`            MM                             
  MM  ,pP"Ybd mMMmm ,6"Yb.    MMpMMMb.   ,6"Yb.  `7MMpMMMb.  
  MM  8I   `"  MM  8)   MM    MM    MM  8)   MM    MM    MM  
  MM  `YMMMa.  MM   ,pm9MM    MM    MM   ,pm9MM    MM    MM  
  MM  L.   I8  MM  8M   MM    MM    MM  8M   MM    MM    MM  
.JMML.M9mmmP'.JMML.`Moo9^Yo..JMML  JMML.`Moo9^Yo..JMML  JMML.
*/

var Isfahan = function(configObject) {
  var _isfahan = this,

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }

  function getNode(id) {
    node = jQuery.grep(_isfahan.layout, function(node) {
      return node.id === id;
    })[0];
  };

  /*
    `7MMF'     A     `7MF'`7MMM.     ,MMF'
      `MA     ,MA     ,V    MMMb    dPMM  
       VM:   ,VVM:   ,V     M YM   ,M MM  
        MM.  M' MM.  M'     M  Mb  M' MM  
        `MM A'  `MM A'      M  YM.P'  MM  
         :MM;    :MM;       M  `YM'   MM  
          VF      VF      .JML. `'  .JMML.
  */
  /* Constructor for creating the WindowManager
     var wm = new isfahan.WindowManager(...)
   */
  this.WindowManager = function(options) {
    jQuery.extend(true, this, {    
      windows: {},
      selectedWindow: null,
      container: null,
      layout: {type: "row"},
      onEnter: function(window) {},
      onExit: function(window) {}
    }, options);
    this.element = this.element || jQuery('<div id="windowManager">');
    this.init();
  };
  this.WindowManager.prototype = {
    init: function () {
      this.element.(this.container);
      this.render();
      this.bindEvents();
    },    
    get: function(prop) {
      return this[prop];
    },
    
    set: function(prop, value, options) {
      var _this = this;
      this[prop] = value;
    },
    
    // Get window by window.id (dom id)
    getWindow: function(id) {
      return this.windows[id];
    }
    

    /*
                          ,,                    ,,                           
    `7MMF'     A     `7MF'db                  `7MM                           
      `MA     ,MA     ,V                        MM                           
       VM:   ,VVM:   ,V `7MM  `7MMpMMMb.   ,M""bMM  ,pW"Wq.`7M'    ,A    `MF'
        MM.  M' MM.  M'   MM    MM    MM ,AP    MM 6W'   `Wb VA   ,VAA   ,V  
        `MM A'  `MM A'    MM    MM    MM 8MI    MM 8M     M8  VA ,V  VA ,V   
         :MM;    :MM;     MM    MM    MM `Mb    MM YA.   ,A9   VVV    VVV    
          VF      VF    .JMML..JMML  JMML.`Wbmd"MML.`Ybmd9'     W      W     
    */

    /* Defines a structure to which maps the dom + user's data
     * to a node. This is a physical Window (what is seen) of the
     * Workspace.
     */
    Window: function() {
      var Window = function(id, container, buffer) {
	return {
	  "id": id,
	  "container": container,
	  "buffer": buffer // object storing user's data
	}
      };
      Window.prototype = {
	/* Sets the buffer contents of the Window */
	set: function(buffer) {
	  this.buffer = buffer;
	}

	/* Removing a window makes a call to Isfahan to remove the
	 * node correctly.
	 */
	remove: function() {
	  _isfahan.delete(this.id);
	},

	/* Declare this window to be currently selected */
	select: function() {},

	/* Splitting */
	vsp: function() {},
	hsp: function() {}
      };
      return Window;
    }();

    render: function() {
      var _this = this;
      _this.layout = new _isfahan({
	containerId: _this.element.attr('id'),
	layout: _this.layout,
	padding: 0
      });
      
      var data = _this.layout.filter( function(d) {
	return !d.children;
      });
      
      // Data Join.
      var divs = d3.select("#" + _this.element.attr('id'))
	.selectAll(".layout-slot")
	.data(data, function(d) { return d.id; });
      
      // Implicitly updates the existing elements.
      // Must come before the enter function.
      divs.call(cell).each(function(d) {
      });
      
      // Enter
      divs.enter().append("div")
	.attr("class", "layout-slot")
	.attr("data-layout-slot-id", function(d) { return d.id; })
	.call(cell)
	.each(function(d) {
	  var $container = jQuery(
	    _this.element.children('div')
	      .filter('[data-layout-slot-id="' + d.id + '"]')[0]
	  );
	  var window = new _this.Window({
	    id: d.id,
	    container: $container
	  });
	  _this.windows[d.id] = window;
	  _this.onEnter(window);
	});

      // Exit
      divs.exit()
	.remove("div")
	.each(function(d) {
	  _this.onExit();
	});
      
      function cell() {
	this
	  .style("left", function(d) { return d.x + "px"; })
	  .style("top", function(d) { return d.y + "px"; })
	  .style("width", function(d) { return Math.max(0, d.dx ) + "px"; })
	  .style("height", function(d) { return Math.max(0, d.dy ) + "px"; });
      }
    },

    bindEvents: function() {
      var _this = this;
      d3.select(window).on('resize', function(event) {
	_this.render();
      });
    }
  };
  
  /*                           ,,          
  `7MN.   `7MF'              `7MM          
    MMN.    M                  MM          
    M YMb   M  ,pW"Wq.    ,M""bMM  .gP"Ya  
    M  `MN. M 6W'   `Wb ,AP    MM ,M'   Yb 
    M   `MM.M 8M     M8 8MI    MM 8M"""""" 
    M     YMM YA.   ,A9 `Mb    MM YM.    , 
  .JML.    YM  `Ybmd9'   `Wbmd"MML.`Mbmmd' 
  */


  /* Defines an internal data structure Isfahan uses to manage
   * internal representation of layout.
   */
  this.Node = function(type, parent) {
    return {
      "type": type;
      "id": _isfahan.uuid()
      "parent": parent
    }
  };
  this.Node.prototype = {
    index: function() {
      return this.parent.children.indexOf(this);
    }

    delete: function() {
      var index = this.index();
      if (this.parent.children.length === 2) {
	// remove this node from parent's children
	this.parent.children.splice(index, 1);

	// Since there are only 2 children of parent, and we just
	// deleted one of them (this), the parent ceases to serve any
	// purpose. Thus, we convert sibling into its own parent and
	// delete the antiquated parent reference.
	var sibling = this.parent.children[0];
	sibling.parent.id = sibling.id; // override parent
	delete this.parent;
      } else if (this.parent.children.length > 2) { 
	// If the node is one of more than 2 siblings,
	// simply splice it out of the parent's children 
	// array.
	this.parent.children.splice(index, 1);
      }
    }
  }





  containerSize = function(containerId) {
    return [document.getElementById(containerId).offsetWidth,
      document.getElementById(containerId).offsetHeight]
  },
  containerId = configObject.containerId,
  pad = d3_layout_cellPadNull,
  round = Math.round,
  padding = configObject.padding,
  hierarchy = d3.layout.hierarchy(),
  layout = configObject.layout;

  function calculateLayout(node) {
    var children = node.children;

    if (children && children.length) {
      var rect = pad(node),
      type = node.type,
      group = [],
      remaining = children.slice(), // copy-on-write
      child,
      n;

      while ((n = remaining.length) > 0) {
        group.push(child = remaining[n - 1]);
        remaining.pop();
      }

      position(group, node.type, rect);
      children.forEach(function(child, index) {
        child.address = node.address.concat("." + child.type + (index + 1));
      })
      children.forEach(calculateLayout);
    }
  }

  // Positions the specified row of nodes. Modifies `rect`.
  function position(group, groupType, rect) {
    // console.log('%c\n'+' parent ' + groupType + ' rect is: ', 'background: #222; color: #EFEFEF; font-family: helvetica neue; font-size:20px; padding: 0 7px 3px 0;');
    // console.log(rect);
    var i = -1,
    // for ternary statements later, specifies whether that particular
    // child is a row or not. Allows easy, centralised description of the
    // parameter calculations that can be switched from row to column.
    row = (groupType === "row") ? false : true,
    n = group.length,
    x = rect.x,
    y = rect.y,
    o;
    var offset = 0;
    while (++i < n) {
      o = group[n-(i+1)],
      d = divisor(o, row, rect, group, n),
      o.id = typeof o.id !== 'undefined' ? o.id : uuid(),
      o.x = row ?  x : x + offset,
      o.y = row ? y + offset : y,
      o.dx = row ? rect.dx : rect.dx/d,
      o.dy = row ? rect.dy/d : rect.dy,
      offset += row ? o.dy : o.dx;
      // console.log({x:o.x, y: o.y, width:o.dx, height: o.dy});
    }
  }

  function divisor(node, row, rect, group, n) {

    var old = false,
    dimension = row ? 'dy' : 'dx',
    total = rect[dimension],
    divisor;
    // if not already set, divide equally.
    group.forEach(function(item) {
      if (!item[dimension] === undefined) {
        old = true;
      }
    });

    if (old) {
      console.log('preserved');
      var sum = group.reduce(
        function(previousValue, currentValue, index, array) {
        return previousValue[dimension] + currentValue[dimension];
      });
      console.log('sum: ' + sum);

      divisor = (node[dimension]/sum)*total;
      console.log("divisor: "+divisor);
      return divisor;
    } else {
      return n;
    }
  }

  function isfahan(configObject) {
    var nodes = hierarchy(configObject.layout),
    root = nodes[0];
    size = (function(containerSelector) {
      var width = jQuery(containerSelector).width();
      var height = jQuery(containerSelector).height();

      return [width, height];
    })(configObject.containerSelector);
    root.x = 0;
    root.y = 0;
    root.dx = containerSize(containerId)[0];
    root.dy = containerSize(containerId)[1];
    root.address = root.type + "1";
    root.id = root.id || uuid();

    calculateLayout(root);
    isfahan.padding(padding);
    nodes = nodes.map(function(node) {
      return merge(node, pad(node));
    });

    return nodes;
  }

  isfahan.size = function(x) {
    if (!arguments.length) return containerSize;
    containerSize = x;
    return isfahan;
  };

  isfahan.round = function(x) {
    if (!arguments.length) return round != Number;
    round = x ? Math.round : Number;
    return isfahan;
  };

  isfahan.padding = function(x) {
    if (!arguments.length) return padding;

    function padFunction(node) {
      var p = x.call(isfahan, node, node.depth);
      console.log(p);
      return p == null
      ? d3_layout_cellPadNull(node)
      : d3_layout_cellPad(node, typeof p === "number" ? [p, p, p, p] : p);
    }

    function padConstant(node) {
      return d3_layout_cellPad(node, x);
    }

    var type;
    pad = (padding = x) == null ? d3_layout_cellPadNull
    : (type = typeof x) === "function" ? padFunction
    : type === "number" ? (x = [x, x, x, x], padConstant)
    : padConstant;
    return isfahan;
  };

  function d3_layout_cellPadNull(node) {
    return {x: node.x, y: node.y, dx: node.dx, dy: node.dy};
  }

  function d3_layout_cellPad(node, padding) {
    var x = node.x + padding[3],
    y = node.y + padding[0],
    dx = node.dx - padding[1] - padding[3],
    dy = node.dy - padding[0] - padding[2];
    if (dx < 0) { x += dx / 2; dx = 0; }
    if (dy < 0) { y += dy / 2; dy = 0; }
    return {x: x, y: y, dx: dx, dy: dy};
  }

  function merge(target, source) {

    /* Merges two (or more) objects,
       giving the last one precedence */

    if ( typeof target !== 'object' ) {
      target = {};
    }

    for (var property in source) {

      if ( source.hasOwnProperty(property) ) {

        var sourceProperty = source[ property ];

        if ( typeof sourceProperty === 'object' ) {
          target[ property ] = util.merge( target[ property ], sourceProperty );
          continue;
        }

        target[ property ] = sourceProperty;

      }

    }

    for (var a = 2, l = arguments.length; a < l; a++) {
      merge(target, arguments[a]);
    }

    return target;
  };

  // return d3.rebind(isfahan, hierarchy,"sort", "children", "value");
  return isfahan(configObject);
};


