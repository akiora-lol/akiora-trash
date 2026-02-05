from enum import Enum


class GameMode(str, Enum):
    NORMAL = "normal"
    ARAM = "aram"
    SOLOQ = "soloq"
    FLEXQ = "flexq"
    ARENA = "arena"


class Rank(str, Enum):
    IRON = "iron"
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"
    EMERALD = "emerald"
    DIAMOND = "diamond"
    MASTER = "master"
    GRANDMASTER = "grandmaster"
    CHALLENGER = "challenger"


class Role(str, Enum):
    TOP = "top"
    JUNGLE = "jungle"
    MID = "mid"
    ADC = "adc"
    SUPPORT = "support"


class Server(str, Enum):
    RU = "ru"
    EUW = "euw"
    EUNE = "eune"
    TR = "tr"
    JP = "jp"
    MENA = "mena"
    NA = "na"
    OCE = "oce"
    KR = "kr"
    TW = "tw"
    BR = "br"
    LAN = "lan"
    LAS = "las"
