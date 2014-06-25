from django.contrib import admin

# Register your models here.
from specify.models import IndicatorType
from specify.models import Indicator
from specify.models import IndicatorOperator
from specify.models import ElementOperator
from specify.models import Instrument
from specify.models import Rule
from specify.models import Setup
from specify.models import Event
from specify.models import Branch
from specify.models import Condition
from specify.models import CondOper
from specify.models import EntryEvent

admin.site.register(IndicatorType)
admin.site.register(Indicator)
admin.site.register(IndicatorOperator)
admin.site.register(ElementOperator)
admin.site.register(Instrument)
admin.site.register(Rule)
admin.site.register(Setup)
admin.site.register(Event)
admin.site.register(Branch)
admin.site.register(Condition)
admin.site.register(CondOper)
admin.site.register(EntryEvent)













