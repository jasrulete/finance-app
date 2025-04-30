from django import forms
from .models import Entry, Category

class EntryForm(forms.ModelForm):
    class Meta:
        model = Entry
        fields = ['title', 'amount', 'date', 'entry_type', 'category', 'notes']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'entry_type': forms.Select(attrs={'class': 'form-control'}),
            'category': forms.Select(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)

        if user:
            Category.create_default_categories(user)  # Make sure defaults exist

            # Default: all user + default categories
            qs = Category.objects.filter(user=user) | Category.objects.filter(is_default=True)

            # If entry_type is selected via form POST or GET
            entry_type = (
                self.data.get('entry_type') or 
                getattr(self.instance, 'entry_type', None)
            )
            if entry_type in dict(Entry.ENTRY_TYPE_CHOICES):
                qs = qs.filter(category_type=entry_type)

            self.fields['category'].queryset = qs.order_by('name')
        else:
            # Safe fallback if no user is passed
            self.fields['category'].queryset = Category.objects.none()
