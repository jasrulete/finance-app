from django.urls import path
from .views import *

app_name = 'finance'

urlpatterns = [
    # path('', entry_list, name='entry-list'), # Commented out to avoid circular import issues
    path('', transaction, name='entry-list'),
    path('add/', entry_create, name='entry-create'),
    path('edit/<int:pk>/', entry_update, name='entry-update'),
    path('delete/<int:pk>/', entry_delete, name='entry-delete'),
    path('get-categories/', get_filtered_categories, name='get-categories'),
    path('export/', export_entries, name='entry-export'),
]