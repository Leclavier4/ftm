#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, hashlib, base64, unicodedata

OUT = "public/labs"
os.makedirs(OUT, exist_ok=True)
SALT = b"ftm-academy-v1"

def norm(s):
    s = s.strip().lower()
    s = "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")
    return " ".join(s.split())

def kdf(a): return hashlib.sha256(SALT + norm(a).encode()).digest()
def xor(d, k): return bytes(b ^ k[i % len(k)] for i, b in enumerate(d))

# (id, monde, titre, rappel de tâche, question, réponse, flag)
LABS = [
 ("l0-1","La Forge","Réveille la bête","Tu dois avoir installé VirtualBox depuis le site officiel.","Nom (un seul mot) du logiciel de virtualisation que tu viens d'installer :","virtualbox","FTM{virtualbox_pret_au_combat}"),
 ("l0-2","La Forge","Invoque Kali","Ta VM Kali doit demarrer et tu dois pouvoir t'y connecter.","Dans un terminal Kali, tape `whoami`. Quel est le resultat ?","kali","FTM{kali_vit_et_respire}"),
 ("l0-3","La Forge","Le premier snapshot","Tu dois avoir pris une sauvegarde de l'etat de ta VM.","Comment appelle-t-on cette sauvegarde d'etat (un mot, anglais) ?","snapshot","FTM{retour_vers_le_futur}"),
 ("l1-1","Le Terminal","Bonjour terminal","Tu dois savoir te reperer : pwd, ls, cd.","Tape `whoami` dans Kali. Resultat ?","kali","FTM{je_sais_ou_je_suis}"),
 ("l1-2","Le Terminal","Chasse au fichier","Tu as cache le mot 'sesame' dans note13.txt puis retrouve avec grep.","Quel etait le mot secret cache dans note13.txt ?","sesame","FTM{grep_le_maitre_mot}"),
 ("l1-3","Le Terminal","Les cles du royaume","Tu dois savoir rendre un fichier executable avec chmod.","Quelle option de chmod rend un fichier executable ? (ex: +?)","+x","FTM{rwx_sous_controle}"),
 ("l1-4","Le Terminal","Qui es-tu ?","Tu dois comprendre root et sudo.","Quel compte possede tous les pouvoirs sous Linux ? (un mot)","root","FTM{root_avec_grand_respect}"),
 ("l1-5","Le Terminal","Les fantomes actifs","Tu dois savoir lister et arreter un processus.","Quelle commande arrete un processus via son PID ? (un mot)","kill","FTM{jai_dompte_les_process}"),
 ("l2-1","L'Atelier","Installe l'etabli","Tu dois avoir installe VSCode sur Kali.","Quelle commande, tapee dans le terminal, lance VSCode ? (un mot)","code","FTM{vscode_en_place}"),
 ("l2-2","L'Atelier","Ton premier script","Tu dois avoir ecrit et lance un script bash.","Quelle est la premiere ligne (le shebang) d'un script bash ?","#!/bin/bash","FTM{bash_ne_me_fait_plus_peur}"),
 ("l2-3","L'Atelier","Python entre en scene","Tu dois avoir execute un script Python.","Quelle commande lance le script hello.py en Python 3 ?","python3 hello.py","FTM{python_repond_present}"),
 ("l3-1","Les Cables","Ping le monde","Tu dois avoir trouve ton IP et teste la connectivite.","Quelle commande teste la connectivite (echo request) ? (un mot)","ping","FTM{jai_trouve_mon_ip}"),
 ("l3-2","Les Cables","Les portes du chateau","Tu dois avoir scanne les ports de TA machine.","Quel outil scanne les ports d'une machine ? (un mot)","nmap","FTM{les_ports_nont_plus_de_secret}"),
 ("l3-3","Les Cables","L'annuaire secret","Tu dois avoir resolu un nom de domaine en IP.","Le DNS traduit un nom de domaine en quoi ? (deux lettres)","ip","FTM{dns_lannuaire_du_net}"),
 ("l4-1","Le Coffre","Base64 demasque","Decode la chaine Base64 donnee dans le lab.","Colle ici le TEXTE obtenu apres decodage Base64 :","FTM{base64_ce_nest_pas_du_chiffrement}","FTM{base64_ce_nest_pas_du_chiffrement}"),
 ("l4-2","Le Coffre","L'empreinte","Tu dois comprendre qu'un hash est a sens unique.","Un hash se dechiffre-t-il ? (oui / non)","non","FTM{un_hash_ca_ne_se_dechiffre_pas}"),
 ("l4-3","Le Coffre","Le Cesar","Dechiffre le message ROT13 du lab.","Colle ici le message DECHIFFRE (ROT13) :","FTM{cesar_na_qua_bien_se_tenir}","FTM{cesar_na_qua_bien_se_tenir}"),
 ("l5-1","La Toile","Anatomie d'une requete","Tu dois savoir lire les codes de statut HTTP.","Quel code HTTP signifie 'page introuvable' ?","404","FTM{http_je_te_lis_a_livre_ouvert}"),
 ("l5-2","La Toile","La porte derobee","Sur TA machine, tu as observe une injection SQL, et sa parade.","Pour bloquer une injection SQL, on utilise des requetes ______ (un mot) :","preparees","FTM{injection_sur_ma_propre_machine}"),
 ("l5-3","La Toile","Le miroir piege","Tu dois comprendre le XSS (sur lab local).","Quel langage, injecte dans une page, s'execute dans le navigateur ? (un mot)","javascript","FTM{le_javascript_qui_trahit}"),
 ("l5-4","La Toile","La cle sous le paillasson","Tu dois comprendre l'IDOR.","Dans un IDOR, on modifie l'____ dans l'URL (deux lettres) :","id","FTM{jai_ose_changer_lurl}"),
 ("l6-1","L'Enquete","Ce que l'image cache","Tu as revele un texte cache avec strings.","Quelle commande extrait le texte lisible d'un binaire ? (un mot)","strings","FTM{strings_revele_les_secrets}"),
 ("l6-2","L'Enquete","Sur les traces","Tu dois savoir lire des journaux.","Comment appelle-t-on les journaux d'evenements ? (un mot, anglais)","logs","FTM{les_logs_racontent_tout}"),
 ("l6-3","L'Enquete","L'oeil ouvert","OSINT = enquete a partir d'informations publiques, dans le respect de la loi.","L'OSINT s'appuie sur des informations ______ (un mot) :","publiques","FTM{osint_sans_franchir_la_ligne}"),
 ("l7-1","L'Arene","Le rituel","La 1re etape, avant tout, c'est l'enumeration.","Quelle est la 1re etape du rituel, avant d'exploiter ? (un mot)","enumerer","FTM{enumerer_avant_dexploiter}"),
 ("l7-2","L'Arene","Prends des notes","Documente tout, au fur et a mesure.","Complete : si ce n'est pas ______, ca n'existe pas (un mot).","note","FTM{si_ce_nest_pas_note_ca_nexiste_pas}"),
 ("l7-3","L'Arene","Le rapport","Un test sans rapport ne sert a rien.","Quel document restitue un test de securite ? (un mot)","rapport","FTM{un_bon_rapport_vaut_un_bon_hack}"),
 ("lg-1","Le Pantheon","L'epreuve finale","Resous une box debutant de bout en bout.","Cite une plateforme d'entrainement sur des box (un mot) :","tryhackme","FTM{bienvenue_au_pantheon}"),
 ("lg-2","Le Pantheon","Le serment","Le vrai niveau God est moral : proteger, jamais nuire.","Le serment : tu utiliseras tes competences pour ______ (un mot) :","proteger","FTM{un_grand_pouvoir_de_grandes_responsabilites}"),
]

TPL = r'''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# FTM ACADEMY // {world} // {title}
# Fais d'abord la tache du lab, PUIS : python3 {fname}
import hashlib, base64, unicodedata
SALT=b"ftm-academy-v1"; CT="{ct}"; CHK="{chk}"
BRIEF={brief!r}; QUESTION={question!r}
def norm(s):
    s=s.strip().lower(); s="".join(c for c in unicodedata.normalize("NFD",s) if unicodedata.category(c)!="Mn")
    return " ".join(s.split())
def _x(d,k): return bytes(b^k[i%len(k)] for i,b in enumerate(d))
def main():
    print("\n  \033[96m{world}\033[0m // \033[1m{title}\033[0m\n")
    print("  "+BRIEF+"\n")
    ans=input("  \033[93m>\033[0m "+QUESTION+"\n  \033[93m$\033[0m ")
    key=hashlib.sha256(SALT+norm(ans).encode()).digest()
    try: flag=_x(base64.b64decode(CT),key).decode()
    except Exception: flag=""
    if flag.startswith("FTM{{") and hashlib.sha256(flag.encode()).hexdigest()[:8]==CHK:
        print("\n  \033[92m[+] Acces accorde. Ton flag :\033[0m\n  \033[1m\033[92m"+flag+"\033[0m")
        print("\n  Colle-le dans FTM Academy pour ton XP. GG !\n")
    else:
        print("\n  \033[91m[-] Pas encore. Refais la tache, observe le resultat, puis reessaie.\033[0m\n")
if __name__=="__main__": main()
'''

key_lines = ["# Corrige FTM Academy (NE PAS deployer)\n","| id | reponse .py | flag |","|---|---|---|"]
for (lid, world, title, brief, question, answer, flag) in LABS:
    k = kdf(answer)
    ct = base64.b64encode(xor(flag.encode(), k)).decode()
    chk = hashlib.sha256(flag.encode()).hexdigest()[:8]
    fname = lid + ".py"
    open(os.path.join(OUT, fname), "w").write(
        TPL.format(world=world, title=title, fname=fname, ct=ct, chk=chk, brief=brief, question=question))
    key_lines.append("| {} | `{}` | `{}` |".format(lid, answer, flag))
open("ANSWER_KEY.md", "w").write("\n".join(key_lines) + "\n")
print("OK - 29 labs generes dans public/labs + ANSWER_KEY.md")
