#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# FTM ACADEMY // Le Terminal // Qui es-tu ?
# Fais d'abord la tache du lab, PUIS : python3 l1-4.py
import hashlib, base64, unicodedata
SALT=b"ftm-academy-v1"; CT="1POq+4kdhXoM749QB6fK3CxwbCJ4CqZI67MvGQ=="; CHK="9d39337c"
BRIEF='Tu dois comprendre root et sudo.'; QUESTION='Quel compte possede tous les pouvoirs sous Linux ? (un mot)'
def norm(s):
    s=s.strip().lower(); s="".join(c for c in unicodedata.normalize("NFD",s) if unicodedata.category(c)!="Mn")
    return " ".join(s.split())
def _x(d,k): return bytes(b^k[i%len(k)] for i,b in enumerate(d))
def main():
    print("\n  \033[96mLe Terminal\033[0m // \033[1mQui es-tu ?\033[0m\n")
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
