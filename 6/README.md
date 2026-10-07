# Jour 6 : Ogre

`/6` oppose Ogrest à Tristepin et Yugo, tous deux joués par l’utilisateur. Le menu commun et le calendrier ouvrent ce sixième jour. Un aperçu du calendrier reste statique et ne lance aucun tour automatique.

Chaque round mélange les combattants vivants ; chacun joue exactement une fois. Tristepin a 144 PV et inflige 24 dégâts, Yugo a 120 PV et inflige 20 dégâts ; Ogrest a 330 PV. Un héros à terre est retiré des tours suivants. Le survivant peut terminer le combat.

Ogrest annonce sa prochaine action et sa cible. Il choisit une garde (27 %, jamais deux gardes consécutives), une onde de choc (23 dégâts sur les deux héros), un coup (34 dégâts) ou un coup lourd (46 dégâts). Les seuils et l’absence de garde consécutive font varier les proportions effectives. Sa garde absorbe 60 % de ses deux prochains coups reçus et cesse à son prochain tour. La garde ne s’additionne pas. À partir du round 9, ses nouvelles intentions d’attaque gagnent 3 dégâts par round.

Les héros peuvent attaquer, éviter la prochaine offensive ou préparer une attaque ×2,2. Un boost ne se cumule pas et reste disponible jusqu’à l’attaque ; esquiver l’abandonne. L’esquive reste prête pendant une garde d’Ogrest, puis expire à sa prochaine offensive, même s’il vise l’autre héros. Une autre action est nécessaire avant de pouvoir esquiver à nouveau. Les états suivent les actions, plutôt que les frontières de round, pour rester cohérents lorsque l’ordre change.

Le moteur de combat est indépendant de l’interface et injecte le hasard pour les tests. Les boutons bloquent les actions concurrentes pendant les animations. Les temporisations sont annulées au redémarrage, à l’ouverture des règles, à la sortie de page et quand l’onglet est masqué. Les animations respectent la préférence de réduction des mouvements.

## Illustrations

Univers, personnages et illustrations DOFUS / WAKFU © Ankama. Expérience de fan indépendante. Les assets sont locaux ; aucun hotlink n’est nécessaire pour jouer.

- Ogrest : [visuel reproduit sur PNGEgg](https://www.pngegg.com/fr/png-mwqoo). Le fichier `ogrest-cutout.png` est une adaptation détourée par imagegen de l’asset de référence `ogrest.png` ; ce n’est pas un sprite officiel extrait du jeu.
- Tristepin : [illustration reproduite sur PinClipart](https://www.pinclipart.com/downpngs/hmxhTi_tristepin-wakfu-season-1-characters-clipart/).
- Yugo : [illustration reproduite sur PNGAAA](https://www.pngaaa.com/detail/1817776), version originale transparente.

Validation : `pnpm test` et `pnpm build` depuis la racine.

`simulateBalance()` compare 1 000 parties par stratégie avec un hasard reproductible. La politique tactique esquive les attaques annoncées quand elle le peut et prépare un boost contre la garde. Avec les réglages retenus, elle gagne 641 parties sur 1 000, contre 292 pour une attaque systématique. Ce contrôle mesure des politiques automatisées, pas un taux de victoire garanti pour les joueurs.
