from statistics import mean


def moving_average(y_values, periods):
    if not y_values:
        return [0] * periods
    window = y_values[-3:] if len(y_values) >= 3 else y_values
    avg = mean(window)
    return [max(0, round(avg))] * periods


def linear_trend(y_values, periods):
    n = len(y_values)
    if n == 0:
        return [0] * periods
    if n == 1:
        return [max(0, round(y_values[0]))] * periods
    xs = list(range(n))
    x_mean = mean(xs)
    y_mean = mean(y_values)
    denom = sum((x - x_mean) ** 2 for x in xs)
    if denom == 0:
        return [max(0, round(y_mean))] * periods
    slope = sum((xs[i] - x_mean) * (y_values[i] - y_mean) for i in range(n)) / denom
    intercept = y_mean - slope * x_mean
    return [max(0, round(intercept + slope * (n + k))) for k in range(periods)]


SIMPLE_FORECASTERS = {
    'moving_average': moving_average,
    'linear_trend': linear_trend,
}