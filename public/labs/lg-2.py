#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# FTM ACADEMY // Le Pantheon // Le serment
# Fais d'abord la tache du lab, PUIS : python3 lg-2.py
import hashlib, base64, unicodedata
SALT=b"ftm-academy-v1"; CT="4Ib+8uC+05I4Wh6rm5y+u+sRif2AhUxTV3zbu7b3jMTUt8D5+r7/lChSHKawiaKz"; CHK="1c2067e5"
BRIEF='Le vrai niveau God est moral : proteger, jamais nuire.'; QUESTION='Le serment : tu utiliseras tes competences pour ______ (un mot) :'
def norm(s):
    s=s.strip().lower(); s="".join(c for c in unicodedata.normalize("NFD",s) if unicodedata.category(c)!="Mn")
    return " ".join(s.split())
def _x(d,k): return bytes(b^k[i%len(k)] for i,b in enumerate(d))
def main():
    print("\n  \033[96mLe Pantheon\033[0m // \033[1mLe serment\033[0m\n")
    print("  "+BRIEF+"\n")
    ans=input("  \033[93m>\033[0m "+QUESTION+"\n  \033[93m$\033[0m ")
    key=hashlib.sha256(SALT+norm(ans).encode()).digest()
    try: flag=_x(base64.b64decode(CT),key).decode()
    except Exception: flag=""
    if flag.startswith("FTM{") and hashlib.sha256(flag.encode()).hexdigest()[:8]==CHK:
        print("\n  \033[92m[+] Acces accorde. Ton flag :\033[0m\n  \033[1m\033[92m"+flag+"\033[0m")
        print("\n  Colle-le dans FTM Academy pour ton XP. GG !\n")
    else:
        print("\n  \033[91m[-] Pas encore. Refais la tache, observe le resultat, puis reessaie.\033[0m\n")
if __name__=="__main__": main()
