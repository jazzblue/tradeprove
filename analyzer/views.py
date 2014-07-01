from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required

from django.contrib.auth import logout

@login_required
def index(request):
	logout(request)
	return render_to_response('analyzer/index.html', context_instance=RequestContext(request))
