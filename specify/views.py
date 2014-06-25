from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponse

from django.views.generic.base import TemplateView

from django.contrib.auth.decorators import login_required

from django.forms.models import inlineformset_factory

from django.contrib.auth.models import User

from specify.models import Event, Branch, Condition, CondOper, EntryEvent, Rule, Setup, Indicator
from specify.forms import EventForm, BranchForm, ConditionFormFactory, CondOperForm, EntryEventForm, RuleForm
from django.views.generic import TemplateView

import json


@login_required
def index(request):
    """Renders main page for Specify application."""

    # Parameters: maximal amount of forms for each element type
    MAX_FORMS_EVENT = 10
    MAX_FORMS_BRANCH = 10
    MAX_FORMS_CONDITION = 10 
    MAX_FORMS_CONDOPER = 10
    MAX_FORMS_ENTRY_EVENT = 10

    # Getting current user
    user = User.objects.get(username=request.user.username)
        
    # Formset factory for each element type
    EventFormSet = inlineformset_factory(Setup, Event, form=EventForm,
                                                                  extra=MAX_FORMS_EVENT-Event.objects.count())
                                                            
    BranchFormSet = inlineformset_factory(Setup, Branch, form=BranchForm, 
                                                               extra=MAX_FORMS_BRANCH-Branch.objects.count())
                                                               
    ConditionForm = ConditionFormFactory(user=user)
    ConditionFormSet = inlineformset_factory(Setup, Condition, form=ConditionForm, 
                                                                 extra=MAX_FORMS_CONDITION-Condition.objects.count())

    CondOperFormSet = inlineformset_factory(Setup, CondOper, form=CondOperForm, 
                                                                     extra=MAX_FORMS_CONDOPER-CondOper.objects.count())
                                                                     
    EntryEventFormSet = inlineformset_factory(Setup, EntryEvent, form=EntryEventForm,
                                                                     extra=MAX_FORMS_ENTRY_EVENT-EntryEvent.objects.count())
    
    if request.method == "POST":
                    
        rule_form = RuleForm(request.POST)
        
        if rule_form.is_valid():
        
            # Get rule form from client
            saved_rule = rule_form.save(commit=False)
            
            try:
                # Fetch Rule instance from database by rule_id
                rule = Rule.objects.get(pk=request.POST.get('rule_id'))                 
            except Rule.DoesNotExist:    # This is a new rule
                rule = Rule()   # Create new rule
            
            # Transfer rule attributes from form to instance
            rule.rule_title = saved_rule.rule_title
            rule.user = user
            rule.primary_instrument = saved_rule.primary_instrument
        
            try:
                # Fetch Setup instance from database by rule
                setup = Setup.objects.get(rule=rule)
            except Setup.DoesNotExist:    # This is a new setup and new rule (there is no rule without setup)
                # Create new setup and rule
                setup = Setup()
                setup.rule = rule
             
            # Fetching formset from client for each element type 
            event_formset = EventFormSet(request.POST, instance=setup, prefix='event_set')
            branch_formset = BranchFormSet(request.POST, instance=setup, prefix='branch_set')
            condition_formset = ConditionFormSet(request.POST, instance=setup, prefix='condition_set')
            cond_oper_formset = CondOperFormSet(request.POST, instance=setup, prefix='condoper_set')
            entry_event_formset = EntryEventFormSet(request.POST, instance=setup, prefix='entry_event_set')
                                
            if event_formset.is_valid() \
                and branch_formset.is_valid() \
                and condition_formset.is_valid() \
                and cond_oper_formset.is_valid() \
                and entry_event_formset.is_valid():
        
                rule.save()
                setup.save()
                event_formset.save()
                branch_formset.save()            
                condition_formset.save()
                cond_oper_formset.save()
                entry_event_formset.save()
        
        else:
            print rule_form.errors   # For debug purposes

    # Rendering elements on page
    try:
    
        # Retrieving latest updated rule
        rule = Rule.objects.filter(user=user).latest("id")
        
        setup = Setup.objects.get(rule=rule)
        
        rule_form = RuleForm(instance=rule)
                        
        event_formset = EventFormSet(instance=setup, prefix='event_set')    
        branch_formset = BranchFormSet(instance=setup, prefix='branch_set')
        condition_formset = ConditionFormSet(instance=setup, prefix='condition_set')
        
        cond_oper_formset = CondOperFormSet(instance=setup, prefix='condoper_set')
        entry_event_formset = EventFormSet(instance=setup, prefix='entry_event_set')    
        
    except Rule.DoesNotExist:   # new rule
    
        # Create rule, setup and all element formsets
        rule_form = RuleForm()
                        
        event_formset = EventFormSet(prefix='event_set')    
        branch_formset = BranchFormSet(prefix='branch_set')
        condition_formset = ConditionFormSet(prefix='condition_set')    
        
        cond_oper_formset = CondOperFormSet(prefix='condoper_set')
        entry_event_formset = EntryEventFormSet(prefix='entry_event_set')    
                
                            
    render_objects = {
        "rule_form" : rule_form,        
        "event_formset": event_formset,
        "branch_formset": branch_formset,
        "condition_formset": condition_formset,            
        "cond_oper_formset": cond_oper_formset,            
        "entry_event_formset": entry_event_formset,
    }
    
    try:
        if rule.id is not None:
            render_objects.update({"rule_id" : rule.id})
    except NameError:   # For debug purposes
        pass
        

    return render_to_response(
        "specify/index.html",
        render_objects,
        context_instance=RequestContext(request)
    )
    

def get_exp_rhs(request, expression_lhs_id):
    """
    Receives LHS expression id from  the Condition form and returns a dictionary of compatible choices 
    for an AJAX call, in order for the front-end to construct the RHS expression dropdown menu.
    
    """
        
    lhs_indicator_type = Indicator.objects.get(pk=expression_lhs_id).type
    
    # Getting indicators compatible by type to the LHS
    indicators_rhs = Indicator.objects.filter(type=lhs_indicator_type)
    
    # Constructing a dictionaty
    indicator_dict = {}
    for indicator in indicators_rhs:
        indicator_dict[indicator.id] = indicator.name
        
    return HttpResponse(json.dumps(indicator_dict), content_type="application/json")
    
    
class ProtectView(TemplateView):
    """This is for Git version to allow code demo, but not the app demo to protect the IP. """

    template_name = "specify/protect.html"   
