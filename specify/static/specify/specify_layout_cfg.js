/****************************************************************
*
* File name: specify_layout_cfg.js
*
* Description:
* Configuration tables for Specify application layout. Contains functions for
* geometry calculation.
*
*
* Dependencies:
*  - None
*
****************************************************************/

// Parameters definitions and derived dimension/offset/margin calculations.
var
    seq_cell_length = 120,   // Sequence sell length
    seq_top_margin_pcnt = 50,  // Sequence percentage of top margin

    // Setup left and right margin percentages
    setup_left_margin_pcnt = 50,  
    setup_right_margin_pcnt = 90,

    // Exit left and right margin percentages
    exit_left_margin_pcnt = 90,
    exit_right_margin_pcnt = 50,
    
    // Event cell lengths percentages
    event_operand_cell_length_pcnt = 70,
    event_operator_cell_length_pcnt = 50,   

    // Calculation of margins based on percentages defined above
    seq_top_margin = Math.round(seq_cell_length * seq_top_margin_pcnt / 100),
    setup_left_margin = Math.round(seq_cell_length * setup_left_margin_pcnt / 100),
    setup_right_margin = Math.round(seq_cell_length * setup_right_margin_pcnt / 100),
    exit_left_margin = Math.round(seq_cell_length * exit_left_margin_pcnt / 100),
    exit_right_margin = Math.round(seq_cell_length * exit_right_margin_pcnt / 100),
    entry_left_margin = seq_cell_length - setup_right_margin,
    entry_right_margin = seq_cell_length - exit_left_margin,
   
    // Calculation of Event cell length and offset
    event_operand_cell_length = Math.round(seq_cell_length*event_operand_cell_length_pcnt/100),
    event_operator_cell_length = Math.round(seq_cell_length*event_operator_cell_length_pcnt/100),
    event_formula_top_offset = Math.round(event_operand_cell_length*1.5),

    // Area margins
    area_top_margin = seq_top_margin + event_formula_top_offset,
    area_bottom_margin = seq_top_margin;
    

// Workspace dimensions, offsets and coclor    
var 
    workspace_left = 50,
    workspace_top = 200,
    workspace_width = 1000,
    workspace_height = 500,
    workspace_background_color = "#999966";

// Setup area parameters
var
    area_setup_left = 0,
    area_setup_top = 0,
    area_setup_width = 500,
    area_border_width = 1;

// Entry area parameters and offsets
var 
    area_entry_left = area_setup_left
                    + area_setup_width;
                    + area_border_width,
                    
    area_entry_width = 200;

// Exit area left offset
var area_exit_left = area_entry_left
                   + area_entry_width;
                   + area_border_width;
                    
    
// Workspace configuration
var workspace_def_table = {
    "name": "sequence_workspace",
    "areas": ["setup", "entry", "exit"]
};


// Area configuration table
var area_cfg_table = {
    "setup": {
        "right_margin": setup_right_margin,
        "top_margin": area_top_margin,
        "bottom_margin": area_bottom_margin
    },

    "entry": {
        "right_margin": entry_right_margin,
        "top_margin": area_top_margin,
        "bottom_margin": area_bottom_margin
    },        

    "exit": {
        "right_margin": exit_right_margin,
        "top_margin": area_top_margin,
        "bottom_margin": area_bottom_margin
    }
}    

/*
Every formula has 2 axes: horizontal and vertical
one of them is a direction in which formula runs with operands and operators in between, 
the other one is a "common side".

Example: horizontal formula: ([----] - operand, {--} - operator)

[----] {--} [----]
[----] {--} [----]

As we can see, the formula runs horizontal, therefore, the length of operands and operators at Y-axis is the
same. On the other hand, at X-axis, the length of an operand can be different than the one of the operator
So, we define:
   common_cell_length   (for Y-axis for both operand and operator, in this "horizontal" formula example)
   operand_cell_length  (for X-axis for operand, in this "horizontal" formula example)
   operator_cell_length (for X-axis for operator, in this "horizontal" formula example)
   
Of course, for "vertical" formulas Y and X axes will flip names.

Exclusive formulas - formulas that have same parent and one formula can be selected (visible) at any time.
*/


// Element configuration table
var element_cfg_table = {
    "setup": {
        "common_cell_length": seq_cell_length,
        "operand_cell_length": seq_cell_length,
        "operator_cell_length": seq_cell_length,
        
        "formula_exclusive": true,
        "initial_formula": ["setup_sequence"],
        "dynamic_child_operand": null,
        "dynamic_child_operator": null,
        "has_operators" : false,
        "starts_with_operator": false,

        "first_cell_top_offset": 0,
        "first_cell_left_offset": 0,
    },

    "entry": {
        "common_cell_length": seq_cell_length,
        "operand_cell_length": seq_cell_length,
        "operator_cell_length": seq_cell_length,
                
        "formula_exclusive": true,
        "initial_formula": ["entry_sequence"],
        "dynamic_child_operand": null,
        "dynamic_child_operator": null,
        "has_operators" : false,
        "starts_with_operator": false,

        "first_cell_top_offset": 0,
        "first_cell_left_offset": 0,        
        },        
        
    "exit": {
        "common_cell_length": seq_cell_length,
        "operand_cell_length": seq_cell_length,
        "operator_cell_length": seq_cell_length,

        "formula_exclusive": true,
        "initial_formula": ["exit_sequence"],
        "dynamic_child_operand": null,
        "dynamic_child_operator": null,
        "has_operators" : false,
        "starts_with_operator": false,

        "first_cell_top_offset": 0,
        "first_cell_left_offset": 0,        
    },

    "setup_sequence": {
        "common_cell_length": seq_cell_length,
        "operand_cell_length": seq_cell_length,
        "operator_cell_length": seq_cell_length,
        
        "has_fields": true,
        "initial_formula": ["event"],
        "dynamic_child_operand": "event",
        "dynamic_child_operator": "branch",
        "starts_with_operator": false,
        "is_formula_horizontal": true,
        
        "is_backreferenced_formula": true,
        
        "following_formula": {"area": "entry" , "formula": "entry_sequence"},        

        "first_cell_top_offset": seq_top_margin,
        "first_cell_left_offset": setup_left_margin,
    },

    "event": {
        "common_cell_length": event_operand_cell_length,
        "operand_cell_length": event_operand_cell_length,
        "operator_cell_length": event_operator_cell_length,

        "has_fields": true,
        "initial_formula": ["condition"],
        "dynamic_child_operand": "condition",
        "dynamic_child_operator": "condition_operator",
        "starts_with_operator": false,
        "is_formula_horizontal": false,
        "text": "Event",
        "has_controls": true,
        "has_dialog": true,
        "formula_has_grouping": true,
        "operand_has_backreference": true,
        "first_cell_top_offset": event_formula_top_offset,
        "first_cell_left_offset":
                 get_midplacement_offset(seq_cell_length, 
                                      event_operand_cell_length, false),    
        "fields_width_pcnt": 100,
        "fields_height_pcnt": 60,
        "fields_border_width": 3,
        "fields_border_radius_pcnt": 15,
        "ctrl_common_length_pcnt": 15,
        "control_add_color": "#6755E3",
        "control_delete_color": "#CC0033"
    },

    "branch": {
        "common_cell_length": event_operand_cell_length,
        "operand_cell_length": event_operand_cell_length,
        "operator_cell_length": event_operator_cell_length,
        
        "formula_exclusive": true,
        "has_fields": true,
        "initial_formula": ["branch_qualifier"],
        "dynamic_child_operand": null,
        "dynamic_child_operator": null,
        "has_operators" : false,
        "starts_with_operator": false,
        "is_operator": true,
        "has_dialog": true,
        
        "first_cell_top_offset": 0,
        "first_cell_left_offset": 0,        
        
        "text_subobject": 1, // number of subobject that has text

        "fields_subobject-1_height_pcnt": 15,
        "fields_subobject-1_width_pcnt": 85,
    },

    "branch_qualifier": {
        "common_cell_length": event_operand_cell_length,
        "operand_cell_length": event_operand_cell_length,
        "operator_cell_length": event_operator_cell_length,
        
        "has_fields": true,
        "initial_formula": ["condition"],
        "dynamic_child_operand": "condition",
        "dynamic_child_operator": "condition_operator",
        "starts_with_operator": false,
        "is_formula_horizontal": false,
        "formula_has_grouping": true,
        
        "operand_has_backreference": true,
        
        
        "first_cell_top_offset": event_formula_top_offset,
        "first_cell_left_offset":
                  get_midplacement_offset(seq_cell_length,
                                    event_operand_cell_length, false),        

        "fields_width_pcnt": 30,
        "left_offset_pcnt": 30,
        "top_offset_pcnt": 80,
    },

    "condition": {
        "has_fields": true,
        "initial_formula": [],
        "dynamic_child_operand": null,
        "dynamic_child_operator": null,
        "has_controls": true,
        "has_dialog": true,
        "formula_has_grouping": true,

        "fields_width_pcnt": 100,
        "fields_height_pcnt": 100,
        "fields_border_width": 3,
        "fields_border_radius_pcnt": 15,
        
        "ctrl_common_length_pcnt": 10,
        "control_add_color": "#6755E3",
        "control_delete_color": "#CC0033"
    },
    
    "condition_operator": {
        "has_fields": true,
        "initial_formula": [],
        "dynamic_child_operand": null,
        "dynamic_child_operator": null,
        "is_operator": true,
        "has_dialog": true,
        
        "text_subobject": 2,
                
        "fields_subobject-1_border_width": 1,
        "fields_subobject-2_height_pcnt": 30,
        "fields_subobject-2_width_pcnt": 40,
    },

    "entry_sequence": {
        "common_cell_length": seq_cell_length,
        "operand_cell_length": seq_cell_length,
        "operator_cell_length": seq_cell_length,
        
        "has_fields": true,
        "initial_formula": ["order_branch", "entry_event"],
        "dynamic_child_operand": null,
        "dynamic_child_operator": null,
        "starts_with_operator": true,
        "is_formula_horizontal": true,
        
        "is_backreferenced_formula": true,
        
        "preceding_formula": {"area": "setup" , "formula": "setup_sequence"},
        "following_formula": {"area": "exit" , "formula": "exit_sequence"},

        "first_cell_top_offset": seq_top_margin,
        "first_cell_left_offset": entry_left_margin,
    },

    "entry_event": {
        "common_cell_length": event_operand_cell_length,
        "operand_cell_length": event_operand_cell_length,
        "operator_cell_length": event_operator_cell_length,

        "has_fields": true,
        "has_dialog": true,
        "initial_formula": ["condition"],
    
        "dynamic_child_operand": "condition",
        "dynamic_child_operator": "condition_operator",
        "starts_with_operator": false,
        "is_formula_horizontal": false,
        "text": "Event",
        "formula_has_grouping": true,
        "operand_has_backreference": true,
    
        "fields_width_pcnt": 100,
        "fields_height_pcnt": 60,
        "fields_border_width": 3,
        "fields_border_radius_pcnt": 15,
        
        "ctrl_common_length_pcnt": 15,
        "control_add_color": "#6755E3",
        "control_delete_color": "#CC0033",
        

        "first_cell_top_offset": event_formula_top_offset,
        "first_cell_left_offset": get_midplacement_offset(seq_cell_length, event_operand_cell_length, false),            
    },
    
    "order_branch": {
        "has_fields": true,
        "has_dialog": true,
        "initial_formula": [],
        "dynamic_child_operand": null,
        "dynamic_child_operator": null,
        
        "is_operator": true,
        
        "text_subobject": 1,
                
        "fields_subobject-1_height_pcnt": 15,
        "fields_subobject-1_width_pcnt": 85,
    },

    "exit_sequence": {
        "common_cell_length": seq_cell_length,
        "operand_cell_length": seq_cell_length,
        "operator_cell_length": seq_cell_length,
        
        "has_fields": true,
        "initial_formula": ["exit_branch", "exit_event", "exit_branch", "exit_event"],
        "dynamic_child_operand": null,
        "dynamic_child_operator": null,
        "starts_with_operator": true,
        "is_formula_horizontal": true,
        "preceding_formula": {"area": "entry" , "formula": "entry_sequence"},
        "first_cell_top_offset": seq_top_margin,
        "first_cell_left_offset": exit_left_margin,
    },

    "exit_event": {
        "common_cell_length": event_operand_cell_length,
        "operand_cell_length": event_operand_cell_length,
        "operator_cell_length": event_operator_cell_length,

        "formula_exclusive": true,
        "has_fields": true,
        "initial_formula": ["exit_event_target", "exit_event_stop"],
        "dynamic_child_operand": null,
        "dynamic_child_operator": null,
        "has_operators" : false,
        "starts_with_operator": false,
        "is_operator": true,
        "has_dialog": true,
        
        "first_cell_top_offset": 0,
        "first_cell_left_offset": 0,        
        
        "fields_width_pcnt": 100,
        "fields_height_pcnt": 60,
        "fields_border_width": 3,
        "fields_border_radius_pcnt": 15,
        
        "ctrl_common_length_pcnt": 15,
        "control_add_color": "#6755E3",
        "control_delete_color": "#CC0033"
    },

    "exit_event_target": {
        "common_cell_length": event_operand_cell_length,
        "operand_cell_length": event_operand_cell_length,
        "operator_cell_length": event_operator_cell_length,
        
        "has_fields": true,
        "initial_formula": ["exit_branch_target_condition"],
        "dynamic_child_operand": "exit_branch_target_condition",
        "dynamic_child_operator": null,
        "starts_with_operator": false,
        "is_formula_horizontal": false,
        "formula_has_grouping": true,
        
        "operand_has_backreference": true,
        
        "first_cell_top_offset": event_formula_top_offset,
        "first_cell_left_offset": get_midplacement_offset(seq_cell_length, event_operand_cell_length, false),        

        "fields_width_pcnt": 0,
        "left_offset_pcnt": 0,
        "top_offset_pcnt": 0,
    },
    
    "exit_event_stop": {
        "common_cell_length": event_operand_cell_length,
        "operand_cell_length": event_operand_cell_length,
        "operator_cell_length": event_operator_cell_length,
        
        "has_fields": true,
        "initial_formula": ["exit_branch_stop_condition"],
        "dynamic_child_operand": "exit_branch_stop_condition",
        "dynamic_child_operator": null,
        "starts_with_operator": false,
        "is_formula_horizontal": false,
        "formula_has_grouping": true,
        
        "operand_has_backreference": true,
        

        "first_cell_top_offset": event_formula_top_offset,
        "first_cell_left_offset": get_midplacement_offset(seq_cell_length, event_operand_cell_length, false),        

        "fields_width_pcnt": 0,
        "left_offset_pcnt": 0,
        "top_offset_pcnt": 0,
    },
    
    "exit_branch": {
        "common_cell_length": event_operand_cell_length,
        "operand_cell_length": event_operand_cell_length,
        "operator_cell_length": event_operator_cell_length,
        
        "formula_exclusive": true,
        "has_fields": true,
        "has_dialog": true,
        "initial_formula": ["exit_branch_target", "exit_branch_stop"],
        "dynamic_child_operand": null,
        "dynamic_child_operator": null,
        "has_operators" : false,
        "starts_with_operator": false,
        "is_operator": true,
        
        "first_cell_top_offset": 0,
        "first_cell_left_offset": 0,        
        
        "text_subobject": 1, // number of subobject that has text

        "fields_subobject-1_height_pcnt": 15,
        "fields_subobject-1_width_pcnt": 85,
    },
    
    "exit_branch_target": {
        "common_cell_length": event_operand_cell_length,
        "operand_cell_length": event_operand_cell_length,
        "operator_cell_length": event_operator_cell_length,
        
        "has_fields": true,
        "initial_formula": ["exit_branch_target_condition"],
        "dynamic_child_operand": "exit_branch_target_condition",
        "dynamic_child_operator": null,
        "starts_with_operator": false,
        "is_formula_horizontal": false,
        "formula_has_grouping": true,
                
        "operand_has_backreference": true,
        
        "couple": "exit_event_target",
        
        "first_cell_top_offset": event_formula_top_offset,
        "first_cell_left_offset": get_midplacement_offset(seq_cell_length, event_operand_cell_length, false),        

        "fields_width_pcnt": 30,
        "left_offset_pcnt": 70,
        "top_offset_pcnt": 80,
    },
    
    "exit_branch_stop": {
        "common_cell_length": event_operand_cell_length,
        "operand_cell_length": event_operand_cell_length,
        "operator_cell_length": event_operator_cell_length,
        
        "has_fields": true,
        "initial_formula": ["exit_branch_stop_condition"],
        "dynamic_child_operand": "exit_branch_stop_condition",
        "dynamic_child_operator": null,
        "starts_with_operator": false,
        "is_formula_horizontal": false,
        "formula_has_grouping": true,
        
        "operand_has_backreference": true,
        
        "couple": "exit_event_stop",
        

        "first_cell_top_offset": event_formula_top_offset,
        "first_cell_left_offset": get_midplacement_offset(seq_cell_length, event_operand_cell_length, false),        

        "fields_width_pcnt": 30,
        "left_offset_pcnt": 70,
        "top_offset_pcnt": 80,
    },
    
    "exit_branch_target_condition": {
        "has_fields": true,
        "initial_formula": [],
        "dynamic_child_operand": null,
        "dynamic_child_operator": null,
        "has_controls": true,
        "has_dialog": true,
        "formula_has_grouping": true,

        "fields_width_pcnt": 100,
        "fields_height_pcnt": 100,
        "fields_border_width": 3,
        "fields_border_radius_pcnt": 15,
        
        "ctrl_common_length_pcnt": 10,
        "control_add_color": "#6755E3",
        "control_delete_color": "#CC0033"
    },
    
    "exit_branch_stop_condition": {
        "has_fields": true,
        "initial_formula": [],
        "dynamic_child_operand": null,
        "dynamic_child_operator": null,
        "has_controls": true,
        "has_dialog": true,
        "formula_has_grouping": true,

        "fields_width_pcnt": 100,
        "fields_height_pcnt": 100,
        "fields_border_width": 3,
        "fields_border_radius_pcnt": 15,
        
        "ctrl_common_length_pcnt": 10,
        "control_add_color": "#6755E3",
        "control_delete_color": "#CC0033"
    },
}


function branch_stem_width(parent_class) {
    // Returns branch arrow stem width.

    return (Math.round(element_cfg_table[parent_class]["operator_cell_length"]
                       * (element_cfg_table["event"]["fields_width_pcnt"]/100)*(element_cfg_table["branch"]["fields_subobject-1_width_pcnt"]/100)));
}

function branch_triangle_length(parent_class) {
    // Returns branch arrow triangle length.

    return (Math.round(element_cfg_table[parent_class]["operator_cell_length"] - branch_stem_width(parent_class)));
}


// Element CSS attributes configuration table
element_graphic_table = {
    "setup": {
        "style": {
            "background-color": workspace_background_color,

            "border-style": "solid",
            "border-color": "white"
        },
        "init_dimensions": {
            "left": area_setup_left,
            "top": area_setup_top,
            "width": area_setup_width - 2*area_border_width,
            "height": workspace_height,
            
            "border-right-width": area_border_width,
            "border-left-width": 0,
            "border-top-width": 0,
            "border-bottom-width": 0
        }
    },
    
    "entry": {
        "style": {
            "background-color": workspace_background_color,

            "border-style": "solid",
            "border-color": "white"
        },
        "init_dimensions": {
            "left": area_entry_left,
            "top": area_setup_top,
            "width": area_entry_width - 2*area_border_width,
            "height": workspace_height,
        
            "border-right-width": area_border_width,
            "border-left-width": area_border_width,
            "border-top-width": 0,
            "border-bottom-width": 0
        }
    },        

    "exit": {
        "style": {
            "background-color": workspace_background_color,

            "border-style": "solid",
            "border-color": "white"
        },
        "init_dimensions": {
            "left": area_exit_left,
            "top": area_setup_top,
            "width": 500 - 2*area_border_width,
            "height": workspace_height,
            
            "border-right-width": 0,
            "border-left-width": area_border_width,
            "border-top-width": 0,
            "border-bottom-width": 0
        }
    },

    "setup_sequence": {
        "style": {
            "background-color": "transparent",
            
            "border": "none",
        },
        "init_dimensions": {   // these are fields' CSS
            "left": 20,
            "top": 3,
        },
    },
    
    "event": {
        "style": {
            "background-color": "#C6C6FF",
            
            "border-style": "solid",
            "border-color": "#484848"
        },
        "init_dimensions": {
            "left": 0,
            "top": function(parent_class) { 
                return( get_midplacement_offset(element_cfg_table[parent_class]["operand_cell_length"], 
                                                                          element_cfg_table["event"]["fields_height_pcnt"], true)
                )
            },
            
            "width": function(parent_class) {
                return( length_with_border("event", parent_class, "width", "operand_cell_length"));
            },
            "height": function(parent_class) { 
                return( length_with_border("event", parent_class, "height", "common_cell_length"));
            },
            "border-width": element_cfg_table["event"]["fields_border_width"],      
            "border-radius": function(parent_class) {
                return(get_border_radius("event", parent_class, "common_cell_length"));
            }
        },
    },
    
    "branch": {
        "subobject-1": {
            "style": {
                "background-color": "#6755E3",
                "border-color": "transparent"
            },
            "init_dimensions": {
                "left": 0,
                "top": function(parent_class) {
                    return(get_midplacement_offset(
                               element_cfg_table[parent_class]["common_cell_length"], 
                               element_cfg_table["branch"]["fields_subobject-1_height_pcnt"], true)
                    )
                },
                "width" : function(parent_class) { return(branch_stem_width(parent_class)); },    
                "height": function(parent_class) {
                    return(Math.round(element_cfg_table[parent_class]["common_cell_length"]
                                       * element_cfg_table["branch"]["fields_subobject-1_height_pcnt"]/100)
                    )
                },                
            },
        },
        
        "subobject-2": {
            "style": {
                "border-left-color": "#6755E3",
                "border-top-color": "transparent",
                "border-bottom-color": "transparent",
                "border-left-style": "solid",
                "border-top-style": "solid",
                "border-bottom-style": "solid"
            },
            "init_dimensions": {
                "left": function(parent_class) { return(branch_stem_width(parent_class)); },
                "top": function(parent_class) {
                    return(get_midplacement_offset(
                                         element_cfg_table[parent_class]["common_cell_length"], 
                                         2*branch_triangle_length(parent_class), false)
                    )
                },
                
                "width" : 0,    
                "height": 0,
                "border-left-width": function(parent_class) { return(branch_triangle_length(parent_class)); },
                "border-top-width": function(parent_class) { return(branch_triangle_length(parent_class)); },
                "border-bottom-width": function(parent_class) { return(branch_triangle_length(parent_class)); }
            }    
        }
    },
    
    "branch_qualifier": {
        "style": {
            "background-color": "green",
        },
        "init_dimensions": {
            // common_cell_length - horizontal direction, offset is to the center, "left" is to the border, 
            // therefore, adjusting by half a width
            "left": element_cfg_table["setup_sequence"]["operator_cell_length"]
                             * element_cfg_table["branch_qualifier"]["left_offset_pcnt"]/100
                    - element_cfg_table["setup_sequence"]["operator_cell_length"] 
                             * element_cfg_table["branch_qualifier"]["fields_width_pcnt"]/100/2,
            "top": element_cfg_table["setup_sequence"]["operator_cell_length"]
                             * element_cfg_table["branch_qualifier"]["top_offset_pcnt"]/100
                    - element_cfg_table["setup_sequence"]["operator_cell_length"]
                             * element_cfg_table["branch_qualifier"]["fields_width_pcnt"]/100/2,
                    
            "width": element_cfg_table["setup_sequence"]["operator_cell_length"]
                             * element_cfg_table["branch_qualifier"]["fields_width_pcnt"]/100,
            "height": element_cfg_table["setup_sequence"]["operator_cell_length"]
                             * element_cfg_table["branch_qualifier"]["fields_width_pcnt"]/100,
            
            "border-radius": element_cfg_table["setup_sequence"]["operator_cell_length"]
                             * element_cfg_table["branch_qualifier"]["fields_width_pcnt"]/100/2,
        },
    },

    "condition": {
        "style": {
            "background-color": "#999999",
            
            "border-style": "solid",
            "border-color": "#484848"
        },
        "init_dimensions": {
            "top": 0,
            "left": 0,
            "width": function(parent_class) {
                return(length_with_border("condition", parent_class, "width", "common_cell_length"));
            },
            "height": function(parent_class) {
                return(length_with_border("condition", parent_class, "height", "operand_cell_length"));
            },
            "border-width": element_cfg_table["condition"]["fields_border_width"],      
            "border-radius": function(parent_class) {
                return(get_border_radius("condition", parent_class, "common_cell_length"));
            }
        },
    },

    "condition_operator": {
        "subobject-1": {
            "style": {
                "border-left-color": "#ff0000",                
                "border-left-style": "solid",
            },
            "init_dimensions": {
                "top": 0,
                "left": function(parent_class) {
                    return(get_midplacement_offset(element_cfg_table[parent_class]["common_cell_length"],
                             element_cfg_table["condition_operator"]["fields_subobject-1_border_width"], false)
                    )
                },
                
                "width" : 0,    
                "height": function(parent_class) { return(element_cfg_table[parent_class]["operator_cell_length"]); },
                "border-left-width": element_cfg_table["condition_operator"]["fields_subobject-1_border_width"],
            }    
        },        
        
        "subobject-2": {
            "style": {
                "background-color": "#6755E3",
                "border-color": "transparent"
            },
            "init_dimensions": {
                "left": function(parent_class) {
                    return(get_midplacement_offset(element_cfg_table[parent_class]["common_cell_length"],
                                  element_cfg_table["condition_operator"]["fields_subobject-2_width_pcnt"], true)
                    )
                },
                "top": function(parent_class) {
                    return(get_midplacement_offset(element_cfg_table[parent_class]["operator_cell_length"],
                                 element_cfg_table["condition_operator"]["fields_subobject-2_height_pcnt"], true)
                    )
                },
                "width" : function(parent_class) {
                    return(Math.round(element_cfg_table[parent_class]["common_cell_length"]
                               * element_cfg_table["condition_operator"]["fields_subobject-2_width_pcnt"]/100)
                    )
                },
                "height": function(parent_class) {
                    return(Math.round(element_cfg_table[parent_class]["operator_cell_length"]
                               * element_cfg_table["condition_operator"]["fields_subobject-2_height_pcnt"]/100)
                    )
                },                
            },
        },        
    },
    
    "entry_event": {
        "style": {
            "background-color": "#C6C6FF",
            
            "border-style": "solid",
            "border-color": "#CC6600"
        },
        "init_dimensions": {
            "left": 0,
            "top": function(parent_class) {
                return(get_midplacement_offset(element_cfg_table[parent_class]["common_cell_length"],
                                                                   element_cfg_table["event"]["fields_height_pcnt"], true)
                )
            },
            "width" : function(parent_class) {
                return(Math.round(element_cfg_table[parent_class]["operand_cell_length"]
                           * element_cfg_table["event"]["fields_width_pcnt"]/100
                           - 2*element_cfg_table["event"]["fields_border_width"])
                )
            },    
            "height": function(parent_class) {
                return(Math.round(element_cfg_table[parent_class]["common_cell_length"]
                           * element_cfg_table["event"]["fields_height_pcnt"]/100 
                           - 2*element_cfg_table["event"]["fields_border_width"])
                )
            },    
            "border-width": element_cfg_table["event"]["fields_border_width"],      
            "border-radius": function(parent_class) {
                return(Math.round(element_cfg_table[parent_class]["common_cell_length"]
                           * element_cfg_table["event"]["fields_border_radius_pcnt"]/100)
                )
            },
        },
    },
    
    "order_branch": {
        "subobject-1": {
            "style": {
                "background-color": "#990099",           
                "border-color": "transparent"
            },
            "init_dimensions": {
                "left": 0,
                "top": function(parent_class) {
                    return(get_midplacement_offset(element_cfg_table[parent_class]["common_cell_length"],
                                        element_cfg_table["order_branch"]["fields_subobject-1_height_pcnt"], true) 
                    )
                },
                "width" : function(parent_class) { return(branch_stem_width(parent_class)); },
                "height": function(parent_class) {
                    return(Math.round(element_cfg_table[parent_class]["common_cell_length"]
                               * element_cfg_table["order_branch"]["fields_subobject-1_height_pcnt"]/100)
                    )
                },                
            },
        },
        
        "subobject-2": {
            "style": {
                "border-left-color": "#990099",
                "border-top-color": "transparent",
                "border-bottom-color": "transparent",
                "border-left-style": "solid",
                "border-top-style": "solid",
                "border-bottom-style": "solid"
            },
            "init_dimensions": {
                "left": function(parent_class) { return(branch_stem_width(parent_class)); },
                "top": function(parent_class) { 
                    return(get_midplacement_offset(element_cfg_table[parent_class]["common_cell_length"],
                                                                                  2*branch_triangle_length(parent_class), false)
                    )
                },
                
                "width" : 0,    
                "height": 0,
                "border-left-width": function(parent_class) { return(branch_triangle_length(parent_class)); },
                "border-top-width": function(parent_class) { return(branch_triangle_length(parent_class)); },
                "border-bottom-width": function(parent_class) { return(branch_triangle_length(parent_class)); }
            }    
        }
    },

    "exit_event": {
        "style": {
            "background-color": "#C6C6FF",
            
            "border-style": "solid",
            "border-color": "#990033"
        },
        "init_dimensions": {
            "left": 0,
            "top": function(parent_class) {
                return(get_midplacement_offset(element_cfg_table[parent_class]["common_cell_length"],
                                                                  element_cfg_table["event"]["fields_height_pcnt"], true)
                )
            },
            "width" : function(parent_class) {
                return(Math.round(element_cfg_table[parent_class]["operand_cell_length"]
                                * element_cfg_table["event"]["fields_width_pcnt"]/100
                                - 2*element_cfg_table["event"]["fields_border_width"])
                )
            },    
            "height": function(parent_class) {
                return(Math.round(element_cfg_table[parent_class]["common_cell_length"]
                                       * element_cfg_table["event"]["fields_height_pcnt"]/100
                                       - 2*element_cfg_table["event"]["fields_border_width"])
                )
            },    
            "border-width": element_cfg_table["event"]["fields_border_width"],      
            "border-radius": function(parent_class) {
                return(Math.round(element_cfg_table[parent_class]["common_cell_length"]
                            * element_cfg_table["event"]["fields_border_radius_pcnt"]/100)
                )
            },
        },
    },

    "exit_branch": {
        "subobject-1": {
            "style": {
                "background-color": "#990099",           
                "border-color": "transparent"
            },
            "init_dimensions": {
                "left": 0,
                "top": function(parent_class) {
                    return(get_midplacement_offset(element_cfg_table[parent_class]["common_cell_length"],
                                          element_cfg_table["order_branch"]["fields_subobject-1_height_pcnt"], true)
                    )
                },
                "width" : function(parent_class) { return(branch_stem_width(parent_class)); },    
                "height": function(parent_class) { return(
                    Math.round(element_cfg_table[parent_class]["common_cell_length"]
                               * element_cfg_table["order_branch"]["fields_subobject-1_height_pcnt"]/100)
                    )
                },                
            },
        },
        
        "subobject-2": {
            "style": {
                "border-left-color": "#990099",
                "border-top-color": "transparent",
                "border-bottom-color": "transparent",
                "border-left-style": "solid",
                "border-top-style": "solid",
                "border-bottom-style": "solid"
            },
            "init_dimensions": {
                "left": function(parent_class) { return(branch_stem_width(parent_class)); },
                "top": function(parent_class) {
                    return(get_midplacement_offset(element_cfg_table[parent_class]["common_cell_length"],
                                                                    2*branch_triangle_length(parent_class), false)
                    )
                },
                
                "width" : 0,    
                "height": 0,
                "border-left-width": function(parent_class) { return(branch_triangle_length(parent_class)); },
                "border-top-width": function(parent_class) { return(branch_triangle_length(parent_class)); },
                "border-bottom-width": function(parent_class) { return(branch_triangle_length(parent_class)); }
            }    
        }
    },
    
    "exit_branch_target": {
        "style": {
            "background-color": "green",
        },
        "init_dimensions": {
            // common_cell_length - horizontal direction, offset is to the center, 
            // "left" is to the border, therefore, need to adjust by half of width
            "left": element_cfg_table["exit_sequence"]["operator_cell_length"]
                            * element_cfg_table["branch_qualifier"]["left_offset_pcnt"]/100
                            - element_cfg_table["exit_sequence"]["operator_cell_length"] 
                            * element_cfg_table["branch_qualifier"]["fields_width_pcnt"]/100/2,
            "top": element_cfg_table["exit_sequence"]["operator_cell_length"]
                            * element_cfg_table["branch_qualifier"]["top_offset_pcnt"]/100
                            - element_cfg_table["exit_sequence"]["operator_cell_length"] 
                            * element_cfg_table["branch_qualifier"]["fields_width_pcnt"]/100/2,
                    
            "width": element_cfg_table["exit_sequence"]["operator_cell_length"] 
                            * element_cfg_table["branch_qualifier"]["fields_width_pcnt"]/100,
            "height": element_cfg_table["exit_sequence"]["operator_cell_length"]
                            * element_cfg_table["branch_qualifier"]["fields_width_pcnt"]/100,
            
            "border-radius": element_cfg_table["setup_sequence"]["operator_cell_length"]
                            * element_cfg_table["branch_qualifier"]["fields_width_pcnt"]/100/2,
        },
    },

    "exit_branch_stop": {
        "style": {
            "background-color": "red",
        },
        "init_dimensions": {
            // operator_cell_length - horizontal direction, offset is to the center, "left" is to the border, 
            // therefore, need to adjust by half of width
            "left": element_cfg_table["exit_sequence"]["operator_cell_length"]
                        * element_cfg_table["exit_branch_stop"]["left_offset_pcnt"]/100
                        - element_cfg_table["exit_sequence"]["operator_cell_length"] 
                        * element_cfg_table["exit_branch_stop"]["fields_width_pcnt"]/100/2,
            "top": element_cfg_table["exit_sequence"]["operator_cell_length"] 
                        * element_cfg_table["exit_branch_stop"]["top_offset_pcnt"]/100
                        - element_cfg_table["exit_sequence"]["operator_cell_length"]
                        * element_cfg_table["exit_branch_stop"]["fields_width_pcnt"]/100/2,
                    
            "width": element_cfg_table["exit_sequence"]["operator_cell_length"]
                        * element_cfg_table["exit_branch_stop"]["fields_width_pcnt"]/100,
            "height": element_cfg_table["exit_sequence"]["operator_cell_length"]
                        * element_cfg_table["exit_branch_stop"]["fields_width_pcnt"]/100,
            
            "border-radius": element_cfg_table["exit_sequence"]["operator_cell_length"]
                        * element_cfg_table["exit_branch_stop"]["fields_width_pcnt"]/100/2,
        },
    },
        
    "exit_branch_target_condition": {
        "style": {
            "background-color": "#999999",
            
            "border-style": "solid",
            "border-color": "green"
        },
        "init_dimensions": {
            "top": 0,
            "left": 0,
            "width": function(parent_class) {
                return( length_with_border("exit_branch_target_condition", 
                                                          parent_class, "width", "common_cell_length"));
            },
            "height": function(parent_class) {
                return( length_with_border("exit_branch_target_condition",
                                                          parent_class, "height", "operand_cell_length"));
            },
            "border-width": element_cfg_table["exit_branch_target_condition"]["fields_border_width"],      
            "border-radius": function(parent_class) {
                return(get_border_radius("exit_branch_target_condition", parent_class, "common_cell_length"));
            }
        },
    },

    "exit_branch_stop_condition": {
        "style": {
            "background-color": "#999999",
            
            "border-style": "solid",
            "border-color": "red"
        },
        "init_dimensions": {
            "top": 0,
            "left": 0,
            "width": function(parent_class) {
                return( length_with_border("exit_branch_stop_condition",
                                                          parent_class, "width", "common_cell_length"));
            },
            "height": function(parent_class) {
                return(length_with_border("exit_branch_stop_condition",
                                                          parent_class, "height", "operand_cell_length"));
            },
            "border-width": element_cfg_table["exit_branch_stop_condition"]["fields_border_width"],      
            "border-radius": function(parent_class) {
                return(get_border_radius("exit_branch_stop_condition", 
                                                        parent_class, "common_cell_length"));
            }
        },
    },    
}
