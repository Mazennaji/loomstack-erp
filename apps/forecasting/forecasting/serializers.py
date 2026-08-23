from rest_framework import serializers


class ForecastRequestSerializer(serializers.Serializer):
    tenant_id = serializers.CharField()
    product_id = serializers.CharField()
    periods_weeks = serializers.IntegerField(default=8, min_value=1, max_value=52)
    method = serializers.ChoiceField(
        choices=['prophet', 'moving_average', 'linear_trend', 'gradient_boosting'],
        default='prophet',
    )

class AnomalyRequestSerializer(serializers.Serializer):
    tenant_id = serializers.CharField()
    product_id = serializers.CharField(required=False, allow_blank=True)