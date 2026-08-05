#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# FTM ACADEMY // L'Enquete // Sur les traces
# Fais d'abord la tache du lab, PUIS : python3 l6-2.py
import hashlib, base64, unicodedata
SALT=b"ftm-academy-v1"; CT="mCjtuGMNWmnl1HYN7Uzqen2ojJmjPm/5vlwORA=="; CHK="5fc34918"
BRIEF='Tu dois savoir lire des journaux.'; QUESTION="Comment appelle-t-on les journaux d'evenements ? (un mot, anglais)"
def norm(s):
    s=s.strip().lower(); s="".join(c for c in unicodedata.normalize("NFD",s) if unicodedata.category(c)!="Mn")
    return " ".join(s.split())
def _x(d,k): return bytes(b^k[i%len(k)] for i,b in enumerate(d))
def main():
    print("\n  \033[96mL'Enquete\033[0m // \033[1mSur les traces\033[0m\n")
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
