from django.shortcuts import render
from finance.models import Entry
from django.db.models import Sum
from django.utils.timezone import now
from django.contrib.auth.decorators import login_required
import calendar
import json

@login_required
def dashboard_view(request):
    user = request.user
    current_month = now().month
    current_year = now().year

    # entries for the current month and year
    entries = Entry.objects.filter(user=user, date__year=current_year, date__month=current_month)

    total_income = entries.filter(entry_type='income').aggregate(total=Sum('amount'))['total'] or 0
    total_expenses = entries.filter(entry_type='expense').aggregate(total=Sum('amount'))['total'] or 0
    balance = total_income - total_expenses

    # pie chart test
    expense_by_category = entries.filter(entry_type='expense').values('category__name').annotate(total=Sum('amount'))
    categories = [item['category__name'] or 'Uncategorized' for item in expense_by_category]
    amounts = [float(item['total']) for item in expense_by_category]

    try:
        monthly_data = (
            Entry.objects.filter(user=user)
            .values('entry_type', 'date__year', 'date__month')
            .annotate(total=Sum('amount'))
            .order_by('date__year', 'date__month')
        )

        monthly_income = {}
        monthly_expenses = {}

        for data in monthly_data:
            month_label = f"{calendar.month_abbr[data['date__month']]} {data['date__year']}"
            if data['entry_type'] == 'income':
                monthly_income[month_label] = monthly_income.get(month_label, 0) + float(data['total'])
            else:
                monthly_expenses[month_label] = monthly_expenses.get(month_label, 0) + float(data['total'])

        all_months = sorted(set(monthly_income.keys()) | set(monthly_expenses.keys()))
        income_data = [monthly_income.get(month, 0) for month in all_months]
        expense_data = [monthly_expenses.get(month, 0) for month in all_months]
    except Exception as e:
        print(f"Error processing monthly data: {e}")
        all_months = []
        income_data = []
        expense_data = []

    context = {
        'total_income': total_income,
        'total_expenses': total_expenses,
        'balance': balance,
        'categories': json.dumps(categories),
        'amounts': json.dumps(amounts),
        'months': json.dumps(all_months),
        'monthly_income': json.dumps(income_data),
        'monthly_expenses': json.dumps(expense_data),
    }

    return render(request, 'dashboard/dashboard.html', context)