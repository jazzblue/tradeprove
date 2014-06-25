from django.shortcuts import render

from django.shortcuts import render_to_response
from django.template import RequestContext

from django.contrib.auth import authenticate
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


def render_form(form_factory, template, request):
    """Renders form created using specified form_factory on specified template."""

    form = form_factory()
    return render_to_response(
        template,
        {'form': form,},
        context_instance=RequestContext(request))    


def register(request):
    """Registers new user."""

    if request.method =='POST':
        reg_form = UserCreationForm(request.POST)
        if reg_form.is_valid():
            user = User.objects.create_user(reg_form.cleaned_data['username'], None, reg_form.cleaned_data['password1'])
            user.save()
            
            user = authenticate(username=reg_form.cleaned_data['username'], password=reg_form.cleaned_data['password1'])
            
            return render_to_response('tradeprove/index.html') # Redirect after POST
        else:
            return render_form(UserCreationForm, "accounts/register.html", request)
    else:
        return render_form(UserCreationForm, "accounts/register.html", request)