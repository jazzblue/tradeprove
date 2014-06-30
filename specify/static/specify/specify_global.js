/****************************************************************
*
* File name:     .js
*
* Description:
* Constants and global variables for Specify application web client.
*
*
* Dependencies:
*  - none
****************************************************************/

// Constants
var
    FORMULA_CLASS_NAME = "formula",
	FIELDS_CLASS_NAME = "fields",
	CTRL_PANEL_CLASS_NAME = "ctrl_panel",
	FORM_ID_NAME = "form",
	FORM_RENUM_ID_NAME = "renum",
	ELEMENT_ID_SEPARATOR = "__",
	ELEMENT_ID_NUM_SEPARATOR = "-",
	FORM_ID_CLASS_SEPARATOR = "___",
	FORM_ID_CLASS_PREFIX = "form" + FORM_ID_CLASS_SEPARATOR,
	SAMPLE_FORM_ID = "sample",
	BACKREFERENCE_CLASS_NAME = "backreference",
	REF_INDEX_CLASS_NAME = "ref_index",
	MAX_FORMULA_ELEMENTS = 7,
    
// Global variables

    // Contains all the element forms
    APP_FORMS_CONTAINER, 

    // Django formset where all forms are copied into right before submission
	FORMSET_SUBMIT,

    // Django formset management form
	MANAGEMENT_FORM,
    
    // Dialog for presenting group management form
    GROUP_DIALOG = $("<div/>"),
    
    // Dialog invoked by clicking on fields 
    // for presenting element management form
    FIELDS_DIALOG = $("<div/>");
   

    
    

