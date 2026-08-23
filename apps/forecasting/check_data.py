import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'forecasting_service.settings')
django.setup()

from django.db.models import Count, Sum, Min, Max
from forecasting.models import Product, SalesOrder, SalesOrderLine


def main():
    products = Product.objects.count()
    orders = SalesOrder.objects.count()
    lines = SalesOrderLine.objects.count()

    print('=== DATA INVENTORY ===')
    print(f'Products:          {products}')
    print(f'Sales orders:      {orders}')
    print(f'Sales order lines: {lines}')

    if lines == 0:
        print('\nNo sales history. ML models need data — seed synthetic data first.')
        return

    span = SalesOrderLine.objects.aggregate(first=Min('due_date'), last=Max('due_date'))
    print(f'\nDate range: {span["first"]} -> {span["last"]}')

    print('\n=== LINES PER PRODUCT (top 10) ===')
    per_product = (
        SalesOrderLine.objects
        .values('product__sku', 'product__name')
        .annotate(n=Count('id'), total=Sum('quantity'))
        .order_by('-n')[:10]
    )
    for row in per_product:
        print(f'  {row["product__sku"]:<12} {row["n"]:>4} lines  {row["total"]:>6} units  {row["product__name"]}')

    print('\n=== READINESS ===')
    forecastable = (
        SalesOrderLine.objects
        .values('product_id')
        .annotate(n=Count('id'))
        .filter(n__gte=8)
        .count()
    )
    print(f'Products with >=8 order lines (min for a weak forecast): {forecastable}')
    print(f'Products with >=30 lines (decent for classical ML):      '
          f'{SalesOrderLine.objects.values("product_id").annotate(n=Count("id")).filter(n__gte=30).count()}')
    print(f'Products with >=100 lines (min to attempt DL):           '
          f'{SalesOrderLine.objects.values("product_id").annotate(n=Count("id")).filter(n__gte=100).count()}')


if __name__ == '__main__':
    main()