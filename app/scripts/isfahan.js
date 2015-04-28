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

var Isfahan = (function (){

  /* Utility for calculating size of a DOM element */
  elementSize: function(id) {
    return [document.getElementById(id).offsetWidth,
	    document.getElementById(id).offsetHeight]
  },

  /*
    `7MMF'     A     `7MF'`7MMM.     ,MMF'
      `MA     ,MA     ,V    MMMb    dPMM  
       VM:   ,VVM:   ,V     M YM   ,M MM  
        MM.  M' MM.  M'     M  Mb  M' MM  
        `MM A'  `MM A'      M  YM.P'  MM  
         :MM;    :MM;       M  `YM'   MM  
          VF      VF      .JML. `'  .JMML.
  */
  /* Constructs WindowManagers which offer an interface for
   * manipulating Windows through Tilers. Interfaces with d3 for
   * rendering/drawing.
   *
   * var wm = new Isfahan.WindowManager(...)
  */
  
  WindowManager: (function() {
    var _isfahan = this;
    var WindowManager = function(options) {      
      this.windows = {};
      this.selectedWindow = options.selectedWindow || null;

      // Tiler; manages layout
      this.tiler = new _isfahan.Tiler({
	bind: options.bind,
	container: options.element,
	layout: options.layout,
	padding: options.padding
      });

      // Callbacks for window creation
      this.onCreate = options.onCreate || function(window) {};
      this.onUpdate = options.onUpdate || function(window) {};
      this.onDelete = options.onDelete || function(window) {};
    };
    WindowManager.prototype = {

      /* TODO: Returns a deep copy of this workspace's settings, but not
       * its data. This is useful if you want to create a new empty
       * workspace with the same configuration or settings as this one.
       */
      clone: function() {},
      
      /* TODO: Returns a shallow copy which is an exact replica of this
       * workspace, including its nodes and data.
       */
      copy: function() {},
      
      /* Get a window by its DOM/d3 element id */
      getWindow: function(id) { return this.windows[id]; }

      /* Grep the tiler layout for node representing id */
      getNode: function(id) { return this.tiler.getNode(id); }

      /*
	Changes focus to the specified Window or, the Window to the
	`direction` ∈ ['l' | 'u' | 'r' | 'd'] of Window.
      */
      select: function(window, direction) {
	var _this = this;
	var node = _this.getNode(window.id);
	// XXX use window.neighbors
	console.log('select this window')
      },

      /* Reset the window manager based on the initial layout and
       * parameters */
      reset: function() {
	this.tiler.reset(); // resets tiler to default layout
	this.render(); // performs tiler.prime()
      },      

      render: function() {
	var _this = this;

	// tiler recalculates size + pos from current state of layout
	_this.tiler.prime();

	var data = _this.tiler.layout.filter(function(d) {
          return !d.children;
	});

	// Data Join.
	var divs = d3.select("#" + _this.element.attr('id'))
          .selectAll(".layout-slot")
          .data(data, function(d) { return d.id; });
	
	// Update
	// Implicitly updates the existing elements.
	// Must come before the enter function.
	divs.call(cell).each(function(d) {
	  _this.onUpdate(_this.getWindow(d.id));
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
          var window = new _this.Window({ id: d.id, container: $container });
          _this.windows[d.id] = window;
          _this.onCreate(window);
        });

	// Exit
	divs.exit()
          .remove("div")
          .each(function(d) { _this.onDelete(); });
	
	function cell() {
          _this
            .style("left", function(d) { return d.x + "px"; })
            .style("top", function(d) { return d.y + "px"; })
            .style("width", function(d) { return Math.max(0, d.dx ) + "px"; })
            .style("height", function(d) { return Math.max(0, d.dy ) + "px"; });
	}
      },
      
      /* Allows the WindowManager to react to browser events,
       * e.g. resizing
       */
      bindEvents: function() {
	var _this = this;
	d3.select(window).on('resize', function(event) {
          _this.render();
	});
      },

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
      Window: (function() {
	var _wm = this; // ref to window manager
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
          },
	  
          /* Remove this window. Calls to this WindowManager's Tiler
           * to remove this Window and its underlying node from the
           * layout. If this window is selectedWindow, should delegate
           * its selectedness to closest neighbor or parent (or null)
           */
          remove: function() {
	    var _this = this;
	    _wm.tiler.node.delete(this.id);
	    if (_wm.selectedWindow.id === this.id) {
	      // XXX TODO: Select one of this window's nearest
	      // neighbors or parent and update selectedWindow.
	      _this.selectedWindow = null;
	    }
	    delete _wm.windows[this.id];
	    _wm.render();
          },

	  /* Retrieves a list of windows neighboring this one. Useful
	   * for selecting a neighboring window.
	   */
	  neighbors: function() { console.log('neighbors'); }

          /* Declare this window to be currently selected */
          select: function() { console.log('select'); },

          /* Splitting */
          vsp: function(after) {
	    var _this = this;
	    var node = _wm.getNode(_this.id);
	    var offset = direction === 'd' ? 1 : 0;
	    if (node.type === 'column') {
	      node.insertParent(offset);
	    } else {
	      node.insertSibling(offset);
	    }
	    return node;
	  },

	  /* Performs a horizontal split */
          hsp: function(after) {
	    var _this = this;
	    var node = _wm.getNode(_this.id);
	    var offset = direction === 'r' ? 1 : 0;
	    if (node.type === 'column') {
	      node.insertSibling(offset);
	    } else {
	      node.insertParent(offset);
	    }
	    return node;
	  }

	  split: function(window, direction, after) {
	    var _this = this;
	    var node = (function insert() {
	      if (['l', 'r'].indexOf(direction) != -1) {
		_this.splitHorizontally(window, after);
	      } else { 
		_this.splitVertically(window, after);
	      }
	    })();
	    // recalculates via _this.tiler.prime()
	    _this.render();
	  }	 
	};
	return Window;
      })()
    };
    return WindowManager;
  })(),

  */
  ooooooooooooo  o8o  oooo                     
  8`   888   `8   ~   `888                     
       888      oooo   888   .ooooo.  oooo d8b 
       888      `888   888  d88` `88b `888 `8P 
       888       888   888  888ooo888  888     
       888       888   888  888    .o  888     
      o888o     o888o o888o `Y8bod8P` d888b    
  */

  /*
    The Tiler is responsible for maintaining an internal
    representation of the windowmanager's Windows. Tiler calculates
    the dimensions and positions of each Window within the hierarchy,
    via the use of Nodes and layout.
  */
  Tiler: (function () {
    var _isfahan = this;
    var Tiler = function(settings) {
      this.settings = settings;
      this.bind = settings.bind; // DOM element to bind
      this.container = settings.container || 
	jQuery('<div id="windowManager">');

      this.padding = settings.padding || 0;
      this.pad = d3_layout_cellPadNull,
      this.hierarchy: d3.layout.hierarchy(),

      // inject WindowManager container element into bound element,
      // but only at init, not for reset.
      this.container.appendTo(this.bind);
      this.init(settings);
    };
    Tiler.prototype = {

      init: function() {
	this.layout = this.settings.layout || {type: "row"};
	this.nodes = this.hierarchy(settings.layout);
      }

      reset: function() {
	this.init();
      }

      /* Called by WindowManager render */
      prime: function() {	
	var _this = this;

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

	/* Positions the specified row of nodes. Modifies `rect`. The
	   ternary statements, specify whether a particular child is a
	   row or not. Allows easy, centralised description of the
	   parameter calculations that can be switched from row to
	   column.
	 */
	function position(group, type, rect) {
	  var i = -1,
	  row = (groupType === "row") ? false : true,
	  n = group.length,
	  x = rect.x,
	  y = rect.y,
	  o;
	  var offset = 0;
	  while (++i < n) {
	    o = group[n-(i+1)],
	    d = divisor(o, row, rect, group, n),
	    o.id = typeof o.id !== 'undefined' ? o.id : genUuid(),
	    o.x = row ?  x : x + offset,
	    o.y = row ? y + offset : y,
	    o.dx = row ? rect.dx : rect.dx/d,
	    o.dy = row ? rect.dy/d : rect.dy,
	    offset += row ? o.dy : o.dx;
	  }
	}

	function calculateLayout(node) {
	  var children = node.children;

	  if (children && children.length) {
	    var rect = _this.pad(node),
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

	var nodes = hierarchy(_this.layout);
	root = nodes[0];
	root.x = 0;
	root.y = 0;
	root.dx = containerSize(containerId)[0];
	root.dy = containerSize(containerId)[1];
	root.address = root.type + "1";
	root.id = root.id || genUuid();

	_this.calculateLayout(root);
	_this.padding(padding);
	nodes = nodes.map(function(node) {
	  return merge(node, pad(node));
	});

	_this.layout = nodes;
      },

      getNode: function(id) {
	return jQuery.grep(this.layout, function(node) {
	  return node.id === id;
	})[0];
      },

      /*                           ,,          
        `7MN.   `7MF'              `7MM          
          MMN.    M                  MM          
          M YMb   M  ,pW"Wq.    ,M""bMM  .gP"Ya  
          M  `MN. M 6W'   `Wb ,AP    MM ,M'   Yb 
          M   `MM.M 8M     M8 8MI    MM 8M"""""" 
          M     YMM YA.   ,A9 `Mb    MM YM.    , 
        .JML.    YM  `Ybmd9'   `Wbmd"MML.`Mbmmd' 
        */

      /* Defines an internal data structure the Isfahan Tiler uses to
       * manage internal representation of Window + its position
       * within layout.
       */
      Node: (function() {
	var _tiler = this;
	var Node = function(type, parent) {
	  this.type = type;
	  this.id = this.uuid();
	  this.parent = parent;
	};
	Node.prototype = {

	  uuid: function() {
	    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
	      .replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	      });
	  },

	  index: function() {
	    return this.parent.children.indexOf(this);
	  },

	  // Auxilary function to retrieve neighbors
	  neighbors: function() {
	    return this.parent.children;
	  },

	  /* Insert a node above or below this node. Transforms both
	   * the target node and its parent.
	   * The old linked-list insert switch'aroo:
	   - parent is this node's original parent.
	   - point newParent's parent to this's parent
	   - this node's parent becomes newParent
	  */
	  insertVertically: function(after) {
	    var _this = this;
	    // _tiler.layout.push(newParent, newSibling)
	  },

	  insertHorizontally: function(after) {

	  },

	  delete: function() {
	    /* TODO:
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
	  */
	  }
	};
	return Node;
      }()),    

    };
    return Tiler;
  });
})();