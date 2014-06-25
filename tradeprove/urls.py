from django.conf.urls import patterns, include, url

from tradeprove import views

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    
    url(r'^$', views.index, name='index'),
    url(r'^accounts/login/$', 'django.contrib.auth.views.login'),
    url(r'^accounts/', include('accounts.urls')),   
    
    url(r'^specify/', include('specify.urls')), 
    url(r'^analyze/', include('analyzer.urls')),    
)
