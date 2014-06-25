from django.db import models
from django.contrib.auth.models import User


class IndicatorType(models.Model):
    """Stores a indicator type."""
    
    indicator_type = models.CharField(max_length=10)

    def __unicode__(self):
        return self.indicator_type
        
    
class Indicator(models.Model):
    """
    Stores a definition of an indicator, related to :model:`specify.IndicatorType` and 
    :model:`auth.User`.
    
    """
    # Indicator can be either basic or not (user defined)
    # Non-basic properties can be seen only by the user who defined them.
    # Basic properties can be seen by all users.
    user = models.ForeignKey(User, blank=True, null=True) 
    name = models.CharField(max_length=50)
    basic = models.BooleanField()
    type = models.ForeignKey(IndicatorType) 
    
    def __unicode__(self):
        return self.name

        
class IndicatorOperator(models.Model):
    """
    Stores an operator that can be applied to LHS and RHS expression of the Condition,
    related to :model:`specify.IndicatorType`.
    
    """
    operator = models.CharField(max_length=10)
    type = models.ForeignKey(IndicatorType)    

    def __unicode__(self):
        return self.operator

        
class ElementOperator(models.Model):
    """
    Stores a single Element Operator that can be applied to Cell elements ,
    related to :model:`specify.IndicatorType`.
    
    """
    operator = models.CharField(max_length=10)
    
    def __unicode__(self):
        return self.operator
    

class Instrument(models.Model):
    """Stores a financial instrument information."""
    ticker = models.CharField(max_length=20)

    def __unicode__(self):
        return self.ticker

        
class Rule(models.Model):
    """Stores a trading rule,  related to :model:`specify.Instrument` and :model:`auth.User`."""
    user = models.ForeignKey(User)
    rule_title = models.CharField(max_length=50, blank=True)
    primary_instrument = models.ForeignKey(Instrument)    
        
    def __unicode__(self):
        return self.operator


class Setup(models.Model):
    """Stores a Setup sequence for Rule,  related to :model:`specify.Rule`."""
    rule = models.OneToOneField(Rule, primary_key=True)
    setup_title = models.CharField(max_length=50, blank=True)
#    properties = models.ManyToManyField(Indicator, through='Condition')
    
    def save(self, *args, **kwargs):
        """
        Saves Setup entry, sets setup_title field to be corresponding Rule title 
        with the added prefix `setup_`.
        
        """
        self.setup_title = "setup_" + self.rule.rule_title
        super(Setup, self).save(*args, **kwargs)
        
        
class ElementAttr(models.Model):
    """Common base class for all element models. Defines group attributes and element ID. """
    
    # Grouping is equivalent to applying parenthesis to a sequence of elements, such that the level of parenthesis is 
    # the level of grouping.
    # group_open and group_close are mutually exclusive: the parenthesis can be either opening or closing or none, 
    # but not both at the same time.
    group_open = models.BooleanField(default = False)
    group_close = models.BooleanField(default = False)
    
    # Highest group level on the cell not counting 'group-self', value 0 means no groups on the cell except 'group-self'
    group_high = models.IntegerField(default = 0)
    
    # Lowest level of group-open or group-close (group-end), value 0 means that all levels are group-mid.
    group_end_level = models.IntegerField(default = 0)
    
    element_id = models.CharField(max_length=200, default="sample")

    class Meta:
        abstract = True

    
class Event(ElementAttr):
    """Stores a single Event with its attributes, related to :model:`specify.Setup`."""
    
    setup = models.ForeignKey(Setup)
    title = models.CharField(max_length=50, blank=True)
    ref_index = models.IntegerField()       # index by which this element can be referenced by other elements

    
class Branch(ElementAttr):
    """Stores a single Branch with its attributes, related to :model:`specify.Setup`."""
    
    setup = models.ForeignKey(Setup)
    branch_metric_min = models.CharField(max_length=2)    
    branch_metric_max = models.CharField(max_length=2)    

    
class Condition(ElementAttr):
    """Stores a single Condition with its attributes, related to :model:`specify.Setup`."""

    setup = models.ForeignKey(Setup)
    title = models.CharField(max_length=50, blank=True)
    invert = models.BooleanField()
    
    # Left hand side expression.
    expression_lhs = models.ForeignKey(Indicator, related_name='cond_expression_lhs')
    
    # Right hand side expression.
    expression_rhs = models.ForeignKey(Indicator, related_name='cond_expression_rhs')
    
    indicator_operator = models.ForeignKey(IndicatorOperator)
    
    WEEK_DAY_CHOICES = [(str(n), d) for n, d in enumerate(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])]
        
    value_real = models.DecimalField(max_digits=10, decimal_places=2)

    value_weekday = models.CharField(
        max_length=3,
        choices=WEEK_DAY_CHOICES,
        default='1'  # Monday
    )
    
    MAX_BACKREFERENCE_CHOICE = 30
    BACKREFERENCE_CHOICES = [(str(x), str(x)) for x in range(1, MAX_BACKREFERENCE_CHOICE + 1)]
    
    backreference = models.CharField(
        max_length=2,
        choices=BACKREFERENCE_CHOICES,
        default=str(MAX_BACKREFERENCE_CHOICE)
    )

    
class CondOper(ElementAttr):
    """
    Stores a single Condition Operator with its attributes, related to :model:`specify.Setup` and
    :model:`specify.ElementOperator`.
    
    """
    setup = models.ForeignKey(Setup)
    operator = models.ForeignKey(ElementOperator)
#    invert = models.BooleanField()
    
class EntryEvent(ElementAttr):
    setup = models.ForeignKey(Setup)
#    user = models.ForeignKey(User, blank=True, null=True)
#    element_id = models.CharField(max_length=200, default="sample_event")
                                      
    title = models.CharField(max_length=50, blank=True)
    ref_index = models.IntegerField()    

#class PrimarySecuritySet(models.Model):
#    rule = models.OneToOneField(Rule, primary_key=True)
#    security_set = models.ForeignKey(SecuritySet)   #OneToOne???
    
#class SecuritySet(models.Model):
#    name = models.CharField(max_length=50, blank=True)
#    security = models.ForeignKey(Security)
        
        
#class PrimarySecurity(models.Model):
#    rule = models.OneToOneField(Rule, primary_key=True)
#    ticker = models.ForeignKey(Security)   #OneToOne???        

    #--------- Experiment 

class TradeTime(models.Model):
    trade_time = models.DateTimeField('Time')    
    ticker = models.CharField('Ticker', max_length=10)
    
    
    
    
    