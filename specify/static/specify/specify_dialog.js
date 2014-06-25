/****************************************************************
*
* File name: specify_dialog.js
*
* Description:
* Functions for form dialog creastion and manipulation for Specify 
* application web client.
*
* Form is assigned id. All forms are stored in a formset.
* When element is clicked the form with corresponding id gets cloned and 
* attached to the dialog (which is the only common dialog or all forms)
* If the dialog is OKed - the modified form replaces the old one in formset
* If Cancel button is clicked, the form in the dialog gets dumped.
*
* Dependencies:
*   - specify_defs.js
*   - specify_group.js
****************************************************************/

// Dialog object (global variable)
var fields_dialog = $("<div/>");

// Generates form id
function gen_form_id(cell_id) { return(FORM_ID_CLASS_PREFIX + cell_id); }

// Returns form corresponding to cell
function get_cell_form(cell) { return(app_forms_container.children("#" + create_form_id(cell))); }

// Creates id for form corresponding to cell
function create_form_id(cell) { return(gen_form_id(cell.attr("id"))); }


// Creates renumerated id for the form corresponding to the cell (temporary id used in enumeration process)
function create_renum_form_id(cell) {
    return(FORM_ID_NAME + FORM_ID_CLASS_SEPARATOR + cell.attr("id") 
                                            + FORM_ID_CLASS_SEPARATOR + FORM_RENUM_ID_NAME);
}


function bind_fields_dialog(element_fields, has_grouping) {
	// Binds fields object with dialog
    
	element_fields.click(function(event) {
		event.stopPropagation();   // To avoid event bubbling
		
		var invoking_fields = $(this);
				
		var dialog_buttons = [
			{ 
				text: "Ok", 
				click: function() { 
					$(this).dialog("close");
							
					// Save form into app_forms_container
					// 1. remove original form from the app_forms_container
					app_forms_container.children("#"+create_form_id(invoking_fields.parent())).remove();
					// 2. Take the modified form from the dialog and  move it to the app_forms_container
					app_forms_container.append($(this).children("form"));
							
					$(this).dialog("destroy");
				} 
			}
		];
		
        // Group elements in formula
		if (has_grouping) {    // If the formula has grouping
			dialog_buttons.push(
				{ 
					text: "Group", 
					click: function() {
						$(this).children("form").remove();
						$(this).dialog("close");
						
						var invoking_cell = invoking_fields.parent();
								
						// At group level we take all cells children that are not fields and take the
                        // index of the last one. Then, we add one, because operator connects groups on a level one higher than the operator is on. For example it can connect to "self" groups. That is
						// the level under which the new group will be added upon.

                        // Find number of operators in group (operators_min argument is don't-care)
                        // Siblings of invoking fields are groups. Last group is which is not self is the
                        // highest group under the invoking fields. It is the group that is being scanned.
						var scan_data = measure_group(invoking_fields
                                         .siblings(":not(.group-self):last"), "invoking", false, 0, 0);
                                         
						var operators_in_group = scan_data["operators_in_group"];
						
                        
						if (operators_in_group > 1) {
                        
                            // Take last group under the operator (operator has noe self-group).
                            // Add one, since operator connects groups on a level one higher than 
                            // the operator is on. For example it can connect to "self" groups. 
						    // That is the level under which the new group will be added upon.
							manage_group(invoking_cell, invoking_fields.siblings(":last")
                                                                             .index()+1, "add", "invoking");
                                                                             
                            // Adjust cells offsets
							enumerate_formula(invoking_cell.parent(), null, 0);
						}
						else {   // Only one operator in group
							alert("The operator is already grouped.");
						}
						
                        // Destroy dialog after action completed
						$(this).dialog("destroy");
					} 
				}			
			)
		}
		
		dialog_buttons.push(
			{ 
				text: "Cancel", 
				click: function() {
					// dump the form from the dialog
					$(this).children("form").remove();
					$(this).dialog("close");							
					$(this).dialog("destroy");
				} 
			}
		)
		
		fields_dialog.attr("title", invoking_fields.parent().attr("id"));
			
		// Append form to dialog
		var form_to_clone = app_forms_container.children("#"+create_form_id(invoking_fields.parent()));
		var cloned_form = form_to_clone.clone(true);
		
        // Copy drop down menu to cloned form
		copy_drop_downs(form_to_clone, cloned_form);
		
		fields_dialog.append(cloned_form);

		// Dialog setup
		fields_dialog.dialog({
			autoOpen: false,
			modal: true,			
			position: { of: invoking_fields }, // place at the center of invoking fields
			buttons: dialog_buttons
		})

		fields_dialog.dialog("open");
	});	
}
	
function get_form_id_object(cell) {
    // Returns id of a form corresponding to specified cell.

	return (app_forms_container.children("#" + create_form_id(cell)));
}

function set_renum_form_id(form, cell) {
    // Assigns renumerated id to a form.
    // Arguments:
    //      form: form to assign id to.
    //      cell: cell, the renumerated id should correspond to.

	form.attr("id", create_renum_form_id(cell));
}
	
function set_form_id(form, cell) {
    // Assigns id to a form
    // Arguments:
    //      form: form to assign id to.
    //      cell: cell, the id should correspond to.

	form.attr("id", create_form_id(cell));
}	
	
function copy_drop_down_field(src_field, dest_field) {
    // Copies drop-down menu from src_field to dest_field, preserving selected item.
    // This is needed, since cloning of drop-down does not preserve selected item.

	dest_field.children('option').filter(':eq(' + src_field.children('option:selected').index() + ')').prop("selected", true);
}

function copy_drop_downs(src_form, dest_form) {
    // Copies drop-down menus from src_form to dest_form, preserving selected item.

	src_form.children("select").each(function() {
		var field_class = $(this).attr("class");
		
		copy_drop_down_field(src_form.children("." + field_class), dest_form.children("." + field_class))			
	});
}

