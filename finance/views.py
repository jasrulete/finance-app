from django.shortcuts import render, redirect, get_object_or_404
from .models import Entry, Category
from .forms import EntryForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from django.core.paginator import Paginator

#!-- Commented out to avoid circular import issues --!#
# @never_cache 
# @login_required
# def entry_list(request):
#     entries = Entry.objects.filter(user=request.user)
#     return render(request, 'finance/entry_list.html', {'entries': entries})

def paginate_entries(entries, request, page_param):
    paginator = Paginator(entries, 5)
    page_number = request.GET.get(page_param)
    try:
        return paginator.get_page(page_number)
    except Exception:
        return paginator.get_page(1)

@never_cache
@login_required
def transaction(request):
    income_entries = Entry.objects.filter(user=request.user, entry_type='income').order_by('-date')
    expense_entries = Entry.objects.filter(user=request.user, entry_type='expense').order_by('-date')

    income_page = paginate_entries(income_entries, request, 'income_page')
    expense_page = paginate_entries(expense_entries, request, 'expense_page')

    return render(request, 'finance/transaction.html', {
        'income_page': income_page,
        'expense_page': expense_page,
    })

@never_cache
@login_required
def entry_create(request):
    Category.create_default_categories(request.user)

    if request.method == 'POST':
        form = EntryForm(request.POST, user=request.user)
        if form.is_valid():
            entry = form.save(commit=False)
            entry.user = request.user
            entry.save()
            return redirect('finance:entry-list')
    else:
        form = EntryForm(user=request.user)
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
        form = EntryForm(instance=entry, user=request.user)
    return render(request, 'finance/entry_form.html', {'form': form})

@never_cache
@login_required
def entry_delete(request, pk):
    entry = get_object_or_404(Entry, pk=pk, user=request.user)
    if request.method == 'POST':
        entry.delete()
        return redirect('finance:entry-list')
    return render(request, 'finance/entry_confirm_delete.html', {'entry': entry})
