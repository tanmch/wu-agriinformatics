from Crypto.Util.number import *

FLAG = '?????????????????????'

m = bytes_to_long(FLAG.encode())
e = 65537
n = getRandomNBitInteger(286)

c = pow(m,e,n)

if __name__ == '__main__':
    print(f'c = ', c)
    print(f'e = ', e)
    print(f'n = ', n)    