from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from .forms import SignUpForm
from django.views.decorators.csrf import csrf_protect

def signup_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')
    else:
        form = SignUpForm()
    return render(request, 'accounts/signup.html', {'form': form})

@csrf_protect
def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        if username and password:
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('dashboard')
            else:
                return render(request, 'accounts/login.html', {'error': 'Invalid credentials'})
        else:
            return render(request, 'accounts/login.html', {'error': 'Both fields are required'})
    return render(request, 'accounts/login.html')

def logout_view(request):
    logout(request)
    return redirect('login')
