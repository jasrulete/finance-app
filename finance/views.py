from django.shortcuts import render, redirect, get_object_or_404
from .models import Entry
from .forms import EntryForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache

@never_cache
@login_required
def entry_list(request):
    entries = Entry.objects.filter(user=request.user)
    return render(request, 'finance/entry_list.html', {'entries': entries})

@never_cache
@login_required
def entry_create(request):
    if request.method == 'POST':
        form = EntryForm(request.POST, user=request.user)
        if form.is_valid():
            entry = form.save(commit=False)
            entry.user = request.user
            entry.save()
            return redirect('finance:entry-list')
    else:
        form = EntryForm()
    return render(request, 'finance/entry_form.html', {'form': form})

@never_cache
@login_required
def entry_update(request, pk):
    entry = get_object_or_404(Entry, pk=pk, user=request.user)
    if request.method == 'POST':
        form = EntryForm(request.POST, instance=entry, user=request.user)
        if form.is_valid():
            form.save()
            return redirect('finance:entry-list')
    else:
        form = EntryForm(instance=entry)
    return render(request, 'finance/entry_form.html', {'form': form})

@never_cache
@login_required
def entry_delete(request, pk):
    entry = get_object_or_404(Entry, pk=pk, user=request.user)
    if request.method == 'POST':
        entry.delete()
        return redirect('finance:entry-list')
    return render(request, 'finance/entry_confirm_delete.html', {'entry': entry})
