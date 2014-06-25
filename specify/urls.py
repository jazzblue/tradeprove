from django.conf.urls import patterns, url

from specify.views import index, get_exp_rhs, ProtectView
#from specify.views import TradeView


urlpatterns = patterns('',
    url(r'^$', index, name='index'),
    url(r'^get_exp_rhs/(?P<expression_lhs_id>\d+)/$', get_exp_rhs, name='get_exp_rhs'),
    (r'^protect/', ProtectView.as_view()),
#	url(r'^trade/', TradeView.as_view(), name='trade'),
)
