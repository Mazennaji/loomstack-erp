from django.urls import path
from .views import forecast_view, anomaly_view

urlpatterns = [
    path('forecast/', forecast_view, name='forecast'),
    path('anomalies/', anomaly_view, name='anomalies'),
]