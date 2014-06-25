/****************************************************************
*
* File name: specify.js
*
* Description:
* Web client UI framework for rules specification. Contains initialization and
* methods for objects placements.
*
* Dependencies:
*  - specify_defs.js
*  - specify_general.js
*  - specify_layout_func.js
*  - specify_layout_cfg.js
*  - specify_group_layout.js
*  - specify_group.js
*  - specify_dialog.js
****************************************************************/
 
$(function() {
    // Initializes the page layout and handlers on page load.
    
    // Contains all the element forms (global variable)
    app_forms_container = $("#app_forms_container").hide(); 
    
    // Django formset where all forms are copied into right before submission (global variable)
    formset_submit = $("#formset_submit");  
                                                                 
    // Django formset management form (global variable)
    management_form = $("#management_form").detach();

    
    // Django formset automatically includes visible DELETE check box in every form.
    // The following procedure hides all "DELETE" fields and marks them with a class: 
    // <tagname>-DELETE.
    app_forms_container.children().children().each(function() {  // loop over all fields in all forms

        var attr_name = "id";  // default attribute name

        // Label tags have attribute "for" instead of "id"
        if ($(this)[0].tagName  ===  "LABEL") { attr_name = "for";    }
        
        // Getting the field attribute
        var field_attr = $(this).attr(attr_name);
            
        if (field_attr != undefined)  {

            var attr_words = field_attr.split("-");
    
            // For DELETE checkboxes, Django sets "DELETE" as a 2nd word
            // in the "id" or "for" attribute
            if (attr_words[2]  ===  "DELETE") { 
                $(this).hide();   // Hide DELETE field
                $(this).addClass($(this)[0].tagName + "-DELETE");  // Mark DELETE field with a class
            }
        }
    });

    // Mark as DELETE all "sample" forms.
    // Sample forms set is the pool of unallocated forms which upon submission to Django with the
    // formset should be deleted.
    app_forms_container.children("#"+FORM_ID_CLASS_PREFIX + SAMPLE_FORM_ID).each(function() {
        form_mark_delete($(this));
    });

    
    // Create workspace
    workspace = $("<div/>")
        .attr("class", workspace_def_table["name"])
        .css("position", "absolute")
        .css("left", to_px(workspace_left))
        .css("top", to_px(workspace_top))
        .css("width", to_px(workspace_width))
        .css("height", to_px(workspace_height))
        .css("background-color", workspace_background_color)
        .css("overflow", "scroll")
            
    $("body").append(workspace);

    init_areas(workspace_def_table);  // Create and initialize areas within workspace
    
    $(".button_save").click(function() {
        // Save handler
    
        // Get the group info of the corresponding element cells in layout.
        // Update group attributes in the form only right before submission. 
        // We get the attributes for the form from its corresponding cell        
        
        // Loop over all non-sample form in the app container
        app_forms_container.children(":not(#" + FORM_ID_CLASS_PREFIX + SAMPLE_FORM_ID + ")").each(function() {

            // Get all groups except group-self
            var cell_groups = get_cell_groups(get_form_cell($(this))).filter(":not(.group-self)"),
                group_high = cell_groups.length; 
            
            // Indicators whether cell has open/close group type
            var cell_group_type_open = false,
                cell_group_type_close = false,
                group_end_level;    // Level of the end group (open/close)
                
            if (cell_groups.hasClass("group-open")) {
                cell_group_type_open = true; 
                
                // Since group count starts from 1 and index from 0, we use index()+1
                group_end_level = cell_groups.filter(".group-open").index()+1;
            }
            else if (cell_groups.hasClass("group-close")) { 
                cell_group_type_close = true;
                group_end_level = cell_groups.filter(".group-close").index()+1;
            }
            else {  // Cell has group-mid
                group_end_level = 0;
            }
            
            // Update group attributes in the form
            $(this).children("." + "group_open").prop("checked", cell_group_type_open);
            $(this).children("." + "group_close").prop("checked", cell_group_type_close);
            $(this).children("." + "group_high").val(group_high);            
            $(this).children("." + "group_end_level").val(group_end_level);
            
        });
        
        // Clear formset_submit before copying into it and submitting
        formset_submit.children().remove();
        
        // Copy management forms into formset_submit
        formset_submit.append(management_form.children().clone());
        
        app_forms_cloned = app_forms_container.children().clone();
        
        // Copy all the drop-downs with user selections
        app_forms_container.children().each(function(idx) {
        
            var src_form = $(this);
            copy_drop_downs($(this), app_forms_cloned.filter(':eq(' + idx + ')'));
        });
        
        //append fields
        formset_submit.append(app_forms_cloned.children());
                
        //append Rule title to formset_submit
        var rule_form_cloned = $("#form___rule").clone();
        copy_drop_downs($("#form___rule"), rule_form_cloned);
        formset_submit.append(rule_form_cloned.children());
                
        // Submit formset to the server
        $("body").append(formset_submit);
        formset_submit.submit();            
    });
    
    
    // AJAX call for interdependent drop-down menus
     $(".expression_lhs").change(function() {
    
        var expression_lhs_id = $(this).val(),   // Get id of the chosen select
            parent_form = $(this).parent(),    
            request_url = "get_exp_rhs/" + expression_lhs_id + "/";
        
        $.ajax({
            url: request_url,
            success: function(data){
                        
                // Remove current drop-down options
                parent_form.children(".expression_rhs").children().remove();
            
                // Add default (empty) option
                parent_form.children(".expression_rhs")
                                     .append('<option value="" selected="selected">---------</option>');
                
                // Populate drop-down with new options
                $.each(data, function(key, value) {
                    parent_form.children(".expression_rhs")
                                     .append('<option value="' + key + '">' + value +'</option>');
                });
            }
        });
    });
    
});

        
function offset_first_cell(measure, element_class) {
    // Offsets measure if needed based on first element type.
    // Returns offset measure or original measure id no offset applied.

    // If formula starts with operator then the first operator sticks out of the formula 
    // to connect to preceding area.
    if (element_cfg_table[element_class]["starts_with_operator"]) {
        return (measure - element_cfg_table[element_class]["operator_cell_length"]); 
    }
    else { return (measure); }
}                                 


function add_area(area_class, workspace_class) {
    // Adds area to workspace
    
    // This function has been modified to redirect to protected view in order to protect the IP,
    // since this GitHub code is for code demonstration purposes and not the app demonstration.
}


function create_area(area_class) {
    // Creates and instantiates area.

    var element_area = $("<div/>")
        .addClass(area_class)
        .attr("id", create_area_id(area_class))
        .css("position", "absolute");

        add_graphic_attributes(area_class, element_area, element_graphic_table, null);

    // If area has formula, add formula to area.
    if (element_cfg_table[area_class]["initial_formula"].length > 0) {
        element_area.append(create_formula(area_class, create_area_id(area_class)));
    }

    return (element_area);
}


function create_cell(element_class, parent_class, element_id) {
    // Creates cell and returns it.
    // Cell contains an element. It can be said that element and cell is the same thing, however,
    // element is an abstract notion while cell is the physical object where element resides.

    var element_cell = $("<div/>")
        .css("position", "absolute")
        .addClass(element_class)
        .attr("id", element_id);

    // If element has fields
    if (element_cfg_table[element_class]["has_fields"]) {
    
        // Adding self-group
        if (element_cfg_table[parent_class]["formula_has_grouping"] &&
            !element_cfg_table[element_class]["is_operator"]) {   // operators do not have self-group
            
            element_cell.append(create_group("group-self", get_cell_orientation(parent_class)));
        }
    
        // Create element fields and place it in the cell
        element_cell.append(create_fields(element_class, parent_class));        
    }
        
    // If element has formula
    if (element_cfg_table[element_class]["initial_formula"].length > 0) {
        // Create formula and place it into the cell
        element_cell.append(create_formula(element_class, element_id));            
    }

    return(element_cell);
}


function create_formula(element_class, element_id) {
    // Creates formula and returns it.
    // Formula consists of elements: operands and operators.
    
    var element_formula = null;
        
    if (element_cfg_table[element_class]["initial_formula"].length > 0) {
        // create formula DOM with class
        element_formula = $("<div/>")
            .addClass(FORMULA_CLASS_NAME)
            .css("position", "absolute")
            .css("top", "0px")
            .css("left", "0px");
                
        var cell_class,
            cell_id,
            new_cell,
            cur_app_form;
                
        for (var initial_element_idx in element_cfg_table[element_class]["initial_formula"]) {
            cell_class = element_cfg_table[element_class]["initial_formula"][initial_element_idx];
            cell_id = get_cell_id(cell_class, element_class, element_id, initial_element_idx);
            new_cell = create_cell(cell_class, element_class, cell_id);
            element_formula.append(new_cell);
            init_groups(new_cell, element_class);  // initialize groups            
        }
                                                                                                                        
        // If formula is exclusive, it is entirely defined in the "initial_formula" and no 
        // further processing needed.
        // If formula is not exclusive, continue adding while the form with cell_id is 
        // found in the form table, determine if it is an operator or an operand, 
        // check if it has form, check for id and add the element. 
        if (!element_cfg_table[element_class]["formula_exclusive"]) {        
        
            var element_idx = parseInt(initial_element_idx) + 1;

            if (is_element_operator(element_class, element_idx)) {
                cell_class = element_cfg_table[element_class]["dynamic_child_operator"];
            }
            else {
                cell_class = element_cfg_table[element_class]["dynamic_child_operand"];
            }
        
            cell_id = get_cell_id(cell_class, element_class, element_id, element_idx);
        
            // If the form for that element exists, we need to create corresponding element.
            while (app_forms_container.children("#" + gen_form_id(cell_id)).length > 0) {

                new_cell = create_cell(cell_class, element_class, cell_id);
            
                element_formula.append(new_cell);
                
                init_groups(new_cell, element_class);  // Initialize cell groups.

                element_idx = element_idx + 1;


                if (is_element_operator(element_class, element_idx)) {
                    cell_class = element_cfg_table[element_class]["dynamic_child_operator"];
                }
                else {
                    cell_class = element_cfg_table[element_class]["dynamic_child_operand"];
                }

                cell_id = get_cell_id(cell_class, element_class, element_id, element_idx);                
            }
        }
    }
    
    // Select first exclusive formula. This is default for initialization.
    if (element_cfg_table[element_class]["formula_exclusive"]) {        
        select_exclusive(element_formula.children(":first").children("."+FIELDS_CLASS_NAME));
    }
    
    return(element_formula);
}


function create_fields(element_class, parent_class) {
    // Creates element Fields.
    // Fields is a clickable object that is associated with a form.
    
    var element_fields = null;
    
    if (element_cfg_table[element_class]["has_fields"]) {

        // Default values
        var element_type = "operand",
              formula_has_grouping = false;
            
        if (element_cfg_table[element_class]["is_operator"]) {
            element_type = "operator"; 
            
            if (element_cfg_table[parent_class]["formula_has_grouping"]) {
                formula_has_grouping = true;
            }
        }    
            
        element_fields = $("<div/>")
            .css("position", "absolute")
            .addClass(FIELDS_CLASS_NAME)
            .addClass(element_type)
            .addClass(get_cell_orientation(parent_class))
                                
            // These offsets are needed in order to place control panel
            .css("left", "0px")
            .css("top", "0px");
                                    
        add_graphic_attributes(element_class, element_fields, 
                                          element_graphic_table, parent_class);
                                                                                                                            
        // Number of subobject that has text.
        // TBD: instead of TEXT, should be given a name corresponding to element.
        if(element_cfg_table[element_class]["text_subobject"]>0) {
            element_fields.children(":eq(" 
                    + (element_cfg_table[element_class]["text_subobject"]-1) + ")").text("TEXT");
        }
        else {
            element_fields.text("TEXT");
        }
        
        // Add control panel to element if the element's configuration requires
        if (element_cfg_table[element_class]["has_controls"]) {
            var ctrl_panel = create_ctrl_panel(element_class, element_fields, parent_class);    
            element_fields.append(ctrl_panel);
            bind_ctrl_panel(ctrl_panel);
        }    
    
        // If element has dialog, bind Fields with dialog
        if (element_cfg_table[element_class]["has_dialog"]) {
            bind_fields_dialog(element_fields, formula_has_grouping);
        }
        
        // Create handlers for seleting exclusive formulas
        if (element_cfg_table[parent_class]["formula_exclusive"]) {
            element_fields.click(function() { select_exclusive($(this)); })
        }
    }
    
    return (element_fields);
}


function create_ctrl_panel(element_class, element_fields, parent_class) {
    // Creates control panel for element
    // Control panel allows element addition before or after the element as
    // well as deletion of the element. 
    
    var ctrl_panel = $("<div/>")
        .addClass(CTRL_PANEL_CLASS_NAME)
        .css("position", "absolute")
        .css("left", to_px(0))
        .css("top", to_px(0))
            
        // Needed for positioning control buttons
        .css("width", element_fields.css("width"))
        .css("height", element_fields.css("height"))
            
    ctrl_panel.append(create_ctrl_button("button_add_before", element_class, element_cfg_table[parent_class]["is_formula_horizontal"], element_fields));
    ctrl_panel.append(create_ctrl_button("button_add_after", element_class, element_cfg_table[parent_class]["is_formula_horizontal"], element_fields));
    ctrl_panel.append(create_ctrl_button("button_delete", element_class, element_cfg_table[parent_class]["is_formula_horizontal"], element_fields));

    return (ctrl_panel.hide());        
}
    
    
function bind_ctrl_panel(ctrl_panel) {
    // Creates control panel handlers.

    ctrl_panel.parent().hover(
        function() {
            ctrl_panel.show();
        },
        function() {
            ctrl_panel.hide();
        }
    );
        
    ctrl_panel.children(".button_add_before").click(function(event) {
        event.stopPropagation();
        add_elements(false, $(this));
    });
    
    ctrl_panel.children(".button_add_after").click(function(event) {
        event.stopPropagation();
        add_elements(true, $(this));
    });

    ctrl_panel.children(".button_delete").click(function(event) {
        event.stopPropagation();
        delete_element($(this))
    });        
}


function select_exclusive(fields) {
    // Creates visualization for selection exclusive formula.
    
    fields.fadeTo(400, 1);  // Unfade  fields
    fields.siblings("."+FORMULA_CLASS_NAME).show();  // Show formula

    // Hide formulas of all siblings
    fields.parent().siblings().children("."+FORMULA_CLASS_NAME).hide();
    
    // Fade fields of all siblings
    fields.parent().siblings().children("."+FIELDS_CLASS_NAME).fadeTo(400, .5);

    // In case formula is initialized , the couples might be  still waiting for 
    // initialization and do not exist
    if (fields.parent().attr("class") != undefined) {
        if (element_cfg_table[fields.parent().attr("class")]["couple"]) {        
            select_exclusive(fields.parent().parent().parent().next()
                       .find("." + element_cfg_table[fields.parent()
                       .attr("class")]["couple"] + ">."+FIELDS_CLASS_NAME));
        }
    }
}


function get_cell_id(element_class, parent_class, parent_id, element_idx) {
    // Creates cell ID based on element class, parent class and parent ID and 
    // element index.

    var element_id;
    
    // Exclusive formulas are not enumerated, i.e. element index is not relevant
    if (element_cfg_table[parent_class]["formula_exclusive"]) {
        element_id = create_unique_id(element_class, parent_id);
    }        
    else {
        element_id = create_enum_id(element_class, 
                             get_element_num(parent_class, element_idx), parent_id);
    }
    return(element_id);
}


function is_operand(position, element_class) {
    // Determines if the element at specified position is an operand 
    // (first position is 0).

    if (element_cfg_table[element_class]["starts_with_operator"]) { 
        return ((position+1) % 2  ===  0);
    }
    else {
        return (position % 2  ===  0);
    }            
}


function get_operands_num(position, element_class) {
    // Returns operands number in the formula until specified position.
    // element_class - class of element that carries the formula/
        
    // Operands number is either half of the position (when formula starts
    // with operator, in that case the formula is of an even length) 
    // or half of (position plus one) (when formula starts with an operand,
    // in this case formula is of an odd length)
    if (element_cfg_table[element_class]["starts_with_operator"]) { 
        return (Math.floor(position/2));
    }
    else {
        return (Math.floor((position+1)/2));
    }
}


function get_operators_num(position, element_class) {
    // Returns operators number in the partial formula until position.
    // element_class - class of element that carries the formula
        
    // Subtract operands from the position and what is left is the operators number
    return (position - get_operands_num(position, element_class));
}


function resize_area(area_class) {
    // Calculates area formula length and resizes area according to that.

    // For exclusive formulas only one of them is visible
    var visible_sequence_class = get_visible_sequence_class(area_class);
    
    var formula = $("." + visible_sequence_class).children("." + FORMULA_CLASS_NAME);
        
    var formula_length =  get_formula_length(formula);

    // Initialize new area width
    var new_area_width = get_operands_num(formula_length, visible_sequence_class)
                                          * element_cfg_table[visible_sequence_class]["operand_cell_length"]
                         + get_operators_num(formula_length, visible_sequence_class)
                                          * element_cfg_table[visible_sequence_class]["operator_cell_length"]
                         + element_cfg_table[visible_sequence_class]["first_cell_left_offset"]
                         + area_cfg_table[area_class]["right_margin"]
                         - 2*area_border_width
                         + group_margin*formula.children().children(".group-open, .group-close").length;

    // Initialize new area width                 
    new_area_width = offset_first_cell(new_area_width, visible_sequence_class);
    $("." + area_class).css("width", to_px(new_area_width));
        
    place_areas_horizontal($("." + area_class).parent().attr("class"));
                                                                                                           
    resize_areas_vertical();        
}
    
function place_areas_horizontal(workspace_class) {
    // Calculates horizontal offset for each area in the workspace and places them accordingly.
        
    // Calculated parameters of the previous area,
    var prev_width = 0, 
        prev_left_border_width = 0,
        prev_right_border_width = 0;
            
    // Offset and width of the currently processed area.
    var left_offset = 0,
        left_border_width;
        
    var area;

    for (var area_class_idx in workspace_def_table["areas"]) {
        area = $("." + workspace_def_table["areas"][area_class_idx]);
            
        left_border_width = px_to_num(area.css("border-left-width"));

        left_offset = left_offset + prev_left_border_width + prev_width 
                                         + prev_right_border_width - left_border_width; 

        // Place the area according to offset calculated from prior areas                                 
        area.css("left", to_px(left_offset));
        
        prev_width = px_to_num(area.css("width"));
        prev_left_border_width = left_border_width;
        prev_right_border_width = px_to_num(area.css("border-right-width"));
    }
}


function resize_areas_vertical() {
    // Calculates vertical size of all areas and resizes them accordingly.
    
    var max_area_height = 0,
        area_height,
        formula_length,
        formula_class;
    
    // Find maximum height of all areas and set the size of all areas accordingly,
    // as they all have to line up.
    for (var area_class in area_cfg_table) {
        // All formulas in the visible sequence
        $("." + get_visible_sequence_class(area_class))
                              .find("." + FORMULA_CLASS_NAME).each(function() { 
 
        formula_class = $(this).parent().attr("class");

            // Check only vertical formulas
            if (!element_cfg_table[formula_class]["is_formula_horizontal"]) {

                if (!$(this).css("hidden") &&   // If formula is visible (relevant for exclusive formulas)
                
                    // If parent formula is also visible (sometimes there are two levels of visibility)
                    !$(this).parent().parent("." + FORMULA_CLASS_NAME).css("hidden")) {
                    
                    formula_length = get_formula_length($(this));                                                                                                                      
                    area_height = get_operands_num(formula_length, formula_class) * 
                                              element_cfg_table[formula_class]["operand_cell_length"]
                         + get_operators_num(formula_length, formula_class) * 
                                              element_cfg_table[formula_class]["operator_cell_length"]
                         + area_cfg_table[area_class]["top_margin"]
                         + area_cfg_table[area_class]["bottom_margin"]
                         - 2*area_border_width 
                         + group_margin*$(this).children().children(".group-open, .group-close").length;
                    
                    if (area_height > max_area_height) { max_area_height = area_height; }
                }
            }
            
        })            
    }

    // Area should fill entire workspace vertically. If areas are taller than workspace, scrolling will be used.
    if (max_area_height < workspace_height) { max_area_height = workspace_height; }
        
    // Set calculated max height as area height for all areas
    for (var area_class in area_cfg_table) {            
        $("." + area_class).css("height", to_px(max_area_height));
    }
}


function get_visible_sequence_class(area_class) {
    // Returns class of visible sequence in specified area.
    // It is used for exclusive formulas whereas only one of them is visible.

    var visible_sequence_class;
    for (var horizontal_sequence_idx in element_cfg_table[area_class]["initial_formula"]) {
        if (!($("." + element_cfg_table[area_class]["initial_formula"][horizontal_sequence_idx])
                      .children(".formula").css("hidden"))) {
            visible_sequence_class = element_cfg_table[area_class]["initial_formula"][horizontal_sequence_idx];
        }
    }
    return(visible_sequence_class);
}
    

function add_elements(insert_after, button) {
    // Adds elements before or after the element whose button is specified by an argument.
    // The inserted cells will include operator and an operand.
    // Arguments:
    //    - insert_after: boolean, indicates whether to insert before or after the element.
    //    - button: button that invoked cell insertion before/after which the insertion should occur.

    // Invoking cell is always an operand
    var invoking_cell = get_button_cell(button);

    // Capping maximum number of elements in the formula
    if (invoking_cell.siblings().length > MAX_FORMULA_ELEMENTS) {
        alert("Cannot add another element.\nToo many elements in formula");
    }
    else {
    
        // Create inserted operand (creating out of invoking cell, because the latter is always an operand)
        var inserted_operand = create_cell(invoking_cell.attr("class"), get_cell_parent_class(invoking_cell),
                 "inserted_" + element_cfg_table[get_cell_parent_class(invoking_cell)]["dynamic_child_operator"]);

        // Create inserted operator
        var inserted_operator = create_cell(element_cfg_table[get_cell_parent_class(invoking_cell)]["dynamic_child_operator"], get_cell_parent_class(invoking_cell), 
                                                                                    "inserted_" + element_cfg_table[get_cell_parent_class(invoking_cell)]["dynamic_child_operator"]); // dummy id
        
        var inserted_cells;
        if (insert_after) {
            // After the operand, there will be an operator followed by an operand
            inserted_cells = inserted_operator.add(inserted_operand);
        }
        else {
            // Before the operand, there will be an operand followed by an operator
            inserted_cells = inserted_operand.add(inserted_operator);
        }

        // Insert the cells
        insert_cells(insert_after, invoking_cell, inserted_cells, null);
    }
}


function delete_element(button) {
    // Deletes operand element whose button is specified by an argument with corresponding operator.
        
    var deleted_cell = get_button_cell(button);  // Get cell that corresponds to button
    var formula = deleted_cell.parent();
    
    // For back-reference update take preceding operand by default
    var start_update_br_operand = deleted_cell.prevAll().children("." + FIELDS_CLASS_NAME+".operand").parent(":last");
    
    // If there are no preceding operands, take the next operand after the deleted cell
    if (start_update_br_operand.length  ===  0) {
        start_update_br_operand = deleted_cell.nextAll().children("." + FIELDS_CLASS_NAME+".operand").parent(":first");
    }    
    
    // Determine if group is horizontal or vertical
    var group_orientation = get_cell_orientation(get_cell_parent_class(deleted_cell));    
    
    var enumerate_group_cells_after = false,
        enumerate_group_cells_before = false;

    // We remove cells from the grouping.
    // Topologically, the cell can either have "open" groups or "close" groups, not both at the same time
    // So, if the operand is "open-group", then we will remove the adjacent operator inside the group, i.e. "after".
    // On the other hand, if the operand is "close-group", then, again, we will remove the adjacent operator inside the group, i.e. "before".
    // If the operand is "group-mid" we will remove the operator that is "after".

    // Check for next and preceding operands
    var next_operand_cell = get_next_operand_cell(deleted_cell);
    var preceding_operand_cell = get_prev_operand_cell(deleted_cell);
        
    // Operator that gets deleted with the operand
    var deleted_operator_cell = deleted_cell.next();  // Default is the cell after.
    var next_operand = deleted_cell.nextAll().children("." + FIELDS_CLASS_NAME+".operand").parent(":first");
    if (deleted_operator_cell.length  ===  0 ||   // Check for the last element in non-group formula
        next_operand_cell.length  ===  0 ||        // or no operand after this one
        cell_has_group_close(deleted_cell)) {      // or there is a closing group in the cell

        deleted_operator_cell = deleted_cell.prev();  // Take cell before
    }
    
    // If there is no operators, or no operands on either side,
    // it is the last cell and it should not be removed from the formula.
    if (deleted_operator_cell.length  ===  0 ||
        (preceding_operand_cell.length  ===  0 && next_operand_cell.length  ===  0)) {  
        alert("Can't delete the only element in formula");
    }
    else { 

        // Processing formula with grouping
        if (element_cfg_table[get_cell_parent_class(deleted_cell)]["formula_has_grouping"]) {
        
            // We use prev(), since the last group is self and we want the one before
            var top_group_level = get_cell_groups(deleted_cell).last().prev().index(); 
        
            var scanned_cells_count = 0;
        
            get_cell_groups(deleted_cell).each(function(idx) {
        
                var scan_data,
                    operators_in_group = 0;

                // If the cell has opening group    
                if ($(this).hasClass("group-open")) {
                
                    // Get next operand (double next() to skip operator)
                    var operand_after = deleted_cell.next().next();

                    // If there is more than one operator in the top group (i.e. more than two operands,
                    // then the next operand is group-mid and it should become group-open, since the current
                    // group-open is being deleted, otherwise the function measure_group will mark the  
                    // whole group for removal, because after this operand is deleted there will remain
                    // only one operand and we cannot have just one operator in a group which is not "self-group"
                
                    // Scan and mark the top group for deletion if needed 
                    if (idx  ===  top_group_level) {
                        scan_data = measure_group($(this), "after", true, 2, 0);
                        operators_in_group = scan_data["operators_in_group"];
                        scanned_cells_count = scan_data["scanned_after_count"];
                    }

                    // operators_in_group > 1 means that the top group was not marked for deletion 
                    // (because of argument=2 in measure_group call above)
                    if (operators_in_group > 1 || idx < top_group_level) {
                        // The next operand in the group is group-mid and it should become group-open since the current group-open is being deleted
                        set_group(operand_after.children(":eq("+idx+")"), "group-open", group_orientation);
                    }

                        enumerate_group_cells_after = true;   // Enumerate cells after opening group                
                }
                
                // If the cell has closing group
                if ($(this).hasClass("group-close")) { 
                    var operand_before = deleted_cell.prev().prev();

                    // Scan and mark the top group for deletion if needed 
                    if (idx  ===  top_group_level) {
                        scan_data = measure_group($(this), "before", true, 2, 0);
                        operators_in_group = scan_data["operators_in_group"];
                        scanned_cells_count = scan_data["scanned_before_count"];                        
                    }
                
                    // operators_in_group > 1 means that the top group was not marked for deletion (because of argument=2 in measure_group call above)
                    if (operators_in_group > 1 || idx < top_group_level) {
                        // The next operand in the group is group-mid and it should become group-close since the current group-open is being deleted
                        set_group(operand_before.children(":eq("+idx+")"), "group-close", group_orientation);
                    }
                    enumerate_group_cells_before = true;  // Enumerate cells before closing group
                }            
            });

            // Enumerate groups in affected cells
            // first, go to to-be-deleted operator
            var enum_cell;
            if (enumerate_group_cells_after) { enum_cell = deleted_cell.next(); }
            else if (enumerate_group_cells_before) { enum_cell = deleted_cell.prev(); }        
            
            // In this loop we start from the cell that is adjacent to deleted operator, i.e. the one that might be retained
            //  if we do not need to modify anything outside of the deleted cells, scanned_cells_count will be 0 and the loop willbe skipped
            for (var i = 0; i < scanned_cells_count-1; i++) {
                if (enumerate_group_cells_after) { enum_cell = enum_cell.next(); }
                else                             { enum_cell = enum_cell.prev(); }        
                process_groups(enum_cell, get_cell_parent_class(enum_cell));            
            }
        }

        // Unbind control panel buttons
        button.parent().parent().unbind("hover");
        button.parent().children(".button_add_before").unbind("click");
        button.parent().children(".button_add_after").unbind("click");
        button.parent().children(".button_delete").unbind("click");

        button.parent().parent().unbind("click");    // unbind dialog
        
        // Delete the corresponding form and all descendant forms of the operand.
        delete_descendant_forms(deleted_cell);  
        delete_form(get_cell_form(deleted_cell));
        deleted_cell.remove();
        
        // Delete the corresponding form and all descendant forms of the operator.
        delete_descendant_forms(deleted_operator_cell);
        delete_form(get_cell_form(deleted_operator_cell));
        deleted_operator_cell.remove();

        // Delete 1 operand => offset = -1
        enumerate_formula(formula, next_operand_cell, -1);
    }
}


function delete_descendant_forms(cell) {
    // Recursively deletes forms that correspond to specified cell's descendants.

    cell.children("." + FORMULA_CLASS_NAME).children().each(function() { // run over "children" cells
        
        if (element_cfg_table[$(this).attr("class")]["has_fields"]) {
            // Delete recursively. Recursion will exit when there is no formula and the "each()" 
            // will not enter the loop.
            delete_descendant_forms($(this));
            delete_form(get_cell_form($(this)));
        }
    });
}


function check_operators_num() {
    // Checks number of operators in all groups and gives a warning 
    // if more than one operator is found in any of the groups.

    var illegal_group_found = false;

    // Start with opening group. Thus we will have all the groups covered and
    // each group will be processed only once.
    $(".group-open").each(function() {
        if (!illegal_group_found) {
            var scan_data = measure_group($(this), "after", false, 0, 0);
            var operators_in_group = scan_data["operators_in_group"];
        
            if (operators_in_group > 1) {
                highlight_illegal_group();
                illegal_group_found = true;
                alert("Only one operator is allowed in a group.");
            }
        }
    });
}


function insert_cells(insert_after, invoking_cell, inserted_cells, inserted_dialogs) {
    // Inserts cells.
    // Arguments:
    // insert_after - flag indicating whether insertion will occur after or before the cell with number=cell_num. 
    // invoking cell - cell that invoked insertion. It is the cell before or after which the insertion will occur.
    // inserted_cells - array of operands and operators in between them that will be inserted.
    // inserted_dialogs - dialogs corresponding to inserted_elements by their IDs.
        
    if (insert_after) {    invoking_cell.after(inserted_cells); }
    else              { invoking_cell.before(inserted_cells); }

    // --- Adding groups to the inserted cell ----
    // 1. First, remove all the groupings from all inserted cells
    // 2. All the groups of invoking cell should be cloned and placed under fields of each inserted cell.
    //    The type of each cloned group should be changed to "mid", with the exception of the top cloned 
    //    group which used to be a self-group of the invoking cell. (See next line).
    // 3. The cloned top group:
    //       If insert_after,
    //            The last cell should have this group type set to "close" and all other cells to "mid".
    //       Otherwise (insert before):
    //            The first cell should have this group type set to "close" and all other cells to "mid".        
    // 4. The inserted cells has to be give their own "self-groups", that is the top level group containing only that element
    // 5. Invoking cell should get a new self-group, since the old one contains the inserted cells now.
    
    if (element_cfg_table[get_cell_parent_class(invoking_cell)]["formula_has_grouping"]) {
    
        var group_orientation = get_cell_orientation(get_cell_parent_class(invoking_cell));    
        var invoking_cell_groups = get_cell_groups(invoking_cell);

        // Groups of the invoking cell to be cloned for further insertion into the inserted cells
        var groups_to_clone = invoking_cell_groups.clone();
        
        if (insert_after) {
            // group-self "expands" to include new inserted cells
            set_group(invoking_cell_groups.filter(".group-self"), "group-open", group_orientation);
            
            // group-close "expands" to include new inserted cells
            set_group(invoking_cell_groups.filter(".group-close"), "group-mid", group_orientation);
            
        }
        else {
        
            // group-self "expands" to include new inserted cells
            set_group(invoking_cell_groups.filter(".group-self"), "group-close", group_orientation);
            
            // group-open "expands" to include new inserted cells
            set_group(invoking_cell_groups.filter(".group-open"), "group-mid", group_orientation); 
        }

        // Add new "group-self" to the invoking_cell
        invoking_cell.children("." + FIELDS_CLASS_NAME).before(create_group("group-self", group_orientation));
        process_groups(invoking_cell, get_cell_parent_class(invoking_cell));
        
        var inserted_cells_length = inserted_cells.length;
        
        // Remove all the groupings from all inserted cells 
        inserted_cells.each(function(idx) {

            var cell_groups = get_cell_groups($(this))
            cell_groups.remove(); // remove all cell's groups (see item 1. above)
                                                
            $(this).prepend(groups_to_clone.clone()); // insert invoking groups at the bottom of the cell
            
            if (insert_after && (idx  ===  inserted_cells_length-1)) {   // last cell that was inserted after
                set_group(get_cell_groups($(this)).filter(".group-self"), "group-close", group_orientation);
                set_group(get_cell_groups($(this)).filter(".group-close"), "group-close", group_orientation);
                
                // Insert in the middle of the group
                set_group(get_cell_groups($(this)).filter(".group-open, .group-mid"), "group-mid", group_orientation);         
            }
            else if (!insert_after && (idx  ===  0)) { // first cell that was inserted before
                set_group(get_cell_groups($(this)).filter(".group-self"), "group-open", group_orientation);
                set_group(get_cell_groups($(this)).filter(".group-open"), "group-open", group_orientation);

                // Insert in the middle of the group
                set_group(get_cell_groups($(this)).filter(".group-close, .group-mid"), "group-mid", group_orientation);
            }
            
            // If operand, add self-group
            if ($(this).children("." + FIELDS_CLASS_NAME).hasClass("operand")) {
                $(this).children("." + FIELDS_CLASS_NAME).before(create_group("group-self", group_orientation));
            }
            else { // operator - all groups are mid
                set_group(get_cell_groups($(this)), "group-mid", group_orientation);
            }
            
            bind_group_dialog(get_cell_groups($(this)));  // bind dialog to set of groups
            process_groups($(this), get_cell_parent_class($(this)));
        });                
    }
    
    // 1. Back-reference updates start with first inserted cell
    // 2. insert 1 operand, therefore, offset = +1
    enumerate_formula(invoking_cell.parent(), inserted_cells.filter(":first"), 1); 
}


function enumerate_formula(formula, first_inserted_cell, offset) { 
    // Enumerates formula elements.
    // Arguments:
    //   formula: formula
    //   first_inserted_cell:  first cell that was inserted, if applicable
    //   offset: +1 - cell was inserted, -1 - cell was deleted, 0 - otherwise
    // The latter two arguments are used for back-reference update.

    // If no cell was inserted and offset is non-zero throw exception
    if (first_inserted_cell  ===  null) {
        throw "enumerate_formula: first_inserted_cell is null.";
    }
    
    // Renumeration: assignment of temporary IDs to element forms
    renumerate_formula(formula);
    
    // Enumerate and place: assign final IDs to element forms and place the cells
    enum_and_place_formula(formula, offset);
    
    resize_all();  // Resize all areas.
    
    
    //--------------------------------------------------------------
    // ---------------  Back-reference update -----------------
    //-------------------------------------------------------------

    // Update BRs only if the formula was modified (non-zero offset) and also back-referenced
    if (element_cfg_table[formula.parent().attr("class")]["is_backreferenced_formula"]) {

        do {
            update_backref(formula, start_br_update_cell, offset, get_formula_rel_offset(formula));

            // Determine following formula, which is in a different area
            var following_formula = element_cfg_table[formula.parent().attr("class")]["following_formula"];
        
           // Fetching following formula 
            if (following_formula != undefined) {
                formula = workspace.find("." + following_formula["area"] + " ." 
                                                           + following_formula["formula"] + ">." + FORMULA_CLASS_NAME);
                                                           
                // Start with the "following" formula's first element.
                start_br_update_cell = formula.children(":first");
            }
            else {
                formula = null;
            }
        
        } while (formula != null);
    }
}


function renumerate_formula(formula) {
    // Renumerates formula, i,e, assigns temporary IDs to element forms.
    // This is done for the following reason:
    // If there was cell insertion, inserted cell would get an id that will match existing form that 
    // belongs to another cell. In that case, if we give the form_id_object final id there will 
    // be two form_id_objects with the same id, therefore, during enumeration all form_id_objects
    // get temporary id. And after cell enumeration is done, the form_id_objects are enumerated
    // again with "normal" id and get bound to the cell.

    formula.children().each(function(idx) {

        var form = get_form_id_object($(this)); // Form that corresponds to the cell
    
        if (form.length  ===  0 ||                      // If the cell does not have corresponding form or
            $(this).attr("id")  ===  undefined) {  // if the cell does not have an id, it is a newly created cell 
                                                                  // and it does not have corresponding form yet,                                               
            form = create_new_form($(this));    //   then create a form_id_object.
        }

        // Set cell's id
        $(this).attr("id", get_cell_id($(this).attr("class"),
                            formula.parent().attr("class"), formula.parent().attr("id"), idx));
                
        // Copy cell's id into form's id field
        form.children(".element_id").val($(this).attr("id"));        

        // Set renumerated id only for non-exlusive formulas
        if (!element_cfg_table[formula.parent().attr("class")]["formula_exclusive"]) {
            set_renum_form_id(form, $(this));
        }
        
        // Recursively renumerate children formulas.
        // If child element has formula
        if (element_cfg_table[$(this).attr("class")]["initial_formula"].length > 0) {
            // Create formula and place it into cell
            renumerate_formula($(this).children("." + FORMULA_CLASS_NAME));            
        }
        
    });    
}


function enum_and_place_formula(formula, offset) {
    // Enumerates formula (assigns final IDs to element forms) and places cells.

    var cur_cell_offset;  // Current cell offset
    
    // Offset for non exclusive formulas
    if (!element_cfg_table[formula.parent().attr("class")]["formula_exclusive"]) {
        // Initialize first cell offset
        cur_cell_offset = offset_first_cell(0, formula.parent().attr("class")) - area_border_width;
    }
    
    // Rename to final form ID and place the cells
    formula.children().each(function(idx) {

        // Enumerate form id in non-exclusive formulas
        if (!element_cfg_table[formula.parent().attr("class")]["formula_exclusive"]) {

            // Changing temporary id of a form_id_object to a final one
            set_form_id(app_forms_container.children("#" + create_renum_form_id($(this))), $(this));
            
            // Place cells in formula    
            apply_cell_offset($(this), formula.parent().attr("class"), cur_cell_offset);
            
            // Determining next cell offset
            cur_cell_offset = next_cell_offset($(this), formula.parent().attr("class"), idx, cur_cell_offset);
        }
        
        // Recursively enumerate children formulas
        // If child element has formula
        if (element_cfg_table[$(this).attr("class")]["initial_formula"].length > 0) {
            // Create formula and place it into cell
            enum_and_place_formula($(this).children("." + FORMULA_CLASS_NAME), null, 0);            
        }
        
    });
}


function apply_cell_offset(cell, formula_element_class, cell_offset) {
    // Applies offset to cell in layout
    // Arguments:
    //    cell: cell to be applied offset to.
    //    formula_element_class: class of the element in the formula.
    //    cell_offset: offset to be applied to cell.
    
    var cell_top = 0,   // top offset
          cell_left = 0;   // left offset
    
    if (!element_cfg_table[formula_element_class]["formula_exclusive"]) {
    
        // Calculate cells top and left offsets
        if (element_cfg_table[formula_element_class]["is_formula_horizontal"]) {
            cell_left = element_cfg_table[formula_element_class]["first_cell_left_offset"] + cell_offset;                                
            cell_top = element_cfg_table[formula_element_class]["first_cell_top_offset"];
            }
        else {
            cell_top = element_cfg_table[formula_element_class]["first_cell_top_offset"] + cell_offset;
            cell_left = element_cfg_table[formula_element_class]["first_cell_left_offset"];
        }
    }
        
    cell
        .css("top", to_px(cell_top))
        .css("left", to_px(cell_left));
}


function next_cell_offset(cell, formula_element_class, idx, cur_offset) {
    // Computes next cell offset based on cell index and previous cell offset.
            
    var next_offset = 0,
           cell_length;
    
    // It is only relevant to non-exclusive formulas
    if (!element_cfg_table[formula_element_class]["formula_exclusive"]) {
    
        if (is_operand(idx, formula_element_class)) {
            cell_length = element_cfg_table[formula_element_class]["operand_cell_length"];
        }
        else {
            cell_length = element_cfg_table[formula_element_class]["operator_cell_length"];
        }

        // Find number of "open" and "close" groups in the cell.
        next_offset = cur_offset + cell_length + (cell.children(".group-open").length + cell.children(".group-close").length) * group_margin;
    }
    
    return (next_offset);
}


function get_element_num(formula_class, idx) {
    // Returns number of the operand or operator that pertains to the 
    // cell with specified index within the sequence.
    // Arguments:
    //     formula_class: formula element class
    //     idx: index of a cell within the formula
    
    // Determine if the formula starts with operator
    if (element_cfg_table[formula_class]["starts_with_operator"]) {
        // In this case there is the same number of operand and operators, therefore,
        // divide by 2 and add 1 since index is zero-based and function value is one-based.
        return (Math.floor(idx/2)+1);
    }
    else {
        return (Math.floor((idx+1)/2)+1);
    }
}


function is_element_operator(formula_class, idx) {
    // Determines if the element with specified index is operator (true) or operand (false).
    // Arguments:
    //     formula_class: formula element class
    //     idx: index of a cell within the formula
    
    if (element_cfg_table[formula_class]["starts_with_operator"]) {
       // If formula starts with operator, even index means operator.
       return (idx % 2  ===  0);
    }
    else {
       // If formula starts with and, odd index means operator.
        return (idx % 2  ===  1);
    }
}


function create_new_form(cell) {
    // Returns form for newly created cell.
    // Fetches first sample form of the class corresponding to cell and undeletes (marks as not deleted) it.
    
    // (jQuery: not using space before "#" is like logical AND: .<class>#<id> - element with class and id)
    return (undelete_form(
                   app_forms_container.children("." + create_app_form_class(cell.attr("class"))
                                                    + "#" + FORM_ID_CLASS_PREFIX + SAMPLE_FORM_ID + ":first")));
}


function delete_form(form) {
    // Moves the form to the set of sample forms (delete). This is usually done when the form's cell is deleted.

    // Reset form: copy all fields from the sample-form of the same class to this form
    copy_form(app_forms_container.children("." + form.attr("class") 
                                          + "#" + FORM_ID_CLASS_PREFIX + SAMPLE_FORM_ID + ":first"), form);
                                          
    form_mark_delete(form);   // Mark form as DELETE
    
    // Set id of the form to the sample form id
    form.attr("id", FORM_ID_CLASS_PREFIX + SAMPLE_FORM_ID);
}


function form_mark_delete (form) {
    // Marks form for deletion

    form.children(".INPUT-DELETE").prop("checked", true);  // check DELETE box
}


function undelete_form(form) {
    // Undeletes form (marks as not DELETE) and returns the form

    return(form.children(".INPUT-DELETE").prop("checked", false).parent());
}


function copy_form(src_form, dest_form) {
    // Copies form fields content from src_form into dest_form.

    src_form.children().each(function() {  // Iterate over source form fields
        if ($(this).attr("class") != undefined)  {  // Copy only if the field has class
        
            if ($(this)[0].tagName  ===  "INPUT") {
            
                if ($(this).attr("type")  ===  "checkbox") {
                    dest_form.children("." + $(this).attr("class"))
                        .prop("checked", $(this).prop("checked"));
                }
                else if ($(this).attr("type")  ===  "text") {
                    dest_form.children("." + $(this).attr("class"))
                        .val($(this).val());
                }
            }
        }
    });
}


function init_groups(cell, parent_class) {
    // Initializes groups in the cell based on the corresponding form fields
    // in which backend stores cell's group information.
    // Arguments:
    //     cell: cell under consideration..
    //     parent_class: cell parent's class for determining formula attributes.

    // If formula has groping in its cells
    if (element_cfg_table[parent_class]["formula_has_grouping"]) {

        // Fetch the form
        cur_app_form = app_forms_container.children("#" + gen_form_id(cell.attr("id")));

        // If the form exists, get the grouping info from it and add the initial groups
        if (cur_app_form.length > 0) {
        
            var group_type = "group-mid";   // Default
        
            
            if (cur_app_form.children("." + "group_open").prop("checked")) {
                // If form has opening group box checked
                group_type = "group-open";
            }
            else if (cur_app_form.children("." + "group_close").prop("checked")) {
                // If form has closing group box checked
                group_type = "group-close";
            }
                
            // Level of the lowest group which is group-open or group-close (i.e. "group end")
            var group_end_level = cur_app_form.children("." + "group_end_level").val();
        
            // Highest group level not including group-self
            var group_high = cur_app_form.children("." + "group_high").val();
            
            // Add groups to cell
            add_groups(cell, group_high, group_end_level, group_type, get_cell_orientation(parent_class));
            
            bind_group_dialog(get_cell_groups(cell));   // Bind dialog to set of groups
            process_groups(cell, parent_class);               // Set groups color and shape
        }
    }
}


function get_operand_before(cell) {
    // Fetches operand before specified cell
    // TBD, possibly need to develop for "domino" or "connected" formulas
    return(cell.prev())
}


function update_backref(formula, start_br_update_cell, offset, formula_rel_offset) {
    // Updates formula element back-references due to formula change (element addition 
    // or deletion), or area/formula initialization, In the latter case the offset is expected to 
    // be 0.
    // Arguments:
    //      formula: formula in which BRs should be updated
    //      start_br_update_cell: cell from which BRs should be updated
    //      offset: offset by which BRs should be updated
    //      formula_rel_offset: formula relative offset (offset for all BRs in the formula)

    // If this formula is back-referenced, update the reference indexes.
    if (element_cfg_table[formula.parent().attr("class")]["is_backreferenced_formula"]) {
    
        formula.children().children("." + FIELDS_CLASS_NAME+".operand").parent().each(function(idx) {

            var form = get_form_id_object($(this));   // Form that corresponds to the cell

            set_form_ref_idx(form, (formula_rel_offset + idx+1));   // Set element's ref_index in its form
        });
    }
    
    // Update back-references in the formula and its children recursively
    update_backref_formula(formula, get_operand_idx(get_closest_operand_cell(start_br_update_cell)),
                                                                                                      start_br_update_cell, offset, false);    
}


function update_backref_formula(formula, start_br_update, start_br_update_cell, offset, is_child_update) {
    // Updates back-references in the formula and its children recursively.
    // Arguments:
    //      formula: formula in which BRs (back-references) should be updated.
    //      start_br_update: starting BR from which to update.
    //      start_br_update_cell: cell from which BRs should be updated.
    //      offset: offset by which BRs should be updated.
    //      is_child_update: indicator if this is child's update (initial call will have it as false
    //      and the recursive call as true).

    //Scan through operators since their children can have BR's
    start_br_update_cell.add(start_br_update_cell.nextAll()).each(function() {
    
        // Check if the operand in the formula has back-reference, otherwise, no need to update
        if (element_cfg_table[formula.parent().attr("class")]["operand_has_backreference"]) {        
            update_backref_cell($(this), start_br_update, offset);
        }
        
        // If formula has children, update children BRs, otherwise, end of recursion
        if (element_cfg_table[$(this).attr("class")]["initial_formula"].length > 0) {

            // Update children back-reference    
            update_backref_formula($(this).children("."+FORMULA_CLASS_NAME), 
                                        start_br_update, $(this).children("."+FORMULA_CLASS_NAME)
                                                   .children(":first"), offset, true);   // Take first formula element
        }
    });
}


function update_backref_cell(cell, start_br_update, offset) {
    // Updates cell's back-reference (BR).
    // Arguments:
    //      cell: cell in which BR should be updated.  
    //      starting_br_update: minimum BR number to qualify for update
    //      offset: offset to apply to BR

    if (cell.children("." + FIELDS_CLASS_NAME).hasClass("operand")) {  // Update only operands
    
        populate_br_choice(cell);   // Populate BRs choices in drop-down menu
        
         // Select drop-down BR choice if qualified (BR is at least start_br_update and 
         // does not exceed maximum allowed by the menu).
        if (get_cell_br(cell) >= start_br_update &&
            get_cell_br(cell) + offset <= get_br_choice(cell).children().length) {
            
            set_cell_br(cell, get_cell_br(cell) + offset);
        }
        
        chop_br_options(cell);  // Remove drop-down choices higher than cell's index
    }
}


function chop_br_options(cell) {
    // Removes choices from cell's back-reference menu that are greater than element reference index.
    
    if (get_cell_br(cell) > get_ref_idx(cell)) { 
        set_cell_br(cell, get_ref_idx(cell))
    }
                            
    get_br_choice(cell).children(":gt(" + (get_ref_idx(cell)-1) + ")").remove();  // chop
}

function populate_br_choice(cell) {
    // Populates choices in cell's back-reference menu.
    
    // If current options number is less than reference_index
    if (get_br_choice(cell).children().length < get_ref_idx(cell)) { 
                
        // Populate choices
        for (var i = get_br_choice(cell).children(":last").index()+2; i <= get_ref_idx(cell); i++) {
            get_br_choice(cell).append($("<option>" +  i  + "</option>"));
        }
    }
}

function get_operand_idx(cell) {
    // Returns operand's index if  cell is an operand, otherwise, throws exception.
    
    if (is_cell_operand(cell)) {
         throw "get_operand_idx: Cell is not operand.";
    }
    else {
        return (cell.prevAll().add(cell).children("." + FIELDS_CLASS_NAME+".operand").length);
    }
}


function get_next_operand_cell(cell) {
    // Returns next operand after cell.

    return (cell.nextAll().children("." + FIELDS_CLASS_NAME+".operand").parent(":first"));
}

function get_prev_operand_cell(cell) {
    // Returns previous operand before cell.

    return (cell.prevAll().children("." + FIELDS_CLASS_NAME+".operand").parent(":last"));
}


function is_cell_operand(cell) {
    // Returns true, if cell is operand, otherwise, returns false.

    return (cell.children("." + FIELDS_CLASS_NAME).hasClass("operand"));
}


function get_closest_operand_cell(cell) {
    // If cell is operand, returns the cell, otherwise the cell is operator, returns next operand

    return (cell.add(cell.nextAll()).children("." + FIELDS_CLASS_NAME+".operand").parent(":first"));
}


function get_br_choice(cell) {
    // Returns cell's back-reference menu.

    return (app_forms_container.children("#" + create_form_id(cell))
                                                                        .children("." + BACKREFERENCE_CLASS_NAME)); 
}


function get_cell_br(cell) { 
    // Returns cell's selected back-reference.

    return (get_br_choice(cell).children(":selected").index() + 1);
}

function set_cell_br(cell, br) {
    // Sets cell's back-reference choice to value specified by br argument.

    // Unselected BR
    get_br_choice(cell).children().prop('selected', false); 
        
    // Set selected option to br. br starts with 1, so need to adjust to index which start with 0, hence -1.    
    get_br_choice(cell).children(":eq(" + (br-1) + ")").prop('selected', true);
}

function get_formula_rel_offset(formula) {
    // Returns formula relative offset.

    // Preceding formula in sequence of formulas
    var preceding_formula = element_cfg_table[formula.parent().attr("class")]["preceding_formula"];

    if (preceding_formula != undefined) {
        return(
                get_form_ref_idx(
                    get_form_id_object(
                    
                        workspace.find("." + preceding_formula["area"]
                            + " ." + preceding_formula["formula"]
                            + ">." 
                            + FORMULA_CLASS_NAME).children().children("." + FIELDS_CLASS_NAME+".operand:last").parent()
                    )
                )
        );
    }
    else {
        return (0);    // If no preceding formula, then relative offset is 1
    }
}


function set_form_ref_idx(form, ref_idx) {
    // Sets form's reference index.

    form.children("." + REF_INDEX_CLASS_NAME).val(ref_idx);
}


function get_form_ref_idx(form) {
    // Returns form's reference index.

    return (parseInt(form.children("." + REF_INDEX_CLASS_NAME).val()));
}

function get_ref_idx(cell) {
    // Returns cell's reference index (index of operand in back-referenced formula).

    var ref_idx = null;  // Initialization

     // Look at the element and its non-formula parents, there should only be one that is back-referenced.
    cell.add(cell.parents(':not(.' + FORMULA_CLASS_NAME + ')')).each(function() {

        var cur_parent_cell = $(this).parent().parent(); // take non-formula parent

        // To make sure we are not selecting objects higher than workspace, (like "body" for instance)
        if ($(this).parent().parent().attr("class") != undefined) {

            if (element_cfg_table[cur_parent_cell.attr("class")]["is_backreferenced_formula"]) {
            
                var operand_cell = $(this);   // Default
                if (!is_cell_operand($(this))) {

                    // Take the nearest operand before (example of this is: condition BRs event and that condition is
                    //  under branch (while branch is an operator we need to take the nearest event before the branch.
                    operand_cell = get_operand_before($(this));
                }
                ref_idx = get_form_ref_idx(get_form_id_object(operand_cell));
            }
        }
    });
    return (ref_idx);
}


function init_areas(workspace_def_table) {
    // Initializes areas.
    
    // This function has been modified to redirect to protected view in order to protect the IP,
    // since this GitHub code is for code demonstration purposes and not the app demonstration.
    window.location.assign("protect")
}


function enumerate_all (workspace_class) {
    // Enumerates all formulas in all areas.

    for (var area_class_idx in workspace_def_table["areas"]) {
    
        var cur_formula = $("#" + workspace_def_table["areas"][area_class_idx]).children(".formula");
 
        enumerate_formula(cur_formula, cur_formula.children(":first"), 0); // start BR update from the first element
    }

    // Initialize all BRs in all areas.
    for (var area_class_idx in workspace_def_table["areas"]) {
        var area_class = workspace_def_table["areas"][area_class_idx];
        
        var cur_formula = $("#" + area_class + " ." + element_cfg_table[area_class]["initial_formula"][0]).children(".formula");
        
        if (element_cfg_table[element_cfg_table[area_class]["initial_formula"][0]]["is_backreferenced_formula"]) {
        
            update_backref(cur_formula,  cur_formula.children(":first"), 0, get_formula_rel_offset(cur_formula));
        }
    }    
}

function resize_all() {
    // Resizes all areas.

    resize_area("setup");
    resize_area("entry");
    resize_area("exit");        
}
