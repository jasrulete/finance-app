from django.shortcuts import render, redirect, get_object_or_404
from .models import Entry, Category, Budget
from .forms import EntryForm, BudgetForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from django.core.paginator import Paginator
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_GET
from django.db.models import Q
from datetime import datetime, timedelta
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

@require_GET
@login_required
def check_budget_exists(request):
    try:
        budget = Budget.objects.get(user=request.user)
        return JsonResponse({
            'exists': True,
            'budget_id': budget.id,
            'month': budget.month.strftime('%Y-%m')
        })
    except Budget.DoesNotExist:
        return JsonResponse({'exists': False})
    
@never_cache
@login_required
def create_budget(request):
    if request.method == 'POST':
        form = BudgetForm(request.POST)
        if form.is_valid():
            budget = form.save(commit=False)
            budget.user = request.user
            budget.month = datetime.now().date()
            budget.save()
            return JsonResponse({
                'success': True,
                'budget': {
                    'bills': float(budget.bills),
                    'grocery': float(budget.grocery),
                    'food': float(budget.food),
                    'health': float(budget.health),
                    'eating-out': float(budget.eatingout),
                    'transportation': float(budget.transportation),
                    'gifts': float(budget.gifts),
                }
            })
        return JsonResponse({
            'success': False,
            'errors': form.errors
        }, status=400)
    else:
        form = BudgetForm()
        return render(request, 'dashboard/edit_budget_form.html', {'form': form})

@never_cache
@login_required
def edit_budget(request, budget_id):
    budget = get_object_or_404(Budget, id=budget_id, user=request.user)

    if request.method == 'POST':
        form = BudgetForm(request.POST, instance=budget)
        if form.is_valid():
            form.save()
            return JsonResponse({
                'success': True,
                'budget' : {
                    'bills': float(budget.bills),
                    'grocery': float(budget.grocery),
                    'food': float(budget.food),
                    'health': float(budget.health),
                    'eating-out': float(budget.eatingout),
                    'transportation': float(budget.transportation),
                    'gifts': float(budget.gifts),
                },
            })
        else:
            return JsonResponse({
                'success': False, 
                'errors': form.errors
            }, status=400)

    else:  # GET request
        form = BudgetForm(instance=budget)
        return render(request, 'dashboard/edit_budget_form.html', {'form': form})

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

        # Validate dates
        if start_date and end_date and end_date < start_date:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'error': 'End date cannot be earlier than start date.'})
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

        # Handle AJAX preview request
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            entries_data = []
            totals = {
                'income': 0,
                'expense': 0
            }
            
            for entry in entries.order_by('-date'):
                entry_data = {
                    'title': entry.title,
                    'entry_type': entry.get_entry_type_display(),
                    'category': entry.category.name if entry.category else None,
                    'date': entry.date.strftime('%Y-%m-%d'),
                    'amount': float(entry.amount),
                    'notes': entry.notes
                }
                entries_data.append(entry_data)
                
                if entry.entry_type == 'income':
                    totals['income'] += float(entry.amount)
                else:
                    totals['expense'] += float(entry.amount)
            
            return JsonResponse({
                'entries': entries_data,
                'totals': totals
            })

        # Handle regular CSV export
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="{filename}.csv"'

        writer = csv.writer(response)
        writer.writerow(["Title", "Type", "Category", "Date", "Amount", "Notes"])
        for entry in entries:
            writer.writerow([
                entry.title,
                entry.get_entry_type_display(),
                entry.category.name if entry.category else "",
                entry.date,
                entry.amount,
                entry.notes or ""
            ])

        return response

    # Set default dates (last 30 days)
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=30)
    
    categories = Category.objects.filter(user=request.user) | Category.objects.filter(is_default=True)
    return render(request, "finance/export.html", {
        "categories": categories,
        "start_date": start_date,
        "end_date": end_date,
        "current_date": datetime.now()
    })

@never_cache
@login_required
def expenses_page(request):
    return render(request, 'finance/expenses.html')