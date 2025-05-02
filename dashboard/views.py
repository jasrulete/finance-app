from django.shortcuts import render
from finance.models import Entry, Budget, Category
from django.db.models import Sum
from django.utils.timezone import now
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
import calendar
import json

@never_cache
@login_required
def dashboard_view(request):
    user = request.user
    current_month = now().month
    current_year = now().year

    print(f"\n=== Dashboard Data for {user} (Month: {current_month}/{current_year}) ===")

    # Current month entries
    entries = Entry.objects.filter(user=user, date__year=current_year, date__month=current_month)
    print(f"\nAll entries for this month: {entries.count()} records")

    # Current month totals
    total_income = entries.filter(entry_type='income').aggregate(total=Sum('amount'))['total'] or 0
    total_expenses = entries.filter(entry_type='expense').aggregate(total=Sum('amount'))['total'] or 0
    balance = total_income - total_expenses

    print("\n=== TOTALS ===")
    print(f"Income: {total_income}")
    print(f"Expenses: {total_expenses}")
    print(f"Balance: {balance}")

    # Annual totals for the current year
    year_entries = Entry.objects.filter(user=user, date__year=current_year)
    annual_income = year_entries.filter(entry_type='income').aggregate(total=Sum('amount'))['total'] or 0
    annual_expenses = year_entries.filter(entry_type='expense').aggregate(total=Sum('amount'))['total'] or 0

    print("\n=== ANNUAL TOTALS ===")
    print(f"Annual Income: {annual_income}")
    print(f"Annual Expenses: {annual_expenses}")

    # Expense categories (for current month)
    expense_by_category = entries.filter(entry_type='expense').values('category__name').annotate(total=Sum('amount'))
    print("\n=== EXPENSE CATEGORIES ===")
    for item in expense_by_category:
        print(f"{item['category__name'] or 'Uncategorized'}: {item['total']}")

    # Monthly trends
    try:
        monthly_data = (
            Entry.objects.filter(user=user)
            .values('entry_type', 'date__year', 'date__month')
            .annotate(total=Sum('amount'))
            .order_by('date__year', 'date__month')
        )

        print("\n=== RAW MONTHLY DATA ===")
        for data in monthly_data:
            print(data)

        monthly_income = {}
        monthly_expenses = {}

        for data in monthly_data:
            month_label = f"{calendar.month_abbr[data['date__month']]} {data['date__year']}"
            if data['entry_type'] == 'income':
                monthly_income[month_label] = monthly_income.get(month_label, 0) + float(data['total'])
            else:
                monthly_expenses[month_label] = monthly_expenses.get(month_label, 0) + float(data['total'])

        print("\n=== PROCESSED MONTHLY DATA ===")
        print("Income by month:", monthly_income)
        print("Expenses by month:", monthly_expenses)

        all_months = sorted(set(monthly_income.keys()) | set(monthly_expenses.keys()))
        income_data = [monthly_income.get(month, 0) for month in all_months]
        expense_data = [monthly_expenses.get(month, 0) for month in all_months]

        print("\n=== CHART DATA ===")
        print("All months:", all_months)
        print("Income data:", income_data)
        print("Expense data:", expense_data)

    except Exception as e:
        print(f"\n!!! Error processing monthly data: {e}")
        all_months = []
        income_data = []
        expense_data = []
    
    # --------- BUDGET USAGE CALCULATION (NEW CODE) ----------
    try:
        # Try to get user's budget
        budget = Budget.objects.get(user=user)
        
        # Calculate spending by category for budget comparison
        category_spending = {}
        budget_usage = {}
        
        # Define mapping between category names and budget model fields
        category_mapping = {
            'Bills': 'bills',
            'Grocery': 'grocery', 
            'Food': 'food',
            'Health': 'health',
            'Eating Out': 'eatingout',
            'Transportation': 'transportation',
            'Gifts': 'gifts'
        }
        
        # Initialize all categories with zero spending
        for display_name, field_name in category_mapping.items():
            category_spending[field_name] = 0
        
        # Get current month expenses by category
        current_month_expenses = entries.filter(entry_type='expense')
        
        # Sum up expenses for each category
        for category_name, field_name in category_mapping.items():
            # Look up expenses for this category
            category_expenses = current_month_expenses.filter(
                category__name=category_name
            )
            
            if category_expenses.exists():
                total_spent = category_expenses.aggregate(total=Sum('amount'))['total'] or 0
                category_spending[field_name] = float(total_spent)
        
        print("\n=== BUDGET USAGE ===")
        
        # Calculate usage percentage for each category
        for category_name, field_name in category_mapping.items():
            spent = category_spending[field_name]
            budget_amount = getattr(budget, field_name, 0)
            
            # Calculate percentage, ensuring we don't divide by zero
            if budget_amount and budget_amount > 0:
                percentage = min(int((spent / float(budget_amount)) * 100), 100)
            else:
                percentage = 0
                
            # Store the percentage
            js_field_name = field_name.replace('_', '-')
            budget_usage[js_field_name] = percentage
            
            print(f"{category_name}: Spent ${spent} of ${budget_amount} ({percentage}%)")
        
        # Calculate overall average percentage
        if budget_usage:
            overall_percentage = sum(budget_usage.values()) // len(budget_usage)
            budget_usage['overall'] = overall_percentage
            print(f"Overall budget usage: {overall_percentage}%")
        else:
            budget_usage['overall'] = 0
            
    except Budget.DoesNotExist:
        print("\n!!! No budget found for user")
        budget = None
        category_spending = {}
        budget_usage = {'overall': 0}
    except Exception as e:
        print(f"\n!!! Error calculating budget usage: {e}")
        budget = None
        category_spending = {}
        budget_usage = {'overall': 0}
    # --------- END OF NEW CODE ----------

    context = {
        'total_income': total_income,
        'total_expenses': total_expenses,
        'balance': balance,
        'annual_income': annual_income,
        'annual_expenses': annual_expenses,
        'current_year': current_year,
        'categories': json.dumps([item['category__name'] or 'Uncategorized' for item in expense_by_category]),
        'amounts': json.dumps([float(item['total']) for item in expense_by_category]),
        'months': json.dumps(all_months),
        'monthly_income': json.dumps(income_data),
        'monthly_expenses': json.dumps(expense_data),
        # New context variables for budget usage
        'budget': budget,
        'category_spending': category_spending,
        'budget_usage': budget_usage,
    }

    print("\n=== FINAL CONTEXT ===")
    for key, value in context.items():
        if key in ['categories', 'amounts', 'months', 'monthly_income', 'monthly_expenses']:
            print(f"{key}: (JSON data - length {len(value)})")
        else:
            print(f"{key}: {value}")

    return render(request, 'dashboard/dashboard.html', context)
