/****************************************************************
*
* File name: specify_group_layout.js
*
* Description:
* Group layout configuration for Specify application web client.
* Group is a graphic representation of parenthesis which can be placed or 
* removed.
*
* Dependencies:
*  - specify_layout_cfg.js
****************************************************************/

// Parameters (can be changed later)
var 
    // Group margin is the measure by which open or close group sticks out
    // of the cell. 
    group_margin = 6,  
    layer_colors_num = 2;  // Number of layer colors used


function shape_group(group, parent_class, is_operator) {
    //  Determines and adds CSS attributes to group object.
    // Arguments:
    //      group: group
    //      parent_class: parent class of the cell where group resides
    //      is_operator: true, if cell's element is operator, otherwise, false.

    // CSS attributes based on cell orientation
    if (group.hasClass("cell-horizontal")) {
        var open_end = "left",
            close_end = "right",
            side_one = "top",
            side_two = "bottom",
            dimension = "width";
    }
    else {
        var open_end = "top",
            close_end = "bottom",
            side_one = "left",
            side_two = "right",
            dimension = "height";
    }
    
    group.css("background-color", get_group_color(group));
    
    if (group.hasClass("group-open") || group.hasClass("group-mid")) {
        group.css("border-" + close_end + "-width", to_px(0));
        group.css("border-" + close_end + "-" + side_one + "-radius", to_px(0));    
        group.css("border-" + close_end + "-" + side_two + "-radius", to_px(0));    
    }
    
    if (group.hasClass("group-close") || group.hasClass("group-mid")) {
        group.css("border-" + open_end + "-width", to_px(0));    
        group.css("border-" + open_end + "-" + side_one + "-radius", to_px(0));    
        group.css("border-" + open_end + "-" + side_two + "-radius", to_px(0));    
    }
    
    if (is_operator) {  // Operator can only be "group-mid"
        group.css(dimension, to_px(element_cfg_table[parent_class]["operator_cell_length"]));
    }
    else {  // Operand case
        if (group.hasClass("group-open") || group.hasClass("group-close")) {
            // Group open or close should apply margin sticking out of the cell 
            
            group.css(dimension, to_px(element_cfg_table[parent_class]["operand_cell_length"] 
                  - element_cfg_table[element_cfg_table[parent_class]["dynamic_child_operand"]]["fields_border_width"]
                  + group_margin));
        }
        else if (group.hasClass("group-mid")) {
            group.css(dimension, to_px(element_cfg_table[parent_class]["operand_cell_length"]));
        }
    }    
}


function adjust_offset_in_cell (cell_item, offset) {
    // Sets offset for item inside cell.
    // Arguments:
    //      cell_item: item inside cell.
    //      offset: offset to be applied.

    // Determine offset dimension based on cell orientation
    if (cell_item.hasClass("cell-horizontal")) { 
        var offset_dimension ="left"; 
    }
    else {
        var offset_dimension = "top";
    }
    
    cell_item.css(offset_dimension, offset);
}


function get_group_color(group) {
    // Sets group color

    // Color table (these are parameters that can be changed)
    switch(group.index() % layer_colors_num)
    {
        case 0: return ("#D7D1F8");
        case 1: return ("#5757FF");
        default: return ("black");
    }
}