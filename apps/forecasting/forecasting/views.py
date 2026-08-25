from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import ForecastRequestSerializer
from .services import forecast_demand
from .ml.anomaly import detect_demand_anomalies, detect_all_products
from .serializers import AnomalyRequestSerializer
from .ml.maintenance import predict_machine, predict_all
from .serializers import MaintenanceRequestSerializer


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


@api_view(['POST'])
def anomaly_view(request):
    serializer = AnomalyRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    if data.get('product_id'):
        result = detect_demand_anomalies(data['tenant_id'], data['product_id'])
    else:
        result = detect_all_products(data['tenant_id'])

    return Response(result, status=status.HTTP_200_OK)



@api_view(['POST'])
def maintenance_view(request):
    serializer = MaintenanceRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    if data.get('machine_id'):
        result = predict_machine(data['tenant_id'], data['machine_id'])
    else:
        result = predict_all(data['tenant_id'])

    return Response(result, status=status.HTTP_200_OK)