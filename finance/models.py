from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class Category(models.Model):
    EXPENSE_CATEGORIES = [
        ('grocery', 'Grocery'),
        ('health', 'Health'),
        ('gifts', 'Gifts'),
        ('transportation', 'Transportation'),
        ('food', 'Food'),
        ('eating_out', 'Eating Out'),
        ('bills', 'Bills'),
    ]

    INCOME_CATEGORIES = [
        ('salary', 'Salary'),
        ('bonus', 'Bonus'),
        ('business', 'Business'),
    ]

    CATEGORY_TYPES = [
        ('expense', 'Expense'),
        ('income', 'Income'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    category_type = models.CharField(max_length=7, choices=CATEGORY_TYPES)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    @classmethod
    def create_default_categories(cls, user):
        # create default expense categories
        for code, name in cls.EXPENSE_CATEGORIES:
            cls.objects.get_or_create(
                name=name,
                category_type='expense',
                is_default=True,
                defaults={'user': user}
            )

        # create default income categories
        for code, name in cls.INCOME_CATEGORIES:
            cls.objects.get_or_create(
                name=name,
                category_type='income',
                is_default=True,
                defaults={'user': user}
            )

class Entry(models.Model):
    ENTRY_TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    entry_type = models.CharField(max_length=7, choices=ENTRY_TYPE_CHOICES)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} - {self.entry_type} - {self.amount}"

    def type_display(self):
        return dict(self.ENTRY_TYPE_CHOICES).get(self.entry_type, self.entry_type)