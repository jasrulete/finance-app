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
            Category.create_default_categories(user)

            # filter categories based on entry type if it's set
            if 'entry_type' in self.data:
                entry_type = self.data.get('entry_type')
                self.fields['category'].queryset = Category.objects.filter(
                    user=user,
                    category_type=entry_type
                )
            elif self.instance and self.instance.entry_type:
                self.fields['category'].queryset = Category.objects.filter(
                    user=user,
                    category_type=self.instance.entry_type
                )
            else:
                self.fields['category'].queryset = Category.objects.filter(user=user)