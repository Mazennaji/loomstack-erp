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
        

class Machine(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255)
    status = models.CharField(max_length=50)
    maintenance_interval_hours = models.IntegerField(db_column='maintenanceIntervalHours')
    tenant_id = models.CharField(max_length=255, db_column='tenantId')

    class Meta:
        managed = False
        db_table = 'Machine'


class MachineUsage(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    date = models.DateTimeField()
    hours_run = models.FloatField(db_column='hoursRun')
    cycles = models.IntegerField()
    machine_id = models.CharField(max_length=255, db_column='machineId')
    tenant_id = models.CharField(max_length=255, db_column='tenantId')

    class Meta:
        managed = False
        db_table = 'MachineUsage'


class MaintenanceEvent(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    type = models.CharField(max_length=50)
    date = models.DateTimeField()
    hours_at_service = models.FloatField(db_column='hoursAtService')
    notes = models.TextField(null=True)
    machine_id = models.CharField(max_length=255, db_column='machineId')
    tenant_id = models.CharField(max_length=255, db_column='tenantId')

    class Meta:
        managed = False
        db_table = 'MaintenanceEvent'