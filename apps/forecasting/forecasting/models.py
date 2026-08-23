from django.db import models


class Product(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    sku = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    tenant_id = models.CharField(max_length=255, db_column='tenantId')

    class Meta:
        managed = False
        db_table = 'Product'


class SalesOrder(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    customer_name = models.CharField(max_length=255, db_column='customerName')
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(db_column='createdAt')
    tenant_id = models.CharField(max_length=255, db_column='tenantId')

    class Meta:
        managed = False
        db_table = 'SalesOrder'


class SalesOrderLine(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    quantity = models.IntegerField()
    due_date = models.DateTimeField(db_column='dueDate')
    sales_order = models.ForeignKey(SalesOrder, on_delete=models.DO_NOTHING, db_column='salesOrderId')
    product = models.ForeignKey(Product, on_delete=models.DO_NOTHING, db_column='productId')

    class Meta:
        managed = False
        db_table = 'SalesOrderLine'