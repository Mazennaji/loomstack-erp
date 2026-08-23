from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import ForecastRequestSerializer
from .services import forecast_demand


@api_view(['POST'])
def forecast_view(request):
    serializer = ForecastRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    result = forecast_demand(
        tenant_id=data['tenant_id'],
        product_id=data['product_id'],
        periods_weeks=data['periods_weeks'],
        method=data['method'],
    )

    return Response(result, status=status.HTTP_200_OK)