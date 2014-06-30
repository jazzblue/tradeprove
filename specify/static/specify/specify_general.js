/****************************************************************
*
* File name: specify_general.js
*
* Description:
* General purpose functions for Specify application layout. 
*
*
* Dependencies:
*  - specify_global.js
*
****************************************************************/

function isFunction(functionToCheck) {  // Returns true if argument is function.
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function px_to_num(px) {
    // Converts px to number and returns the latter.

    var px_words = px.split("px");
    return (parseInt(px_words[0]));
}

// Converts number x to px and returns the latter.
function to_px(x) { return (x.toString() + "px"); }


function add_geometry (object_class, object, geometry_table, func_argument) {
    // Sets CSS attributes of the object.
    // Arguments:
    //      object_class - object class
    //      object -  object
    //      geometry_table -  table from which CSS attributes are retrieved
    //      func_argument -  function arguments, in case the attribute is a function

    for(var section in geometry_table[object_class]) {
        
        var section_words = section.split("-");
            
        // Add CSS attributes to sub objects
        if (section_words[0]  ===  "subobject") {     // Check if section name starts with the word "object".
            
            var subobject = $("<div/>");

            object.append(subobject.css("position", "absolute"));
            
            add_geometry(section, subobject, geometry_table[object_class], func_argument);
        }
        else {  // Add attributes to the object
        
            var attribute_value;
            for(var attribute_name in geometry_table[object_class][section]) {
            
                attribute_value = geometry_table[object_class][section][attribute_name];
            
                if (section  ===  "geometry") { 
    
                    // If the table entry is a function, invoke it
                    if (isFunction(attribute_value)) { attribute_value = attribute_value(func_argument); }

                    attribute_value = to_px(attribute_value);  // Convert to px
                }
                object.css(attribute_name, attribute_value);                
            }
        }
    }
}


function get_formula_length(formula) { return(formula.children().length); }

function get_cell_parent_class(cell) { return (cell.parent().parent().attr("class")); }

// Unique id is the used for areas and cells inside exclusive formulas,
// enum id is used inside enumerated formulas.
function create_area_id(area_class) { return(area_class); }

function create_unique_id(element_class, parent_element_id) { 
    return(element_class + ELEMENT_ID_SEPARATOR + parent_element_id);
}

function create_enum_id(element_class, element_num, parent_element_id) {
    return (element_class + ELEMENT_ID_NUM_SEPARATOR + element_num.toString()
                                                         + ELEMENT_ID_SEPARATOR + parent_element_id);
}

// Create application form class name.        
function create_app_form_class(element_class) { return (FORM_ID_CLASS_PREFIX + element_class); }

// Returns cell that contains button (button --> ctrl_panel --> fields --> cell).
function get_button_cell(button) { return (button.parent().parent().parent()); }


// Returns cell id extracted from form_id.
function get_form_cell_id(form_id) {
    var form_id_words = form_id.split(FORM_ID_CLASS_SEPARATOR);
    return(form_id_words[1]); // word #0 is prefix FORM_ID_CLASS_PREFIX
}


// Returns cell corresponding to specified form.
function get_form_cell(form) { return ($("#" + get_form_cell_id(form.attr("id")))); }


function get_cell_orientation(parent_class) {
    // Returns cell orientation.

    if (element_cfg_table[parent_class]["is_formula_horizontal"]) {
        return ("cell-horizontal");
    }
    else {
        return ("cell-vertical");
    }
}    
