/****************************************************************
*
* File name: specify_layout_func.js
*
* Description:
* Auxiliary layout manipulation and geometry calculation functions 
* for Specify application web client.
*
*
* Dependencies:
*  - specify_layout_cfg.js
****************************************************************/

function get_midplacement_offset(outer_length, inner_length, is_inner_length_percentage) {
    // Returns offset for the inner object that is to be placed in the middle of the outer object
    // Arguments:
    //      outer_length: outer object length
    //      inner_length: inner object length
    //      is_inner_length_percentage: true if inner length is a percentage of an outer length,
    //          otherwise, false.
	
    // Calculate inner_length in units
	if (is_inner_length_percentage) {   // Specified as percentage
        var inner_length_units = outer_length * inner_length / 100;
    }
	else {  // In this case it is already specified in units
        var inner_length_units = inner_length;
    }

	return (Math.round((outer_length - inner_length_units)/2)); 
}


function length_with_border(element_class, parent_class, length_name, length_type) {
    // Returns element length, taking border into consideration.
    // Arguments:
    //      element_class: element class
    //      parent_class: element parent class
    //      length_name: length name ("width", "height")
    //      length_type: length type ("common_cell_length", "operand_cell_length", "operator_cell_length")

	return(Math.round(element_cfg_table[parent_class][length_type]
				           * element_cfg_table[element_class]["fields_" + length_name + "_pcnt"]/100
						   - 2*element_cfg_table[element_class]["fields_border_width"]))
}

function get_border_radius(element_class, parent_class, length_type) {
    // Returns element border radius.

	return(Math.round(element_cfg_table[parent_class][length_type] 
                  * element_cfg_table[element_class]["fields_border_radius_pcnt"]/100) )
}

function create_ctrl_button(button_class, element_class, formula_horizontal, element_fields) {
    // Creates control button (like "add-before" and "add-after" buttons).
    // Arguments:
    //      button_class: button class ("button_add_before", "button_add_after", "button_delete").
    //      element_class: element class.
    //      formula_horizontal: true, if formula horizontal, otherwise, false.
    //      element_fields: element fields object.

	var ctrl_button = $("<div/>")
		.addClass(button_class)
		.css("position", "absolute")
		.css("width", to_px(0))
		.css("height", to_px(0))
		.css("border-left-color", "transparent")
		.css("border-right-color", "transparent")
		.css("border-top-color", "transparent")
		.css("border-bottom-color", "transparent")
		.css("border-left-style", "solid")
		.css("border-right-style", "solid")
		.css("border-top-style", "solid")
		.css("border-bottom-style", "solid");
				
	if (formula_horizontal) {
		var length = px_to_num(element_fields.css("width"));
		var common_length = px_to_num(element_fields.css("height"));
	}
	else {
		var length = px_to_num(element_fields.css("height"));
		var common_length = px_to_num(element_fields.css("width"));	
	}

	var button_length = Math.round(common_length * element_cfg_table[element_class]["ctrl_common_length_pcnt"]/100);
		
	var color_side,  // side of the object border (the triangle) that needs to be coloured
		length_offset_side,
		common_length_offset_side;
		
	if (formula_horizontal)  {
		common_length_offset_side = "top";
	
		if (button_class == "button_add_before") {
			color_side = "right";   // triangle points left
			length_offset_side = "left";
		}  
		else {  // ctrl_button_after or button_delete
			color_side = "left";    // triangle points right
			length_offset_side = "right";
		}
	}
	else {   // formula is vertical
		common_length_offset_side = "left";

		if (button_class == "button_add_before") {
			color_side = "bottom";   // triangle points up
			length_offset_side = "top";
			
		}
		else {    // ctrl_button_after or button_delete
			color_side = "top";     // triangle points down
			length_offset_side = "bottom";
		}
	}
	
	
	var border_color_attr = "border-" + color_side + "-color",	
		length_offset = -button_length,
		button_color = element_cfg_table[element_class]["control_add_color"];
		
	if (button_class == "button_delete") {
		button_length = 0.8*button_length;
		border_color_attr = "border-color";   // All sides to get square
		length_offset = 2*button_length;

		button_color = element_cfg_table[element_class]["control_delete_color"];
		
		var button_delete_border_width = 1,
			button_delete_border_color = element_cfg_table[element_class]["control_add_color"];
			
		ctrl_button.append(
			$("<div/>")
				.css("position", "absolute")
				.css("left", to_px(-button_length))
				.css("top", to_px(-button_length))
				.css("width", to_px(button_length*2 - button_delete_border_width*2))
				.css("height", to_px(button_length*2 - button_delete_border_width*2))
				.css("background-color", "transparent")
				.css("border-style", "solid")
				.css("border-width", to_px(button_delete_border_width))				
				.css("border-color", button_delete_border_color)
		)
	}
	
	return (	
		ctrl_button
			.css("border-width", button_length)
			.css(length_offset_side, length_offset)
			.css(common_length_offset_side, get_midplacement_offset(common_length, 2*button_length, false))
			.css(border_color_attr, button_color)
	)
}
