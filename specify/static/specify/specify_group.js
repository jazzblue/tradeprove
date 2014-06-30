/****************************************************************
*
* File name: specify_group.js
*
* Description:
* Group processor functions for Specify application web client.
* Group is a graphic representation of parenthesis which can be  
* placed or removed.
*
* Dependencies:
*  - specify_global.js
*  - specify_layout_func.js
*  - specify_group_layout.js
****************************************************************/

function create_group(group_type, group_orientation) {
    // Creates and returns group HTML object.

    var group = $("<div/>")
        .css("position", "absolute")
        .css("top", "0px")
        .css("left", "0px");
    
    set_group(group, group_type, group_orientation);
    return(group);
}


function set_group(groups, group_type, group_orientation) {
    // Sets group attributes: type and orientation.

    groups.removeClass();
    groups.addClass(group_type);
    groups.addClass(group_orientation);    
}


function add_groups(cell, group_high, group_end_level, group_type, group_orientation) {
    // Adds groups to cell
    
    var cur_group_type = group_type;   // Initialize
                                                        

    for (var i = group_high; i >= 1; i--) {
        // Descend from the highest group to lowest and use prepend operator    
        
        cell.prepend(create_group(cur_group_type, group_orientation));
        
        // Switch to group-mid after group_end_level is prepended
        if (i == group_end_level) { cur_group_type = "group-mid"; }
    }
}


function bind_group_dialog(groups) {
    // Binds group dialog to groups.

    groups.click(function(event) {
        event.stopPropagation();

        var invoking_group = $(this);

        GROUP_DIALOG.attr("title", "Delete grouping?");
            
        // Dialog setup
        GROUP_DIALOG.dialog({
            autoOpen: false,
            modal: true,            
            position: { of: invoking_group }, // place at the center of invoking fields
            buttons: [
                { 
                    text: "Delete", 
                    click: function() { 
                        $(this).dialog("close");
                        
                        if (invoking_group.index() == 0) {
                            alert("Can't delete the lowest group.");
                        }
                        else {
                            var invoking_cell = invoking_group.parent();
                        
                            manage_group(invoking_cell, invoking_group.index(), "delete", "invoking");
                            
                            // Adjust cells offsets
                            enumerate_formula(invoking_cell.parent(), null, 0);
                            
                            $(this).dialog("destroy");
                        }
                    }
                },
                {
                    text: "Cancel", 
                    click: function() {
                        $(this).dialog("close");                            
                        $(this).dialog("destroy");
                    } 
                },
            ]
        })
        GROUP_DIALOG.dialog("open");
    });    
}


function manage_group(cell, group_level, operation, scan_direction) {
    // Adds or deletes a group.

    // Arguments:
    // group_level:
    //  - for "delete": deleted group level
    //  - for "add" : level of the group under which the group will be added
    //
    // scan_direction: 
    //       invoking - invoking cell the start of recursive scan 
    //       before - scanning before the invoking cell recursively, until "group-open" is reached
    //       after - scanning after the invoking cell recursively, until "group-close" is reached
    //       group_level -level of the group under which the new group should be placed or group_level that should be deleted
    //       operation: "add" or "delete"    

    // For "add" the invoking cell is always operator.

    // We scan "before" until we hit "group-open" or "group-self' at the group level. In the simple case we will hit it right away with the first operator "before", 
    //  because we will hit "group-self"
        
    var add_group_type = "group-mid"; // This is only needed for "add" operation.
                                      //    The default is "mid", unless the open or close is reached by recursive scan, in that case add_group_type will be reevaluated
    
    // If the cell is "operator", cur_group will be the fields and not group
    // It is still OK, since it will not have "group-open" or "group-self" class
    var cur_group = cell.children(":eq("+ group_level +")");
    
    if (scan_direction == "before" || scan_direction == "invoking") {
        
        // Scan cells recursively "before" until "group-open" is reached 
        if (cur_group.hasClass("group-open") || cur_group.hasClass("group-self")) {
            add_group_type = "group-open";
        }
        else {
            manage_group(cell.prev(), group_level, operation,  "before");
        }
    }
    
    // When recursion comes back from scanning "before" back to the "invoking" it will start scanning "after" right here
    if (scan_direction == "after" || scan_direction == "invoking") {
    
        // Scan cells recursively "after" until "group-close" is reached 
        if (cur_group.hasClass("group-close") || cur_group.hasClass("group-self")) {
            add_group_type = "group-close";
        }
        else {
            manage_group(cell.next(), group_level, operation,  "after");            
        }    
    }

    if (operation == "delete") {
        cell.children(":eq("+ group_level +")").unbind("click");
        
        // Delete group in this cell
        cell.children(":eq("+ group_level +")").remove();
    }
    else { // Operation "add"
        var new_group = create_group(add_group_type, get_cell_orientation(get_cell_parent_class(cell)));
        bind_group_dialog(new_group);
        
        // Add group in this cell below the group_level
        cell.children(":eq("+ group_level +")").before(new_group);
    }
    
    // Enumerate groups in this cell
    process_groups(cell, get_cell_parent_class(cell));
    
    enum_and_place_formula(cell.parent("." + FORMULA_CLASS_NAME), 0);
}


function process_groups(cell, parent_class) {
    // Process cell's groups:
    // 1. Sets group's color depending on even/odd attribute of the group.
    // 2. Sets width and height and offsets of groups in the cell.
    // Arguments:
    //      cell - cell in which groups should be processed
    //      parent_class - cell's parent class

    if (element_cfg_table[parent_class]["formula_has_grouping"]) {
    
        var operand_class = element_cfg_table[parent_class]["dynamic_child_operand"];
    
        // Remove all the groups marked for deletion
        cell.children(".group-remove").unbind("click");
        cell.children().remove(".group-remove");
        
        var groups = get_cell_groups(cell);
        
        var offset_in_cell = 0;
    
        // If "group-close" is in he cell, reverse the groups and place fields
        // in that case we will be placing items in the cell starting from top (fields) to bottom,
        // so that the lowest "group-close" would stick out the most to the "after" side
        if (cell_has_group_close(cell)) {
            groups = $(groups.get().reverse());
            adjust_offset_in_cell (cell.children("." + FIELDS_CLASS_NAME), offset_in_cell);
        }
        
        // The group should be the same dimensions as operand fields, possibly with some added margins. 
        // The algorithm to set group's shape:
        //  1. Set the same shape as operand field in that formula.
        //  2. If the fields is operator, change group's length to "operator length"
                
        add_geometry(operand_class, groups, element_geometry_table, parent_class);  // Item 1. above
        
        var is_operator = cell.children("." + FIELDS_CLASS_NAME).hasClass("operator");

        groups.each(function() {        
            shape_group($(this), parent_class, is_operator);
    
            adjust_offset_in_cell ($(this), offset_in_cell);
            
            // If "group-open" or "group-close" add margin to the offset after placing
            if ($(this).hasClass("group-open") || $(this).hasClass("group-close")) {
                offset_in_cell = offset_in_cell + group_margin;
            }
        });
    
        // If there is no "group-close" in the cell (this case is dealt with earlier), place the fields last
        // in the cell (so that it would have all accumulated offsets by all "group-open" or no offset, 
        // if there are no "group-open" in the cell).
        if (!cell_has_group_close(cell)) {
            adjust_offset_in_cell (cell.children("." + FIELDS_CLASS_NAME), offset_in_cell);
        }
    }
}

function measure_group(group, scan_direction, remove_group, operators_min, operators_count) {
    // Scans the group starting from the cell containing specified argument "group" in both directions: 
    // before and after. This is a recursive function.
    // Returns hash table consisting of: 
    //      operators_in_group: number of operators in group
    //      scanned_before_count: number of cells before the cell containing group argument
    //      scanned_after_count: number of cells after the cell containing group argument
    // Arguments:
    //      group: group of the cell
    //      scan_direction: "before" or "after"
    //      remove_group: true, if group should be removed
    //      operators_min: - minimum number of operators to retain the group. Only used if remove_group 
    //      is true.
    //      operators_count: number of operators counted so far. It is passed down the recursion in order to 
    //      determine if we can remove this group if the flag remove_group is true
    
    
    // The function determines if there is less than specified operators_min operators in the group 
    // and marks such a group for deletion if the flag remove_group is true. It does so by scanning 
    // the group starting from the specified group to the end and checking in each operator cell if there 
    // is no other group above the specified group level, in other words, it checks if above the current group 
    // there is just the operator. By counting such cells until the group "other" end (close or open, depending on
    // which one the scan started), if the number of such cells is more than one, the specified group has more 
    // than 2 operands: he group that has more than one operators, has more than 2 operands
    // (operand = fields or another group).
     
    // The function adds class "measured-group" to the group in each cell that group exists. It is responsibility of
    // the caller to remove that class. One use of that feature is to highlight the group that has more than one 
    // operator.


    
    var scanned_before_count = 0,
          scanned_after_count = 0,
          operators_in_group = operators_count,
          scan_data,
          next_cell_to_process,
          group_level = group.index();
        
    // If the next level is fields and is operator, i.e. the operator lies in this group (no other group in between)
    var next_layer = group.next();
    if (next_layer.hasClass(FIELDS_CLASS_NAME) && next_layer.hasClass("operator")) {
        operators_in_group = operators_in_group + 1;
    }
    
    // First we scan "before"
    if (scan_direction == "before" || scan_direction == "invoking") {
        
        // scan cells recursively "before" until "group-open" is reached 
        if (!(group.hasClass("group-open") || group.hasClass("group-self"))) {
        
            next_cell_to_process = group.parent().prev();
                        
            scan_data = measure_group(next_cell_to_process.children(":eq(" + group_level + ")"), "before", remove_group, operators_min, operators_in_group);
        
            operators_in_group = scan_data["operators_in_group"];
            
            if (scan_direction == "before") {
                scanned_before_count = scan_data["scanned_before_count"] + 1;
            }
            
            scanned_after_count = scan_data["scanned_after_count"];    
        }
    }

    // Next, we scan "after": when recursion comes back from scanning "before" back to the 
    // "invoking" it will start scanning "after" right here    
    if (scan_direction == "after" || scan_direction == "invoking") {
        
        // scan cells recursively "before" until "group-open" is reached 
        if (!(group.hasClass("group-close") || group.hasClass("group-self"))) {
        
            next_cell_to_process = group.parent().next();
            
            scan_data = measure_group(next_cell_to_process.children(":eq(" + group_level + ")"), "after", 
                                                                            remove_group, operators_min, operators_in_group);
        
            operators_in_group = scan_data["operators_in_group"];
            scanned_before_count = scan_data["scanned_before_count"];

            if (scan_direction == "after") {
                scanned_after_count = scan_data["scanned_after_count"] + 1;        
            }
        }
    }

    if (remove_group && (operators_in_group < operators_min)) {
        group.addClass("group-remove");
    }
    
    return ({ 
        "operators_in_group" : operators_in_group, 
        "scanned_before_count" : scanned_before_count, 
        "scanned_after_count" : scanned_after_count
    });
}

function get_cell_groups(cell) { return (cell.children(":not(." + FIELDS_CLASS_NAME +")")); }

function cell_has_group_close(cell) { return (cell.children(".group-close").length > 0); }
