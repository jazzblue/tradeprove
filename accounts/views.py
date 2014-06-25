from django.shortcuts import render

# Create your views here.
from django.shortcuts import render_to_response
from django.template import RequestContext

from django.contrib.auth import authenticate
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


def render_form(form_func, template, request):
    form = form_func()
    return render_to_response(
        template,
        {'form': form,},
        context_instance=RequestContext(request))    


def register(request):

    if request.method =='POST':
        reg_form = UserCreationForm(request.POST)
        if reg_form.is_valid():
            user = User.objects.create_user(reg_form.cleaned_data['username'], None, reg_form.cleaned_data['password1'])
            user.save()
            # CHECKIF SUCH USER EXISTS ????
            user = authenticate(username=reg_form.cleaned_data['username'], password=reg_form.cleaned_data['password1'])
            
            return render_to_response('tradeprove/index.html') # Redirect after POST
        else:
            return render_form(UserCreationForm, "accounts/register.html", request)
    else:
        return render_form(UserCreationForm, "accounts/register.html", request)