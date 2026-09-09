// Examen final FTM Academy — QCM abordable couvrant les 9 modules.
export const PASS = 11;        // score minimum sur TOTAL pour réussir
export const TOTAL = 15;

export const EXAM = [
  { id:"q1",  module:"Le Terminal", q:"Quelle commande affiche le dossier courant ?",
    options:["ls","cd","pwd","whoami"], answer:2,
    explain:"pwd (print working directory) affiche où tu te trouves." },
  { id:"q2",  module:"Le Terminal", q:"Quelle commande rend un script exécutable ?",
    options:["chmod +x script.sh","chmod -r script.sh","run script.sh","exec script.sh"], answer:0,
    explain:"chmod +x ajoute le droit d'exécution." },
  { id:"q3",  module:"Le Terminal", q:"Sous Linux, le compte tout-puissant s'appelle :",
    options:["admin","root","superuser","master"], answer:1,
    explain:"root est le super-administrateur." },
  { id:"q4",  module:"La Forge", q:"À quoi sert VirtualBox ?",
    options:["Éditer du code","Créer des machines virtuelles","Scanner des ports","Chiffrer des fichiers"], answer:1,
    explain:"VirtualBox fait tourner une VM isolée : ton laboratoire." },
  { id:"q5",  module:"L'Atelier", q:"Quelle est la première ligne (shebang) d'un script bash ?",
    options:["#!/bin/bash","//bash","<bash>","import bash"], answer:0,
    explain:"Le shebang #!/bin/bash indique l'interpréteur." },
  { id:"q6",  module:"Les Câbles", q:"Quel outil scanne les ports d'une machine ?",
    options:["ping","dig","nmap","grep"], answer:2,
    explain:"nmap découvre les ports ouverts et les services." },
  { id:"q7",  module:"Les Câbles", q:"Le DNS traduit un nom de domaine en :",
    options:["mot de passe","adresse IP","numéro de port","empreinte"], answer:1,
    explain:"Le DNS est l'annuaire : nom → adresse IP." },
  { id:"q8",  module:"Le Coffre", q:"Le Base64 est :",
    options:["du chiffrement","du hachage","de l'encodage","de la compression"], answer:2,
    explain:"Encoder n'est pas chiffrer : le Base64 se décode sans clé." },
  { id:"q9",  module:"Le Coffre", q:"Peut-on « déchiffrer » un hash SHA-256 ?",
    options:["Oui, facilement","Non, c'est à sens unique","Oui avec la clé","Seulement en Base64"], answer:1,
    explain:"Un hash est irréversible ; on ne peut que tester des candidats." },
  { id:"q10", module:"La Toile", q:"Quelle parade neutralise les injections SQL ?",
    options:["Les requêtes préparées","Le HTTPS","Les cookies","Le captcha"], answer:0,
    explain:"Les requêtes préparées séparent le code des données." },
  { id:"q11", module:"La Toile", q:"Un code HTTP 404 signifie :",
    options:["OK","Interdit","Page introuvable","Erreur serveur"], answer:2,
    explain:"404 = ressource introuvable." },
  { id:"q12", module:"La Toile", q:"Une attaque XSS injecte :",
    options:["du SQL","du JavaScript dans une page","un virus USB","un port ouvert"], answer:1,
    explain:"Le XSS exécute du JavaScript non filtré dans le navigateur." },
  { id:"q13", module:"L'Enquête", q:"Quelle commande révèle le texte lisible d'un binaire ?",
    options:["cat","strings","chmod","nmap"], answer:1,
    explain:"strings extrait les chaînes lisibles — réflexe forensics/stégano." },
  { id:"q14", module:"L'Arène", q:"Quelle est la 1re étape de la méthode, avant d'exploiter ?",
    options:["Exploiter vite","Énumérer","Rédiger le rapport","Redémarrer"], answer:1,
    explain:"On énumère (tout observer) avant tout." },
  { id:"q15", module:"Le Panthéon", q:"La règle d'or : on ne teste jamais un système…",
    options:["le week-end","sans autorisation","en HTTP","sans VPN"], answer:1,
    explain:"Sans autorisation écrite, c'est illégal. Toujours dans TON labo." },
];

// Mélange (Fisher-Yates) pour varier l'ordre à chaque tentative.
export function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
