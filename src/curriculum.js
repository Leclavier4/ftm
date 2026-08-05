// FTM Academy — contenu du jeu
// Tous les flags sont vérifiés par hachage (cyrb53) : ils ne sont jamais en clair ici.

function cyrb53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507); h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507); h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export function checkFlag(input, hash) {
  if (typeof input !== 'string') return false;
  return cyrb53(input.trim()) === hash;
}

export const RANKS = [
  { name: 'Bleu', emoji: '🫧', note: "Tu débarques. Tout commence ici, dans La Forge.", minPercent: 0 },
  { name: 'Curieux', emoji: '🔍', note: "Tu poses des questions. C'est le premier réflexe du hacker.", minPercent: 0.04 },
  { name: 'Explorateur', emoji: '🧭', note: "Tu commences à te repérer dans le terminal.", minPercent: 0.11 },
  { name: 'Bidouilleur', emoji: '🔧', note: "Tu écris tes premiers scripts, tu casses (un peu) des choses.", minPercent: 0.19 },
  { name: 'Apprenti', emoji: '🌱', note: "Les bases sont posées, la suite va plus vite.", minPercent: 0.28 },
  { name: 'Opérateur', emoji: '🎛️', note: "Le réseau et le chiffrement n'ont plus de secret élémentaire pour toi.", minPercent: 0.37 },
  { name: 'Analyste', emoji: '📊', note: "Tu commences à lire entre les lignes — logs, requêtes, code.", minPercent: 0.47 },
  { name: 'Chasseur', emoji: '🏹', note: "Tu traques les indices avec méthode.", minPercent: 0.58 },
  { name: 'Briseur', emoji: '⚡', note: "Tu comprends comment les systèmes cassent — pour mieux les protéger.", minPercent: 0.70 },
  { name: 'Maître', emoji: '🥋', note: "Ta méthode est solide, ton rapport aussi.", minPercent: 0.82 },
  { name: 'Légende', emoji: '🌟', note: "Il ne reste que le Panthéon.", minPercent: 0.92 },
  { name: 'God', emoji: '👑', note: "100% du parcours. Grand pouvoir, grandes responsabilités.", minPercent: 1 },
]

export const WORLDS = [
  {
    id: 'w0', name: 'La Forge', tagline: 'Installe ta machine de guerre', emoji: '🔨', accent: '#8B7CF0',
    intro: "Avant de hacker quoi que ce soit, il te faut un labo. Un endroit sûr, isolé, à toi, où tu peux tout casser sans jamais risquer ta vraie machine ni celle de quelqu'un d'autre. C'est ce qu'on construit ici : ta machine virtuelle Kali Linux.",
    labs: [
      {
        id: 'l0-1', title: 'Réveille la bête', tagline: 'Installe VirtualBox', xp: 50, est: '15 min', download: '/labs/l0-1.py',
        intro: "VirtualBox est un logiciel de virtualisation : il te permet de faire tourner un ordinateur complet (le \"invité\") à l'intérieur du tien (\"l'hôte\"), sans rien installer directement sur ta machine. En cybersécurité, c'est l'outil de base : ça te donne un labo jetable, isolable, que tu peux casser et recréer à volonté.",
        objectives: [
          "Comprendre ce qu'est une machine virtuelle et pourquoi on l'utilise en cybersécurité",
          "Télécharger et installer VirtualBox sur ta machine",
          "Lancer VirtualBox et vérifier qu'il s'ouvre correctement",
        ],
        steps: [
          "Rends-toi sur virtualbox.org et télécharge la version correspondant à ton système (Windows / Mac / Linux).",
          "Installe le logiciel en suivant l'assistant — les options par défaut conviennent très bien pour débuter.",
          "Lance VirtualBox : tu dois voir la fenêtre « Oracle VM VirtualBox Manager », vide, prête à accueillir ta première VM.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "Si l'installation bloque sur Windows, vérifie que la virtualisation (VT-x/AMD-V) est activée dans le BIOS/UEFI.",
          "Sur Mac Apple Silicon (M1/M2/M3), utilise plutôt la version ARM de VirtualBox ou une alternative comme UTM.",
          "Pas besoin de créer de VM tout de suite pour ce lab : on valide juste que le logiciel est bien installé.",
        ],
        flagHash: '1quu41wpke6',
        success: "Ta machine de guerre est prête. Direction Kali !",
      },
      {
        id: 'l0-2', title: 'Invoque Kali', tagline: 'Installe Kali Linux dans VirtualBox', xp: 50, est: '20 min', download: '/labs/l0-2.py',
        intro: "Kali Linux est une distribution Linux pensée pour la cybersécurité : elle embarque des centaines d'outils déjà installés (scanners, analyseurs, craqueurs de mots de passe...). C'est le système que tu vas utiliser pour presque tous les labs de FTM Academy.",
        objectives: [
          "Télécharger l'image Kali Linux prête pour VirtualBox (fichier .ova)",
          "Importer cette image dans VirtualBox",
          "Démarrer la VM et t'y connecter",
        ],
        steps: [
          "Va sur kali.org/get-kali, section « Virtual Machines », et télécharge l'image VirtualBox 64-bit.",
          "Dans VirtualBox : Fichier > Importer un appareil virtuel, puis sélectionne le fichier téléchargé.",
          "Démarre la VM et connecte-toi (identifiants par défaut : kali / kali).",
          "Ouvre un terminal dans Kali pour vérifier que tout fonctionne.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "Le fichier .ova est volumineux (plusieurs Go) : patience pendant le téléchargement.",
          "Si le clavier est mal configuré une fois connecté, ajuste-le dans Paramètres > Clavier.",
        ],
        flagHash: 'oe8ugqjtaj',
        success: "Kali respire. Ton labo prend forme.",
      },
      {
        id: 'l0-3', title: 'Le premier snapshot', tagline: 'Sauvegarde l\'état de ta VM', xp: 50, est: '10 min', download: '/labs/l0-3.py',
        intro: "Un snapshot (instantané) fige l'état complet de ta VM à un instant T. Si tu casses tout dix minutes plus tard, tu reviens en un clic à cet état propre. C'est le filet de sécurité indispensable avant toute manipulation risquée.",
        objectives: [
          "Comprendre à quoi sert un instantané (snapshot)",
          "Prendre un snapshot de ta VM Kali fraîchement installée",
          "Savoir comment y revenir en cas de pépin",
        ],
        steps: [
          "Dans VirtualBox, sélectionne ta VM Kali puis l'onglet « Instantanés ».",
          "Clique sur « Prendre » et donne-lui un nom clair, par exemple « install propre ».",
          "Vérifie que le snapshot apparaît bien dans la liste.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "Prends l'habitude de snapshotter avant chaque manipulation risquée : c'est ton bouton retour en arrière.",
        ],
        flagHash: 'kklzcd1g56',
        success: "Ton labo a désormais un bouton retour en arrière. La Forge est terminée !",
      },
    ],
  },
  {
    id: 'w1', name: 'Le Terminal', tagline: 'Deviens maître de Linux', emoji: '⌨️', accent: '#2BD9A8',
    intro: "Le terminal, c'est le cockpit du hacker. Presque tout ce que tu feras en cybersécurité passe par des lignes de commande. On commence doucement : se repérer, chercher, gérer les droits, gérer les processus.",
    labs: [
      {
        id: 'l1-1', title: 'Bonjour terminal', tagline: 'pwd, ls, cd, whoami', xp: 60, est: '15 min', download: '/labs/l1-1.py',
        intro: "Trois commandes suffisent pour se repérer n'importe où sous Linux : pwd (où suis-je ?), ls (qu'y a-t-il ici ?), cd (où je vais). On y ajoute whoami, pour savoir qui tu es aux yeux du système.",
        objectives: [
          "Ouvrir un terminal dans Kali",
          "Utiliser pwd, ls et cd pour te repérer",
          "Identifier l'utilisateur courant avec whoami",
        ],
        steps: [
          "Ouvre un terminal (icône dans la barre, ou raccourci clavier).",
          "Tape `pwd` pour voir dans quel dossier tu te trouves.",
          "Tape `ls` pour lister le contenu, puis `cd` pour te déplacer (par exemple `cd Bureau`).",
          "Tape `whoami` pour connaître ton identité aux yeux du système.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "`pwd` = « print working directory », littéralement « affiche le dossier où je suis ».",
          "`cd ..` te fait remonter d'un dossier.",
          "`whoami` répond en un seul mot : c'est ce mot qui t'intéresse ici.",
        ],
        flagHash: 'w4o1snn4zt',
        success: "Tu sais te repérer. Le terminal n'est plus un mur noir.",
      },
      {
        id: 'l1-2', title: 'Chasse au fichier', tagline: 'find et grep', xp: 60, est: '15 min', download: '/labs/l1-2.py',
        intro: "`find` cherche des fichiers (par nom, taille, date...), `grep` cherche du texte à l'intérieur des fichiers. Deux outils complémentaires, redoutables une fois combinés.",
        objectives: [
          "Créer un fichier texte contenant plusieurs lignes",
          "Utiliser grep pour rechercher un mot précis dedans",
          "Comprendre la différence entre find (cherche des fichiers) et grep (cherche du contenu)",
        ],
        steps: [
          "Crée un fichier `note13.txt` (par exemple avec `nano note13.txt`) et écris plusieurs lignes de texte, en cachant le mot `sesame` quelque part au milieu.",
          "Utilise `find` pour vérifier que le fichier existe bien : `find . -name note13.txt`.",
          "Utilise `grep sesame note13.txt` pour retrouver la ligne contenant le mot secret.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "`grep motclé fichier` affiche toutes les lignes contenant ce mot.",
          "Ajoute `-i` à grep pour ignorer la casse (majuscules/minuscules).",
        ],
        flagHash: '28ztoee6s5f',
        success: "Rien ne t'échappe plus dans un fichier texte.",
      },
      {
        id: 'l1-3', title: 'Les clés du royaume', tagline: 'Permissions et chmod', xp: 60, est: '15 min', download: '/labs/l1-3.py',
        intro: "Sous Linux, chaque fichier a des permissions : lecture (r), écriture (w), exécution (x), pour le propriétaire, le groupe, et les autres. Un script fraîchement créé n'est pas exécutable par défaut : il faut lui donner explicitement le droit.",
        objectives: [
          "Comprendre les permissions Linux (lecture, écriture, exécution)",
          "Créer un script et tenter de l'exécuter sans le droit adéquat",
          "Rendre le script exécutable avec chmod",
        ],
        steps: [
          "Crée un fichier `test.sh` contenant une seule ligne : `echo bonjour`.",
          "Essaie de l'exécuter avec `./test.sh` — Linux refuse (permission denied).",
          "Tape `ls -l test.sh` pour observer les droits actuels.",
          "Utilise `chmod +x test.sh` puis relance `./test.sh` : ça fonctionne !",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "Les trois blocs affichés par `ls -l` sont : propriétaire / groupe / autres.",
          "`chmod +x` ajoute le droit d'exécution, il ne remplace pas les autres droits.",
        ],
        flagHash: 's5uhc2r2ob',
        success: "Les portes du système t'obéissent — dans les règles.",
      },
      {
        id: 'l1-4', title: 'Qui es-tu ?', tagline: 'root et sudo', xp: 60, est: '10 min', download: '/labs/l1-4.py',
        intro: "`root` est le super-utilisateur : il a tous les droits sur le système, sans restriction. C'est puissant, et donc dangereux si mal utilisé. `sudo` permet d'emprunter ces droits ponctuellement, commande par commande, sans se connecter en root en permanence.",
        objectives: [
          "Comprendre ce qu'est le compte root",
          "Utiliser sudo pour exécuter une commande avec les droits d'administration",
          "Comprendre pourquoi on manipule root avec précaution",
        ],
        steps: [
          "Tape `whoami` : tu es probablement `kali`, un utilisateur normal.",
          "Tape `sudo whoami` (renseigne le mot de passe si demandé) : observe le résultat.",
          "Réfléchis à pourquoi ce compte-là a tous les droits sur le système.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "`sudo` signifie « super user do » : exécute une commande en tant qu'administrateur, ponctuellement.",
        ],
        flagHash: 'u5h5m77m0t',
        success: "Le pouvoir absolu du système, tu le comprends — et tu le respectes.",
      },
      {
        id: 'l1-5', title: 'Les fantômes actifs', tagline: 'ps et kill', xp: 60, est: '15 min', download: '/labs/l1-5.py',
        intro: "Tout ce qui tourne sur ton système est un processus, identifié par un numéro unique : le PID. `ps` te permet de les lister, `kill` de les arrêter en ciblant leur PID.",
        objectives: [
          "Lister les processus en cours avec ps",
          "Identifier un processus par son PID",
          "L'arrêter proprement avec kill",
        ],
        steps: [
          "Lance une commande longue en arrière-plan, par exemple `sleep 300 &`.",
          "Utilise `ps aux` (ou `ps -ef`) pour repérer son PID.",
          "Utilise `kill <PID>` pour l'arrêter, puis vérifie avec `ps aux` qu'il a bien disparu.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "Le PID (Process ID) est un numéro unique attribué à chaque processus en cours.",
        ],
        flagHash: '6e6lbx3zd6',
        success: "Les processus du système n'ont plus de secret pour toi. Le Terminal est dompté !",
      },
    ],
  },
  {
    id: 'w2', name: "L'Atelier", tagline: 'Écris et exécute ton code', emoji: '🧰', accent: '#F0B429',
    intro: "Un hacker qui ne code pas un minimum reste limité aux outils des autres. Ici, tu installes ton éditeur, tu écris ton premier script bash, puis ton premier script Python : les deux langages que tu croiseras partout en sécu.",
    labs: [
      {
        id: 'l2-1', title: "Installe l'établi", tagline: 'VSCode sur Kali', xp: 70, est: '15 min', download: '/labs/l2-1.py',
        intro: "Visual Studio Code (VSCode) est un éditeur de code léger et puissant, très utilisé en sécurité pour lire, écrire et déboguer des scripts rapidement.",
        objectives: [
          "Télécharger et installer Visual Studio Code sur Kali",
          "Lancer VSCode depuis le terminal",
          "Ouvrir un dossier de travail dedans",
        ],
        steps: [
          "Télécharge le paquet .deb de VSCode sur code.visualstudio.com, ou installe-le via les dépôts si disponibles (`sudo apt install code`).",
          "Une fois installé, ouvre un terminal, place-toi dans un dossier et tape `code .` pour lancer l'éditeur dessus.",
          "Vérifie que VSCode s'ouvre bien avec le dossier chargé dans la barre latérale.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "Si `code` n'est pas reconnu dans le terminal, redémarre-le ou vérifie que le paquet est bien installé.",
        ],
        flagHash: '1affc8q2bbs',
        success: "Ton établi est prêt. Passons aux choses sérieuses.",
      },
      {
        id: 'l2-2', title: 'Ton premier script', tagline: 'Bash et le shebang', xp: 70, est: '15 min', download: '/labs/l2-2.py',
        intro: "Un script bash automatise une suite de commandes. La première ligne, le « shebang » (`#!/bin/bash`), indique au système quel interpréteur utiliser pour l'exécuter.",
        objectives: [
          "Créer un fichier hello.sh",
          "Écrire un script bash valide avec un shebang",
          "Le rendre exécutable et le lancer",
        ],
        steps: [
          "Dans VSCode ou nano, crée un fichier `hello.sh`.",
          "Écris en première ligne `#!/bin/bash`, puis sur la ligne suivante `echo \"Salut FTM Academy\"`.",
          "Rends-le exécutable avec `chmod +x hello.sh`, puis lance-le avec `./hello.sh`.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "Le shebang indique au système quel interpréteur (ici bash) doit exécuter le script.",
        ],
        flagHash: '1wjqn3vinqz',
        success: "Ton premier script tourne. Bash ne te fait plus peur.",
      },
      {
        id: 'l2-3', title: 'Python entre en scène', tagline: 'Ton premier script Python', xp: 70, est: '15 min', download: '/labs/l2-3.py',
        intro: "Python est le couteau suisse de la cybersécurité : rapide à écrire, lisible, avec une immense bibliothèque d'outils. Tu vas l'utiliser tout au long de FTM Academy pour révéler tes flags.",
        objectives: [
          "Créer un fichier hello.py",
          "Écrire un script Python simple",
          "L'exécuter avec python3",
        ],
        steps: [
          "Crée un fichier `hello.py` contenant la ligne `print(\"Salut FTM Academy\")`.",
          "Dans le terminal, place-toi dans le dossier et tape `python3 hello.py`.",
          "Observe le résultat affiché à l'écran.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "Si `python3` n'est pas reconnu, essaie `python --version` pour voir ce qui est réellement installé.",
        ],
        flagHash: '16b2s8r5516',
        success: "Python répond présent. L'Atelier est terminé, tu es armé pour la suite !",
      },
    ],
  },
  {
    id: 'w3', name: 'Les Câbles', tagline: 'Comprends le réseau', emoji: '🕸️', accent: '#56CCF2',
    intro: "Rien ne circule sur Internet sans réseau : adresses IP, ports, DNS. On explore ces bases avec des outils simples, toujours sur ta propre machine.",
    labs: [
      {
        id: 'l3-1', title: "J'ai trouvé mon adresse", tagline: 'ping et ip', xp: 80, est: '15 min', download: '/labs/l3-1.py',
        intro: "Chaque machine sur un réseau a une adresse IP. `ping` vérifie qu'un hôte répond en lui envoyant des paquets « echo request » et en attendant un « echo reply ».",
        objectives: [
          "Afficher l'adresse IP de ta machine",
          "Tester la connectivité vers un hôte avec ping",
          "Comprendre la différence entre IP locale et IP publique",
        ],
        steps: [
          "Tape `ip a` (ou `ifconfig`) pour lister tes interfaces réseau et repérer ton adresse IP locale.",
          "Tape `ping -c 4 8.8.8.8` pour tester ta connectivité Internet.",
          "Observe les temps de réponse affichés.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "`ping` envoie des paquets « echo request » et attend en retour un « echo reply ».",
        ],
        flagHash: '1ruyf7cj2g7',
        success: "Tu sais te situer sur le réseau.",
      },
      {
        id: 'l3-2', title: 'Les portes du château', tagline: 'nmap sur ta propre machine', xp: 80, est: '20 min', download: '/labs/l3-2.py',
        intro: "Un port ouvert, c'est une porte par laquelle un service écoute. nmap scanne une machine et te dit quelles portes sont ouvertes. Ici, on scanne uniquement TA propre machine (localhost).",
        objectives: [
          "Vérifier que nmap est installé",
          "Scanner les ports ouverts de TA propre machine (localhost)",
          "Comprendre ce qu'est un port ouvert",
        ],
        steps: [
          "Vérifie que nmap est installé : `nmap --version`.",
          "Scanne ta propre machine avec `nmap 127.0.0.1` (ou `nmap localhost`).",
          "Observe la liste des ports ouverts et essaie d'identifier les services associés.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "Ne scanne jamais une machine qui n'est pas la tienne sans autorisation écrite explicite.",
        ],
        flagHash: 'uglgfv77mc',
        success: "Les ports n'ont plus de secret pour toi — et tu sais où t'arrêter.",
      },
      {
        id: 'l3-3', title: "L'annuaire secret", tagline: 'Le DNS', xp: 80, est: '15 min', download: '/labs/l3-3.py',
        intro: "Le DNS (Domain Name System) traduit les noms de domaine que tu tapes (exemple.com) en adresses IP que les machines comprennent réellement. C'est l'annuaire d'Internet.",
        objectives: [
          "Comprendre le rôle du DNS",
          "Résoudre un nom de domaine en adresse IP",
        ],
        steps: [
          "Tape `nslookup exemple.com` ou `dig exemple.com`.",
          "Observe l'adresse IP renvoyée.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "DNS = Domain Name System : l'annuaire qui traduit les noms de domaine en adresses IP.",
        ],
        flagHash: 'j9sy0x3978',
        success: "L'annuaire du net n'a plus de mystère. Les Câbles sont dévoilés !",
      },
    ],
  },
  {
    id: 'w4', name: 'Le Coffre', tagline: 'Encodage & cryptographie', emoji: '🔐', accent: '#B197FC',
    intro: "Encodage, hachage, chiffrement : trois mots souvent confondus, trois mécanismes très différents. On démystifie tout ça avec Base64, SHA-256 et le bon vieux chiffre de César.",
    labs: [
      {
        id: 'l4-1', title: 'Base64 démasqué', tagline: "Ce n'est pas du chiffrement", xp: 90, est: '10 min', download: '/labs/l4-1.py',
        intro: "Le Base64 encode des données binaires en texte lisible (lettres, chiffres, +, /, =). C'est très pratique pour le transport... mais ça n'a rien à voir avec du chiffrement : aucune clé secrète n'est nécessaire pour le décoder.",
        objectives: [
          "Comprendre que le Base64 est un encodage, pas un chiffrement",
          "Décoder une chaîne Base64",
        ],
        steps: [
          "Voici une chaîne encodée en Base64 : `RlRNe2Jhc2U2NF9jZV9uZXN0X3Bhc19kdV9jaGlmZnJlbWVudH0=`",
          "Utilise un décodeur en ligne, ou en terminal : `echo \"RlRNe2Jhc2U2NF9jZV9uZXN0X3Bhc19kdV9jaGlmZnJlbWVudH0=\" | base64 -d`.",
          "Lis attentivement le texte obtenu.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "Base64 ne demande aucune clé secrète pour être décodé : ce n'est pas du chiffrement.",
        ],
        flagHash: 'dmpl7e2b91',
        success: "Base64 démasqué. Encodage ≠ chiffrement, tu ne l'oublieras plus.",
      },
      {
        id: 'l4-2', title: "L'empreinte", tagline: 'Fonctions de hachage', xp: 90, est: '10 min', download: '/labs/l4-2.py',
        intro: "Une fonction de hachage (comme SHA-256) transforme n'importe quelle donnée en une empreinte de taille fixe. C'est à sens unique : facile à calculer dans un sens, impossible à inverser dans l'autre.",
        objectives: [
          "Comprendre ce qu'est une fonction de hachage",
          "Comprendre pourquoi un hash ne se « déchiffre » pas",
        ],
        steps: [
          "Dans un terminal, tape `echo -n \"bonjour\" | sha256sum`.",
          "Observe la chaîne obtenue : c'est l'empreinte (hash) du mot « bonjour ».",
          "Essaie de retrouver « bonjour » uniquement à partir du hash, sans jamais le retaper : c'est impossible directement.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "Un hash est une fonction à sens unique : facile à calculer, impossible à inverser mathématiquement.",
        ],
        flagHash: 'nwmudtnxlq',
        success: "L'empreinte n'a plus de secret. Un hash, ça ne se déchiffre pas.",
      },
      {
        id: 'l4-3', title: 'Le César', tagline: 'Chiffrement de César et ROT13', xp: 90, est: '10 min', download: '/labs/l4-3.py',
        intro: "Le chiffrement de César décale chaque lettre d'un nombre fixe de positions dans l'alphabet. Le ROT13 en est une variante célèbre (décalage de 13) : appliqué deux fois, il te ramène exactement au texte de départ.",
        objectives: [
          "Comprendre le chiffrement de César et le ROT13",
          "Déchiffrer un message ROT13",
        ],
        steps: [
          "Voici un message chiffré en ROT13 : `SGZ{prfne_an_dhn_ovra_fr_grave}`",
          "Le ROT13 décale chaque lettre de 13 positions — applique cette technique à la main ou avec un outil en ligne (cherche « rot13 »).",
          "Note bien le résultat obtenu, avec ses underscores et ses accolades.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "ROT13 est son propre inverse : l'appliquer deux fois te ramène au texte d'origine.",
        ],
        flagHash: '1jf566pfy5w',
        success: "César n'a qu'à bien se tenir. Le Coffre est ouvert !",
      },
    ],
  },
  {
    id: 'w5', name: 'La Toile', tagline: 'Sécurité des applications web', emoji: '🌐', accent: '#FF922B',
    intro: "Attention, terrain sensible : tout ce qui suit se pratique EXCLUSIVEMENT sur des applications volontairement vulnérables tournant en local sur TA machine (type DVWA, Juice Shop). Jamais sur un site qui n'est pas le tien. On explore HTTP, l'injection SQL, le XSS et l'IDOR — pour apprendre à s'en défendre.",
    labs: [
      {
        id: 'l5-1', title: "Anatomie d'une requête", tagline: 'HTTP et les DevTools', xp: 110, est: '20 min', download: '/labs/l5-1.py',
        intro: "Chaque page web charge via des requêtes HTTP, chacune avec un code de statut : 200 (succès), 301/302 (redirection), 404 (introuvable), 500 (erreur serveur). Les DevTools de ton navigateur te permettent d'observer tout ça en direct.",
        objectives: [
          "Ouvrir les outils de développement de ton navigateur",
          "Observer l'onglet Réseau lors du chargement d'une page",
          "Identifier un code de statut HTTP",
        ],
        steps: [
          "Ouvre ton navigateur, appuie sur F12 (ou clic droit > Inspecter) pour ouvrir les DevTools.",
          "Va dans l'onglet « Réseau » (Network) et recharge une page.",
          "Clique sur une requête pour voir son code de statut. Essaie volontairement une URL inexistante sur ton application locale (DVWA/Juice Shop) pour observer un code d'erreur.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "200 = succès, 301/302 = redirection, 404 = introuvable, 500 = erreur serveur.",
        ],
        flagHash: '1zy8315wh5g',
        success: "Tu lis le HTTP à livre ouvert désormais.",
      },
      {
        id: 'l5-2', title: 'La porte dérobée', tagline: 'Injection SQL, en local', xp: 110, est: '25 min', download: '/labs/l5-2.py',
        intro: "Une injection SQL exploite une entrée utilisateur non filtrée, insérée directement dans une requête SQL. Sur une appli locale volontairement vulnérable, on observe l'attaque — et surtout sa parade : les requêtes préparées.",
        objectives: [
          "Observer une injection SQL sur une application volontairement vulnérable, en local",
          "Comprendre la parade : les requêtes préparées",
        ],
        steps: [
          "Installe/lance une application volontairement vulnérable en local (par exemple DVWA via Docker), uniquement sur TA machine.",
          "Dans un champ de connexion vulnérable, teste une entrée comme `' OR '1'='1` et observe le comportement.",
          "Renseigne-toi sur la notion de « requêtes préparées » (prepared statements), la vraie protection contre ce type d'attaque.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "Une injection SQL exploite une entrée utilisateur non filtrée, insérée directement dans une requête.",
          "Ne teste jamais ça sur un site que tu ne possèdes pas ou sans autorisation écrite.",
        ],
        flagHash: 'zu35jko2i7',
        success: "La porte dérobée est comprise — et fermée, sur ta propre machine.",
      },
      {
        id: 'l5-3', title: 'Le miroir piégé', tagline: 'Cross-Site Scripting (XSS), en local', xp: 110, est: '20 min', download: '/labs/l5-3.py',
        intro: "Le XSS survient quand une page réaffiche une entrée utilisateur sans la filtrer ni l'échapper. Résultat : du code peut s'exécuter dans le navigateur d'une victime.",
        objectives: [
          "Comprendre le principe du Cross-Site Scripting (XSS)",
          "L'observer sur un lab local vulnérable",
        ],
        steps: [
          "Sur ton application locale vulnérable, trouve un champ qui réaffiche ta saisie (ex : barre de recherche).",
          "Essaie d'y injecter `<script>alert(1)</script>` et observe si une alerte apparaît.",
          "Réfléchis à quel langage vient de s'exécuter dans ton navigateur.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "Le XSS survient quand une page affiche une entrée utilisateur sans la filtrer ni l'échapper.",
        ],
        flagHash: 'owbw4momw8',
        success: "Le miroir piégé est démonté. Le JavaScript qui trahit, tu le repères.",
      },
      {
        id: 'l5-4', title: 'La clé sous le paillasson', tagline: 'IDOR, en local', xp: 110, est: '20 min', download: '/labs/l5-4.py',
        intro: "Un IDOR (Insecure Direct Object Reference) survient quand une application fait confiance à un identifiant fourni par l'utilisateur (dans une URL par exemple) sans vérifier ses droits réels sur la ressource visée.",
        objectives: [
          "Comprendre l'IDOR (Insecure Direct Object Reference)",
        ],
        steps: [
          "Sur ton lab local, connecte-toi et repère une URL contenant un identifiant, par exemple `?id=12`.",
          "Modifie cet identifiant (par exemple `?id=13`) et observe si tu accèdes à des données qui ne sont pas les tiennes.",
          "Note ce que révèle cette faille sur le contrôle d'accès côté serveur.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "Un IDOR se corrige en vérifiant, côté serveur, que l'utilisateur a bien le droit d'accéder à la ressource demandée.",
        ],
        flagHash: '241o6icz8xg',
        success: "La clé n'est plus sous le paillasson. La Toile est démêlée !",
      },
    ],
  },
  {
    id: 'w6', name: "L'Enquête", tagline: 'Forensics, OSINT & stéganographie', emoji: '🔎', accent: '#20C997',
    intro: "Un fichier binaire, un journal système, une recherche publique : chacun raconte une histoire si on sait où regarder. Ici, on apprend à lire ces traces — toujours dans le respect de la loi.",
    labs: [
      {
        id: 'l6-1', title: "Ce que l'image cache", tagline: 'strings', xp: 120, est: '15 min', download: '/labs/l6-1.py',
        intro: "La commande `strings` extrait toutes les séquences de texte lisible cachées dans un fichier binaire — souvent révélatrices.",
        objectives: [
          "Extraire le texte lisible d'un fichier binaire avec strings",
        ],
        steps: [
          "Crée ou récupère un petit fichier binaire (image, exécutable...).",
          "Utilise la commande `strings monfichier` pour extraire les chaînes de caractères lisibles.",
          "Cherche, parmi le résultat, un mot ou une phrase qui ressemble à un message caché.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "Ajoute `| grep motclé` après `strings` pour filtrer directement ce que tu cherches.",
        ],
        flagHash: '1c46qfnthdu',
        success: "Les secrets cachés dans un binaire ne te résistent plus.",
      },
      {
        id: 'l6-2', title: 'Sur les traces', tagline: 'Lire des logs', xp: 120, est: '15 min', download: '/labs/l6-2.py',
        intro: "Les logs sont la mémoire du système : chaque connexion, chaque action y laisse une trace horodatée. Savoir les lire, c'est reconstituer un fil des événements.",
        objectives: [
          "Lire et interpréter des journaux d'événements (logs)",
        ],
        steps: [
          "Consulte un fichier de log sur ta machine, par exemple `/var/log/auth.log` (`sudo cat /var/log/auth.log`, ou équivalent selon ton système).",
          "Repère des lignes intéressantes : connexions, tentatives échouées, horodatages.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "Les logs sont la mémoire du système : on les analyse pour comprendre « qui a fait quoi, quand ».",
        ],
        flagHash: 'h5t2os1zoc',
        success: "Les logs n'ont plus rien à te cacher.",
      },
      {
        id: 'l6-3', title: "L'œil ouvert", tagline: 'OSINT éthique', xp: 120, est: '20 min', download: '/labs/l6-3.py',
        intro: "L'OSINT (Open Source Intelligence) consiste à rassembler des informations exclusivement publiques. Tant que tu restes sur ce qui a été volontairement rendu accessible, c'est légal — la frontière avec l'intrusion illégale doit rester très claire dans ta tête.",
        objectives: [
          "Comprendre l'OSINT (Open Source Intelligence)",
          "Distinguer information publique et intrusion illégale",
        ],
        steps: [
          "Choisis une entreprise ou un projet public (le tien de préférence, ou un exemple neutre).",
          "Recherche uniquement des informations déjà publiques (site web, réseaux sociaux publics, whois d'un domaine).",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "L'OSINT reste légal tant que tu n'accèdes qu'à des informations rendues publiques volontairement.",
        ],
        flagHash: '57w7eei2uu',
        success: "L'œil ouvert, mais la ligne respectée. L'Enquête est bouclée !",
      },
    ],
  },
  {
    id: 'w7', name: "L'Arène", tagline: 'Méthode CTF et rapport', emoji: '🏟️', accent: '#FF6B81',
    intro: "Ce qui distingue un débutant d'un professionnel, ce n'est pas les outils : c'est la méthode. Énumérer, documenter, rapporter — dans cet ordre, à chaque fois.",
    labs: [
      {
        id: 'l7-1', title: 'Le rituel', tagline: "L'énumération avant tout", xp: 140, est: '15 min', download: '/labs/l7-1.py',
        intro: "Avant de vouloir exploiter quoi que ce soit, on liste : ports, services, versions, fichiers. Un attaquant pressé qui saute cette étape rate la majorité des indices.",
        objectives: [
          "Retenir la première étape de toute méthodologie : l'énumération",
        ],
        steps: [
          "Applique ce réflexe sur un lab déjà terminé (relis tes notes des mondes précédents) : qu'aurais-tu pu lister de plus ?",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [
          "Un attaquant pressé qui saute l'énumération rate l'essentiel des indices.",
        ],
        flagHash: '18c8mmk4f3r',
        success: "Le rituel est ancré. Énumérer avant d'exploiter, toujours.",
      },
      {
        id: 'l7-2', title: 'Prends des notes', tagline: 'La discipline du CTF', xp: 140, est: '10 min', download: '/labs/l7-2.py',
        intro: "Si ce n'est pas noté, ça n'existe pas. Une bonne prise de notes te fait gagner un temps considérable, surtout quand tu dois revenir en arrière.",
        objectives: [
          "Adopter une discipline de prise de notes systématique",
        ],
        steps: [
          "Note, pour un lab déjà terminé : la commande utilisée, le résultat obtenu, la conclusion.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [],
        flagHash: '25vgtmd6i4e',
        success: "Tes notes, ta mémoire externe. Bien joué.",
      },
      {
        id: 'l7-3', title: 'Le rapport', tagline: 'Restituer un test de sécurité', xp: 140, est: '15 min', download: '/labs/l7-3.py',
        intro: "Un test de sécurité sans rapport ne sert à rien : c'est le rapport qui permet à d'autres de comprendre, corriger, et progresser.",
        objectives: [
          "Comprendre l'importance du rapport final dans un test de sécurité",
        ],
        steps: [
          "Rédige un mini-rapport de 5 lignes pour un lab déjà résolu : contexte, action, résultat, recommandation.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [],
        flagHash: '1288qr7hacp',
        success: "Un bon rapport vaut un bon hack. L'Arène t'a forgé.",
      },
    ],
  },
  {
    id: 'wg', name: 'Le Panthéon', tagline: "L'épreuve du niveau God", emoji: '👑', accent: '#F0B429',
    intro: "Dernière étape. Une box complète, de bout en bout, puis un serment. Ce que tu as appris n'a de valeur que si tu l'utilises pour protéger.",
    labs: [
      {
        id: 'lg-1', title: "L'épreuve finale", tagline: 'Une box débutant, de bout en bout', xp: 250, est: '90 min', download: '/labs/lg-1.py',
        intro: "Il est temps de mettre bout à bout tout ce que tu as appris, sur une plateforme d'entraînement légale et conçue pour ça.",
        objectives: [
          "Résoudre une box débutant complète sur une plateforme d'entraînement",
        ],
        steps: [
          "Crée un compte sur une plateforme comme TryHackMe ou HackTheBox et choisis une box « débutant ».",
          "Résous-la de bout en bout en appliquant ce que tu as appris : énumération, exploitation, notes, rapport.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [],
        flagHash: '14vkpwsep3x',
        success: "Bienvenue au Panthéon. Il ne reste qu'un dernier pas.",
      },
      {
        id: 'lg-2', title: 'Le serment', tagline: "L'éthique du hacker", xp: 250, est: '10 min', download: '/labs/lg-2.py',
        intro: "Le vrai niveau God n'est pas technique, il est moral. Un grand pouvoir implique de grandes responsabilités.",
        objectives: [
          "Prêter le serment du hacker éthique",
        ],
        steps: [
          "Relis les règles d'or de FTM Academy : jamais sans autorisation, toujours dans ton propre labo.",
          "Engage-toi : tes compétences serviront à protéger, jamais à nuire.",
          "Fais la tâche ci-dessus, puis télécharge et exécute le fichier Python du lab (⬇ plus bas) : réponds à sa question pour révéler ton flag.",
        ],
        hints: [],
        flagHash: 'w3sk0zviej',
        success: "Niveau God atteint. Grand pouvoir, grandes responsabilités — n'oublie jamais.",
      },
    ],
  },
]

export const ALL_LABS = WORLDS.flatMap((w) =>
  w.labs.map((l) => ({ ...l, worldId: w.id, worldName: w.name, worldAccent: w.accent, worldEmoji: w.emoji }))
)

export const TOTAL_XP = ALL_LABS.reduce((sum, l) => sum + l.xp, 0)

export function rankFor(xp) {
  const percent = TOTAL_XP > 0 ? xp / TOTAL_XP : 0
  let current = RANKS[0]
  for (const rank of RANKS) {
    if (rank.minPercent === 1) {
      if (percent >= 1) current = rank
      continue
    }
    if (percent >= rank.minPercent) current = rank
  }
  return current
}
