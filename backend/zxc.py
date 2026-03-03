def mult_pol(a: list, b: list, base: list):
    # 11001 x 00010 = x^4 + x3 + 1 mult x
    for i in range(len(a)):
        for j in range(len(b)):
            pass


def shift(a: str, base: str):
    """
    Выполняет один шаг сдвига регистра для деления в GF(2)
    a: текущее состояние регистра (строка битов)
    base: образующий многочлен (строка битов)

    Возвращает новое состояние регистра после сдвига
    """
    # Преобразуем строки в целые числа
    reg = int(a, 2)
    poly = int(base, 2)
    len_reg = len(a)

    # Проверяем старший бит
    if reg & (1 << (len_reg - 1)):
        # Сдвигаем влево и отбрасываем старший бит
        reg = ((reg << 1) & ((1 << len_reg) - 1)) ^ poly
    else:
        # Просто сдвигаем
        reg = (reg << 1) & ((1 << len_reg) - 1)

    # Преобразуем обратно в строку нужной длины
    return bin(reg)[2:].zfill(len_reg)


a = "1110"
b = "1111"

print(shift(a, "1101"))
