from django.shortcuts import render, redirect, get_object_or_404
from .models import Entry, Category
from .forms import EntryForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.db.models import Q
from datetime import datetime
import csv

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

@require_GET
@login_required
def get_filtered_categories(request):
    entry_type = request.GET.get('entry_type')
    if entry_type not in dict(Entry.ENTRY_TYPE_CHOICES):
        return JsonResponse({'categories': []})

    categories = Category.objects.filter(
        Q(user=request.user) | Q(is_default=True),
        category_type=entry_type
    ).order_by('name')

    data = [{'id': cat.id, 'name': cat.name} for cat in categories]
    return JsonResponse({'categories': data})

@never_cache
@login_required
def export_entries(request):
    if request.method == "POST":
        filename = request.POST.get("filename", f"export_{datetime.now().strftime('%Y%m%d')}")
        entry_type = request.POST.get("entry_type")
        category_id = request.POST.get("category")
        start_date = request.POST.get("start_date")
        end_date = request.POST.get("end_date")

        # ✅ Early check: end date cannot be before start date
        if start_date and end_date and end_date < start_date:
            categories = Category.objects.filter(user=request.user) | Category.objects.filter(is_default=True)
            return render(request, "finance/export.html", {
                "categories": categories,
                "error": "End date cannot be earlier than start date."
            })

        entries = Entry.objects.filter(user=request.user)

        if entry_type in ['income', 'expense']:
            entries = entries.filter(entry_type=entry_type)

        if category_id:
            entries = entries.filter(category_id=category_id)

        if start_date:
            entries = entries.filter(date__gte=start_date)
        if end_date:
            entries = entries.filter(date__lte=end_date)

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="{filename}.csv"'

        writer = csv.writer(response)
        writer.writerow(["Title", "Type", "Category", "Date", "Amount", "Notes"])
        for entry in entries:
            writer.writerow([
                entry.title,
                entry.entry_type,
                entry.category.name if entry.category else "",
                entry.date,
                entry.amount,
                entry.notes or ""
            ])

        return response

    categories = Category.objects.filter(user=request.user) | Category.objects.filter(is_default=True)
    return render(request, "finance/export.html", {"categories": categories})

@never_cache
@login_required
def expenses_page(request):
    return render(request, 'finance/expenses.html')