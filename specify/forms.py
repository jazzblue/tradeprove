from django.forms import ModelForm, TextInput, CheckboxInput, Select, HiddenInput, ModelChoiceField
from specify.models import ElementAttr, Event, Branch, Condition, CondOper, EntryEvent, Rule, Indicator, Instrument
from django.db.models import Q


class RuleForm(ModelForm):
    """Form for rule specification."""

    # Get all instruments from database for the drop-down menu
    primary_instrument = ModelChoiceField(
        queryset=Instrument.objects.all(),
        widget=Select(attrs={'class': 'primary_instrument'})
    )

    def __init__(self, *args, **kwargs): 
        super(RuleForm, self).__init__(*args, **kwargs)
        self.css_class = 'rule'

    class Meta:
        model = Rule
        fields = ('user', 'rule_title', 'primary_instrument')
        exclude = ('user',)
        widgets = {
            'rule_title': TextInput(attrs={'class': 'rule_title'}),
            'primary_instrument': Select(attrs={'class': 'primary_instrument'}),
        }
        labels = {
            'rule_title': 'Trading Rule', 
            'primary_instrument':'Primary Instrument'
        }
        
    
class ElementAttrForm(ModelForm):
    """Common base class for all element forms."""

    class Meta:
        model = ElementAttr
        fields = ('group_open', 'group_close', 'group_high', 'group_end_level', 'element_id')
        widgets = {            
            'group_open': HiddenInput(attrs={'class': 'group_open'}),
            'group_close': HiddenInput(attrs={'class': 'group_close'}),
            'group_high': HiddenInput(attrs={'class': 'group_high'}),
            'group_end_level': HiddenInput(attrs={'class': 'group_end_level'}),
            'element_id': HiddenInput(attrs={'class': 'element_id'})
        }
        

class EventForm(ElementAttrForm):
    def __init__(self, *args, **kwargs):
        super(EventForm, self).__init__(*args, **kwargs)
        self.css_class = 'event'

    class Meta(ElementAttrForm.Meta):
        model = Event
        fields = ElementAttrForm.Meta.fields + ('setup', 'title', 'ref_index')
        widgets = ElementAttrForm.Meta.widgets.copy()
        widgets.update({
            'title': TextInput(attrs={'class': 'title'}),
            'ref_index': HiddenInput(attrs={'class': 'ref_index'}),
        })


class BranchForm(ElementAttrForm):

    def __init__(self, *args, **kwargs):
        super(BranchForm, self).__init__(*args, **kwargs)
        self.css_class = 'branch'

    class Meta(ElementAttrForm.Meta):
        model = Branch
        fields = ElementAttrForm.Meta.fields + ('setup', 'branch_metric_min', 'branch_metric_max')
        widgets = ElementAttrForm.Meta.widgets.copy()
        widgets.update({
            'branch_metric_min': TextInput(attrs={'class': 'title'}),
            'branch_metric_max': TextInput(attrs={'class': 'title'})
        })

        
def ConditionFormFactory(user=None):
    """Returns class ConditionForm based on user variable."""

    # LHS expression can be any basic indicator or user defined indicator,
    # but cannot be value
    expression_lhs_query_set = Indicator.objects.filter(
        Q(basic=True) | Q(user=user)
    ).exclude(type__indicator_type='value')
    
    
    class ConditionForm(ElementAttrForm):

        expression_lhs = ModelChoiceField(
            queryset = expression_lhs_query_set,
            widget = Select(attrs={'class': 'expression_lhs'})
        )
        
        def __init__(self, *args, **kwargs): 
            super(ConditionForm, self).__init__(*args, **kwargs)
            self.css_class = 'condition'

        class Meta(ElementAttrForm.Meta):
            model = Condition
            fields = ElementAttrForm.Meta.fields + (
                'setup', 'title', 'invert', 'expression_lhs', 'expression_rhs',
                'indicator_operator', 'value_real', 'value_weekday', 'backreference'
            )
            widgets = ElementAttrForm.Meta.widgets.copy()
            widgets.update({
                'title': TextInput(attrs={'class': 'title'}),
                'invert': CheckboxInput(attrs={'class': 'invert'}),
                'expression_rhs': Select(attrs={'class': 'expression_rhs'}),
                'indicator_operator':  Select(attrs={'class': 'indicator_operator'}),
                'value_real': TextInput(attrs={'class': 'value_real'}),
                'value_weekday':  Select(attrs={'class': 'value_weekday'}),
                'backreference': Select(attrs={'class': 'backreference'})
            })
            
    return ConditionForm


class CondOperForm(ElementAttrForm):

    def __init__(self, *args, **kwargs): 
        super(CondOperForm, self).__init__(*args, **kwargs)
        self.css_class = 'condition_operator'

    class Meta(ElementAttrForm.Meta):
        model = CondOper
        fields = ElementAttrForm.Meta.fields + ('setup', 'operator')
        widgets = ElementAttrForm.Meta.widgets.copy()
        widgets.update({
            'operator': Select(attrs={'class': 'indicator_operator'})
        })
        
        
class EntryEventForm(ElementAttrForm):

    def __init__(self, *args, **kwargs):
        super(EntryEventForm, self).__init__(*args, **kwargs)
        self.css_class = 'entry_event'

    class Meta(ElementAttrForm.Meta):
        model = EntryEvent
        fields = ElementAttrForm.Meta.fields + ('setup', 'title', 'ref_index')
        widgets = ElementAttrForm.Meta.widgets.copy()
        widgets.update({
            'title': TextInput(attrs={'class': 'title'}),
            'ref_index': HiddenInput(attrs={'class': 'ref_index'}),
        })
