import time
import sys

sys.set_int_max_str_digits(10_000_000)


def fast_pow_mod(x, n, m):
    result = 1
    x = x % m
    while n > 0:
        if n & 1:
            result = (result * x) % m
        x = (x * x) % m
        n >>= 1
    return result


x = 2
n = 10**8
m = 10**9 + 7

print("=" * 60)
print(f"2^{n} mod {m}")
print("=" * 60)

try:
    start = time.perf_counter()
    huge = x**n
    print(f"Создание числа: {time.perf_counter() - start:.2f} сек")
    print(f"Длина числа: {len(str(huge))} цифр")

    start = time.perf_counter()
    result = huge % m
    print(result)
    print(f"Взятие модуля: {time.perf_counter() - start:.2f} сек")

except Exception as e:
    print(f"Ошибка: {e} - число слишком большое для памяти")


start = time.perf_counter()
result = fast_pow_mod(x, n, m)
fast_time = time.perf_counter() - start
print(f"\nНаш метод: {fast_time:.2f} сек")
print(f"Результат: {result}")
